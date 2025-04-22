"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchuserById = exports.sendMessageInChat = exports.createNewChat = exports.fetchMessagesForChat = exports.fetchAllChats = void 0;
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User"); // Make sure you have this interface
const Message_1 = require("../models/Message"); // Add this interface too
// Fetch all chats for the authenticated user
const fetchAllChats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id; // From JWT
        console.log("userId: ", userId);
        const chats = yield Chat_1.Chat.find({
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
            const participants = chat.participants;
            const lastMessage = chat.lastMessage;
            const otherParticipant = participants.find((p) => p._id.toString() !== userId.toString());
            return {
                id: chat._id.toString(),
                name: otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.firstName,
                avatar: otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.avatar,
                lastMessage: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || '',
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
                status: (otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.status) || 'offline',
                userId: otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant._id.toString(), // For single chats
            };
        });
        res.json(formattedChats);
    }
    catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});
exports.fetchAllChats = fetchAllChats;
//Fetch messages for a specific chat
const fetchMessagesForChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        // Verify user is part of the chat
        const chat = yield Chat_1.Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
        });
        if (!chat) {
            res.status(403).json({ error: 'Chat not found or access denied' });
            return;
        }
        const messages = yield Message_1.Message.find({
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
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.fetchMessagesForChat = fetchMessagesForChat;
// Create a new single chat with a user
const createNewChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body; // ID of the other user
        const creatorId = req.user._id;
        if (!userId || userId === creatorId) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        // Check if user exists
        const otherUser = yield User_1.userModel.findById(userId);
        if (!otherUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Check if a single chat already exists
        const existingChat = yield Chat_1.Chat.findOne({
            type: 'single',
            participants: { $all: [creatorId, userId] },
            isActive: true,
        });
        if (existingChat) {
            res.status(200).json({ id: (existingChat === null || existingChat === void 0 ? void 0 : existingChat._id).toString() });
            return;
        }
        // Create new single chat
        const chat = new Chat_1.Chat({
            type: 'single',
            participants: [creatorId, userId],
            createdBy: creatorId,
            isActive: true,
            // Default jam ID or null (adjust based on your requirements)
            jam: null, // Assuming jam is optional for single chats
        });
        yield chat.save();
        res.status(201).json({ id: chat._id.toString() });
    }
    catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
});
exports.createNewChat = createNewChat;
const sendMessageInChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: 'Message content is required' });
            return;
        }
        // Verify user is part of the chat
        const chat = yield Chat_1.Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true,
        });
        if (!chat) {
            res.status(403).json({ error: 'Chat not found or access denied' });
            return;
        }
        // Create new message
        const message = new Message_1.Message({
            conversationId: chatId,
            senderId: userId,
            content: text,
            contentType: 'text',
            status: 'sent',
        });
        yield message.save();
        // Update chat's lastMessage
        // @ts-ignore
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        yield chat.save();
        // @ts-ignore
        res.status(201).json({ id: message._id.toString() });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
exports.sendMessageInChat = sendMessageInChat;
const fetchuserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.userModel.findById(userId).select('name avatar status');
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
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.fetchuserById = fetchuserById;
