import express from 'express';
import {
  getChatMessages,
  getConversations,
  markMessagesAsSeen,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All chat routes are protected
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getChatMessages);
router.put('/:userId/seen', protect, markMessagesAsSeen);

export default router;
