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
import User from '../models/user.js';
import Job from '../models/Job.js';

const router = express.Router();

// Protected routes (require authentication)
router.put('/update-profile', protect, updateProfile);
router.get('/', protect, getAllUsers);

// Connection routes
router.post('/connect', protect, sendConnectionRequest);
router.post('/accept-connection', protect, acceptConnectionRequest);
router.post('/reject-connection', protect, rejectConnectionRequest);
router.get('/connections', protect, getUserConnections);

// Save a job
router.post('/save-job', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    const user = await User.findById(userId);
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }
    res.json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save job' });
  }
});

// Unsave a job
router.post('/unsave-job', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    const user = await User.findById(userId);
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();
    res.json({ message: 'Job unsaved successfully', savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsave job' });
  }
});

// Get saved jobs
router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('savedJobs');
    res.json({ savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved jobs' });
  }
});

export default router; 