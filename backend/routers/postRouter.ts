import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createPost } from "../controllers/postController";
import { attachmentsMulter } from "../middleware/multer";

const postRouter = express.Router();

postRouter.post("/create-post", isAuthenticated, attachmentsMulter, createPost);

export default postRouter;
