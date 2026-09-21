import express from 'express';
import { scanFileForVulnerabilities } from '../controllers/securityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/scan', protect, scanFileForVulnerabilities);

export default router;
