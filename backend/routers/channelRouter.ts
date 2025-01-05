import express from "express";
import { createChannel } from "../controllers/channelController";

const channelRouter = express.Router();

// Route to create a new channel
channelRouter.post("/create-channel", createChannel);

export default channelRouter;
