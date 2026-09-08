require('dotenv').config();
const express = require('express');
const cors = require('cors');
const groqService = require('./services/groqService');

const app = express();
app.use(cors());
app.use(express.json());

// Main endpoint for testing the LLM
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    res.setHeader("Content-Type", "text/plain");
    await groqService.streamResponse(message, context, res);
    return;

  } catch (error) {
    console.error("LLM Error:", error);
    res.status(500).json({ error: "Failed to generate response from LLM", details: error.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`LLM Sandbox Backend running on http://localhost:${PORT}`);
});
