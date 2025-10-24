// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshChatHistory = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ChatContext.Provider value={{
      chatHistory,
      setChatHistory,
      refreshChatHistory,
      refreshTrigger
    }}>
      {children}
    </ChatContext.Provider>
  );
};