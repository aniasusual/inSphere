import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    type: 'single' | 'group';
    participants: mongoose.Types.ObjectId[];
    name?: string;
    avatar?: string;
    lastMessage?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    admins?: mongoose.Types.ObjectId[];
    isActive: boolean;
}

const ChatSchema = new Schema({
    type: {
        type: String,
        enum: ['single', 'group'],
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    name: { type: String }, // Required for group chats
    avatar: { type: String },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
        type: Schema.Types.ObjectId,
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
        next(new Error('Single chats must have exactly 2 participants'));
    }
    next();
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);