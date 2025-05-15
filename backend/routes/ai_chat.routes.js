// chatRoutes.js - Define all chat-related routes
import express from 'express';
import {processChat,getChatHistory,clearChatHistory} from '../controllers/ai_chat.controller.js';

const router = express.Router();

// Route for handling chat messages
router.post('/chat', processChat);

// Route for conversation history (optional)
router.get('/history/:sessionId', getChatHistory);

// Route to clear conversation (optional)
router.delete('/history/:sessionId', clearChatHistory);

export default router;