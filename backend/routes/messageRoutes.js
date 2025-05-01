import express from 'express';
import { submitMessage, getAllMessages, markMessageAsRead, deleteMessage } from '../controllers/messageController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public route for submitting contact messages
router.post('/submit', submitMessage);

// Protected admin routes
router.get('/', protect, restrictTo('admin'), getAllMessages);
router.patch('/:id/read', protect, restrictTo('admin'), markMessageAsRead);
router.delete('/:id', protect, restrictTo('admin'), deleteMessage);

export default router; 