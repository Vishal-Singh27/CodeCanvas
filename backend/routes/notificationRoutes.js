import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure user is authenticated

// Get notifications for a specific repo
router.get('/:owner/:repo', getNotifications);

export default router;
