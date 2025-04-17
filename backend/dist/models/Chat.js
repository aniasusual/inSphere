"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChatSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['single', 'group', 'jam', 'channel'],
        required: true
    },
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: function () {
                return this.type !== 'channel'; // Channels may not require participants
            }
        }],
    name: {
        type: String,
        required: function () {
            return this.type === 'group' || this.type === 'jam' || this.type === 'channel';
        }
    },
    avatar: { type: String },
    lastMessage: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Message'
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
// Ensure single chats have exactly 2 participants
ChatSchema.pre('save', function (next) {
    if (this.type === 'single' && this.participants.length !== 2) {
        return next(new Error('Single chats must have exactly 2 participants'));
    }
    next();
});
exports.Chat = mongoose_1.default.model('Chat', ChatSchema);
