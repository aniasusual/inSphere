// post.routes.ts
import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { addComment, addReply, deleteComment, getComments } from "../controllers/commentController";
// Your authentication middleware

const commentRouter = express.Router();

// Public route
commentRouter.get("/comments/:postId", getComments);

// Protected routes
commentRouter.post("/:postId", isAuthenticated, addComment);
commentRouter.post("/:postId/reply/:commentId", isAuthenticated, addReply);
commentRouter.delete("/:commentId", isAuthenticated, deleteComment);

export default commentRouter;