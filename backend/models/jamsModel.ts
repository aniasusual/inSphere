// src/models/Jam.ts
import mongoose, { Schema } from 'mongoose';

const JamSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: true },
    inviteCode: { type: String, unique: true }, // For private jams
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
    displayImage: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    maxParticipants: { type: Number, default: 50 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Geospatial index for local jams
JamSchema.index({ location: '2dsphere' });

export const Jam = mongoose.model('Jam', JamSchema);

// TypeScript interface
export interface IJam extends mongoose.Document {
    name: string;
    description?: string;
    creator: mongoose.Types.ObjectId;
    isPublic: boolean;
    inviteCode?: string;
    displayImage?: {
        public_id: string;
        url: string;
    };

    location: {
        type: string;
        coordinates: [number, number];
    };
    participants: mongoose.Types.ObjectId[];
    maxParticipants: number;
    createdAt: Date;
    updatedAt: Date;
}