import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  updateProfile, 
  getAllUsers,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getUserConnections
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.put('/update-profile', protect, updateProfile);
router.get('/', protect, getAllUsers);

// Connection routes
router.post('/connect', protect, sendConnectionRequest);
router.post('/accept-connection', protect, acceptConnectionRequest);
router.post('/reject-connection', protect, rejectConnectionRequest);
router.get('/connections', protect, getUserConnections);

export default router; 