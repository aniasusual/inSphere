import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    contentType: 'text' | 'file' | 'image' | 'audio';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: mongoose.Types.ObjectId;
    readBy: Array<{
        user: mongoose.Types.ObjectId;
        readAt: Date;
    }>;
    reactions: Array<{
        user: mongoose.Types.ObjectId;
        emoji: string;
    }>;
    attachments?: Array<{
        public_id: string;
        url: string;
        mediaType: string;
    }>;
    isEdited: boolean;
    isDeleted: boolean;
    deliveredTo: mongoose.Types.ObjectId[];
}

const MessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
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
        enum: ['text', 'file', 'image', 'audio'],
        default: 'text'
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    readBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [
        {
            mediaType: { type: String },
            public_id: { type: String },
            url: { type: String },
        },
    ],
    reactions: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deliveredTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create text index for search
MessageSchema.index({ content: 'text' });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);