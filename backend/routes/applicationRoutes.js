import express from 'express';
import { 
  submitApplication, 
  getUserApplications, 
  getApplicationById,
  getJobPosterApplications
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { uploadCV, handleFileUploadError } from '../middleware/fileUpload.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Submit a new application with file upload
router.post('/', uploadCV.single('cv'), handleFileUploadError, submitApplication);

// Get the authenticated user's applications
router.get('/my-applications', getUserApplications);

// Get applications for jobs posted by the current user
router.get('/posted-jobs-applications', getJobPosterApplications);

// Get a specific application (user can only access their own applications)
router.get('/:id', getApplicationById);

export default router; 