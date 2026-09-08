const { GoogleGenAI } = require('@google/genai');

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate a response from the Gemini model given a user message and repository context.
 * 
 * @param {string} message - The user's prompt or question
 * @param {string} context - The repository context (e.g., file tree, git diff, selected code)
 * @returns {string} - The AI's markdown response
 */
async function generateResponse(message, context = "") {
  // Construct the final prompt by combining the user's message with the injected context
  let systemPrompt = "You are an expert AI coding assistant integrated into CodeCanvas, a GitHub-like platform. Your job is to analyze the provided code context and answer the user's questions clearly and concisely.";
  
  let finalPrompt = message;
  
  if (context.trim()) {
    finalPrompt = `Repository Context:\n\`\`\`\n${context}\n\`\`\`\n\nUser Question:\n${message}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: finalPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for more analytical/factual coding answers
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

module.exports = {
  generateResponse
};

async function streamResponse(message, context = "", res) {
  let systemPrompt = "You are an expert AI coding assistant integrated into CodeCanvas, a GitHub-like platform. Your job is to analyze the provided code context and answer the user's questions clearly and concisely.";
  let finalPrompt = message;
  
  if (context.trim()) {
    finalPrompt = `Repository Context:\n\`\`\`\n${context}\n\`\`\`\n\nUser Question:\n${message}`;
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents: finalPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error) {
    console.error("Gemini API stream failed:", error);
    res.write("\n\n[Error: Failed to stream response]");
    res.end();
  }
}

module.exports.streamResponse = streamResponse;
