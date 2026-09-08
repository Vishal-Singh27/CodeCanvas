import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import Message from "../models/Message.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const githubToken = process.env.GITHUB_TOKEN;

// Helper to fetch file from GitHub
async function fetchFileFromGithub(repoFullName, path, branch) {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/contents/${path}?ref=${branch}`;
    const res = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    if (res.data && res.data.content) {
      return Buffer.from(res.data.content, 'base64').toString('utf-8');
    }
    return "File is empty or not found.";
  } catch (error) {
    return `Error reading file: ${error.response?.data?.message || error.message}`;
  }
}


async function getRepoCollaborators(repoFullName) {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/collaborators`;
    const res = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    if (res.data && Array.isArray(res.data)) {
      return res.data.map(c => `- ${c.login} (${c.role_name || (c.permissions?.admin ? 'admin' : 'push')})`).join('\n');
    }
    return "No collaborators found or insufficient permissions to list them.";
  } catch (error) {
    return `Error fetching collaborators: ${error.response?.data?.message || error.message}`;
  }
}

// Helper to fetch commit diff
async function fetchCommitDiffFromGithub(repoFullName, hash) {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/commits/${hash}`;
    const res = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3.diff'
      }
    });
    return res.data;
  } catch (error) {
    return `Error fetching diff: ${error.response?.data?.message || error.message}`;
  }
}

// Helper to search collaborators across all repos (checks both collaborators and commit history)
async function searchCollaborators(targetUsername, allRepos) {
  try {
    if (!allRepos || allRepos.length === 0) return "No repositories available in the workspace to search.";
    if (!githubToken) return "Error: GitHub token is missing.";

    const reposToSearch = allRepos.slice(0, 30);
    const query = targetUsername.toLowerCase();

    const promises = reposToSearch.map(async (repo) => {
      const repoPath = repo.fullName || repo.name;
      const headers = { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json' };
      
      try {
        // 1. Check official collaborators list (partial match)
        try {
          const collabRes = await axios.get(`https://api.github.com/repos/${repoPath}/collaborators?per_page=100`, { headers });
          if (collabRes.data && Array.isArray(collabRes.data)) {
             for (const c of collabRes.data) {
               if (c.login?.toLowerCase().includes(query)) return { repo: repo.name, user: c.login };
             }
          }
        } catch (e) {}

        // 2. Check official contributors list
        try {
          const contribRes = await axios.get(`https://api.github.com/repos/${repoPath}/contributors?per_page=100`, { headers });
          if (contribRes.data && Array.isArray(contribRes.data)) {
             for (const c of contribRes.data) {
               const login = c.login?.toLowerCase() || "";
               if (login.includes(query)) return { repo: repo.name, user: c.login };
             }
          }
        } catch(e) {}
        
        // 3. Check commit history
        try {
          const commitsRes = await axios.get(`https://api.github.com/repos/${repoPath}/commits?per_page=100`, { headers });
          if (commitsRes.data && Array.isArray(commitsRes.data)) {
             for (const c of commitsRes.data) {
               const authorName = c.commit?.author?.name?.toLowerCase() || "";
               const authorEmail = c.commit?.author?.email?.toLowerCase() || "";
               if (authorName.includes(query) || authorEmail.includes(query)) {
                  return { repo: repo.name, user: c.commit?.author?.name || c.commit?.author?.email };
               }
             }
          }
        } catch(e) {}
      } catch (err) {}
      return null;
    });

    const outcomes = await Promise.all(promises);
    const validMatches = outcomes.filter(r => r !== null);

    if (validMatches.length === 0) return `No repositories found where '${targetUsername}' is a contributor or collaborator.`;
    
    const formattedMatches = validMatches.map(m => `- ${m.repo} (matched user: ${m.user})`).join('\n');
    return `Found ${validMatches.length} repositories associated with '${targetUsername}':\n${formattedMatches}\n\nIf multiple distinct users matched, ask the user to clarify which specific user they meant.`;
  } catch (error) {
    return `Error searching collaborators: ${error.message}`;
  }
}

// Helper to fetch Team Chat
async function fetchTeamChat(repoFullName, branch) {
  try {
    const chats = await Message.find({ repoFullName, branch }).sort({ timestamp: -1 }).limit(50);
    if (!chats || chats.length === 0) return "No team chat history found for this branch.";
    return chats.reverse().map(c => `[${new Date(c.createdAt).toLocaleTimeString()}] ${c.author}: ${c.text}`).join("\n");
  } catch (error) {
    return "Error reading team chat.";
  }
}

