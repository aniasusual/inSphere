"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const mongoose_1 = require("mongoose");
const channelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isPrivate: {
        type: Boolean,
        default: false
    },
    posts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    chat: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ChatRoom"
    },
    hashtags: [
        {
            type: String,
            trim: true,
            lowercase: true
        }
    ],
    visibilityRadius: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});
exports.Channel = (0, mongoose_1.model)("Channel", channelSchema);
