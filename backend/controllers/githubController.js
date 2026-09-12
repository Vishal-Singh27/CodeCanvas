import axios from 'axios';

// Helper to get GitHub API headers using the LOGGED IN USER'S token!
const getGithubHeaders = (req) => {
  const token = req.user?.githubAccessToken || process.env.GITHUB_TOKEN; 
  return {
    'Accept': 'application/vnd.github.v3+json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// 1. Get Repositories for a User (To populate the sidebar)
export const getUserRepos = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Hitting /user/repos instead of /users/{username}/repos ensures we get PRIVATE repos too
    // because it uses the GITHUB_TOKEN's permissions.
    const response = await axios.get(`https://api.github.com/user/repos?sort=updated&per_page=100`, {
      headers: getGithubHeaders(req)
    });
    
    // Map to a cleaner, simpler structure for our frontend
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      private: repo.private
    }));

    res.json(repos);
  } catch (error) {
    console.error('GitHub API Error (getUserRepos):', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

// 1.5 Get Files for a Repo/Branch (Supports navigating into folders)
export const getRepoFiles = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch || 'main';
    const folderPath = req.query.path || '';

    const url = folderPath
      ? `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(folderPath)}`
      : `https://api.github.com/repos/${owner}/${repo}/contents`;

    const response = await axios.get(url, {
      headers: getGithubHeaders(req),
      params: { ref: branch }
    });
    
    // Sort so folders are on top, then files
    const files = response.data.map(item => ({
      name: item.name,
      type: item.type === 'dir' ? 'folder' : 'file',
      path: item.path,
      sha: item.sha
    })).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    res.json(files);
  } catch (error) {
    console.error('GitHub API Error (getRepoFiles):', error.message);
    res.status(500).json({ error: 'Failed to fetch repository files' });
  }
};

// 1.6 Get Raw Text Content or Images of a Single File
export const getFileContent = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const filePath = req.query.path;
    const ref = req.query.ref || 'main';

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: getGithubHeaders(req),
      params: { ref }
    });
    
    if (response.data.content) {
      // Determine file type
      const extMatch = filePath.match(/\.([^.]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : '';
      
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'icns', 'webp', 'ico'];
      const binaryExts = ['xlsx', 'xls', 'pdf', 'zip', 'tar', 'gz', 'mp4', 'mp3', 'exe', 'dll', 'ttf', 'woff'];
      
      if (imageExts.includes(ext)) {
        // Send base64 back directly for images so the frontend can render an <img> tag!
        res.json({ 
          content: response.data.content, 
          isImage: true,
          mimeType: `image/${ext === 'svg' ? 'svg+xml' : ext}`
        });
      } else if (binaryExts.includes(ext)) {
        res.json({ content: 'This binary file format cannot be rendered in the web preview.', isImage: false, isBinary: true });
      } else {
        // Decode to UTF-8 text (works perfectly for .csv, .md, .py, .js, etc.)
        const decoded = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.json({ content: decoded, isImage: false, isBinary: false });
      }
    } else {
      res.json({ content: '// Cannot display file content.', isImage: false, isBinary: false });
    }
  } catch (error) {
    console.error('GitHub API Error (getFileContent):', error.message);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
};

// 1.75 Get Branches for a Repo
export const getRepoBranches = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`[DEBUG] getRepoBranches called with owner: "${owner}", repo: "${repo}"`);
    console.log(`[DEBUG] Requesting URL: https://api.github.com/repos/${owner}/${repo}/branches`);
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: getGithubHeaders(req)
    });
    
    // Extract just the branch names
    const branches = response.data.map(b => b.name);
    res.json(branches);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 404 usually means the repository exists but is completely empty (no branches).
      return res.json([]);
    }
    
    console.error('GitHub API Error (getRepoBranches):', error.message);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// 2. Get Commits for the DAG (Filtered by branch!)
export const getRepoCommits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch; 
    const defaultBranch = req.query.defaultBranch; // e.g., 'main'

    // Use axios params to ensure branch names with slashes are properly URL encoded!
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: getGithubHeaders(req),
      params: branch ? { sha: branch } : {}
    });

    // Determine which commits are unique to this branch
    let branchSpecificHashes = new Set();
    if (branch && defaultBranch && branch !== defaultBranch) {
      try {
        const compareRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/compare/${defaultBranch}...${branch}`, {
          headers: getGithubHeaders(req)
        });
        compareRes.data.commits.forEach(c => branchSpecificHashes.add(c.sha));
      } catch (err) {
        console.error('GitHub API Error (compare):', err.message);
      }
    }

    // Format specifically for React Flow nodes
    const commits = response.data.map(commitObj => ({
      id: commitObj.sha.substring(0, 7),
      hash: commitObj.sha,
      message: commitObj.commit.message.split('\n')[0],
      author: commitObj.commit.author.name,
      date: commitObj.commit.author.date,
      parentIds: commitObj.parents.map(p => p.sha),
      isBranchSpecific: branchSpecificHashes.has(commitObj.sha)
    }));

    res.json(commits);
  } catch (error) {
    console.error('GitHub API Error (getRepoCommits):', error.message);
    res.status(500).json({ error: 'Failed to fetch repository commits' });
  }
};

// 2.5 Get Details & Files for a SINGLE Commit
export const getCommitDetails = async (req, res) => {
  try {
    const { owner, repo, hash } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${hash}`, {
      headers: getGithubHeaders(req)
    });
    
    // Extract the files array (showing what was modified/added/deleted)
    const files = response.data.files.map(f => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch // The actual git diff lines
    }));

    res.json({
      message: response.data.commit.message,
      author: response.data.commit.author.name,
      date: response.data.commit.author.date,
      files: files
    });
  } catch (error) {
    console.error('GitHub API Error (getCommitDetails):', error.message);
    res.status(500).json({ error: 'Failed to fetch commit details' });
  }
};

// 3. Get Raw Diff for a specific commit (CRITICAL FOR THE LLM!)
export const getCommitDiff = async (req, res) => {
  try {
    const { owner, repo, hash } = req.params;
    
    // Notice the specific 'application/vnd.github.v3.diff' Accept header!
    // This tells GitHub to return the raw code diff instead of a JSON object.
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${hash}`, {
      headers: {
        'Accept': 'application/vnd.github.v3.diff',
        ...(req.user?.githubAccessToken && { 'Authorization': `Bearer ${req.user.githubAccessToken}` })
      }
    });

    // The response data is pure text/diff format ready for the AI
    res.send(response.data);
  } catch (error) {
    console.error('GitHub API Error (getCommitDiff):', error.message);
    res.status(500).json({ error: 'Failed to fetch commit diff' });
  }
};
