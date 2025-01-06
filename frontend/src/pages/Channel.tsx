import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@components/ui/shadcn/card";
import { Button } from "@components/ui/shadcn/button";
import { Input } from "@components/ui/shadcn/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/shadcn/tabs";
import { ScrollArea } from "@components/ui/shadcn/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/shadcn/avatar";
import { Separator } from "@components/ui/shadcn/separator";
import {
    MessageSquare,
    Send,
    Users,
    MapPin,
    Clock,
    ThumbsUp,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Image as ImageIcon,
    Smile,
} from 'lucide-react';
import { Post } from '@components/Post';

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface Message {
    id: string;
    user: User;
    content: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
}

interface Post {
    id: string;
    user: User;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: Date;
    hashtags: string[];
}

interface ChannelData {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    radius: number;
    hashtags: string[];
    isGlobal: boolean;
    owner: User;
}

const MessageBubble = ({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => {
    const bubbleClass = `
        group flex items-start space-x-2 
        ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}
        animate-in slide-in-from-bottom-2 duration-300
    `;

    const contentClass = `
        relative max-w-[80%] rounded-2xl p-3
        ${isCurrentUser ?
            'bg-primary text-primary-foreground ml-2' :
            'bg-muted dark:bg-gray-800 mr-2'
        }
        transition-all duration-200
        hover:shadow-lg
        ${message.status === 'sending' ? 'opacity-70' : 'opacity-100'}
    `;

    return (
        <div className={bubbleClass}>
            <Avatar className="w-8 h-8 transition-transform duration-200 group-hover:scale-110">
                <AvatarImage src={message.user.avatar} />
                <AvatarFallback>{message.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className={contentClass}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                        {message.user.name}
                    </span>
                    <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                    </span>
                </div>
                <p className="text-sm break-words">
                    {message.content}
                </p>
                {message.status === 'sending' && (
                    <div className="absolute bottom-1 right-2 text-xs opacity-70">
                        sending...
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatInput = ({ onSend }: { onSend: (content: string) => void }) => {
    const [message, setMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative mt-4">
            <div className={`
                flex items-end space-x-2
                transition-all duration-300 ease-in-out
                ${isExpanded ? 'bg-muted dark:bg-black rounded-lg p-2' : ''}
            `}>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
                    >
                        <Smile className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        onBlur={() => !message && setIsExpanded(false)}
                        placeholder="Type a message..."
                        className="transition-all duration-200"
                    />
                </div>
                <Button
                    type="submit"
                    className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                    disabled={!message.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
};

const ChannelPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeTab, setActiveTab] = useState('posts');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const channel: ChannelData = {
        id: '1',
        name: 'Local Tech Community',
        description: 'A place for tech enthusiasts to connect and share knowledge',
        memberCount: 256,
        radius: 5,
        hashtags: ['#tech', '#coding', '#community'],
        isGlobal: false,
        owner: {
            id: '1',
            name: 'John Doe',
            avatar: '/api/placeholder/32/32'
        }
    };

    const [posts] = useState<Post[]>([
        {
            id: '1',
            user: { id: '2', name: 'Alice Smith', avatar: '/api/placeholder/32/32' },
            content: 'Just launched my new project! Looking for beta testers.',
            image: '/api/placeholder/400/300',
            likes: 24,
            comments: 8,
            timestamp: new Date(),
            hashtags: ['#launch', '#beta', '#tech']
        }
    ]);

    useEffect(() => {
        if (chatEndRef.current) {
            const scrollOptions = {
                behavior: messages.length > 1 ? 'smooth' : 'auto',
                block: 'end'
            } as ScrollIntoViewOptions;

            chatEndRef.current.scrollIntoView(scrollOptions);
        }
    }, [messages]);

    const sendMessage = (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            user: { id: 'current-user', name: 'You', avatar: '/api/placeholder/32/32' },
            content,
            timestamp: new Date(),
            status: 'sending'
        };

        setMessages(prev => [...prev, newMessage]);

        setTimeout(() => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === newMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                )
            );
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
            <div className="sticky top-0 bg-white z-15 dark:bg-black shadow-sm !z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold">{channel.name}</h1>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Users className="h-4 w-4" />
                                    <span>{channel.memberCount} members</span>
                                    <span>•</span>
                                    <MapPin className="h-4 w-4" />
                                    <span>{channel.radius}km radius</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {channel.hashtags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary dark:bg-primary/20"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
                    <TabsList className="grid w-60 grid-cols-2 mb-6 bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
                        <TabsTrigger value="posts" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Posts
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Live Chat
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-6 flex flex-col justify-center items-center">
                        {posts.map(post => (
                            <div>
                                <Post />
                                <Post />
                                <Post />
                                <Post />
                                <Post />
                                <Post />
                                <Post />
                                <Post />

                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="chat" className="h-[calc(100vh-18rem)]">
                        <Card className="h-full border-none shadow-lg transition-shadow duration-300 hover:shadow-xl bg-gray-200 dark:bg-black text-black dark:text-white">
                            <CardContent className="p-4 h-full flex flex-col">
                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-6 pb-4">
                                        {messages.map(message => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                isCurrentUser={message.user.id === 'current-user'}
                                            />
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                </ScrollArea>
                                <ChatInput onSend={sendMessage} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ChannelPage;