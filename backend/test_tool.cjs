require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

async function run() {
  try {
    const res = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are CodeCanvas AI. If the user asks to switch to a different repository, output ONLY a JSON object like this:\n{\"action\": \"navigate_repo\", \"target\": \"RepoName\"}\nCRITICAL: DO NOT use native API tool calling!" },
        { role: "user", content: "Open the Air-mouse repo" }
      ],
      model: "openai/gpt-oss-120b",
      tool_choice: "none"
    });
    console.log(res.choices[0].message);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
