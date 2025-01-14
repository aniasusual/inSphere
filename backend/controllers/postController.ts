import { Request, Response } from 'express';
import { Post, IPost } from '../models/Post';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req: Request, res: Response): Promise<void> => {

    console.log("reaches here: ", req.body);

    try {

        const creator = req.user._id;

        const {
            title,
            description,
            isPrivate,
            hashtags: hashtagsString,
            location: locationString,
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
            location,
            hashtags,
            likes: [],
            comments: [],
            shares: [],
            savedBy: [],
        });

        const savedPost = await newPost.save();

        // Step 6: Respond with success
        res.status(201).json({
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