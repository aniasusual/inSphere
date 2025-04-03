import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    type: 'single' | 'group' | 'jam' | 'channel';
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
        enum: ['single', 'group', 'jam', 'channel'],
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: function (this: any) {
            return this.type !== 'channel'; // Channels may not require participants
        }
    }],
    name: {
        type: String,
        required: function (this: any) {
            return this.type === 'group' || this.type === 'jam' || this.type === 'channel';
        }
    },
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
        return next(new Error('Single chats must have exactly 2 participants'));
    }
    next();
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
