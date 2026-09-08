import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  const stream = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: "What is 25 * 4? Use the calculator tool." }],
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
    stream: true
  });

  let toolCalls = {};

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.content) {
      process.stdout.write(delta.content);
    }
    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (!toolCalls[tc.index]) toolCalls[tc.index] = { id: tc.id, type: "function", function: { name: tc.function.name, arguments: "" } };
        if (tc.function.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
      }
    }
  }
  console.log("\n\nBuffered Tool Calls:", JSON.stringify(toolCalls, null, 2));
}
run();
