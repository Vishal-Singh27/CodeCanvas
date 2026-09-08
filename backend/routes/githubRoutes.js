import express from 'express';
import { getUserRepos, getRepoCommits, getCommitDiff, getRepoBranches, getRepoFiles, getCommitDetails, getFileContent } from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure all routes below are authenticated

// Fetch repositories to display in the sidebar
router.get('/repos/:username', getUserRepos);

// Fetch branches for a specific repository
router.get('/branches/:owner/:repo', getRepoBranches);

// Fetch files for a specific repository and branch
router.get('/files/:owner/:repo', getRepoFiles);

// Fetch raw file content
router.get('/file-content/:owner/:repo', getFileContent);

// Fetch branch commit history to build the React Flow DAG
router.get('/commits/:owner/:repo', getRepoCommits);

// Fetch specific files changed in a single commit
router.get('/commit/:owner/:repo/:hash/details', getCommitDetails);

// Fetch the raw code changes for a commit (to feed into the LLM)
router.get('/commit/:owner/:repo/:hash/diff', getCommitDiff);

export default router;
