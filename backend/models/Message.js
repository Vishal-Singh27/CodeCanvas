import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  repoFullName: {
    type: String,
    required: true,
    index: true
  },
  branch: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Message', messageSchema);