const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_repo_collaborators",
      description: "List the collaborators for the current repository.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "find_repos_by_collaborator",
      description: "Searches all repositories to find which ones have a specific GitHub user/collaborator. ALWAYS use this tool if the user asks to find repos made by, with, or associated with a specific person.",
      parameters: {
        type: "object",
        properties: { username: { type: "string", description: "The exact GitHub username to search for." } },
        required: ["username"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_team_chat",
      description: "Read the recent messages in the Team Chat for the current repository and branch.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the content of a file in the repository.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_commit_diff",
      description: "Get the line-by-line diff for a specific commit hash to see exactly what changed in the code.",
      parameters: {
        type: "object",
        properties: { hash: { type: "string" } },
        required: ["hash"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ui_action",
      description: "Trigger a UI action in the user's IDE. Action can be 'navigate_repo' to switch repos, or 'open_file' to open a file.",
      parameters: {
        type: "object",
        properties: { 
          action: { type: "string", enum: ["navigate_repo", "open_file"] },
          target: { type: "string", description: "The repo name or file path." }
        },
        required: ["action", "target"]
      }
    }
  }
];

export const handleChat = async (req, res) => {
  const { message, context, chatHistory, uiState } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  let uiContextStr = "";
  let repoFullName = "";
  let currentBranch = "main";

  if (uiState) {
    if (uiState.hasRepoSelected) {
      repoFullName = uiState.selectedRepo.fullName;
      currentBranch = uiState.selectedRepo.activeBranch || "main";
      uiContextStr += `The user is currently viewing the repository: ${uiState.selectedRepo.name} (${repoFullName})\n`;
      if (uiState.selectedRepo.description) {
         uiContextStr += `Description: ${uiState.selectedRepo.description}\n`;
      }
      uiContextStr += `Active branch: ${currentBranch}\n`;
      uiContextStr += `Available branches: ${(uiState.selectedRepo.branches || []).join(', ')}\n\n`;
      
      if (uiState.recentCommits && uiState.recentCommits.length > 0) {
         uiContextStr += `Recent commits in this branch:\n`;
         uiState.recentCommits.slice(0, 10).forEach(c => {
           uiContextStr += `- [${c.hash.substring(0,7)}] ${c.text} (by ${c.author} on ${new Date(c.date).toLocaleDateString()})\n`;
         });
      }
    } else {
      uiContextStr += `The user is currently on the dashboard home screen (no specific repository selected).\n\n`;
      uiContextStr += `Available repositories in their workspace:\n`;
      if (uiState.allRepos && uiState.allRepos.length > 0) {
        uiState.allRepos.slice(0, 20).forEach(r => {
          uiContextStr += `- ${r.name}${r.description ? `: ${r.description}` : ""}\n`;
        });
      } else {
        uiContextStr += `No repositories found.\n`;
      }
    }
  }

  let systemPrompt = `You are CodeCanvas AI, an elite developer assistant integrated directly into the user's IDE.
You will answer questions concisely and helpfully like a human pair programmer. 

CRITICAL BEHAVIOR:
1. ALWAYS default to brief, concise answers.
2. Only provide detailed, lengthy explanations if the user explicitly asks for them.
3. If asked about a commit, use 'get_commit_diff' to read it before answering. Do not hallucinate code changes!
4. If asked about a file, use 'read_file' to read it before answering.
5. If asked about what the team is discussing, use 'read_team_chat'.
6. You can control the UI with 'ui_action'.
8. If the user asks to find repositories 'made with', 'by', or 'associated with' a specific person/username, ALWAYS use 'find_repos_by_collaborator'. DO NOT try to read README files to find users.
7. Use markdown tables when presenting structured data, summaries, or comparisons. Keep tables concise so they fit in a narrow chat window.

CURRENT UI CONTEXT:
${uiContextStr}`;

  let finalPrompt = message;
  if (context && context.trim()) {
    finalPrompt = `Selected Code/File Context:\n\`\`\`\n${context}\n\`\`\`\n\nUser Question:\n${message}`;
  }

  console.log("SYSTEM PROMPT:", systemPrompt);

  const messages = [{ role: "system", content: systemPrompt }];
  if (chatHistory && Array.isArray(chatHistory)) {
      messages.push(...chatHistory.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })));
  }
  messages.push({ role: "user", content: finalPrompt });

  try {
    res.setHeader("Content-Type", "text/plain");

    let isDone = false;
    let MAX_LOOPS = 50;
    let loopCount = 0;

    while (!isDone && loopCount < MAX_LOOPS) {
      loopCount++;
      console.log("PAYLOAD MESSAGES:", JSON.stringify(messages, null, 2));

      const stream = await groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        tools: AI_TOOLS,
        stream: true,
      });

      let toolCalls = {};
      let hasToolCalls = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          res.write(delta.content);
        }
        
        if (delta?.tool_calls) {
          hasToolCalls = true;
          for (const tc of delta.tool_calls) {
            if (!toolCalls[tc.index]) {
              toolCalls[tc.index] = { id: tc.id, type: "function", function: { name: tc.function.name, arguments: "" } };
            }
            if (tc.function.arguments) {
              toolCalls[tc.index].function.arguments += tc.function.arguments;
            }
          }
        }
      }

      if (!hasToolCalls) {
        isDone = true;
      } else {
        // Construct the assistant message containing tool calls
        const assistantToolMsg = { role: "assistant", content: null, tool_calls: Object.values(toolCalls) };
        messages.push(assistantToolMsg);

        // Execute tools
        for (const tc of Object.values(toolCalls)) {
          const fnName = tc.function.name;
          let fnArgs;
          try {
            fnArgs = JSON.parse(tc.function.arguments);
          } catch (e) {
            messages.push({ role: "tool", tool_call_id: tc.id, content: "Error parsing arguments." });
            continue;
          }

          let toolResult = "";
          if (fnName === "read_file") {
             res.write(`\n> *(Reading ${fnArgs.path}...)*\n\n`);
             toolResult = await fetchFileFromGithub(repoFullName, fnArgs.path, currentBranch);
          } else if (fnName === "get_commit_diff") {
             res.write(`\n> *(Analyzing commit ${fnArgs.hash.substring(0,7)}...)*\n\n`);
             toolResult = await fetchCommitDiffFromGithub(repoFullName, fnArgs.hash);
             // Truncate if too huge
             if (toolResult.length > 20000) toolResult = toolResult.substring(0, 20000) + "...(truncated)";
          } else if (fnName === "read_team_chat") {
             res.write(`\n> *(Reading Team Chat...)*\n\n`);
             toolResult = await fetchTeamChat(repoFullName, currentBranch);
          } else if (fnName === "find_repos_by_collaborator") {
             res.write(`\n> *(Searching for collaborator: ${fnArgs.username}...)*\n\n`);
             const allRepos = uiState?.allRepos || [];
             toolResult = await searchCollaborators(fnArgs.username, allRepos);
                    } else if (fnName === "get_repo_collaborators") {
             res.write(`\n> *(Fetching collaborators for ${repoFullName}...)*\n\n`);
             toolResult = await getRepoCollaborators(repoFullName);
          } else if (fnName === "ui_action") {
             res.write(`\n{"action": "${fnArgs.action}", "target": "${fnArgs.target}"}\n`);
             toolResult = "UI action triggered successfully.";
          } else {
             toolResult = "Unknown tool.";
          }
          
          messages.push({ role: "tool", tool_call_id: tc.id, content: toolResult });
        }
      }
    }
    
    
    if (!isDone && loopCount >= MAX_LOOPS) {
       res.write("\n\n> *(System halted: AI reached maximum processing loops. Please refine your request if you need more information.)*\n");
    }
    
    res.end();
  } catch (error) {
    console.error("AI Error:", error);
    res.write("\n\n[Error: Failed to stream response]");
    res.end();
  }
};

