import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Notification document
export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    type: 'message' | 'mention' | 'reaction' | 'call' | 'system';
    content: string;
    relatedEntityId: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    read: boolean;
    createdAt: Date;
}

// Create the Mongoose Schema
const NotificationSchema: Schema = new Schema({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'mention', 'reaction', 'call', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    relatedEntityId: {
        type: Schema.Types.ObjectId,
        refPath: 'type',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient notification queries
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

// Create the model
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);