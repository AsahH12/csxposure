'use client'
import { useState } from "react";
import ChatOverlay from "../Components/ChatOverlay";

interface Chat {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

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

      {/* Example Button to Open Chat */}
      <button
        onClick={() => openChat({ id: "1", name: "John Doe" })}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Chat with John
      </button>

      {/* Chat Overlay Component */}
    </div>
  );
};

export default Dashboard;
