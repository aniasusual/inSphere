"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// post.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const commentController_1 = require("../controllers/commentController");
// Your authentication middleware
const commentRouter = express_1.default.Router();
// Public route
commentRouter.get("/comments/:postId", commentController_1.getComments);
// Protected routes
commentRouter.post("/:postId", auth_1.isAuthenticated, commentController_1.addComment);
commentRouter.post("/:postId/reply/:commentId", auth_1.isAuthenticated, commentController_1.addReply);
commentRouter.delete("/:commentId", auth_1.isAuthenticated, commentController_1.deleteComment);
exports.default = commentRouter;
