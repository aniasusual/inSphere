import mongoose, { Schema, Document } from 'mongoose';

// Interface for the FileUpload document
export interface IFileUpload extends Document {
    userId: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    fileUrl: string;
    filename: string;
    fileType: string;
    fileSize: number;
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
    };
    createdAt: Date;
}

// Create the Mongoose Schema
const FileUploadSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number
    }
}, {
    timestamps: true
});

// Compound index for efficient file queries
FileUploadSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });
FileUploadSchema.index({ fileType: 1 });

// Create the model
export const FileUpload = mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);