// 1. Get all comments for a post
import { Request, Response } from "express";
import asyncHandler from "express-async-handler"; // For error handling
import { Post } from "../models/Post";
import { Comment, IComment } from "../models/Comment";
const mongoose = require("mongoose");

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }

    // Fetch top-level comments (those without a parent)
    const comments = await Comment.find({ post: postId, parent: null })
        .populate({
            path: "user",
            select: "username avatar",
        })
        .populate({
            path: "replies",
            populate: {
                path: "user",
                select: "username avatar",
            },
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        comments,
    });
});

// 2. Add a new comment to a post
export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id; // Assuming user is added to req by auth middleware

    if (!content) {
        res.status(400).json({ success: false, message: "Content is required" });
        return;
    }

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }

    const comment = new Comment({
        user: userId,
        post: postId,
        content,
    });

    await comment.save();

    // Add comment reference to post
    post.comments.push(new mongoose.Types.ObjectId(comment._id));
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate({
        path: "user",
        select: "username avatar",
    });

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment: populatedComment,
    });
});

// 3. Add a reply to an existing comment
export const addReply = asyncHandler(async (req: Request, res: Response) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content) {
        res.status(400).json({ success: false, message: "Content is required" });
        return;
    }

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
        res.status(404).json({ success: false, message: "Parent comment not found" });
        return;
    }

    const reply = new Comment({
        user: userId,
        post: postId,
        content,
        parent: commentId,
    });

    await reply.save();

    // Add reply reference to parent comment
    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(new mongoose.Types.ObjectId(reply._id));
    await parentComment.save();

    const populatedReply = await Comment.findById(reply._id).populate({
        path: "user",
        select: "username avatar",
    });

    res.status(201).json({
        success: true,
        message: "Reply added successfully",
        comment: populatedReply,
    });
});

// 4. Delete a comment
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404).json({ success: false, message: "Comment not found" });
        return;
    }

    // Check if user is authorized to delete (only the comment creator)
    if (comment.user.toString() !== userId.toString()) {
        res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
        return;
    }

    // If comment has replies, we might want to handle them differently
    if (comment.replies && comment.replies.length > 0) {
        // Delete all replies
        await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // Remove comment from post
    await Post.updateOne(
        { _id: comment.post },
        { $pull: { comments: commentId } }
    );

    // If it's a reply, remove it from parent's replies array
    if (comment.parent) {
        await Comment.updateOne(
            { _id: comment.parent },
            { $pull: { replies: commentId } }
        );
    }

    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
});