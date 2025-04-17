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
exports.createChannel = void 0;
const Channel_1 = require("../models/Channel");
const createChannel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, isGlobal, hashtags, radius } = req.body;
        const createdBy = req.user._id;
        // Validate input
        if (!name || !createdBy) {
            res.status(400).json({ message: "Name and createdBy are required." });
            return;
        }
        // Create a new channel
        const newChannel = new Channel_1.Channel({
            name,
            description,
            createdBy,
            isGlobal: isGlobal || false,
            hashtags: hashtags || [],
            visibilityRadius: radius || 0
        });
        // Save the channel to the database
        const savedChannel = yield newChannel.save();
        res.status(201).json({ message: "Channel created successfully", channel: savedChannel });
    }
    catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.createChannel = createChannel;
