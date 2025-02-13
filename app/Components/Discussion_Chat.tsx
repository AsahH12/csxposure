import React from 'react';

interface ChatProps {
  messages: string[];
}

const Chat: React.FC<ChatProps> = ({ messages }) => {
  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd' }}>
      {messages.length === 0 ? (
        <p>No messages yet. Be the first to comment!</p>
      ) : (
        <div>
          {messages.map((msg, index) => (
            <div key={index} style={{ padding: '5px 0' }}>
              <p>{msg}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
