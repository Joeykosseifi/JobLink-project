import express from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - requires authentication
router.post('/', protect, createJob);
router.patch('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

export default router; 