"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const channelController_1 = require("../controllers/channelController");
const auth_1 = require("../middleware/auth");
const channelRouter = express_1.default.Router();
// Route to create a new channel
channelRouter.post("/create-channel", auth_1.isAuthenticated, channelController_1.createChannel);
exports.default = channelRouter;
