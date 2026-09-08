import express from 'express';
import { githubLogin, githubCallback } from '../controllers/authController.js';

const router = express.Router();

router.get('/github', githubLogin);
router.post('/github/callback', githubCallback);

export default router;
