import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Conversation document
export interface IConversation extends Document {
    type: 'direct' | 'group' | 'channel';
    participants: mongoose.Types.ObjectId[];
    name?: string;
    lastMessage?: mongoose.Types.ObjectId;
    pinnedMessages?: mongoose.Types.ObjectId[];
    settings?: {
        isEncrypted: boolean;
        muteNotificationsUntil?: Date;
        admins?: mongoose.Types.ObjectId[];
    };
    mediaCount?: {
        images: number;
        files: number;
        videos: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const ConversationSchema: Schema = new Schema({
    type: {
        type: String,
        enum: ['direct', 'channel'],
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    name: {
        type: String,
        trim: true,
        maxlength: 100
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    pinnedMessages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    settings: {
        isEncrypted: {
            type: Boolean,
            default: false
        },
        muteNotificationsUntil: Date,
        admins: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    mediaCount: {
        images: {
            type: Number,
            default: 0
        },
        files: {
            type: Number,
            default: 0
        },
        videos: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for participants and type
ConversationSchema.index({ participants: 1, type: 1 });

// Create the model
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);