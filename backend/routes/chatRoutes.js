import express from 'express';
import { getMessages, postMessage } from '../controllers/chatController.js';

const router = express.Router();

// Get messages for a specific repo and branch
router.get('/:owner/:repo', getMessages);

// Post a new message
router.post('/:owner/:repo', postMessage);

export default router;
