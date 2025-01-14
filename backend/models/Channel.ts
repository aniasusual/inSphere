import { Document, Schema, model } from "mongoose";

// Define the TypeScript interface for a Channel
export interface IChannel extends Document {
    name: string;
    description?: string;
    createdBy: Schema.Types.ObjectId;
    members: Schema.Types.ObjectId[];
    isPrivate: boolean;
    visibilityRadius: number;
    posts: Schema.Types.ObjectId[];
    chat?: Schema.Types.ObjectId;
    hashtags: string[];
    createdAt?: Date;
    updatedAt?: Date;
}


const channelSchema = new Schema<IChannel>(
    {
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
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isPrivate: {
            type: Boolean,
            default: false
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post"
            }
        ],
        chat: {
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: true
    }
);

export const Channel = model<IChannel>("Channel", channelSchema);
