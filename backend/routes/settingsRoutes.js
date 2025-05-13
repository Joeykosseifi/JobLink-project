import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings, deleteAccount } from '../controllers/settingsController.js';

const router = express.Router();

// Log all requests to settings routes
router.use((req, res, next) => {
  console.log(`Settings route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Protected routes (require authentication)
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.delete('/account', protect, deleteAccount);

console.log('Settings routes registered, including DELETE /account');

export default router; 