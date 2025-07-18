import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    googleId: string;
    firstName?: string;
    lastName?: string;
    email: string;
    username: string;
    password: string;
    phoneNumber?: number;
    userPosts: mongoose.Types.ObjectId[];
    channelsFollowed: mongoose.Types.ObjectId[];
    usersFollowed: mongoose.Types.ObjectId[];

    // Added bio field
    bio?: string;
    website?: string;

    preferences: {
        theme: 'light' | 'dark';
        notificationSettings: {
            messageNotifications: boolean;
            soundEnabled: boolean;
            pushNotifications: boolean;
        };
        privacySettings: {
            profileVisibility: 'public' | 'friends_only' | 'private';
            lastSeenVisibility: 'all' | 'contacts' | 'none';
        };
    };

    blockedUsers: string[];
    reportCount: number;
    status: 'online' | 'offline' | 'away' | 'do_not_disturb';
    lastSeen: Date;

    avatar?: {
        public_id: string;
        url: string;
    };

    // Added coverPhoto field
    coverPhoto?: {
        public_id: string;
        url: string;
    };

    location: {
        type: string;
        coordinates: [number, number];
    };
    fcmToken?: string;
    authToken?: string;
    createdAt: Date;
    verificationToken?: string;
    isVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    getJWTToken: () => string;
    comparePassword: (password: string) => Promise<boolean>;
}

// User Schema
const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        googleId: {
            type: String,
            // unique: true
        },
        firstName: {
            type: String,
            required: [false, "Please Enter Your Name"],
            maxLength: [30, "Name cannot exceed 30 characters"],
        },
        lastName: {
            type: String,
            required: [false, "Please Enter Your Last Name"],
            maxLength: [30, "Name cannot exceed 30 characters"],
        },
        email: {
            type: String,
            validate: [validator.isEmail, "Please Enter a valid Email"],
        },
        username: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            minLength: [8, "Password should be greater than 8 characters"],
            select: false,
        },
        phoneNumber: {
            type: Number,
            maxLength: [10, "Phone Number cannot exceed 10 digits"],
        },
        userPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        channelsFollowed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Channel",
            },
        ],
        usersFollowed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // Added bio field to schema
        bio: {
            type: String,
            maxLength: [160, "Bio cannot exceed 160 characters"],
            default: ""
        },
        website: {
            type: String,
            maxLength: [160, "Bio cannot exceed 160 characters"],
            default: ""
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark'],
                default: 'light'
            },
            notificationSettings: {
                messageNotifications: {
                    type: Boolean,
                    default: true
                },
                soundEnabled: {
                    type: Boolean,
                    default: true
                },
                pushNotifications: {
                    type: Boolean,
                    default: true
                }
            },
            privacySettings: {
                profileVisibility: {
                    type: String,
                    enum: ['public', 'friends_only', 'private'],
                    default: 'public'
                },
                lastSeenVisibility: {
                    type: String,
                    enum: ['all', 'contacts', 'none'],
                    default: 'all'
                }
            }
        },
        blockedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        avatar: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        // Added coverPhoto field to schema
        coverPhoto: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
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
        fcmToken: {
            type: String,
        },
        authToken: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        verificationToken: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries
userSchema.index({ location: "2dsphere" });

userSchema.index({ username: 'text', email: 'text' });

// JWT Token Method
userSchema.methods.getJWTToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "1d" } as jwt.SignOptions
    );
};

// Compare Password Method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// Password Hashing Middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// User Model
const userModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { userModel, IUser };