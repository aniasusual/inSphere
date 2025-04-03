// comment.model.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IComment extends Document {
    user: mongoose.Schema.Types.ObjectId;
    post: mongoose.Schema.Types.ObjectId;
    content: string;
    parent?: mongoose.Schema.Types.ObjectId;
    replies?: mongoose.Schema.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);