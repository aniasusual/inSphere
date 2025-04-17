"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messageController_1 = require("../controllers/messageController");
const messageRouter = (0, express_1.Router)();
messageRouter.post('/send', auth_1.isAuthenticated, messageController_1.sendMessage);
messageRouter.get('/:jamId', auth_1.isAuthenticated, messageController_1.getMessages);
exports.default = messageRouter;
