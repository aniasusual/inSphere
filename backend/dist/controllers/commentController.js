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
exports.deleteComment = exports.addReply = exports.addComment = exports.getComments = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler")); // For error handling
const Post_1 = require("../models/Post");
const Comment_1 = require("../models/Comment");
const mongoose = require("mongoose");
exports.getComments = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    // Verify post exists
    const post = yield Post_1.Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }
    // Fetch top-level comments (those without a parent)
    const comments = yield Comment_1.Comment.find({ post: postId, parent: null })
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
}));
// 2. Add a new comment to a post
exports.addComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.params;
    const { content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming user is added to req by auth middleware
    if (!content) {
        res.status(400).json({ success: false, message: "Content is required" });
        return;
    }
    const post = yield Post_1.Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }
    const comment = new Comment_1.Comment({
        user: userId,
        post: postId,
        content,
    });
    yield comment.save();
    // Add comment reference to post
    post.comments.push(new mongoose.Types.ObjectId(comment._id));
    yield post.save();
    const populatedComment = yield Comment_1.Comment.findById(comment._id).populate({
        path: "user",
        select: "username avatar",
    });
    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment: populatedComment,
    });
}));
// 3. Add a reply to an existing comment
exports.addReply = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!content) {
        res.status(400).json({ success: false, message: "Content is required" });
        return;
    }
    const post = yield Post_1.Post.findById(postId);
    if (!post) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
    }
    const parentComment = yield Comment_1.Comment.findById(commentId);
    if (!parentComment) {
        res.status(404).json({ success: false, message: "Parent comment not found" });
        return;
    }
    const reply = new Comment_1.Comment({
        user: userId,
        post: postId,
        content,
        parent: commentId,
    });
    yield reply.save();
    // Add reply reference to parent comment
    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(new mongoose.Types.ObjectId(reply._id));
    yield parentComment.save();
    const populatedReply = yield Comment_1.Comment.findById(reply._id).populate({
        path: "user",
        select: "username avatar",
    });
    res.status(201).json({
        success: true,
        message: "Reply added successfully",
        comment: populatedReply,
    });
}));
// 4. Delete a comment
exports.deleteComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const comment = yield Comment_1.Comment.findById(commentId);
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
        yield Comment_1.Comment.deleteMany({ _id: { $in: comment.replies } });
    }
    // Remove comment from post
    yield Post_1.Post.updateOne({ _id: comment.post }, { $pull: { comments: commentId } });
    // If it's a reply, remove it from parent's replies array
    if (comment.parent) {
        yield Comment_1.Comment.updateOne({ _id: comment.parent }, { $pull: { replies: commentId } });
    }
    yield Comment_1.Comment.deleteOne({ _id: commentId });
    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
    });
}));
