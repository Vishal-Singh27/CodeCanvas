async function testAI() {
  const reqBody = {
    message: "What is the team talking about?",
    uiState: {
      hasRepoSelected: true,
      selectedRepo: {
        name: "CodeCanvas",
        fullName: "Vishal-Singh27/CodeCanvas",
        description: "The IDE",
        activeBranch: "main",
        branches: ["main"]
      },
      recentCommits: []
    },
    chatHistory: []
  };

  const response = await fetch('http://127.0.0.1:5001/api/ai/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    },
    body: JSON.stringify(reqBody)
  });
  console.log("Status:", response.status);
  console.log("Response:", await response.text());
}
testAI();
