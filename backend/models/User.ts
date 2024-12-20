import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new mongoose.Schema({
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
        required: [true, "Please Enter Your Password"],
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
        // required: [true, "Please Enter Your Phone Number"],
        // unique: true,
        // default: 8734599272,
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
        }
    ],
    avatar: {
        public_id: {
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        },
    },
    location: {
        type: {
            type: String,
            enum: ["Point"], // GeoJSON type
            default: "Point",
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]
            index: "2dsphere", // Create 2dsphere index for geospatial queries
            default: [0, 0],
        },
    },
    fcmToken: {
        type: String
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
)

userSchema.index({ location: "2dsphere" });

userSchema.methods.getJWTToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(
        { id: this._id }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: process.env.JWT_EXPIRE || "1d" } // Options with fallback
    );
};


userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.model("User", userSchema);

export default userModel;

