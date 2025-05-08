import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as statsController from '../controllers/statsController.js';

const router = express.Router();

// Stats routes
router.get('/', statsController.getStats);

export default router; 