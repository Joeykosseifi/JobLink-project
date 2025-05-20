import express from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Debug route - remove in production
router.get('/debug/users', async (req, res) => {
  const User = require('../models/User.js');
  try {
    const users = await User.find().select('+active');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.get('/profile', protect, getProfile);

export default router; 