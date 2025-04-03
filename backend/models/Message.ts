import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Message document
export interface IMessage extends Document {
    jam: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    contentType: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location';
    status: 'sent' | 'delivered' | 'read';
    metadata?: {
        fileUrl?: string;
        fileSize?: number;
        filetype?: string;
        duration?: number;
        location?: {
            latitude: number;
            longitude: number;
        };
    };
    replyTo?: mongoose.Types.ObjectId;
    reactions?: {
        [emojiCode: string]: mongoose.Types.ObjectId[];
    };
    edited: boolean;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const MessageSchema: Schema = new Schema({
    jam: { type: Schema.Types.ObjectId, ref: 'Jam', required: true },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['text', 'image', 'file', 'voice', 'video', 'location'],
        default: 'text'
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    metadata: {
        fileUrl: String,
        fileSize: Number,
        filetype: String,
        duration: Number,
        location: {
            latitude: Number,
            longitude: Number
        }
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    reactions: {
        type: Map,
        of: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    edited: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Text index for message content
MessageSchema.index({ content: 'text' });

// Compound index for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Create the model
export const Message = mongoose.model<IMessage>('Message', MessageSchema);