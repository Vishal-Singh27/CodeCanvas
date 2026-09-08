const fs = require('fs');
let content = fs.readFileSync('../frontend/client/src/components/Dashboard.jsx', 'utf8');

const teamChatStartStr = `{/* Right Side: Team/Branch Chat (FULLY INTERACTIVE) */}`;
const teamChatEndStr = `</main>`;

const startIndex = content.indexOf(teamChatStartStr);
const endIndex = content.indexOf(teamChatEndStr, startIndex);

const teamChatSection = content.substring(startIndex, endIndex);

console.log("Found Team Chat Section length:", teamChatSection.length);

const aiChatStartStr = `{/* AI Chat Bubble Toggle */}`;
const aiChatEndStr = `  );`;
const aiIndex1 = content.indexOf(aiChatStartStr);
const aiIndex2 = content.lastIndexOf(aiChatEndStr);
const aiChatSection = content.substring(aiIndex1, aiIndex2);

console.log("Found AI Chat Section length:", aiChatSection.length);
