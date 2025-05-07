import React, { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, Smile } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  isOpen = false,
  onClose,
  userName = "You",
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to the chat! How can I help you today?",
      sender: "other",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Center the chat box when first opened
  useEffect(() => {
    if (isOpen && chatBoxRef.current) {
      const rect = chatBoxRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2,
      });

      // Focus the input when chat opens
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([...messages, userMessage]);
      setNewMessage("");

      // Simulate response (in a real app, this would come from your backend)
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! This is a simulated response.",
          sender: "other",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div
        ref={chatBoxRef}
        className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col w-full max-w-md sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 h-3/4 max-h-[600px]"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Chat Header */}
        <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-blue-400 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="text-sm">{message.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none mr-2"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none mr-2"
            title="Insert emoji"
          >
            <Smile size={20} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 py-2 px-3 rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!newMessage.trim()}
            className={`ml-2 p-2 rounded-full focus:outline-none ${
              newMessage.trim()
                ? "bg-blue-400 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
