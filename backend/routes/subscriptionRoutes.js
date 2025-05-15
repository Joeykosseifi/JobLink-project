import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  updateSubscriptionPlan,
  getSubscriptionDetails
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get subscription details
router.get('/details', getSubscriptionDetails);

// Update subscription plan
router.post('/update', updateSubscriptionPlan);

export default router; 