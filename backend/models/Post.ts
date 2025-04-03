import mongoose, { Document, Schema, Model } from "mongoose";

// Define the TypeScript interfaces for the schema
interface IMediaFile {
    mediaType: string;
    public_id?: string;
    url?: string;
}

interface IShare {
    user: mongoose.Schema.Types.ObjectId;
    date?: Date;
}

// Main Post interface extending Mongoose's Document
export interface IPost extends Document {
    creator: mongoose.Schema.Types.ObjectId;
    accessibility: "private" | "public";
    mediaFiles: IMediaFile[];
    title: string;
    description: string;
    likes: mongoose.Schema.Types.ObjectId[];
    comments: mongoose.Schema.Types.ObjectId[];
    shares: IShare[];
    savedBy: mongoose.Schema.Types.ObjectId[];
    location: {
        type: string;
        coordinates: [number, number];
    };
    hashtags: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const postSchema = new Schema<IPost>(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        accessibility: {
            type: String,
            enum: ["private", "public"],
            required: true,
            default: "public",
        },
        mediaFiles: [
            {
                mediaType: { type: String },
                public_id: { type: String },
                url: { type: String },
            },
        ],
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        shares: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        savedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
                default: [0, 0],
            },
        },
        hashtags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Export the model
export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
