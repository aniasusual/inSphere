"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const postController_1 = require("../controllers/postController");
const multer_1 = require("../middleware/multer");
const postRouter = express_1.default.Router();
postRouter.post("/create-post", auth_1.isAuthenticated, multer_1.attachmentsMulter, postController_1.createPost);
postRouter.get("/my-feed", auth_1.isAuthenticated, postController_1.fetchMyFeedPosts);
postRouter.get("/like/:postId", auth_1.isAuthenticated, postController_1.toggleLike);
postRouter.get("/save/:postId", auth_1.isAuthenticated, postController_1.toggleSave);
postRouter.get("/detail/:postId", postController_1.getPostDetails);
postRouter.get("/getSearchData", postController_1.getSearchData);
postRouter.post("/find-post-around", postController_1.findPostsAround);
exports.default = postRouter;
