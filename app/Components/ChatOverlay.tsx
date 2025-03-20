"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebaseconfig";
import { ArrowLeft, User, User2 } from "lucide-react"; // Back Arrow icon
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { arrayUnion } from "firebase/firestore";
import styles from "./ChatOverlay.module.css";
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
  getDoc,
} from "firebase/firestore";

// Define possible resize directions
type ResizeDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// Define properties for ChatOverlay component
interface ChatOverlayProps {
  onClose: () => void; // Function to call when closing the chat overlay
  selectedUser?: string; // Email of the selected user
  chatId?: string; // ID of the current chat
}

// Main ChatOverlay component
const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<any[]>([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(""); // New message input
  const [chatId, setChatId] = useState<string | null>(null); // ID of the current chat
  const [userEmail, setUserEmail] = useState<string>(""); // Current user's email
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Selected user email
  const [unreadCount, setUnreadCount] = useState<number>(0); // Count of unread messages
  const [users, setUsers] = useState<any[]>([]); // Store users list
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null); // Direction for resizing
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position of the chat overlay
  const [size, setSize] = useState({ width: 400, height: 400 }); // Size of the chat overlay
  const chatRef = useRef<HTMLDivElement | null>(null); // Reference to the chat overlay div
  const dragOffset = useRef({ x: 0, y: 0 }); // Offset for dragging
  const resizeOffset = useRef({ x: 0, y: 0 }); // Offset for resizing
  const [isDragging, setIsDragging] = useState(false); // State for dragging
  const [isResizing, setIsResizing] = useState(false); // State for resizing
  const [showDiscussionForm, setShowDiscussionForm] = useState(false); // State for showing discussion form
  const [discussionTitle, setDiscussionTitle] = useState(""); // Title for the discussion post
  const [discussionDescription, setDiscussionDescription] = useState(""); // Description for the discussion post
  const [firstName, setFirstName] = useState<string>(""); // Current user's first name
  const [lastName, setLastName] = useState<string>(""); // Current user's last name
  const [profileImage, setProfileImage] = useState<string | null>(null); // Current user's profile image
  const selectedUserObject = users.find((user) => user.email === selectedUser); // Object of the selected user
  const [otherfirstName, othersetFirstName] = useState<string>(""); // Other user's first name
  const [otherlastName, othersetLastName] = useState<string>(""); // Other user's last name


  //////////////////////////////////// Fetching or Saving Data ////////////////////////////////////
  // Get current user's email
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Set user's email
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Fetch all users except the current user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userEmail) return;
      updateReadReceipts(userEmail); // Update read receipts
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

            const userQuery = query(collection(db, "users"), where("email", "==", otherUserEmail));
            const userSnap = await getDocs(userQuery);

            let userId = "";
            if (!userSnap.empty) {
              userId = userSnap.docs[0].id; // Get the userId (document ID)
            }
            // Fetch the user's profile image from the nested structure
            const userDocRef = doc(db, "users", userId, "details", "profileData");
            console.log('UserRefrence', userDocRef);
            const userDoc = await getDoc(userDocRef);

            let profileImageUrl = null;
            if (userDoc.exists()) {
              profileImageUrl = userDoc.data()?.profileImage || null; // Get the profile image URL
              othersetFirstName(userDoc.data()?.firstName || null); // Set the first name
              othersetLastName(userDoc.data()?.lastName || null); // Set the last name
              console.log('profile image', userDoc.data());
            }

            return {
              email: otherUserEmail,
              chatId: chatDoc.id,
              hasMessages: true,
              profileImageUrl,
              userId, // Add userId to the return data
            };
          }
          return null;
        })
      );
      console.log('user list', usersList)
      setUsers(usersList.filter((user) => user !== null)); // Filter out null values and set users state
    };

    if (userEmail) fetchUsers(); // Fetch users if userEmail is present
  }, [userEmail]);

  // Find or create a chat when a user is selected
  useEffect(() => {
    if (!selectedUser || !userEmail) return;

    const chatRef = collection(db, "chats");
    const chatQuery = query(chatRef, where("participants", "array-contains", userEmail));

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const existingChat = snapshot.docs.find((doc) =>
        doc.data().participants.includes(selectedUser) // Check if there is an existing chat with selected user
      );

      if (existingChat) {
        setChatId(existingChat.id); // Set chat ID if chat exists
        setUnreadCount(existingChat.data().unreadMessages?.[userEmail] || 0); // Set unread count
      } else {
        const newChatRef = await addDoc(chatRef, {
          participants: [userEmail, selectedUser],
          unreadMessages: { [selectedUser]: 0, [userEmail]: 0 }, // Initialize unread messages
          lastMessage: "",
        });
        setChatId(newChatRef.id); // Set new chat ID
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [selectedUser, userEmail]);

  // Fetch messages for the chat and set up a listener
  useEffect(() => {
    if (!chatId || !userEmail) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc")); // Order messages by timestamp

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageDocs = snapshot.docs.map((doc) => doc.data());

      // Check for unread messages and update their status
      messageDocs.forEach((message, index) => {
        if (!message.readBy?.includes(userEmail)) {
          handleMessageRead(snapshot.docs[index].id); // Mark message as read
        }
      });

      setMessages(messageDocs); // Update messages state
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [chatId, userEmail]);  // Add userEmail as dependency to trigger updates when user changes


  //////////////////////////////////// Other Methods ////////////////////////////////////
  // Function to get initials from first and last name
  const getInitials = (firstName: string | null, lastName: string | null) =>
    `${firstName?.charAt(0).toUpperCase() ?? ""}${lastName?.charAt(0).toUpperCase() ?? ""}`;


  //////////////////////////////////// Handeling Messages ////////////////////////////////////
  // Update read receipts for current user
  const updateReadReceipts = async (userEmail: string) => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userEmail));

    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (doc) => {
      const chatData = doc.data();

      // Update unread messages and read timestamps if applicable
      if (chatData.unreadMessages && chatData.unreadMessages[userEmail] > 0) {
        const chatRef = doc.ref;
        await updateDoc(chatRef, {
          [`unreadMessages.${userEmail}`]: 0, // Set unread messages count to 0
          [`readTimestamps.${userEmail}`]: serverTimestamp(), // Update read timestamp
        });
      }
    });
  };

  // Mark a message as read
  const handleMessageRead = async (messageId: string) => {
    if (!messageId || !userEmail || !chatId) return;

    const messageRef = doc(db, "chats", chatId, "messages", messageId);

    // Update the message status to read by adding userEmail to the readBy array
    await updateDoc(messageRef, {
      readBy: arrayUnion(userEmail),  // Add the current user to the readBy array
    });

    // Now update the unreadMessages and readMessages fields in the chat document
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`unreadMessages.${userEmail}`]: Math.max(0, unreadCount - 1),  // Decrement unread count for the current user
      [`readMessages.${userEmail}`]: arrayUnion(messageId),  // Add messageId to readMessages array
    });
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageRef = collection(db, "chats", chatId, "messages");

    await addDoc(messageRef, {
      sender: userEmail,
      text: newMessage,
      timestamp: serverTimestamp(), // Add timestamp to the message
    });

    // Update chat with the last message and increment unread count for the receiver
    const chatDoc = doc(db, "chats", chatId);
    await updateDoc(chatDoc, {
      lastMessage: newMessage, // Update the last message
      [`unreadMessages.${selectedUser}`]: unreadCount + 1,  // Increment unread count for the receiver
    });

    setNewMessage(""); // Clear the message input
  };

  
  //////////////////////////////////// Handeling Discussion ////////////////////////////////////
  // Handle creating a discussion post
  const handleCreateDiscussionPost = async () => {
    if (!discussionTitle.trim() || !discussionDescription.trim()) return;

    const discussionRef = collection(db, "discussionPosts");
    await addDoc(discussionRef, {
      title: discussionTitle,
      description: discussionDescription,
      createdAt: new Date(), // Set creation date
      createdBy: userEmail, // Set creator's email
    });

    // Reset the fields and close the form
    setDiscussionTitle(""); // Clear title
    setDiscussionDescription(""); // Clear description
    setShowDiscussionForm(false); // Close discussion form
  };


  //////////////////////////////////// Window Movement ////////////////////////////////////
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x, // Calculate offset for dragging
      y: e.clientY - position.y,
    };
  };

  // Handle mouse move for dragging or resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x, // Update position based on drag
        y: e.clientY - dragOffset.current.y,
      });
    } else if (isResizing && resizeDirection) {
      const newWidth = Math.max(200, e.clientX - resizeOffset.current.x); // Calculate new width
      const newHeight = Math.max(200, e.clientY - resizeOffset.current.y); // Calculate new height
      const newPos = { x: position.x, y: position.y }; // Temp position

      if (resizeDirection.includes("left")) {
        newPos.x = e.clientX; // Update x position for left resize
      }

      if (resizeDirection.includes("top")) {
        newPos.y = e.clientY; // Update y position for top resize
      }

      setPosition(newPos); // Set updated position

      setSize({
        width: resizeDirection.includes("left") ? size.width - newWidth + position.x : newWidth, // Adjust width
        height: resizeDirection.includes("top") ? size.height - newHeight + position.y : newHeight, // Adjust height
      });
    }
  };

  // Handle mouse up for dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false); // Stop dragging
    setIsResizing(false); // Stop resizing
    setResizeDirection(null); // Reset resize direction
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    setIsResizing(true);
    setResizeDirection(direction); // Set the current resize direction
    resizeOffset.current = {
      x: e.clientX - size.width, // Calculate offset for resizing
      y: e.clientY - size.height,
    };
  };

  // Attach mouse events to handle dragging and resizing
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove); // Add mouse move event listener
      document.addEventListener("mouseup", handleMouseUp); // Add mouse up event listener
    } else {
      document.removeEventListener("mousemove", handleMouseMove); // Remove mouse move event listener
      document.removeEventListener("mouseup", handleMouseUp); // Remove mouse up event listener
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove); // Cleanup mouse move event listener
      document.removeEventListener("mouseup", handleMouseUp); // Cleanup mouse up event listener
    };
  }, [isDragging, isResizing]); // Depend on dragging and resizing state
  const initials = getInitials(firstName, lastName); // Get initials for the user


  //////////////////////////////////// Chat HTML ////////////////////////////////////
  return (
    <div
      ref={chatRef} // Reference to chat div
      className={styles.container}
      style={{
        top: `${position.y}px`, // Set top position
        left: `${position.x}px`, // Set left position
        width: `${size.width}px`, // Set width
        height: "auto",
      }}
      onMouseDown={handleMouseDown} // Handle mouse down for dragging
    >
      {/* Chat header with user info */}
      <div className={styles.header}>
        {/* Back Button */}
        {selectedUser && (
          <button className={styles.backButton} onClick={() => setSelectedUser(null)}>
            ← Back
          </button>
        )}
        {/* Chat Header */}
        <h3 className={styles.chatTitle}>
          {selectedUser ? `${otherfirstName} ${otherlastName}` : "Chats"}
        </h3>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>
      </div>
  
      <div className={styles.contentWrapper}>
        {/* Left section: Create Post Button & User Selection (vertical scroll) */}
        <div className={styles.leftSection}>
          {/* Create Discussion Post Button */}
          <button
            onClick={() => setShowDiscussionForm(!showDiscussionForm)}
            className={styles.createPostButton}
          >
            {showDiscussionForm ? "Cancel" : "Create Discussion Post"}
          </button>
  
          {/* User selection */}
          <div className="flex flex-col p-3">
            {users.length === 0 ? (
              <p className="text-gray-500">No active chats</p> // No chats message
            ) : (
              users
                .filter((user) => user.hasMessages) // Filter users with messages
                .map((user) => (
                  <div
                    key={user.email}
                    onClick={() => {
                      setChatId(user.chatId); // Set chat ID
                      setSelectedUser(user.email); // Set selected user
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        className="p-0 bg-transparent border-white"
                        onClick={() => {
                          setChatId(user.chatId); // Set chat ID
                          setSelectedUser(user); // Set selected user
                        }}
                      >
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            width={75}
                            height={75}
                            className="rounded-square border"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-square border flex items-center justify-center">
                            <span className="text-black font-bold text-3xl">
                              {getInitials(otherfirstName, otherlastName)}
                            </span>
                          </div>
                        )}
                      </button>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
  
        {/* Right section: Chat & Discussion Form */}
        <div className={styles.rightSection}>
          {/* Discussion Post Form */}
          {!selectedUser && showDiscussionForm && (
            <div className={styles.discussionForm}>
              <input
                type="text"
                placeholder="Enter the title of your discussion"
                value={discussionTitle}
                onChange={(e) => setDiscussionTitle(e.target.value)} // Update discussion title
                className={styles.inputField}
              />
              <textarea
                placeholder="Enter the description of your discussion"
                value={discussionDescription}
                onChange={(e) => setDiscussionDescription(e.target.value)} // Update discussion description
                className={`${styles.inputField} ${styles.textarea}`}
              />
              <button onClick={handleCreateDiscussionPost}>Create Discussion</button>
            </div>
          )}
  
          {/* Chat messages */}
          {selectedUser && (
            <>
              {/* Scrollable messages container */}
              <div className={styles.messageContainer}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${message.sender === userEmail ? styles.myMessage : styles.otherMessage}`}
                  >
                    <p>{message.text}</p>
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      {message.timestamp ? new Date(message.timestamp.seconds * 1000).toLocaleString() : "Just now"}
                    </span>
                  </div>
                ))}
              </div>
  
              {/* Message input area */}
              <div className={styles.inputArea}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)} // Update message input
                  className={`${styles.textarea} ${styles.messageInput}`}
                  placeholder="Type your message..." // Placeholder for message input
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()} // Disable button if message is empty
                  className={styles.sendButton}
                >
                  Send
                </button> {/* Button to send message */}
              </div>
            </>
          )}
        </div>
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
