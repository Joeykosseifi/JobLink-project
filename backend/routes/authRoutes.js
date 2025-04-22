const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Debug route - remove in production
router.get('/debug/users', async (req, res) => {
  const User = require('../models/User');
  try {
    const users = await User.find().select('+active');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.get('/profile', protect, authController.getProfile);

module.exports = router; 