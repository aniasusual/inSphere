"use strict";
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
exports.getSearchData = exports.followUser = exports.updateUserLocation = exports.findUsersAround = exports.fetchUserById = exports.logout = exports.getUserDetails = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../utils/errorHandler");
// import { sendEmail } from "../utils/apifeatures";
const crypto_1 = __importDefault(require("crypto"));
const jwtToken_1 = require("../utils/jwtToken");
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, username } = req.body;
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const user = yield User_1.userModel.create({
            firstName,
            lastName,
            email,
            username,
            password,
            verificationToken,
            isVerified: false
        });
        if (!user) {
            return next(new errorHandler_1.ErrorHandler("User creation failed", 500));
        }
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Email Verification',
        //     message,
        // });
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            user
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                message: "User not created due to an unknown error",
                error: "Unknown error"
            });
        }
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next(new errorHandler_1.ErrorHandler("Please enter username and password", 400));
        }
        const user = yield User_1.userModel.findOne({ username }).select("+password");
        if (!user) {
            return next(new errorHandler_1.ErrorHandler("Invalid email or password", 401));
        }
        const isPasswordMatched = yield user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new errorHandler_1.ErrorHandler("Invalid email or password", 401));
        }
        // if (!user.isVerified) {
        //     const verificationToken = crypto.randomBytes(32).toString('hex');
        //     const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        //     const message = `Please verify your email by clicking on the link: \n\n ${verificationUrl}`;
        //     await sendEmail({
        //         email: user.email,
        //         subject: 'Email Verification',
        //         message,
        //     });
        //     // return next(new ErrorHandler("Please verify your email to login", 401));
        //     res.status(500).json({
        //         status: "verification",
        //         message: "You are not verified. Email Sent for Verification. Please verify 🙄"
        //     })
        // }
        // else
        (0, jwtToken_1.sendToken)(user, 200, res);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
});
exports.loginUser = loginUser;
const getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.status(200).json({
            status: "success",
            message: "User Loaded",
            user
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
});
exports.getUserDetails = getUserDetails;
const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err)
            return next(err);
        res.clearCookie("connect.sid", {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : false,
        });
        // Clear the token cookie
        res.cookie("token", "", {
            expires: new Date(Date.now()), // Set the cookie to expire immediately
            httpOnly: true,
        });
        res.status(200).json({
            message: "Logged Out",
        });
    });
};
exports.logout = logout;
const fetchUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield User_1.userModel.findOne({ _id: id });
        res.status(200).json({
            "success": true,
            user
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: `${error.message}`,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                message: "User not logged in due to an unknown error",
                error: "Unknown error"
            });
        }
    }
});
exports.fetchUserById = fetchUserById;
const findUsersAround = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // const currentUser = req.user;
        const { longitude, latitude, maxDistance } = req.body;
        if (!longitude && !latitude) {
            res.status(500).json({ success: false, message: 'Cant access your location, please give location permissions if not given already' });
            return;
        }
        ;
        if (!longitude) {
            res.status(500).json({ success: false, message: 'Longitude not provided' });
            return;
        }
        ;
        if (!latitude) {
            res.status(500).json({ success: false, message: 'Latitude not provided' });
            return;
        }
        ;
        try {
            const users = yield User_1.userModel.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: maxDistance * 1000
                    }
                }
            });
            res.json({ success: true, users });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to find users nearby' });
        }
    });
};
exports.findUsersAround = findUsersAround;
const updateUserLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { longitude, latitude } = req.body;
        if (!longitude && !latitude) {
            res.status(400).json({ success: false, message: 'Cannot access your location. Please grant location permissions if not already given.' });
            return;
        }
        if (!longitude) {
            res.status(400).json({ success: false, message: 'Longitude not provided' });
            return;
        }
        if (!latitude) {
            res.status(400).json({ success: false, message: 'Latitude not provided' });
            return;
        }
        const user = yield User_1.userModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Update user's location
        user.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };
        yield user.save();
        res.json({ success: true, message: 'User location updated successfully', user });
    }
    catch (error) {
        console.error('Error updating user location:', error);
        next(error); // Properly forward errors to the Express error handler
    }
});
exports.updateUserLocation = updateUserLocation;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const userIdToFollow = req.params.id;
    if (!currentUserId || !userIdToFollow) {
        res.status(400);
        throw new Error("User IDs are required");
    }
    if (currentUserId.toString() === userIdToFollow) {
        res.status(400).json({
            success: false,
            message: "You cannot follow yourself"
        });
        return;
    }
    try {
        const [currentUser, userToFollow] = yield Promise.all([
            User_1.userModel.findById(currentUserId),
            User_1.userModel.findById(userIdToFollow)
        ]);
        if (!currentUser) {
            res.status(404);
            throw new Error("Current user not found");
        }
        if (!userToFollow) {
            res.status(404).json({
                success: false,
                message: "User not found!"
            });
            return;
        }
        // Check if user is blocked
        if (userToFollow.blockedUsers.includes(currentUserId.toString())) {
            res.status(403).json({
                success: false,
                message: "You cannot follow this user"
            });
            return;
        }
        const isAlreadyFollowing = currentUser.usersFollowed.some(id => id.toString() === userIdToFollow);
        if (isAlreadyFollowing) {
            // Unfollow the user
            yield Promise.all([
                User_1.userModel.findByIdAndUpdate(currentUserId, { $pull: { usersFollowed: userIdToFollow } }, { new: true }),
                User_1.userModel.findByIdAndUpdate(userIdToFollow, { $inc: { followersCount: -1 } })
            ]);
            res.status(200).json({
                success: true,
                message: `Successfully unfollowed ${userToFollow.username}`,
                data: {
                    unfollowedUserId: userIdToFollow,
                    username: userToFollow.username
                }
            });
        }
        else {
            // Follow the user
            yield Promise.all([
                User_1.userModel.findByIdAndUpdate(currentUserId, { $push: { usersFollowed: userIdToFollow } }, { new: true }),
                User_1.userModel.findByIdAndUpdate(userIdToFollow, { $inc: { followersCount: 1 } })
            ]);
            res.status(200).json({
                success: true,
                message: `Successfully followed ${userToFollow.username}`,
                data: {
                    followedUserId: userIdToFollow,
                    username: userToFollow.username
                }
            });
        }
    }
    catch (error) {
        res.status(500);
        throw new Error("Error following/unfollowing user: " + error.message);
    }
});
exports.followUser = followUser;
const getSearchData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters
        const { q, status, location, radius, visibility, limit = "10", page = "1", } = req.query;
        // Build the MongoDB query
        const query = {};
        // Text search across username, email, firstName, lastName, and bio
        if (q) {
            query.$or = [
                { username: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { firstName: { $regex: q, $options: "i" } },
                { lastName: { $regex: q, $options: "i" } },
                { bio: { $regex: q, $options: "i" } },
            ];
        }
        // Filter by status
        if (status && ["online", "offline", "away", "do_not_disturb"].includes(status)) {
            query.status = status;
        }
        // Filter by profile visibility
        if (visibility &&
            ["public", "friends_only", "private"].includes(visibility)) {
            query["preferences.privacySettings.profileVisibility"] = visibility;
        }
        // Geospatial search
        if (location && radius) {
            try {
                const coords = JSON.parse(location);
                if (Array.isArray(coords) && coords.length === 2) {
                    query.location = {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [coords[0], coords[1]],
                            },
                            $maxDistance: parseInt(radius) || 10000, // Default 10km
                        },
                    };
                }
            }
            catch (error) {
                res.status(400).json({ error: "Invalid location format" });
                return;
            }
        }
        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        // Execute the query
        const users = yield User_1.userModel
            .find(query)
            .select("-password -authToken -resetPasswordToken -resetPasswordExpire -verificationToken") // Exclude sensitive fields
            .populate("userPosts", "title createdAt") // Populate basic post info
            .populate("usersFollowed", "username avatar") // Populate followed users
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Newest users first
        // Get total count for pagination
        const totalUsers = yield User_1.userModel.countDocuments(query);
        // Response
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalUsers / limitNum),
                totalUsers,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        console.error("Error in getUserSearchData:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.getSearchData = getSearchData;
