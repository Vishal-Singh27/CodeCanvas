import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

target = r'            <div className="flex items-center space-x-2 md:space-x-4">\s*\{\/\* Notification Bell \*\/\}'

replacement = """            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {((!selectedRepo && repos.length > 0) || selectedRepo) && (
              <>
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="md:hidden p-2 text-gray-400 hover:text-white rounded-full transition-colors"
                >
                  <Search size={18} />
                </button>
                <div className={`absolute inset-0 z-50 bg-[#121212] px-4 flex items-center md:static md:w-48 lg:w-64 md:flex ${isSearchExpanded ? 'flex' : 'hidden'}`}>
                  <Search size={16} className="absolute left-7 md:left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    autoFocus={isSearchExpanded}
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder={selectedRepo ? (activeTab === "commits" ? "Search commits" : "Search files") : "Search repositories"} 
                    className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 text-sm rounded-md py-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] pl-9 pr-8 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {globalSearchQuery && (
                    <button 
                      onClick={() => setGlobalSearchQuery('')}
                      className="absolute right-12 md:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {isSearchExpanded && (
                    <button 
                      onClick={() => setIsSearchExpanded(false)}
                      className="ml-3 text-gray-400 hover:text-white md:hidden"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

              {/* Notification Bell */}"""

t = re.sub(target, replacement, t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
