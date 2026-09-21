const fs = require('fs');
let content = fs.readFileSync('frontend/client/src/components/Dashboard.jsx', 'utf8');

// 1. Add the Scan Button in the header
const headerTarget = `<div className="flex items-center space-x-2">`;
const headerReplacement = \`<div className="flex items-center space-x-2">
                  {!fileModal.isDiff && !fileModal.isImage && (
                    <button
                      onClick={runSecurityScan}
                      disabled={scanningSecurity}
                      className="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 font-bold py-1 px-3 rounded flex items-center border border-red-800 transition"
                    >
                      {scanningSecurity ? "Scanning..." : "Deep Security Scan"}
                    </button>
                  )}\`;
content = content.replace(headerTarget, headerReplacement);

// 2. Add the custom line renderer in the pre block
const preTarget = `<pre
                    onMouseUp={handleMouseUp}
                    className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto w-full h-full"
                  >
                    {fileModal.content}
                  </pre>`;

const preReplacement = \`<div 
                    onMouseUp={handleMouseUp}
                    className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto w-full h-full"
                  >
                    {fileModal.content.split('\\n').map((line, i) => {
                      const vuln = securityScan?.vulnerabilities?.find(v => v.line === i + 1);
                      return (
                        <div key={i} className={\`group relative px-4 flex \${vuln ? 'bg-red-950/40 border-l-[3px] border-red-500' : 'hover:bg-white/5 border-l-[3px] border-transparent'}\`}>
                          <span className="w-12 text-gray-600 select-none text-right pr-4 shrink-0">{i + 1}</span>
                          <span className="whitespace-pre">
                            {line || ' '}
                          </span>
                          {vuln && (
                            <div className="absolute right-4 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center bg-red-900 text-red-100 text-[10px] px-2 py-1 rounded shadow-lg border border-red-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1.5" />
                              <strong className="mr-1">{vuln.cwe}:</strong> {vuln.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>\`;
content = content.replace(preTarget, preReplacement);

fs.writeFileSync('frontend/client/src/components/Dashboard.jsx', content);