export const getRecommendedRepos = async (req, res) => {
  try {
    const { repos } = req.body; // Expect an array of repo objects
    if (!repos || !Array.isArray(repos)) {
      return res.status(400).json({ error: "Invalid repos array" });
    }

    const recentRepos = repos.slice(0, 10);
    const repoListString = recentRepos.map(r => `- ID: ${r.id}, Name: ${r.name}, Description: ${r.description || 'None'}`).join('\n');

    const prompt = `
You are CodeCanvas AI. The user just opened their dashboard. Here are their most recently updated GitHub repositories:

${repoListString}

Select EXACTLY 3 repositories that seem most interesting, active, or relevant for the user to jump back into.
For each selected repository, provide a very short, punchy 4-5 word description/reasoning of why it's recommended or what it is (e.g., "Active AI vision project", "Recent bug fix activity", "Core backend API service").

Format your response exactly as valid JSON like this:
[
  { "id": 123456, "reason": "Active AI vision project" },
  { "id": 789012, "reason": "Recent frontend UI changes" },
  { "id": 345678, "reason": "Core backend API service" }
]
Do not include any markdown formatting, just the raw JSON array.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", // Fast model for JSON tasks
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0]) {
      console.error("Groq API Error Response:", JSON.stringify(data, null, 2));
      return res.status(502).json({ error: "Upstream AI API failed to return a valid response." });
    }
    let jsonText = data.choices[0].message.content.trim();
    const match = jsonText.match(/\[[\s\S]*\]/);
    if (match) {
        jsonText = match[0];
    }
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
};
