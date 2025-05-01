import express from 'express';
import { 
  submitApplication, 
  getUserApplications, 
  getApplicationById
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Submit a new application
router.post('/', submitApplication);

// Get the authenticated user's applications
router.get('/my-applications', getUserApplications);

// Get a specific application (user can only access their own applications)
router.get('/:id', getApplicationById);

export default router; 