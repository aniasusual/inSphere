// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { Message, IMessage } from '../models/Message';
import { IUser } from '../models/User';

export const sendMessage = async (req: Request, res: Response) => {
    const { jamId, content } = req.body;
    const user = req.user as IUser; // From auth middleware
    try {
        const message = new Message({
            jam: jamId,
            sender: user._id,
            content,
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    const { jamId } = req.params;
    try {
        const messages = await Message.find({ jam: jamId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};