"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
// User Schema
const userSchema = new mongoose_1.default.Schema({
    googleId: {
        type: String,
        unique: true
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
        validate: [validator_1.default.isEmail, "Please Enter a valid Email"],
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    channelsFollowed: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Channel",
        },
    ],
    usersFollowed: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Index for geospatial queries
userSchema.index({ location: "2dsphere" });
userSchema.index({ username: 'text', email: 'text' });
// JWT Token Method
userSchema.methods.getJWTToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "1d" });
};
// Compare Password Method
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, this.password);
    });
};
// Password Hashing Middleware
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        this.password = yield bcryptjs_1.default.hash(this.password, 10);
        next();
    });
});
// User Model
const userModel = mongoose_1.default.model("User", userSchema);
exports.userModel = userModel;
