import Message from '../models/Message.js';
import axios from 'axios';

// Get Github Headers from request
const getGithubHeaders = (req) => {
  const token = req.user?.githubAccessToken || process.env.GITHUB_TOKEN; 
  return {
    'Accept': 'application/vnd.github.v3+json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getNotifications = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoFullName = `${owner}/${repo}`;

    // 1. Fetch recent 10 chat messages across ALL branches for this repo
    const recentMessages = await Message.find({ repoFullName })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10)
      .lean();

    const chatNotifications = recentMessages.map(msg => ({
      id: `chat_${msg._id}`,
      type: 'chat',
      title: `${msg.author} in ${msg.branch}`,
      message: msg.text,
      time: msg.createdAt,
      avatarUrl: msg.avatarUrl,
      unread: true // the frontend can manage actual read state locally
    }));

    // 2. Fetch recent 5 commits for this repo (from default branch)
    let commitNotifications = [];
    try {
      const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers: getGithubHeaders(req),
        params: { per_page: 5 }
      });
      
      commitNotifications = commitsResponse.data.map(commitObj => ({
        id: `commit_${commitObj.sha}`,
        type: 'commit',
        title: `Push by ${commitObj.commit.author.name}`,
        message: commitObj.commit.message.split('\n')[0],
        time: commitObj.commit.author.date,
        avatarUrl: commitObj.author?.avatar_url || null,
        unread: true
      }));
    } catch (gitErr) {
      console.error('Failed to fetch github commits for notifications:', gitErr.message);
    }

    res.json({
      chats: chatNotifications,
      commits: commitNotifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
