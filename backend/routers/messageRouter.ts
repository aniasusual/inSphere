import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getMessages, sendMessage } from '../controllers/messageController';

const messageRouter = Router();
messageRouter.post('/send', isAuthenticated, sendMessage);
messageRouter.get('/:jamId', isAuthenticated, getMessages);

export default messageRouter;