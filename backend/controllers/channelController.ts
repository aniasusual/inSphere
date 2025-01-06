import { Request, Response } from "express";
import { Channel } from "../models/Channel";

export const createChannel = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, isGlobal, hashtags, radius } = req.body;

        const createdBy = req.user._id;

        // Validate input
        if (!name || !createdBy) {
            res.status(400).json({ message: "Name and createdBy are required." });
            return;
        }

        // Create a new channel
        const newChannel = new Channel({
            name,
            description,
            createdBy,
            isGlobal: isGlobal || false,
            hashtags: hashtags || [],
            visibilityRadius: radius || 0
        });

        // Save the channel to the database
        const savedChannel = await newChannel.save();

        res.status(201).json({ message: "Channel created successfully", channel: savedChannel });
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
