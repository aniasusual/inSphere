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
exports.findPostsAround = exports.getSearchData = exports.getPostDetails = exports.toggleSave = exports.toggleLike = exports.fetchMyFeedPosts = exports.createPost = void 0;
const Post_1 = require("../models/Post");
const cloudinary_1 = require("cloudinary");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const creator = req.user._id;
        const { title, description, isPrivate, hashtags: hashtagsString, locationString, channelId } = req.body;
        // Validate required fields
        if (!creator || !title || !description) {
            res.status(400).json({ error: "Creator, title, and description are required." });
            return;
        }
        // Step 3: Parse optional fields
        const hashtags = hashtagsString ? JSON.parse(hashtagsString) : [];
        const location = locationString
            ? JSON.parse(locationString)
            : { type: "Point", coordinates: [0, 0] };
        // Step 4: Process uploaded files
        const mediaFiles = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map(file => ({
            mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video',
            public_id: file.filename,
            url: file.path,
        }))) || [];
        // Step 5: Create new post
        const newPost = new Post_1.Post({
            creator,
            accessibility: isPrivate === 'true' ? 'private' : 'public',
            mediaFiles,
            title,
            description,
            location: {
                type: "Point",
                coordinates: location
            },
            hashtags,
            likes: [],
            comments: [],
            shares: [],
            savedBy: [],
        });
        const savedPost = yield newPost.save();
        // Step 6: Respond with success
        res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post: savedPost,
        });
    }
    catch (error) {
        console.error("Error in createPost:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.createPost = createPost;
// Optional: Helper function to handle file deletion in case of errors
const deleteUploadedFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const file of files) {
            if (file.filename) {
                yield cloudinary_1.v2.uploader.destroy(file.filename);
            }
        }
    }
    catch (error) {
        console.error('Error deleting files:', error);
    }
});
const fetchMyFeedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        // Fetch the user's followed users
        const user = yield User_1.userModel
            .findById(userId)
            .select('usersFollowed')
            .lean();
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Array of user IDs to fetch posts from (self + followed)
        const followedUserIds = [...user.usersFollowed, userId];
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Fetch posts, sorted by creation time (newest first)
        const posts = yield Post_1.Post
            .find({
                creator: { $in: followedUserIds },
                accessibility: 'public'
            })
            .sort({ createdAt: -1 }) // Ensures newest posts first, mixed across all users
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'creator',
                select: 'username avatar firstName lastName _id'
            })
            .lean();
        // Total count for pagination
        const totalPosts = yield Post_1.Post.countDocuments({
            creator: { $in: followedUserIds },
            accessibility: 'public'
        });
        // Example of how posts will be ordered:
        // If User A has 10 posts and User B has 4 posts, they'll be mixed like:
        // [A-post@10:00, B-post@9:59, A-post@9:58, B-post@9:57, ...]
        // based solely on createdAt timestamp
        const response = {
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                postsPerPage: limit
            }
        };
        res.status(200).json({
            success: true,
            data: response
        });
    }
    catch (error) {
        console.error('Error fetching feed posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching feed',
            error: error.message
        });
    }
});
exports.fetchMyFeedPosts = fetchMyFeedPosts;
const toggleLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming user ID is attached to req by auth middleware
        // Find the post
        const post = yield Post_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post not found",
            });
            return;
        }
        // Check if user has already liked the post
        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
            // Unlike the post
            post.likes = post.likes.filter((likeId) => likeId.toString() !== userId.toString());
        }
        else {
            // Like the post
            post.likes.push(userId);
        }
        // Save the updated post
        const updatedPost = yield post.save();
        res.status(200).json({
            success: true,
            message: hasLiked ? "Post unliked successfully" : "Post liked successfully",
            data: {
                postId: updatedPost._id,
                likesCount: updatedPost.likes.length,
                isLiked: !hasLiked,
            },
        });
        return;
    }
    catch (error) {
        console.error("Error in toggle like:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
        return;
    }
});
exports.toggleLike = toggleLike;
const toggleSave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming user ID is attached to req by auth middleware
        // Find the post
        const post = yield Post_1.Post.findById(postId);
        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post not found",
            });
            return;
        }
        // Check if user has already saved the post
        const hasSaved = post.savedBy.includes(userId);
        if (hasSaved) {
            // Unsave the post
            post.savedBy = post.savedBy.filter((savedUserId) => savedUserId.toString() !== userId.toString());
        }
        else {
            // Save the post
            post.savedBy.push(userId);
        }
        // Save the updated post
        const updatedPost = yield post.save();
        res.status(200).json({
            success: true,
            message: hasSaved ? "Post unsaved successfully" : "Post saved successfully",
            data: {
                postId: updatedPost._id,
                savedCount: updatedPost.savedBy.length,
                isSaved: !hasSaved,
            },
        });
        return;
    }
    catch (error) {
        console.error("Error in toggle save:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
        return;
    }
});
exports.toggleSave = toggleSave;
const getPostDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        // Validate postId
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            res.status(400).json({
                success: false,
                message: "Invalid post ID",
            });
            return;
        }
        // Fetch the post and populate the creator field
        const post = yield Post_1.Post.findById(postId)
            .populate({
                path: "creator",
                select: "firstName username avatar", // Only fetch necessary fields
            })
            .lean(); // Use lean() for better performance if you don't need a Mongoose document
        if (!post) {
            res.status(404).json({
                success: false,
                message: "Post not found",
            });
            return;
        }
        // Check accessibility (optional: adjust based on your auth logic)
        // if (post.accessibility === "private" && req.user) {
        //     // If private, only allow creator or authorized users to view
        //     if (post.creator._id.toString() !== req.user._id) {
        //         res.status(403).json({
        //             success: false,
        //             message: "You do not have permission to view this post",
        //         });
        //         return;
        //     }
        // }
        // // Format the response
        // const responsePost = {
        //     _id: post._id,
        //     creator: {
        //         _id: post.creator._id,
        //         firstName: post.creator.firstName,
        //         username: post.creator.username,
        //         avatar: post.creator.avatar,
        //     },
        //     accessibility: post.accessibility,
        //     mediaFiles: post.mediaFiles,
        //     title: post.title,
        //     description: post.description,
        //     likes: post.likes,
        //     comments: post.comments,
        //     shares: post.shares,
        //     savedBy: post.savedBy,
        //     location: post.location,
        //     hashtags: post.hashtags,
        //     createdAt: post.createdAt,
        //     updatedAt: post.updatedAt,
        // };
        res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            post: post,
        });
        return;
    }
    catch (error) {
        console.error("Error fetching post details:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching post details",
            error: error.message,
        });
        return;
    }
});
exports.getPostDetails = getPostDetails;
const getSearchData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters
        const { q, creator, accessibility, location, radius, limit = "10", page = "1", } = req.query;
        // Build the MongoDB query
        const query = {};
        // Text search across title, description, and hashtags
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { hashtags: { $regex: q, $options: "i" } },
            ];
        }
        // Filter by creator
        if (creator && mongoose_1.default.Types.ObjectId.isValid(creator)) {
            query.creator = new mongoose_1.default.Types.ObjectId(creator);
        }
        // Filter by accessibility
        if (accessibility === "private" || accessibility === "public") {
            query.accessibility = accessibility;
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
                1;
            }
        }
        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        // Execute the query
        const posts = yield Post_1.Post.find(query)
            .populate("creator", "username profileImage") // Populate creator details
            .populate("comments", "content createdAt") // Populate comments
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Newest first
        // Get total count for pagination
        const totalPosts = yield Post_1.Post.countDocuments(query);
        // Response
        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalPosts / limitNum),
                totalPosts,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        console.error("Error in getPostSearchData:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.getSearchData = getSearchData;
// Enhanced API endpoint
const findPostsAround = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Type the request body
        const { longitude, latitude, maxDistance } = req.body;
        // Validate input parameters
        if (!longitude || !latitude) {
            res.status(400).json({
                success: false,
                message: 'Both longitude and latitude are required'
            });
            return;
        }
        if (isNaN(longitude) || isNaN(latitude)) {
            res.status(400).json({
                success: false,
                message: 'Longitude and latitude must be valid numbers'
            });
            return;
        }
        // Set default maxDistance if not provided (e.g., 10km)
        const distanceInMeters = (maxDistance || 10) * 1000;
        // Query posts using geospatial search
        const posts = yield Post_1.Post.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: distanceInMeters
                }
            }
        })
            .populate('creator', 'username profilePicture') // Optional: populate creator info
            .populate('comments') // Optional: populate comments
            .lean(); // Convert to plain JavaScript objects
        console.log("Posts found:", posts.length);
        // Return success response with found posts
        res.status(200).json({
            success: true,
            message: posts.length > 0 ? 'Posts found nearby' : 'No posts found nearby',
            data: {
                posts,
                count: posts.length,
                distanceSearched: distanceInMeters / 1000 // Return in kilometers
            }
        });
        return;
    }
    catch (error) {
        console.error('Error in findPostsAround:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to find posts nearby',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
});
exports.findPostsAround = findPostsAround;
