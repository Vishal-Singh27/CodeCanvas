const fs = require('fs');
let content = fs.readFileSync('frontend/client/src/components/Dashboard.jsx', 'utf8');

const scanCode = `
  const runSecurityScan = async () => {
    if (!fileModal || fileModal.isDiff || fileModal.isImage) return;
    setScanningSecurity(true);
    try {
      const res = await fetchWithAuth(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/security/scan\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fileModal.content, filename: fileModal.name }),
      });
      const data = await res.json();
      setSecurityScan(data);
    } catch (err) {
      console.error(err);
    }
    setScanningSecurity(false);
  };
`;

content = content.replace('  if (!user || loading) {', scanCode + '\n  if (!user || loading) {');
fs.writeFileSync('frontend/client/src/components/Dashboard.jsx', content);
