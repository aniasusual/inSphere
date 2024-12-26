import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    username: string;
    password: string;
    phoneNumber?: number;
    userPosts: mongoose.Types.ObjectId[];
    channelsFollowed: mongoose.Types.ObjectId[];
    communitiesFollowed: mongoose.Types.ObjectId[];
    usersFollowed: mongoose.Types.ObjectId[];
    avatar?: {
        public_id: string;
        url: string;
    };
    location: {
        type: string;
        coordinates: [number, number];
    };
    fcmToken?: string;
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
            required: [true, "Please Enter Your Email"],
            unique: true,
            validate: [validator.isEmail, "Please Enter a valid Email"],
        },
        username: {
            type: String,
            required: [true, "Please Enter Your Username"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please Enter Your Password"],
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
        communitiesFollowed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Community",
            },
        ],
        usersFollowed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        avatar: {
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

// JWT Token Method
userSchema.methods.getJWTToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(
        { id: this._id }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: process.env.JWT_EXPIRE || "1d" } // Options with fallback
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
