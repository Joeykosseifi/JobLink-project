const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile } = require('../controllers/userController');

// Protected routes (require authentication)
router.put('/update-profile', protect, updateProfile);

module.exports = router; 