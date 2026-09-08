const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function streamResponse(message, context = "", res) {
  let systemPrompt = "You are an expert AI coding assistant integrated into CodeCanvas, a GitHub-like platform. Your job is to analyze the provided code context and answer the user's questions clearly and concisely.";
  let finalPrompt = message;
  
  if (context.trim()) {
    finalPrompt = `Repository Context:\n\`\`\`\n${context}\n\`\`\`\n\nUser Question:\n${message}`;
  }

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt }
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }
    res.end();
  } catch (error) {
    console.error("Groq API stream failed:", error);
    res.write("\n\n[Error: Failed to stream response from Groq]");
    res.end();
  }
}

module.exports = {
  streamResponse
};
