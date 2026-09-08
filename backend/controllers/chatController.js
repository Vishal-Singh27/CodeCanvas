import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch || 'main';
    const repoFullName = `${owner}/${repo}`;

    const messages = await Message.find({ repoFullName, branch })
      .sort({ createdAt: 1 }) // Chronological order
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { branch, text, author, avatarUrl } = req.body;
    const repoFullName = `${owner}/${repo}`;

    if (!text || !author || !branch) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({
      repoFullName,
      branch,
      author,
      avatarUrl,
      text
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error posting chat message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
};
