import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# The broken block starts at:
#                             .map((branch) => (
#                               <button
#                                 key={branch}
#                                 onClick={() => {
#                               readNotificationIds.current.add(notification.id);
#
# And ends at:
#                                 <span className="font-medium text-sm text-gray-200 truncate max-w-[150px]">
#                                   {notification.title}
#                                 </span>

missing_code = """                              <button
                                key={branch}
                                onClick={() => {
                                  setBranch(branch);
                                  setChatBranch(branch);
                                  setIsBranchDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 ${branch === chatBranch ? "text-blue-400 font-bold bg-blue-500/10" : "text-gray-300"} transition-colors flex items-center justify-between`}
                              >
                                <span className="truncate pr-2">{branch}</span>
                                {branch === chatBranch && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Dashboard</div>
              )}
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative group"
                >
                  <Bell size={18} />
                  {((notifications.chats || []).filter(c => c.unread).length + (notifications.commits || []).filter(c => c.unread).length) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#121212]"></span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-spring-up origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <h3 className="text-white font-bold text-sm">
                        Notifications
                      </h3>
                      <button
                        onClick={() => {
                          (notifications.chats || []).forEach((n) => {
                            readNotificationIds.current.add(n.id);
                            clearedNotificationIds.current.add(n.id);
                          });
                          (notifications.commits || []).forEach((n) => {
                            readNotificationIds.current.add(n.id);
                            clearedNotificationIds.current.add(n.id);
                          });
                          setNotifications({
                            chats: [],
                            commits: [],
                          });
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Clear all
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                      <button
                        className={`flex-1 py-2 text-xs font-medium text-center ${notificationTab === "chats" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-200"}`}
                        onClick={() => setNotificationTab("chats")}
                      >
                        Team Chat
                      </button>
                      <button
                        className={`flex-1 py-2 text-xs font-medium text-center ${notificationTab === "commits" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-200"}`}
                        onClick={() => setNotificationTab("commits")}
                      >
                        Commit Pushes
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {(() => {
                        const activeNotifications =
                          notificationTab === "chats"
                            ? notifications.chats || []
                            : notifications.commits || [];

                        if (activeNotifications.length === 0) {
                          return (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No recent {notificationTab}
                            </div>
                          );
                        }

                        return activeNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              readNotificationIds.current.add(notification.id);
                              setNotifications((prev) => ({
                                chats: (prev.chats || []).map(c => c.id === notification.id ? { ...c, unread: false } : c),
                                commits: (prev.commits || []).map(c => c.id === notification.id ? { ...c, unread: false } : c),
                              }));
                            }}
                            className={`p-4 border-b border-white/10/50 last:border-0 hover:bg-white/5 cursor-pointer transition-colors ${notification.unread ? "bg-blue-900/10" : ""}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center space-x-2">
                                {notification.avatarUrl ? (
                                  <img
                                    src={notification.avatarUrl}
                                    alt="Avatar"
                                    className="w-5 h-5 rounded-full"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                                    {notification.title.charAt(0)}
                                  </div>
                                )}

                                <span className="font-medium text-sm text-gray-200 truncate max-w-[150px]">
                                  {notification.title}
                                </span>"""

broken_pattern = r'                              <button\s+key=\{branch\}\s+onClick=\{\(\) => \{\s+readNotificationIds\.current\.add\(notification\.id\);[\s\S]*?setNotifications\(\(prev\) => \(\{[\s\S]*?\}\)\);[\s\S]*?\}\}\s+className=\{`p-4 border-b border-white/10/50 last:border-0 hover:bg-white/5 cursor-pointer transition-colors \$\{notification\.unread \? "bg-blue-900/10" : ""\}`\}[\s\S]*?<div className="flex justify-between items-start mb-1">[\s\S]*?<div className="flex items-center space-x-2">[\s\S]*?\{notification\.avatarUrl \? \([\s\S]*?<img[\s\S]*?src=\{notification\.avatarUrl\}[\s\S]*?alt="Avatar"[\s\S]*?className="w-5 h-5 rounded-full"[\s\S]*?\/>[\s\S]*?\) : \([\s\S]*?<div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-\[9px\] font-bold">[\s\S]*?\{notification\.title\.charAt\(0\)\}[\s\S]*?<\/div>[\s\S]*?\)}(\s*)<span className="font-medium text-sm text-gray-200 truncate max-w-\[150px\]">(\s*)\{notification\.title\}(\s*)</span>'

t = re.sub(broken_pattern, missing_code, t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
