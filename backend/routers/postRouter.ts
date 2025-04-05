import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createPost, fetchMyFeedPosts, findPostsAround, getPostDetails, getSearchData, toggleLike, toggleSave } from "../controllers/postController";
import { attachmentsMulter } from "../middleware/multer";

const postRouter = express.Router();

postRouter.post("/create-post", isAuthenticated, attachmentsMulter, createPost);
postRouter.get("/my-feed", isAuthenticated, fetchMyFeedPosts);
postRouter.get("/like/:postId", isAuthenticated, toggleLike);
postRouter.get("/save/:postId", isAuthenticated, toggleSave);
postRouter.get("/detail/:postId", getPostDetails);
postRouter.get("/getSearchData", getSearchData);
postRouter.post("/find-post-around", findPostsAround);


export default postRouter;
