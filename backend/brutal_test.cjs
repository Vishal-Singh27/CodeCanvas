async function ask(message, context = "") {
  console.log(`\n\n=== ASKING: ${message} ===`);
  const uiState = {
    selectedRepo: { owner: "Vishal-Singh27", name: "AI-Based-Unauthorized-Screen-Recording-Detection-System" },
    activeBranch: "main"
  };
  
  try {
    const res = await fetch('http://127.0.0.1:5003/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chatHistory: [], uiState, context })
    });

    console.log("Status:", res.status);
    
    if (res.body) {
      let fullText = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while(true) {
         const {done, value} = await reader.read();
         if(done) break;
         const text = decoder.decode(value);
         process.stdout.write(text);
         fullText += text;
      }
      if (fullText.includes("Error") || fullText.includes("Failed")) {
        console.error("\n\nCRASH DETECTED IN STREAM!");
      } else {
        console.log("\n\nSUCCESS!");
      }
    }
  } catch(e) {
    console.error("FATAL ERROR:", e);
  }
}

async function runTests() {
  await ask("Can you explain the code changes in commit 4cca058?");
  
  const largeContext = "console.log('test');\n".repeat(100);
  await ask("Can you explain these code changes?", largeContext);
}

runTests();
