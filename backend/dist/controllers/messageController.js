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
exports.getMessages = exports.sendMessage = void 0;
const Message_1 = require("../models/Message");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jamId, content } = req.body;
    const user = req.user; // From auth middleware
    try {
        const message = new Message_1.Message({
            jam: jamId,
            sender: user._id,
            content,
        });
        yield message.save();
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jamId } = req.params;
    try {
        const messages = yield Message_1.Message.find({ jam: jamId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.getMessages = getMessages;
