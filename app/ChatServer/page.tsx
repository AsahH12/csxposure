"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseconfig"; // Ensure Firebase is set up
import { collection, addDoc, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";

const ChatServer: React.FC = () => {
  const { profileId } = useParams(); // Get the profileId from the URL
  const [messages, setMessages] = useState<any[]>([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(""); // Store new message input
  const [chatId, setChatId] = useState<string | null>(null); // Track current chat ID
  const [userEmail, setUserEmail] = useState<string>(""); // Store current user's email

  // Ensure profileId is a string, if it's an array, pick the first element
  const profileEmail = Array.isArray(profileId) ? profileId[0] : profileId;

  // Fetch current user's email (replace with Firebase Auth)
  useEffect(() => {
    // Assuming the current user's email is available
    const currentUserEmail = "currentUserEmail"; // You should fetch this from Firebase Auth
    setUserEmail(currentUserEmail);
  }, []);

  // Create or get chat ID between two users
  useEffect(() => {
    if (!profileEmail || !userEmail) return;

    // Check if a chat exists between current user and selected profile
    const chatRef = collection(db, "chats");
    const chatQuery = query(
      chatRef,
      where("user1_email", "in", [userEmail, profileEmail]),
      where("user2_email", "in", [userEmail, profileEmail])
    );

    // Listen for existing chat between users
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      if (snapshot.empty) {
        // If no chat exists, create a new chat document
        addDoc(chatRef, {
          user1_email: userEmail,
          user2_email: profileEmail,
        }).then((docRef) => setChatId(docRef.id));
      } else {
        // Get the chat ID from the snapshot
        snapshot.docs.forEach((doc) => {
          setChatId(doc.id);
        });
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, [profileEmail, userEmail]);

  // Fetch messages for the chatId
  useEffect(() => {
    if (!chatId) return;

    // Get messages for the selected chat
    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe(); // Clean up listener
  }, [chatId]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    // Add new message to Firestore
    await addDoc(collection(db, "chats", chatId as string, "messages"), {
      sender: userEmail, // Current user's email
      text: newMessage,
      timestamp: new Date(),
    });

    setNewMessage(""); // Clear input
  };

  return (
    <div className="chat-container">
      <h1>Chat with {profileEmail}</h1>

      {/* Message list */}
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
              {new Date(message.timestamp.seconds * 1000).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Message input */}
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
    </div>
  );
};

export default ChatServer;
