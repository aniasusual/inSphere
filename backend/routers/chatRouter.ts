import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { createNewChat, fetchAllChats, fetchMessagesForChat, fetchuserById, sendMessageInChat } from '../controllers/chatController';

const chatRouter = Router();
chatRouter.get('/all', isAuthenticated, fetchAllChats);
chatRouter.post('/newChat', isAuthenticated, createNewChat);
chatRouter.get('/user/:userId', fetchuserById);
chatRouter.route('/:chatId/messages').get(isAuthenticated, fetchMessagesForChat).post(isAuthenticated, sendMessageInChat);


export default chatRouter;