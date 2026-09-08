import React from 'react';
import { GitBranch, Eye, MessageSquare, ArrowRight, Sparkles, Code2, Users, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 overflow-hidden relative flex flex-col">
      
      {/* Ultra Vibrant Glass Background Orbs spanning the entire page */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Navigation Bar - Full Width, Frosted Glass */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-[#050505]/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" className="logo-img w-9 h-9 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10" />
          <span className="font-extrabold text-2xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">CodeCanvas</span>
        </div>
        
        <button 
          onClick={async () => {
            const token = localStorage.getItem("token");
            if (token) {
              window.location.href = "/dashboard";
              return;
            }
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/github`);
              const data = await res.json();
              window.location.href = data.redirectUrl; 
            } catch (err) {
              console.error("Ensure backend is running on 5001", err);
            }
          }}
          className="px-5 py-2.5 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-full transition-all flex items-center cursor-pointer group shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2.5" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center relative z-10 w-full max-w-6xl mx-auto">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-10 tracking-wide shadow-xl backdrop-blur-md">
          <Sparkles size={14} className="text-blue-400 mr-2" />
          Powered by Agentic AI
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          Your codebase, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r pb-2 leading-tight from-blue-400 via-purple-400 to-blue-400 animate-gradient-x" style={{ backgroundSize: '200% auto' }}>
            brought to life.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          CodeCanvas unifies your GitHub repositories, commit histories, and team communication into a single, intelligent workspace.
        </p>

        <button 
          onClick={async () => {
            const token = localStorage.getItem("token");
            if (token) {
              window.location.href = "/dashboard";
              return;
            }
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/github`);
              const data = await res.json();
              window.location.href = data.redirectUrl; 
            } catch (err) {
              console.error(err);
            }
          }}
          className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1 flex items-center justify-center mx-auto cursor-pointer group"
        >
          Open Workspace <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </main>

      {/* Features Grid - Floating Glass Cards */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:bg-white/[0.06] transition-colors shadow-2xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Code2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Codebase</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Directly syncs with GitHub to fetch file trees, raw code, and live commit diffs instantaneously.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:bg-white/[0.06] transition-colors shadow-2xl">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Agentic AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">An integrated AI that physically drives the UI and translates raw commits into plain English.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:bg-white/[0.06] transition-colors shadow-2xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multiplayer Focus</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Bridging the gap between code and communication by analyzing team discussions across workspaces.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;
