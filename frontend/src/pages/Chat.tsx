import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Smile, Paperclip, Image, Search, Phone, Video,
    Menu, X, MessageSquare, Settings, User, Bell, ArrowLeft
} from 'lucide-react';
import { TopNav } from '@components/TopNav';
import logo from "@assets/hyperlocalNobg.png"

interface Chat {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    status: 'online' | 'offline' | 'typing';
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
}

const ChatPage = () => {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle responsive view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 640);
        };
        
        // Set initial state
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Scroll to bottom of messages when messages change or chat is selected
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat]);

    const chats: Chat[] = [
        { id: '1', name: 'Alex Morgan', avatar: '/api/placeholder/40/40', lastMessage: 'See you tomorrow!', timestamp: '2m ago', unreadCount: 3, status: 'online' },
        { id: '2', name: 'Sarah Wilson', avatar: '/api/placeholder/40/40', lastMessage: 'The project looks great!', timestamp: '1h ago', status: 'typing' },
        { id: '3', name: 'John Smith', avatar: '/api/placeholder/40/40', lastMessage: 'Can we meet later?', timestamp: '3h ago', status: 'offline' },
        { id: '4', name: 'Emily Davis', avatar: '/api/placeholder/40/40', lastMessage: 'Thanks for your help!', timestamp: 'Yesterday', status: 'online' },
        { id: '5', name: 'Michael Brown', avatar: '/api/placeholder/40/40', lastMessage: 'I sent you the files', timestamp: 'Yesterday', unreadCount: 1, status: 'offline' },
    ];

    const messages: Message[] = [
        { id: '1', text: 'Hey! How are you?', sender: 'other', timestamp: '10:30 AM' },
        { id: '2', text: 'I am doing great! Just finished the new design.', sender: 'user', timestamp: '10:31 AM', status: 'read' },
        { id: '3', text: 'Thats awesome! Can you share it with me?', sender: 'other', timestamp: '10:32 AM' },
        { id: '4', text: 'Sure, Ill send it over right away. It has all the new features we discussed.', sender: 'user', timestamp: '10:33 AM', status: 'read' },
        { id: '5', text: 'Perfect! Im excited to see it. Our client will be very happy with the progress.', sender: 'other', timestamp: '10:35 AM' },
    ];

    const handleSend = () => {
        if (newMessage.trim()) {
            // In a real app, you would add the message to the messages array
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
    };

    return (
        <div className="flex h-[97.5vh]  box-border bg-gradient-to-br from-gray-100 to-cream-100 dark:from-gray-900 dark:to-charcoal-900 overflow-hidden box">
            {/* Chat List Sidebar - hidden on mobile when chat is selected */}
            <div className={`w-full sm:w-80 lg:w-96 bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-md border-r border-cream-200/50 dark:border-charcoal-700/50 flex flex-col transition-all duration-300 ${isMobileView && selectedChat ? 'hidden' : 'block'}`}>
                {/* Search Header */}
                <div className="flex flex-row justify-between items-center p-4 border-b border-cream-200/50 dark:border-charcoal-700/50">
                    <a href="/" className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold">
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

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`w-full p-4 flex items-center gap-4 hover:bg-gradient-to-r hover:from-cream-100 hover:to-gold-50 dark:hover:from-charcoal-700 dark:hover:to-navy-800 transition-all duration-300 ${selectedChat === chat.id ? 'bg-gradient-to-r from-cream-100 to-gold-50 dark:from-charcoal-700 dark:to-navy-800' : ''}`}
                        >
                            <div className="relative">
                                <img
                                    src={chat.avatar}
                                    alt={chat.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-300 dark:ring-gold-500/50"
                                />
                                {chat.status === 'online' && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-cream-50 dark:border-charcoal-800" />
                                )}
                                {chat.status === 'typing' && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gold-500 rounded-full border-2 border-cream-50 dark:border-charcoal-800" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium truncate dark:text-cream-200 text-navy-800">{chat.name}</h3>
                                    <span className="text-xs text-gray-600 dark:text-cream-400 whitespace-nowrap">{chat.timestamp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700 dark:text-cream-300 truncate">
                                        {chat.status === 'typing' ? (
                                            <span className="text-gold-500 animate-pulse">typing...</span>
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
                    ))}
                </div>
            </div>

            {/* Main Chat Area - shown on mobile only when chat is selected */}
            <div className={`flex-1 flex flex-col ${isMobileView && !selectedChat ? 'hidden' : 'block'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 flex items-center justify-between px-4 bg-gradient-to-r from-navy-800 to-navy-900 text-cream-200 shadow-md">
                            <div className="flex items-center gap-4">
                                {isMobileView && (
                                    <button
                                        className="p-2 hover:bg-cream-200/10 rounded-full transition-all duration-300"
                                        onClick={handleBackToChats}
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={chats.find(c => c.id === selectedChat)?.avatar}
                                            alt="User"
                                            className="w-8 h-8 rounded-full ring-2 ring-cream-200/50"
                                        />
                                        {chats.find(c => c.id === selectedChat)?.status === 'online' && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-navy-900" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-medium">{chats.find(c => c.id === selectedChat)?.name}</h2>
                                        <p className="text-xs text-emerald-300">
                                            {chats.find(c => c.id === selectedChat)?.status === 'online' 
                                                ? 'Online' 
                                                : chats.find(c => c.id === selectedChat)?.status === 'typing'
                                                    ? 'Typing...'
                                                    : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-cream-200/10 rounded-full transition-all duration-300">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-cream-200/10 rounded-full transition-all duration-300">
                                    <Video className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-cream-100 to-gray-100 dark:from-charcoal-900 dark:to-navy-950">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs sm:max-w-md md:max-w-lg ${message.sender === 'user'
                                            ? 'bg-gradient-to-r from-navy-700 to-navy-800 text-cream-100 rounded-t-xl rounded-l-xl'
                                            : 'bg-cream-50/90 dark:bg-charcoal-800/90 dark:text-cream-200 rounded-t-xl rounded-r-xl backdrop-blur-md'
                                            } p-3 md:p-4 shadow-md hover:shadow-lg transition-all duration-300`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <div className={`flex items-center mt-1 space-x-2 ${message.sender === 'user' ? 'justify-end text-cream-300' : 'justify-start text-gray-600 dark:text-cream-400'}`}>
                                            <span className="text-xs opacity-75">{message.timestamp}</span>
                                            {message.sender === 'user' && message.status && (
                                                <span className="text-xs">{message.status === 'read' ? '✓✓' : '✓'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
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
                                    onClick={handleSend}
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