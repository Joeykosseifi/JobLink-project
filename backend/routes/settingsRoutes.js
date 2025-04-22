const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Protected routes (require authentication)
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router; 