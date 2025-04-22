import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  Smile,
  Paperclip,
  Image,
  Search,
  X,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import logo from "@assets/hyperlocalNobg.png";
import defaultImage from "@assets/defaultImage.jpg";
import { useSocket } from "socket";

interface Chat {
  id: string;
  name: string;
  avatar: { url?: string };
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  status: "online" | "offline" | "typing";
  userId: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface User {
  id: string;
  name: string;
  avatar: { url?: string };
  status: "online" | "offline" | "typing";
}

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { socket, isConnected } = useSocket();

  // Fetch chats from backend
  useEffect(() => {
    console.log(typingUsers)
    const fetchChats = async () => {
      setLoadingChats(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/chat/all`,
          { withCredentials: true }
        );
        if (Array.isArray(response.data)) {
          setChats(response.data);
        } else {
          console.error("Expected array but got:", response.data);
          setChats([]);
        }
      } catch (err) {
        setError("Failed to load chats");
        console.error(err);
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Handle URL parameters and chat selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const chatId = params.get("chatId");

    // Only initialize if no selection is active already
    if (!selectedChat && !selectedUser) {
      if (chatId) {
        // Handle direct chat ID selection
        setSelectedChat(chatId);
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          setSelectedUser({
            id: chat.userId,
            name: chat.name,
            avatar: chat.avatar || { url: defaultImage },
            status: chat.status,
          });
        }
      } else if (userId) {
        // Handle user selection
        if (loadingChats) return;

        const existingChat = chats.find((chat) => chat.userId === userId);
        if (existingChat) {
          setSelectedChat(existingChat.id);
          setSelectedUser({
            id: existingChat.userId,
            name: existingChat.name,
            avatar: existingChat.avatar || { url: defaultImage },
            status: existingChat.status,
          });
        } else {
          const fetchUser = async () => {
            try {
              const response = await axios.get(
                `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/chat/user/${userId}`,
                { withCredentials: true }
              );
              setSelectedUser({
                id: response.data.id,
                name: response.data.name,
                avatar: response.data.avatar || { url: defaultImage },
                status: response.data.status,
              });
            } catch (err) {
              setError("Failed to load user");
              console.error(err);
              setSelectedUser(null);
            }
          };
          fetchUser();
        }
      }
    }
  }, [location.search, chats, loadingChats, selectedChat, selectedUser]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (
        selectedChat &&
        Array.isArray(chats) &&
        chats.find((c) => c.id === selectedChat)
      ) {
        setLoadingMessages(true);
        setError(null);
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/chat/${selectedChat}/messages`,
            { withCredentials: true }
          );
          setMessages(response.data);
        } catch (err) {
          setError("Failed to load messages");
          console.error(err);
        } finally {
          setLoadingMessages(false);
        }
      } else if (selectedChat) {
        // We have a selectedChat but it's not in our chats array yet
        // This could happen with a new chat
        setMessages([]);
      }
    };

    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat, chats]);

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !isConnected || !selectedChat) return;

    socket.emit("joinChat", { chatId: selectedChat });

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat
            ? {
              ...chat,
              lastMessage: message.text,
              timestamp: message.timestamp,
            }
            : chat
        )
      );
    };

    const handleTyping = ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === selectedChat) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(userId);
          return newSet;
        });
      }
    };

    const handleStopTyping = ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === selectedChat) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    };

    const handleUserStatus = ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.userId === userId ? { ...chat, status } : chat
        )
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status } : prev));
      }
    };

    socket.on("message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("userStatus", handleUserStatus);

    return () => {
      socket.emit("leaveChat", { chatId: selectedChat });
      socket.off("message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("userStatus", handleUserStatus);
    };
  }, [socket, isConnected, selectedChat, selectedUser]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !isConnected || !selectedChat || !newMessage) return;

    socket.emit("typing", { chatId: selectedChat });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId: selectedChat });
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, socket, isConnected, selectedChat]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let chatId = selectedChat;
    let isNewChat = !chatId && selectedUser;

    try {
      if (isNewChat && selectedUser) {
        const config = {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        };
        const chatResponse = await axios.post(
          `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/chat/newChat`,
          { userId: selectedUser.id },
          config
        );
        chatId = chatResponse.data.id;

        const newChat: Chat = {
          id: chatId as string,
          name: selectedUser.name,
          avatar: selectedUser.avatar,
          lastMessage: newMessage,
          timestamp: "Just now",
          status: selectedUser.status,
          userId: selectedUser.id,
        };

        setChats((prev) => [newChat, ...prev]);
        setSelectedChat(chatId);

        // Important: Update URL but don't trigger navigation that would reset state
        window.history.replaceState(null, '', `/chat?chatId=${chatId}`);
      }

      // Ensure we have a valid chat ID
      if (!chatId) {
        console.error("No chat ID available for sending message");
        return;
      }

      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const messageResponse = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/chat/${chatId}/messages`,
        { text: newMessage },
        config
      );

      const newMsg: Message = {
        id: messageResponse.data.id,
        text: newMessage,
        sender: "user",
        timestamp,
        status: "sent",
      };

      if (socket && isConnected) {
        socket.emit("sendMessage", {
          chatId,
          message: newMsg,
        });
      }

      setMessages((prev) => [...prev, newMsg]);

      // Update the last message in chat list
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, lastMessage: newMessage, timestamp: "Just now" }
            : chat
        )
      );

      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setSelectedUser(null);
    setMessages([]);
    navigate("/chat", { replace: true });
  };

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat.id);
    setSelectedUser({
      id: chat.userId,
      name: chat.name,
      avatar: chat.avatar || { url: defaultImage },
      status: chat.status,
    });

    // Update URL without triggering a full navigation
    window.history.replaceState(null, '', `/chat?chatId=${chat.id}`);
  };

  return (
    <div className="flex h-[97.5vh] box-border bg-gradient-to-br from-gray-100 to-cream-100 dark:from-gray-900 dark:to-charcoal-900 overflow-hidden box">
      <div
        className={`w-full sm:w-80 lg:w-96 bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-md border-r border-cream-200/50 dark:border-charcoal-700/50 flex flex-col transition-all duration-300 ${isMobileView && selectedChat ? "hidden" : "block"
          }`}
      >
        <div className="flex flex-row justify-between items-center p-4 border-b border-cream-200/50 dark:border-charcoal-700/50">
          <a
            href="/"
            className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold"
          >
            <img src={logo} alt="hyperlocal" className="max-w-14" />
          </a>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats"
                  className="w-full pl-10 pr-4 py-2 bg-cream-100/50 dark:bg-charcoal-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 dark:text-cream-200 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-4 text-center text-gray-600 dark:text-cream-300">
              Loading chats...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : !Array.isArray(chats) || chats.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-cream-300">
              No chats available
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-gradient-to-r hover:from-cream-100 hover:to-gold-50 dark:hover:from-charcoal-700 dark:hover:to-navy-800 transition-all duration-300 ${selectedChat === chat.id
                  ? "bg-gradient-to-r from-cream-100 to-gold-50 dark:from-charcoal-700 dark:to-navy-800"
                  : ""
                  }`}
              >
                <div className="relative">
                  <img
                    src={chat.avatar?.url || defaultImage}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-300 dark:ring-gold-500/50"
                  />
                  {chat.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-cream-50 dark:border-charcoal-800" />
                  )}
                  {chat.status === "typing" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gold-500 rounded-full border-2 border-cream-50 dark:border-charcoal-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium truncate dark:text-cream-200 text-navy-800">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-600 dark:text-cream-400 whitespace-nowrap">
                      {chat.timestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700 dark:text-cream-300 truncate">
                      {chat.status === "typing" ? (
                        <span className="text-gold-500 animate-pulse">
                          typing...
                        </span>
                      ) : (
                        chat.lastMessage
                      )}
                    </p>
                    {chat.unreadCount && (
                      <span className="ml-2 px-2 py-1 bg-gold-500 text-cream-50 text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div
        className={`flex-1 flex flex-col ${isMobileView && !selectedChat ? "hidden" : "block"
          }`}
      >
        {selectedChat && selectedUser ? (
          <>
            <div className="h-16 flex items-center justify-between px-4 bg-gradient-to-r from-navy-800 to-navy-900 text-cream-200 shadow-md">
              <div className="flex items-center gap-4">
                {isMobileView && (
                  <button
                    className="p-2 hover:bg-cream-200/10 rounded-full transition-all duration-300"
                    onClick={handleBackToChats}
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar?.url || defaultImage}
                      alt="User"
                      className="w-8 h-8 rounded-full ring-2 ring-cream-200/50"
                    />
                    {selectedUser.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-navy-900" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium">{selectedUser.name}</h2>
                    <p className="text-xs text-emerald-300">
                      {selectedUser.status === "online"
                        ? "Online"
                        : selectedUser.status === "typing"
                          ? "Typing..."
                          : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-cream-100 to-gray-100 dark:from-charcoal-900 dark:to-navy-950">
              {loadingMessages ? (
                <div className="text-center text-gray-600 dark:text-cream-300">
                  Loading messages...
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-cream-300">
                  No messages yet
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md md:max-w-lg ${message.sender === "user"
                        ? "bg-gradient-to-r from-navy-700 to-navy-800 text-cream-100 rounded-t-xl rounded-l-xl"
                        : "bg-cream-50/90 dark:bg-charcoal-800/90 dark:text-cream-200 rounded-t-xl rounded-r-xl backdrop-blur-md"
                        } p-3 md:p-4 shadow-md hover:shadow-lg transition-all duration-300`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`flex items-center mt-1 space-x-2 ${message.sender === "user"
                          ? "justify-end text-cream-300"
                          : "justify-start text-gray-600 dark:text-cream-400"
                          }`}
                      >
                        <span className="text-xs opacity-75">
                          {message.timestamp}
                        </span>
                        {message.sender === "user" && message.status && (
                          <span className="text-xs">
                            {message.status === "read" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 md:p-4 bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-md border-t border-cream-200/50 dark:border-charcoal-700/50">
              <div className="flex items-end gap-2 md:gap-4">
                <div className="flex-1 bg-cream-100/50 dark:bg-charcoal-700/50 rounded-xl p-2 shadow-md">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-transparent border-none focus:ring-0 max-h-32 min-h-[2.5rem] resize-none text-navy-800 dark:text-cream-200 placeholder-gray-500 dark:placeholder-cream-400 transition-all duration-300"
                    rows={1}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-cream-200/50 dark:border-charcoal-600/50">
                    <div className="flex gap-1">
                      <button className="p-1 md:p-2 hover:bg-cream-200/50 dark:hover:bg-charcoal-600/50 rounded-full transition-all duration-300">
                        <Smile className="w-5 h-5 text-gray-600 dark:text-cream-300" />
                      </button>
                      <button className="p-1 md:p-2 hover:bg-cream-200/50 dark:hover:bg-charcoal-600/50 rounded-full transition-all duration-300">
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-cream-300" />
                      </button>
                      <button className="p-1 md:p-2 hover:bg-cream-200/50 dark:hover:bg-charcoal-600/50 rounded-full transition-all duration-300">
                        <Image className="w-5 h-5 text-gray-600 dark:text-cream-300" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleSend(e)}
                  className="p-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 rounded-full text-cream-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-cream-100 to-gray-100 dark:from-charcoal-900 dark:to-navy-950">
            <div className="text-center p-8 bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-md rounded-xl shadow-lg">
              <MessageSquare className="w-16 h-16 mx-auto text-gold-500 mb-4" />
              <h3 className="text-2xl font-medium text-navy-800 dark:text-cream-200 mb-2">
                Begin Your Conversation
              </h3>
              <p className="text-gray-600 dark:text-cream-300">
                Select a chat to connect
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;