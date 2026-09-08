import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [context, setContext] = useState("diff --git a/src/index.js b/src/index.js\n+ const newFeature = true;");
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    
    // Add user message and a blank placeholder for AI
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', content: userMessage },
      { role: 'ai', content: '' }
    ]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5002/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context })
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Append chunk to the last message (which is the AI's placeholder)
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          newHistory[lastIndex] = {
            ...newHistory[lastIndex],
            content: newHistory[lastIndex].content + chunk
          };
          return newHistory;
        });
      }
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        newHistory[lastIndex].content = "Error connecting to server.";
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Left Pane: Context Injector */}
      <div className="w-1/2 border-r border-dark-700 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 flex items-center text-blue-400">
          <Sparkles className="mr-2" /> Context Injector
        </h2>
        <p className="text-gray-400 mb-4 text-sm">Paste mock repository context (like a file tree, git diff, or raw code) here to test how the LLM interprets it.</p>
        <textarea 
          className="flex-1 bg-dark-800 border border-dark-700 rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors resize-none"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste code context here..."
        />
      </div>

      {/* Right Pane: Chat GUI */}
      <div className="w-1/2 p-6 flex flex-col bg-dark-900">
        <h2 className="text-xl font-bold mb-4">LLM Chat Tester</h2>
        
        <div className="flex-1 bg-dark-800 border border-dark-700 rounded-lg overflow-y-auto p-4 space-y-6 mb-4">
          {chatHistory.length === 0 ? (
            <div className="text-gray-500 text-center mt-10">Ask a question about the context on the left!</div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1">{msg.role === 'user' ? 'You' : 'Gemini'}</span>
                <div className={`px-4 py-3 rounded-lg max-w-[90%] text-sm ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : 'bg-dark-700 text-gray-200'}`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-start">
              <span className="text-xs text-gray-500 mb-1">Gemini is thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something about the code..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
