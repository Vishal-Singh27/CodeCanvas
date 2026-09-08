import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String
  },
  githubAccessToken: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'developer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
