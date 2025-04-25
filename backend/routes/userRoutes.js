import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.put('/profile', protect, updateProfile);

export default router; 