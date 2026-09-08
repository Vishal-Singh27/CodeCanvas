const fs = require('fs');
let content = fs.readFileSync('frontend/client/src/components/Dashboard.jsx', 'utf8');

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

// Let's create the replacement
let newContent = content;

// 1. Remove Team Chat from its current place
const teamChatOnly = teamChatSection.replace('{/* Right Side: Team/Branch Chat (FULLY INTERACTIVE) */}', '').trim();
newContent = newContent.replace(teamChatOnly, '');

// 2. Remove AI Chat from its current place
newContent = newContent.replace(aiChatSection, '');

// 3. Construct the Dock
// We need to patch the AI Chat UI to remove Rnd and use standard flex.
const aiCode = `
      {/* AI CHAT SLOT */}
      <div className="flex flex-col items-end pointer-events-auto shrink-0">
        {!isAiChatOpen ? (
          <div 
            onClick={() => setIsAiChatOpen(true)}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 shadow-xl rounded-full p-4 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
          >
            <Sparkles size={24} className="text-white" />
          </div>
        ) : (
          <div className={\`\${isAiExpanded ? 'fixed inset-0 w-full h-full rounded-none z-[100]' : 'w-[350px] h-[500px] max-h-[80vh] rounded-xl'} bg-dark-800 shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col transition-all\`} style={{ resize: isAiExpanded ? "none" : "both", minWidth: "300px", minHeight: "400px" }}>
            <div className="p-3 border-b border-dark-700 flex justify-between items-center bg-dark-900/80">
              <h3 className="text-sm font-semibold text-white flex items-center select-none">
                <Sparkles size={16} className="mr-2 text-purple-400" /> CodeCanvas AI
              </h3>
              <div className="flex items-center space-x-3">
                <button onClick={() => setIsAiExpanded(!isAiExpanded)} className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                  <Maximize2 size={14} />
                </button>
                <button onClick={() => setIsAiChatOpen(false)} className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-800">
              {aiContext && (
                <div className="text-xs text-gray-400 bg-dark-900/50 p-2 rounded border border-dark-700">
                  <span className="text-purple-400 font-semibold block mb-1">Attached Context:</span>
                  <div className="truncate opacity-75">{aiContext}</div>
                  <button onClick={() => setAiContext('')} className="text-red-400 hover:text-red-300 mt-2 block">Clear Context</button>
                </div>
              )}
              {aiChatHistory.length === 0 ? (
                <div className="text-gray-500 text-center mt-8 text-sm">Ask me anything about the codebase, or select code to attach it as context!</div>
              ) : (
                aiChatHistory.map((msg, i) => (
                  <div key={i} className={\`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'}\`}>
                    <div className={\`px-3 py-2 rounded-lg max-w-[90%] text-sm \${msg.role === 'user' ? 'bg-purple-600/20 text-purple-100 border border-purple-500/30' : 'bg-dark-700 text-gray-200'}\`}>
                      {msg.role === 'user' ? msg.content : (
                         <div className="prose prose-invert prose-sm max-w-none">
                           <ReactMarkdown>
                             {msg.content.replace(/\\{"action":\\s*"navigate_repo",?\\s*"target":\\s*"[^"]*"\\}/g, '> *(Navigating to repository...)*')}
                           </ReactMarkdown>
                         </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {aiLoading && <div className="text-xs text-purple-400 animate-pulse">AI is thinking...</div>}
            </div>
            
            <form onSubmit={handleAiSubmit} className="p-3 border-t border-dark-700 bg-dark-900/50 relative">
              <input 
                type="text" 
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask CodeCanvas AI..."
                className="w-full bg-dark-900 border border-dark-600 text-sm rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
                disabled={aiLoading}
              />
              <button type="submit" disabled={aiLoading} className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>`;

const teamCode = `
      {/* TEAM CHAT SLOT */}
      <div className="flex flex-col items-end pointer-events-auto shrink-0">
        {!isChatOpen ? (
          <div 
            onClick={() => {
              setIsChatOpen(true);
              setUnreadChatCount(0);
            }}
            className="relative z-50 bg-blue-600 hover:bg-blue-500 shadow-xl rounded-full p-4 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center w-14 h-14"
          >
            <MessageSquare size={24} className="text-white" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-dark-900 shadow-sm animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </div>
        ) : (
          <div className="w-80 h-[500px] max-h-[80vh] bg-dark-800 flex flex-col z-50 shadow-2xl rounded-xl border border-dark-600 overflow-hidden" style={{ resize: "both", minWidth: "300px", minHeight: "350px" }}>
            <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Users size={16} className="mr-2 text-blue-400" /> Team Chat
                </h3>
                <div className="ml-3 relative flex items-center"><GitBranch size={10} className="absolute left-1.5 text-blue-400 pointer-events-none" /><select value={chatBranch} onChange={(e) => setChatBranch(e.target.value)} className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded pl-4 pr-1 py-0.5 max-w-[120px] appearance-none cursor-pointer focus:outline-none focus:border-blue-500 hover:bg-blue-900/50 transition-colors" title="Switch chat branch">
                  {branches.map(b => (
                    <option key={b} value={b} className="bg-dark-800 text-gray-200">{b}</option>
                  ))}
                </select>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-sm text-gray-500 mt-10">No messages in this branch yet. Be the first to start the discussion!</div>
              ) : (
                chatMessages.map(msg => {
                  const isSelf = msg.author === user.username;
                  const timeString = new Date(msg.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
                  return (
                    <div key={msg._id || msg.id} className="flex space-x-3">
                      {msg.avatarUrl ? (
                        <img src={msg.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {msg.author.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-sm font-semibold text-gray-200">{msg.author}</span>
                          <span className="text-xs text-gray-500">{timeString}</span>
                        </div>
                        <div className="mt-1 bg-dark-700 text-gray-300 text-sm px-3 py-2 rounded-lg rounded-tl-none inline-block border border-dark-600/50">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t border-dark-700 bg-dark-900/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="relative"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message team..."
                  className="w-full bg-dark-900 border border-dark-600 text-sm rounded-md py-2 pl-3 pr-10 focus:outline-none focus:border-blue-500 transition-colors text-gray-200 placeholder-gray-500"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>`;

const dockCode = `
      {/* GLOBAL CHAT DOCK (Right-To-Left Stacking) */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-row-reverse items-end gap-6 pointer-events-none">
        ${teamCode}
        ${aiCode}
      </div>
`;

newContent = newContent.replace(aiChatEndStr, dockCode + '\n  );');
fs.writeFileSync('frontend/client/src/components/Dashboard.jsx', newContent);
console.log("Done");
