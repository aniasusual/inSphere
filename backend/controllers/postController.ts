import { Request, Response } from 'express';
import { Post, IPost } from '../models/Post';
import { v2 as cloudinary } from 'cloudinary';
import { userModel } from '../models/User';
import mongoose from 'mongoose';

export const createPost = async (req: Request, res: Response): Promise<void> => {

    try {
        const creator = req.user._id;

        const {
            title,
            description,
            isPrivate,
            hashtags: hashtagsString,
            locationString,
            channelId
        } = req.body;


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
        const mediaFiles = (req.files as Express.Multer.File[])?.map(file => ({
            mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video',
            public_id: file.filename,
            url: file.path,
        })) || [];

        // Step 5: Create new post
        const newPost: IPost = new Post({
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

        const savedPost = await newPost.save();

        // Step 6: Respond with success
        res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post: savedPost,
        });

    } catch (error: any) {
        console.error("Error in createPost:", error);
        res.status(500).json({ error: error.message });
    }
};


// Optional: Helper function to handle file deletion in case of errors
const deleteUploadedFiles = async (files: Express.Multer.File[]) => {
    try {
        for (const file of files) {
            if (file.filename) {
                await cloudinary.uploader.destroy(file.filename);
            }
        }
    } catch (error) {
        console.error('Error deleting files:', error);
    }
};

export const fetchMyFeedPosts = async (req: Request, res: Response): Promise<void> => {

    try {
        const userId = req.user._id;

        // Fetch the user's followed users
        const user = await userModel
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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Fetch posts, sorted by creation time (newest first)
        const posts = await Post
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
        const totalPosts = await Post.countDocuments({
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

    } catch (error: any) {
        console.error('Error fetching feed posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching feed',
            error: error.message
        });
    }
}

export const toggleLike = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming user ID is attached to req by auth middleware

        // Find the post
        const post = await Post.findById(postId);

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
            post.likes = post.likes.filter(
                (likeId) => likeId.toString() !== userId.toString()
            );
        } else {
            // Like the post
            post.likes.push(userId);
        }

        // Save the updated post
        const updatedPost = await post.save();

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

    } catch (error: any) {
        console.error("Error in toggle like:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
        return;
    }
}

export const toggleSave = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id; // Assuming user ID is attached to req by auth middleware

        // Find the post
        const post = await Post.findById(postId);

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
            post.savedBy = post.savedBy.filter(
                (savedUserId) => savedUserId.toString() !== userId.toString()
            );
        } else {
            // Save the post
            post.savedBy.push(userId);
        }

        // Save the updated post
        const updatedPost = await post.save();

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

    } catch (error: any) {
        console.error("Error in toggle save:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
        return;
    }
}

export const getPostDetails = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        // Validate postId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({
                success: false,
                message: "Invalid post ID",
            });
            return;
        }

        // Fetch the post and populate the creator field
        const post = await Post.findById(postId)
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
    } catch (error: any) {
        console.error("Error fetching post details:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching post details",
            error: error.message,
        });
        return;
    }
};

// Interface for query parameters (optional)
interface SearchQuery {
    q?: string; // Search term for title, description, or hashtags
    creator?: string; // User ID
    accessibility?: "private" | "public";
    location?: string; // GeoJSON coordinates as string
    radius?: string; // Radius in meters for location search
    limit?: string;
    page?: string;
}

export const getSearchData = async (req: Request, res: Response) => {
    console.log("reaches here")
    try {
        // Extract query parameters
        const {
            q,
            creator,
            accessibility,
            location,
            radius,
            limit = "10",
            page = "1",
        } = req.query as SearchQuery;

        console.log("reaches here")

        // Build the MongoDB query
        const query: any = {};

        // Text search across title, description, and hashtags
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { hashtags: { $regex: q, $options: "i" } },
            ];
        }

        // Filter by creator
        if (creator && mongoose.Types.ObjectId.isValid(creator)) {
            query.creator = new mongoose.Types.ObjectId(creator);
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
            } catch (error) {
                res.status(400).json({ error: "Invalid location format" });
                1;
            }
        }

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Execute the query
        const posts = await Post.find(query)
            .populate("creator", "username profileImage") // Populate creator details
            .populate("comments", "content createdAt") // Populate comments
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Newest first

        // Get total count for pagination
        const totalPosts = await Post.countDocuments(query);

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
    } catch (error) {
        console.error("Error in getPostSearchData:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};


interface LocationQuery {
    longitude: number;
    latitude: number;
    maxDistance: number; // in kilometers
}

// Enhanced API endpoint
export const findPostsAround = async (req: Request, res: Response) => {
    try {
        // Type the request body
        const { longitude, latitude, maxDistance } = req.body as LocationQuery;

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
        const posts = await Post.find({
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

    } catch (error: any) {
        console.error('Error in findPostsAround:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to find posts nearby',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return
    }
};

