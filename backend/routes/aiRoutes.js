import express from 'express';
import { handleChat, getRecommendedRepos } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', handleChat);

router.post('/recommend', getRecommendedRepos);

export default router;
