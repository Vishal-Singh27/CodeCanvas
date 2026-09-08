const fs = require('fs');
let content = fs.readFileSync('controllers/aiController.js', 'utf8');

content = content.replace(
  /Do not output any markdown or explanation if you are using a tool\./,
  \`Do not output any markdown or explanation if you are using a tool.
CRITICAL INSTRUCTION: You must NOT use native API function calling or tool calling. Do not attempt to emit a tool call payload. If you need to navigate, output raw plain text JSON exactly as requested.\`
);

fs.writeFileSync('controllers/aiController.js', content);
