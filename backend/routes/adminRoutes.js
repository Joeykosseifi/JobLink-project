import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { getAnalyticsData } from '../controllers/analyticsController.js';
import { getAllApplications, updateApplicationStatus, deleteApplication } from '../controllers/applicationController.js';
import { getRecentActivities } from '../controllers/activityController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.use(protect, restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Applications routes
router.get('/applications', getAllApplications);
router.patch('/applications/:id/status', updateApplicationStatus);
router.delete('/applications/:id', deleteApplication);

// Analytics routes
router.get('/analytics', getAnalyticsData);

// Activity routes
router.get('/activities', getRecentActivities);

export default router; 