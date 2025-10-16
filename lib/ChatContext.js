import { createContext, useContext, useState } from "react";

// In-memory chat state that survives client-side route changes
// but resets on full refresh (no localStorage on purpose).
const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [writeMode, setWriteMode] = useState(false);

  return (
    <ChatContext.Provider
      value={{ messages, setMessages, inputText, setInputText, writeMode, setWriteMode }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

