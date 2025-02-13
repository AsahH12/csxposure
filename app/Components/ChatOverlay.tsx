"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebaseconfig";
import { ArrowLeft, User } from "lucide-react"; // Back Arrow icon
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { UserInfo } from "firebase-admin/auth";
import { userInfo } from "os";

type ResizeDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface ChatOverlayProps {
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]); // Store users list
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 400 });
  const chatRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionDescription, setDiscussionDescription] = useState("");
  const questions = [
    "What’s the title of your discussion post?",
    "Please provide a description for your post."
  ];

  const [discussionPost, setDiscussionPost] = useState<any>({
    title: "",
    description: "",
  });
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
      if (!userEmail) return;
    
      const chatQuery = query(collection(db, "chats"), where("participants", "array-contains", userEmail));
      const chatSnapshot = await getDocs(chatQuery);
    
      const usersList = await Promise.all(
        chatSnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const messagesRef = collection(db, "chats", chatDoc.id, "messages");
          const messagesSnapshot = await getDocs(messagesRef);
    
          // Check if messages exist between current user and other participant
          if (!messagesSnapshot.empty) {
            const otherUserEmail = chatData.participants.find((email: string) => email !== userEmail);
            return { email: otherUserEmail, chatId: chatDoc.id, hasMessages: true };
          }
          return null;
        })
      );
    
      setUsers(usersList.filter((user) => user !== null));
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

  // Handle sending a new message
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
  const handleCreateDiscussionPost = async () => {
    if (!discussionTitle.trim() || !discussionDescription.trim()) return;
  
    const discussionRef = collection(db, "discussionPosts");
    await addDoc(discussionRef, {
      title: discussionTitle,
      description: discussionDescription,
      createdAt: new Date(),
      createdBy: userEmail,
    });
  
    // Reset the fields and close the form
    setDiscussionTitle("");
    setDiscussionDescription("");
    setShowDiscussionForm(false);
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Handle mouse move for dragging or resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    } else if (isResizing && resizeDirection) {
      const newWidth = Math.max(200, e.clientX - resizeOffset.current.x);
      const newHeight = Math.max(200, e.clientY - resizeOffset.current.y);
      const newPos = { x: position.x, y: position.y };

      if (resizeDirection.includes("left")) {
        newPos.x = e.clientX;
      }

      if (resizeDirection.includes("top")) {
        newPos.y = e.clientY;
      }

      setPosition(newPos);

      setSize({
        width: resizeDirection.includes("left") ? size.width - newWidth + position.x : newWidth,
        height: resizeDirection.includes("top") ? size.height - newHeight + position.y : newHeight,
      });
    }
  };

  // Handle mouse up for dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    setIsResizing(true);
    setResizeDirection(direction);
    resizeOffset.current = {
      x: e.clientX - size.width,
      y: e.clientY - size.height,
    };
  };

  // Attach mouse events to handle dragging and resizing
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      ref={chatRef}
      className="fixed top-1/2 right-5 bg-white shadow-lg border border-gray-300 z-50 flex flex-col rounded-lg"
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: "auto", // Make the height dynamic
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Chat header with user info */}
      <div className="flex justify-between items-center bg-gray-200 px-4 py-3 rounded-t-lg cursor-move">
        
  {selectedUser && (
    <button
      className="text-black font-bold p-2 rounded hover:bg-gray-300 transition"
      onClick={() => setSelectedUser(null)} // Go back to chat list

    >
      ← Back
    </button>
  )}
  
  <h3 className="text-black text-lg font-semibold">
    {selectedUser ? `Chatting with ${selectedUser}` : "Chats"}
  </h3>
</div>
<div className="flex justify-between items-center bg-gray-200 px-4 py-3 rounded-t-lg cursor-move">
</div>
 {/* Discussion Post Form */}
 {showDiscussionForm && (
  
  <div  style={{
    maxHeight: "200px",
    overflowY: "auto",
    paddingBottom: "10px",
    marginBottom: "10px",
  }}>
    <input
      type="text"
      placeholder="Enter the title of your discussion"
      value={discussionTitle}
      onChange={(e) => setDiscussionTitle(e.target.value)}
      style={{
        padding: "5px",
        marginBottom: "10px",
        borderRadius: "4px",
        border: "1px solid #ddd",
      }}
    />
    <textarea
      placeholder="Enter the description of your discussion"
      value={discussionDescription}
      onChange={(e) => setDiscussionDescription(e.target.value)}
      style={{
        padding: "5px",
        marginBottom: "10px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        minHeight: "100px",
      }}
    />
    <button onClick={handleCreateDiscussionPost}>Create Discussion</button>
  </div>
)}

<button onClick={() => setShowDiscussionForm(!showDiscussionForm)}>
  {showDiscussionForm ? "Cancel" : "Create Discussion Post"}
</button>

{/* User selection */}
<div className="flex flex-col p-3">
<div className="flex flex-col p-3">
  {users.length === 0 ? (
    <p className="text-gray-500">No active chats</p>
  ) : (
    users
      .filter((user) => user.hasMessages) // Only show users with messages
      .map((user) => (
        <button
          key={user.email}
          className="p-3 bg-gray-200 rounded-lg text-left mb-2 hover:bg-gray-300 transition cursor-pointer"
          onClick={() => {
            setChatId(user.chatId);
            setSelectedUser(user.email);
          }}
        >
          {user.email}
        </button>
        
      ))
      
  )}
</div>

  {selectedUser && (
          
          <>
          
            {/* Scrollable messages container */}
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                paddingBottom: "10px",
                marginBottom: "10px",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    padding: "10px",
                    margin: "10px 0",
                    backgroundColor: message.sender === userEmail ? "#007aff" : "#e5e5ea", // Blue for sender, gray for receiver
                    borderRadius: "10px",
                    textAlign: message.sender === userEmail ? "right" : "left",
                    color: message.sender === userEmail ? "white" : "black", // White text for sender, black for receiver
                  }}
                >
                  <p>{message.text}</p>
                  <span style={{ fontSize: "12px", color: "#555" }}>
                    {message.timestamp
                      ? new Date(message.timestamp.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </span>
                </div>
              ))}
            </div>

            {/* Message input area */}
            <div style={{ display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
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
                  alignSelf: "flex-end",
                }}
              >
                Send
              </button>
            </div>
          </>
          
        )}
      </div>
      

      {/* Resize handles */}
      <div className="w-6 h-6 bg-gray-300 absolute top-0 left-0 cursor-nwse-resize" onMouseDown={(e) => handleResizeMouseDown(e, "top-left")} />
      <div className="w-6 h-6 bg-gray-300 absolute top-0 right-0 cursor-nese-resize" onMouseDown={(e) => handleResizeMouseDown(e, "top-right")} />
      <div className="w-6 h-6 bg-gray-300 absolute bottom-0 left-0 cursor-sws-resize" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")} />
      <div className="w-6 h-6 bg-gray-300 absolute bottom-0 right-0 cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")} />
    </div>
  
  );
};

export default ChatOverlay;
