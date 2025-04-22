import { NextFunction, Request, Response } from "express";
import { Chat, IChat } from "../models/Chat";
import { IUser, userModel } from "../models/User"; // Make sure you have this interface
import { IMessage, Message } from "../models/Message"; // Add this interface too

// Fetch all chats for the authenticated user
export const fetchAllChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id; // From JWT
        console.log("userId: ", userId)
        const chats = await Chat.find({
            participants: userId,
            isActive: true,
        })
            .populate('participants', 'firstName avatar status')
            .populate({
                path: 'lastMessage',
                select: 'content createdAt',
                match: { deleted: false },
            })
            .lean();

        // Format chats for frontend
        const formattedChats = chats.map((chat) => {
            const participants = chat.participants as any;
            const lastMessage = chat.lastMessage as IMessage | undefined;

            const otherParticipant = participants.find(
                (p: any) => p._id.toString() !== userId.toString()
            );

            return {
                id: chat._id.toString(),
                name: otherParticipant?.firstName,
                avatar: otherParticipant?.avatar,
                lastMessage: lastMessage?.content || '',
                timestamp: lastMessage
                    ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : new Date(chat.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                unreadCount: 0, // Implement unread count logic if needed
                status: otherParticipant?.status || 'offline',
                userId: otherParticipant?._id.toString(), // For single chats
            };
        });

        res.json(formattedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};

//Fetch messages for a specific chat
export const fetchMessagesForChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
        });
        if (!chat) {
            res.status(403).json({ error: 'Chat not found or access denied' });
            return;
        }

        const messages = await Message.find({
            conversationId: chatId,
            deleted: false,
        })
            .populate('senderId', 'name avatar')
            .sort({ createdAt: 1 })
            .lean();

        // Format messages for frontend
        const formattedMessages = messages.map((msg) => ({
            id: msg._id.toString(),
            text: msg.content,
            sender: msg.senderId._id.toString() === userId ? 'user' : 'other',
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            status: msg.status,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}

// Create a new single chat with a user
export const createNewChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body; // ID of the other user
        const creatorId = req.user._id;

        if (!userId || userId === creatorId) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }

        // Check if user exists
        const otherUser = await userModel.findById(userId);
        if (!otherUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if a single chat already exists
        const existingChat: IChat | null = await Chat.findOne({
            type: 'single',
            participants: { $all: [creatorId, userId] },
            isActive: true,
        });

        if (existingChat) {
            res.status(200).json({ id: (existingChat?._id as any).toString() });
            return;
        }

        // Create new single chat
        const chat = new Chat({
            type: 'single',
            participants: [creatorId, userId],
            createdBy: creatorId,
            isActive: true,
            // Default jam ID or null (adjust based on your requirements)
            jam: null, // Assuming jam is optional for single chats
        });

        await chat.save();
        res.status(201).json({ id: (chat._id as any).toString() });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
}

export const sendMessageInChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: 'Message content is required' });
            return;
        }

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
        });
        if (!chat) {
            res.status(403).json({ error: 'Chat not found or access denied' });
            return;
        }

        // Create new message
        const message = new Message({
            conversationId: chatId,
            senderId: userId,
            content: text,
            contentType: 'text',
            status: 'sent',
        });

        await message.save();

        // Update chat's lastMessage
        // @ts-ignore
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        await chat.save();
        // @ts-ignore
        res.status(201).json({ id: message._id.toString() });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}

export const fetchuserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId).select('name avatar status');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user._id.toString(),
            name: user.firstName,
            avatar: user.avatar,
            status: user.status || 'offline',
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}

