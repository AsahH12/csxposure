'use client'; // Ensure it's treated as a client component

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ChatOverlay from "../Components/ChatOverlay";

interface Chat {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user info from Firebase authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Get the email of the signed-in user
      } else {
        setUserEmail(null); // If not signed in, set email to null
      }
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="relative min-h-screen p-4">
      <h1 className="text-2xl">Dashboard</h1>

      {/* Display the signed-in user email */}
      {userEmail ? (
        <p className="text-lg mt-2">
          You are signed in as <span className="font-bold">{userEmail}</span>
        </p>
      ) : (
        <p className="text-lg mt-2 text-red-500">You are not signed in</p>
      )}

      {/* Render the chat overlay */}
      {isChatOpen && selectedChat && <ChatOverlay onClose={closeChat} />}
    </div>
  );
};

export default Dashboard;

