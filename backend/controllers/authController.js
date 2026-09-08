import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Redirect to GitHub for Authentication
export const githubLogin = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.FRONTEND_URL}/login/callback`;
  
  // Request scope to read user profile and repositories
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user,repo`;
  
  res.json({ redirectUrl: githubAuthUrl });
};

// Handle the callback from GitHub
export const githubCallback = async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // 1. Exchange code for GitHub Access Token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(401).json({ error: 'Failed to retrieve access token from GitHub' });

    // 2. Fetch User Profile from GitHub API
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    // 3. Find or Create User in MongoDB
    let user = await User.findOne({ githubId: githubUser.id.toString() });
    if (!user) {
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        githubAccessToken: accessToken
      });
    } else {
      user.githubAccessToken = accessToken; // Always update token
    }
    await user.save();

    // 4. Generate JWT for our Frontend
    const jwtToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token: jwtToken,
      user: { id: user._id, username: user.username, avatarUrl: user.avatarUrl }
    });

  } catch (error) {
    console.error('GitHub Callback Error:', error.message);
    if (error.response) {
      console.error('GitHub Callback Error Data:', error.response.data);
      console.error('GitHub Callback Error Status:', error.response.status);
    }
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};
