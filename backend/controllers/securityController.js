import axios from "axios";

// Heuristic fallback for Viva Demo if Hugging Face API fails or is unconfigured
const VULN_PATTERNS = [
  { regex: /eval\s*\(/g, cwe: 'CWE-95', name: 'Eval Injection', risk: 0.95, desc: 'Execution of arbitrary code via eval().' },
  { regex: /innerHTML\s*=/g, cwe: 'CWE-79', name: 'Cross-Site Scripting (XSS)', risk: 0.88, desc: 'Improper neutralization of input during web page generation.' },
  { regex: /(password|secret|api_key|token)\s*=\s*["'][^"']+["']/gi, cwe: 'CWE-798', name: 'Hardcoded Credentials', risk: 0.92, desc: 'Use of hardcoded passwords or cryptographic keys.' },
  { regex: /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*=\s*(\$|\+|\%)/gi, cwe: 'CWE-89', name: 'SQL Injection', risk: 0.94, desc: 'Improper neutralization of special elements used in an SQL Command.' },
  { regex: /dangerouslySetInnerHTML/g, cwe: 'CWE-79', name: 'React XSS', risk: 0.85, desc: 'Use of dangerouslySetInnerHTML exposes app to XSS.' },
  { regex: /child_process\.exec\(/g, cwe: 'CWE-78', name: 'Command Injection', risk: 0.96, desc: 'Improper neutralization of special elements used in an OS Command.' },
  { regex: /res\.send\(.*req\.query/g, cwe: 'CWE-79', name: 'Reflected XSS', risk: 0.89, desc: 'Reflecting unsanitized user input in response.' },
  { regex: /localStorage\.setItem/g, cwe: 'CWE-312', name: 'Cleartext Storage of Sensitive Info', risk: 0.70, desc: 'Storing tokens in localStorage exposes them to XSS attacks.' }
];

export const scanFileForVulnerabilities = async (req, res) => {
  const { content, filename } = req.body;
  if (!content) return res.status(400).json({ error: "File content required" });

  try {
    const lines = content.split('\n');
    let vulnerabilities = [];
    let aiSecurityScore = null;
    let aiPrediction = "Safe";
    
    // 1. REAL DEEP LEARNING INTEGRATION (Hugging Face Inference API)
    if (process.env.HF_API_TOKEN && process.env.HF_MODEL_NAME) {
      try {
        console.log(`[Security] Querying Neural Network: ${process.env.HF_MODEL_NAME}`);
        // Send a truncated version of the file (CodeBERT max tokens is 512)
        const truncatedContent = content.substring(0, 1500); 
        
        const hfResponse = await axios.post(
          `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_NAME}`,
          { inputs: truncatedContent },
          { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
        );

        if (hfResponse.data && hfResponse.data[0]) {
          // The API returns an array of label/score objects
          const predictions = hfResponse.data[0];
          // Usually LABEL_1 is vulnerable, LABEL_0 is safe in CodeBERT
          const vulnPrediction = predictions.find(p => p.label === 'LABEL_1' || p.label === 1 || p.label === '1');
          
          if (vulnPrediction && vulnPrediction.score > 0.5) {
            aiPrediction = "Vulnerable";
            aiSecurityScore = Math.round((1 - vulnPrediction.score) * 100); // Inverse score (lower is worse)
          } else {
            aiSecurityScore = 100;
          }
        }
      } catch (e) {
        console.warn('[Security] Hugging Face API timeout or error. Using static analysis only.', e.message);
      }
    }

    // 2. STATIC ANALYZER (For visual line-number highlighting in UI)
    lines.forEach((line, index) => {
      for (const pattern of VULN_PATTERNS) {
        if (pattern.regex.test(line)) {
          vulnerabilities.push({
            line: index + 1,
            cwe: pattern.cwe,
            name: pattern.name,
            confidence: pattern.risk,
            description: pattern.desc,
            snippet: line.trim()
          });
          break; // Avoid multiple tags on same line
        }
      }
    });

    // If HF API wasn't configured, fallback to calculating score based on static analysis
    if (aiSecurityScore === null) {
      const baseScore = 100;
      const penalty = vulnerabilities.length * 5;
      aiSecurityScore = Math.max(0, baseScore - penalty);
    }

    res.json({
      score: aiSecurityScore,
      aiStatus: aiPrediction,
      vulnerabilities,
      scannedLines: lines.length
    });
  } catch (error) {
    console.error('[Security] Scan Error:', error);
    res.status(500).json({ error: "Failed to scan file" });
  }
};
