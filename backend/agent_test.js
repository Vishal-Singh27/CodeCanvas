import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: "What is 25 * 4?" }],
      tools: [{
        type: "function",
        function: {
          name: "calculate",
          description: "Evaluate a math expression",
          parameters: {
            type: "object",
            properties: { expression: { type: "string" } },
            required: ["expression"]
          }
        }
      }],
      tool_choice: "auto"
    });
    console.log("Model response:", JSON.stringify(response.choices[0].message, null, 2));
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
