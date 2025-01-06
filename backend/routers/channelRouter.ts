import express from "express";
import { createChannel } from "../controllers/channelController";
import { isAuthenticated } from "../middleware/auth";

const channelRouter = express.Router();

// Route to create a new channel
channelRouter.post("/create-channel", isAuthenticated, createChannel);

export default channelRouter;
