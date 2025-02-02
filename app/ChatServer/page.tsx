"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseconfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ChatServer: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]); // Store users list
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Selected chat partner

  // Get current user's email
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all users except the current user
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const usersList = usersSnapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.email !== userEmail); // Exclude self
      setUsers(usersList);
    };

    if (userEmail) fetchUsers();
  }, [userEmail]);

  // Find or create a chat when a user is selected
  useEffect(() => {
    if (!selectedUser || !userEmail) return;

    const chatRef = collection(db, "chats");
    const chatQuery = query(chatRef, where("participants", "array-contains", userEmail));

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const existingChat = snapshot.docs.find((doc) =>
        doc.data().participants.includes(selectedUser)
      );

      if (existingChat) {
        setChatId(existingChat.id);
        setUnreadCount(existingChat.data().unreadMessages?.[userEmail] || 0);
      } else {
        const newChatRef = await addDoc(chatRef, {
          participants: [userEmail, selectedUser],
          unreadMessages: { [selectedUser]: 0, [userEmail]: 0 },
          lastMessage: "",
        });
        setChatId(newChatRef.id);
      }
    });

    return () => unsubscribe();
  }, [selectedUser, userEmail]);

  // Fetch messages when chatId is available
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));

      // Mark messages as read
      if (chatId) {
        const chatDoc = doc(db, "chats", chatId);
        updateDoc(chatDoc, {
          [`unreadMessages.${userEmail}`]: 0,
        });
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageRef = collection(db, "chats", chatId, "messages");

    await addDoc(messageRef, {
      sender: userEmail,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    // Update chat with the last message and increment unread count for the receiver
    const chatDoc = doc(db, "chats", chatId);
    await updateDoc(chatDoc, {
      lastMessage: newMessage,
      [`unreadMessages.${selectedUser}`]: unreadCount + 1,
    });

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <h1>Select a Chat Partner</h1>

      {/* User selection dropdown */}
      <select
        onChange={(e) => setSelectedUser(e.target.value)}
        value={selectedUser || ""}
        style={{ padding: "10px", marginBottom: "20px", width: "100%" }}
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.email} value={user.email}>
            {user.email}
          </option>
        ))}
      </select>

      {selectedUser && (
        <>
          <h2>Chat with {selectedUser}</h2>

          {/* Unread messages notification */}
          {unreadCount > 0 && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              You have {unreadCount} unread messages!
            </div>
          )}

          {/* Messages List */}
          <div className="messages-container" style={{ maxHeight: "400px", overflowY: "scroll" }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === userEmail ? "sent" : "received"}`}
                style={{
                  padding: "10px",
                  margin: "10px 0",
                  backgroundColor: message.sender === userEmail ? "#d3f8e2" : "#f0f0f0",
                  borderRadius: "10px",
                  textAlign: message.sender === userEmail ? "right" : "left",
                }}
              >
                <p>{message.text}</p>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {message.timestamp
                    ? new Date(message.timestamp.seconds * 1000).toLocaleString()
                    : "Just now"}
                </span>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="message-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ width: "100%", height: "80px", padding: "10px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatServer;
