const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("codecanvas_token");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  GitBranch,
  Box,
  Settings,
  Search,
  Activity,
  ChevronRight,
  Sparkles,
  Send,
  X,
  Users,
  Folder,
  FileCode,
  ChevronDown,
  FileText,
  Eye,
  Bell,
  MessageSquare,
  Menu,
  Sun,
  Moon,
  Maximize2, ArrowDown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactDiffViewer from "react-diff-viewer-continued";

const diffStyles = {
  variables: {
    dark: {
      diffViewerBackground: "#0d1117",
      diffViewerColor: "#c9d1d9",
      addedBackground: "#1c3a26",
      addedColor: "#c9d1d9",
      removedBackground: "#45171e",
      removedColor: "#c9d1d9",
      wordAddedBackground: "rgba(46, 160, 67, 0.4)",
      wordRemovedBackground: "rgba(218, 54, 51, 0.4)",
      gutterBackground: "#0d1117",
      gutterBackgroundDark: "#0d1117",
      highlightBackground: "#21262d",
      highlightGutterBackground: "#21262d",
      codeFoldGutterBackground: "#161b22",
      codeFoldBackground: "#161b22",
      emptyLineBackground: "#0d1117",
      gutterColor: "#484f58",
      addedGutterBackground: "#1c3a26",
      removedGutterBackground: "#45171e",
      addedGutterColor: "#c9d1d9",
      removedGutterColor: "#c9d1d9",
      titleBlockBackground: "#0d1117",
    },
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitializing = React.useRef(true);
  const initialParams = React.useRef({
    repo: searchParams.get("repo"),
    branch: searchParams.get("branch"),
    commit: searchParams.get("commit"),
    file: searchParams.get("file"),
    tab: searchParams.get("tab")
  });

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("commits");

  const [activeBranch, setActiveBranch] = useState("main");
  const [chatBranch, setChatBranch] = useState("main");
  const [branches, setBranches] = useState(["main"]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [repoFiles, setRepoFiles] = useState([]);

  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitDetails, setCommitDetails] = useState(null);
  const [commitFilesTree, setCommitFilesTree] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);
  const [fileModal, setFileModal] = useState(null);

  const [currentPath, setCurrentPath] = useState("");
  const [commitCurrentPath, setCommitCurrentPath] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);

  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  const [aiContext, setAiContext] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendedRepos, setRecommendedRepos] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (repos.length > 0 && !selectedRepo && recommendedRepos.length === 0 && !isRecommending) {
        setIsRecommending(true);
        try {
          const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/ai/recommend`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              
            },
            body: JSON.stringify({ repos: repos.slice(0, 10) })
          });
          if (res.ok) {
            const data = await res.json();
            setRecommendedRepos(data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsRecommending(false);
        }
      }
    };
    fetchRecommendations();
  }, [repos, selectedRepo]);
  const [aiMessage, setAiMessage] = useState("");
  const [selectionRect, setSelectionRect] = useState(null);



  const [isLightMode, setIsLightMode] = useState(localStorage.getItem("codecanvas_theme") === "light");
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [settingsModal, setSettingsModal] = useState({ isOpen: false, activeTab: "profile" });

  // Sync state to URL
  useEffect(() => {
    if (isInitializing.current) return;
    
    const params = new URLSearchParams();
    if (selectedRepo) params.set("repo", selectedRepo.fullName);
    if (activeBranch && activeBranch !== "main") params.set("branch", activeBranch);
    if (selectedCommit) params.set("commit", selectedCommit.hash);
    if (fileModal && fileModal.name) params.set("file", fileModal.name);
    if (activeTab && activeTab !== "commits") params.set("tab", activeTab);
    
    setSearchParams(params, { replace: true });
  }, [selectedRepo, activeBranch, selectedCommit, fileModal, activeTab, setSearchParams]);

  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (isLightMode) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("codecanvas_theme", "light");
      if (favicon) favicon.href = "/logo-light.jpg";
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("codecanvas_theme", "dark");
      if (favicon) favicon.href = "/logo.jpg";
    }
  }, [isLightMode]);

  const isChatOpenRef = useRef(true);
  const chatMessagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [unreadScrollCount, setUnreadScrollCount] = useState(0);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  const aiChatEndRef = useRef(null);
  
  const aiInputRef = useRef(null);
  const teamInputRef = useRef(null);
  
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);
  
  useEffect(() => {
    if (isAiChatOpen && !aiLoading) {
      setTimeout(() => aiInputRef.current?.focus(), 100);
    }
  }, [isAiChatOpen, aiLoading]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => teamInputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const handleChatScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAtBottomRef.current = isBottom;
    if (isBottom) {
      setUnreadScrollCount(0);
    }
  };

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadScrollCount(0);
    isAtBottomRef.current = true;
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setAiContext(text);
      setSelectionRect({
        top: rect.top - 40,
        left: rect.left + rect.width / 2 - 40,
      });
    } else {
      setSelectionRect(null);
    }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMessage = aiMessage;
    setAiMessage("");
    setAiChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "ai", content: "" },
    ]);
    setAiLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("codecanvas_token")}`,
        },
        body: JSON.stringify({
          message: userMessage,
          context: aiContext,
          chatHistory: aiChatHistory,
          uiState: {
            hasRepoSelected: !!selectedRepo,
            selectedRepo: selectedRepo
              ? {
                  name: selectedRepo.name,
                  fullName: selectedRepo.fullName,
                  description: selectedRepo.description,
                  activeBranch: activeBranch,
                  branches: branches,
                }
              : null,
            allRepos: repos.map((r) => ({
              name: r.name,
              fullName: r.fullName,
              description: r.description,
            })),
            recentCommits: commits
              ? commits.slice(0, 5).map((c) => ({
                  message: c.message,
                  author: c.author,
                  date: c.date,
                  hash: c.hash,
                }))
              : [],
          },
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setAiChatHistory((prev) => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          let newContent = newHistory[lastIndex].content + chunk;

          // Execute navigation if json is detected
          if (newContent.includes('{"action"')) {
            try {
              const jsonMatch = newContent.match(/\{.*?\}/);
              if (jsonMatch) {
                const cmd = JSON.parse(jsonMatch[0]);
                if (cmd.action === "navigate_repo") {
                  const targetRepo = repos.find(
                    (r) => r.name.toLowerCase() === cmd.target.toLowerCase(),
                  );
                  if (targetRepo)
                    setTimeout(() => setSelectedRepo(targetRepo), 100);
                } else if (cmd.action === "open_file") {
                  setTimeout(() => openFileModal({ name: cmd.target.split('/').pop(), path: cmd.target, status: "modified" }), 100);
                }
              }
            } catch (e) {}
          }

          newHistory[lastIndex] = {
            ...newHistory[lastIndex],
            content: newContent,
          };
          return newHistory;
        });
      }
    } catch (err) {
      setAiChatHistory((prev) => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        newHistory[lastIndex].content = "Error connecting to AI server.";
        return newHistory;
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState({
    chats: [],
    commits: [],
  });
  const [notificationTab, setNotificationTab] = useState("chats");
  const readNotificationIds = useRef(new Set(JSON.parse(localStorage.getItem("read_notifications") || "[]")));
  const clearedNotificationIds = useRef(new Set(JSON.parse(localStorage.getItem("cleared_notifications") || "[]")));
  const saveNotificationState = () => {
    localStorage.setItem("cleared_notifications", JSON.stringify(Array.from(clearedNotificationIds.current)));
    localStorage.setItem("read_notifications", JSON.stringify(Array.from(readNotificationIds.current)));
  };

  // Fetch chat messages when repo and branch change (LIVE POLLING)
  useEffect(() => {
    let intervalId;

    const fetchMessages = () => {
      if (selectedRepo && chatBranch) {
        fetchWithAuth(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/chat/${selectedRepo.fullName}?branch=${chatBranch}`,
        )
          .then((res) => res.json())
          .then((data) => {
            setChatMessages((prev) => {
              const newData = Array.isArray(data) ? data : [];
              if (newData.length > prev.length && prev.length > 0) {
                const newMsgs = newData.length - prev.length;
                
                // If it's a message WE just sent (based on author matching), we already scrolled optimistically
                // But just in case, we can force scroll if we're at bottom or it's ours.
                const lastMsg = newData[newData.length - 1];
                const isOurs = lastMsg && lastMsg.author === user?.username;

                if (!isChatOpenRef.current) {
                  setUnreadChatCount((c) => c + newMsgs);
                } else {
                  if (isAtBottomRef.current || isOurs) {
                    setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                  } else {
                    setUnreadScrollCount((c) => c + newMsgs);
                  }
                }
              }
              return newData;
            });
          })
          .catch((err) => console.error("Failed to load chat messages", err));
      }
    };

    // Fetch immediately on mount or branch change
    fetchMessages();

    // Then poll every 3 seconds for new messages
    if (selectedRepo && chatBranch) {
      intervalId = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedRepo, chatBranch]);

  // Fetch live notifications
  useEffect(() => {
    let intervalId;
    const fetchNotifications = () => {
      if (selectedRepo) {
        fetchWithAuth(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/notifications/${selectedRepo.fullName}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.chats || data.commits) {
              setNotifications({
                chats: (data.chats || []).filter((c) => !clearedNotificationIds.current.has(c.id)).map((c) => ({
                  ...c,
                  unread: !readNotificationIds.current.has(c.id),
                })),
                commits: (data.commits || []).filter((c) => !clearedNotificationIds.current.has(c.id)).map((c) => ({
                  ...c,
                  unread: !readNotificationIds.current.has(c.id),
                })),
              });
            }
          })
          .catch((err) => console.error("Failed to load notifications", err));
      }
    };
    fetchNotifications();
    if (selectedRepo) {
      intervalId = setInterval(fetchNotifications, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedRepo]);

  useEffect(() => {
    const token = localStorage.getItem("codecanvas_token");
    const userData = localStorage.getItem("codecanvas_user");

    if (!token || !userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/repos/${parsedUser.username}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load repos", err);
        setLoading(false);
      });
  }, [navigate]);

  // Fetches Real Branches, Commits, and Files when you click a Repo!
  const handleSelectRepo = (repo, initialBranchOverride = null) => {
    setSelectedRepo(repo);
    setCommits([]);
    setBranches([]);
    setRepoFiles([]); // Clear files
    setActiveTab("commits");
    setIsBranchDropdownOpen(false);
    setIsMobileSidebarOpen(false);
    setGlobalSearchQuery("");
    setBranchSearchQuery("");

    // Reset all commit details views so it goes back to the home page of the repo!
    setSelectedCommit(null);
    setCommitDetails(null);
    setCommitFilesTree(null);
    setExpandedFile(null);
    setCurrentPath("");
    setCommitCurrentPath("");

    fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/branches/${repo.fullName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch branches");
        return res.json();
      })
      .then((branchList) => {
        if (!Array.isArray(branchList) || branchList.length === 0) {
          // Empty or uninitialized repository
          setBranches([]);
          setActiveBranch("main");
          setRepoFiles([]);
          setCommits([]);
          return;
        }

        setBranches(branchList);
        const initialBranch = (initialBranchOverride && branchList.includes(initialBranchOverride))
          ? initialBranchOverride
          : branchList.includes("main")
            ? "main"
            : branchList.includes("master")
              ? "master"
              : branchList[0];

        setActiveBranch(initialBranch);

        // Fetch files for the initial branch
        fetchWithAuth(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/files/${repo.fullName}?branch=${initialBranch}`,
        )
          .then((res) => res.json())
          .then((data) => setRepoFiles(Array.isArray(data) ? data : []))
          .catch((err) => console.error("Failed to load files", err));

        // Fetch commits
        fetchWithAuth(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/commits/${repo.fullName}?branch=${initialBranch}&defaultBranch=${repo.defaultBranch}`,
        )
          .then((res) => res.json())
          .then((data) => setCommits(Array.isArray(data) ? data : []))
          .catch((err) => console.error("Failed to load commits", err));
      })
      .catch((err) => {
        console.error("Empty or unavailable repository:", err);
        setBranches([]);
        setCommits([]);
        setRepoFiles([]);
      });
  };

  // INITIALIZATION CASCADE
  useEffect(() => {
    if (repos.length > 0 && isInitializing.current) {
      if (initialParams.current.repo) {
        const repo = repos.find(r => r.fullName === initialParams.current.repo);
        if (repo) {
          if (initialParams.current.tab) {
            setActiveTab(initialParams.current.tab);
          }
          handleSelectRepo(repo, initialParams.current.branch);
          // If no further cascade is needed, finish init
          if (!initialParams.current.commit && !initialParams.current.file) {
            isInitializing.current = false;
          }
        } else {
          isInitializing.current = false;
        }
      } else {
        isInitializing.current = false;
      }
    }
  }, [repos]);

  useEffect(() => {
    if (commits.length > 0 && isInitializing.current && initialParams.current.commit && !selectedCommit) {
      const c = commits.find(c => c.hash === initialParams.current.commit || c.id === initialParams.current.commit);
      if (c) {
        handleCommitClick(c);
        // If no file needs to be opened, finish init
        if (!initialParams.current.file) {
          isInitializing.current = false;
        }
      } else {
        isInitializing.current = false; 
      }
    } else if (commits.length > 0 && isInitializing.current && !initialParams.current.file) {
        // If commits loaded and we aren't waiting for a file, we are done
        isInitializing.current = false;
    }
  }, [commits]);

  useEffect(() => {
    if (commitDetails && isInitializing.current && initialParams.current.file && activeTab !== "files") {
      const f = commitDetails.files.find(f => f.filename === initialParams.current.file);
      if (f) {
        openFileModal({ stopPropagation: () => {} }, initialParams.current.file, selectedCommit);
      }
      isInitializing.current = false; 
    }
  }, [commitDetails]);

  useEffect(() => {
    if (repoFiles.length > 0 && isInitializing.current && initialParams.current.file && activeTab === "files") {
      openFileModal({ stopPropagation: () => {} }, initialParams.current.file, { hash: activeBranch });
      isInitializing.current = false;
    }
  }, [repoFiles]);


  // Fetches NEW commits and files when you switch branches!
  const handleSelectBranch = (branch) => {
    setActiveBranch(branch);
    setIsBranchDropdownOpen(false);
    setIsMobileSidebarOpen(false);
    setGlobalSearchQuery("");
    setBranchSearchQuery("");
    setSelectedCommit(null);
    setCurrentPath("");
    setCommits([]);
    setRepoFiles([]); // Clear files for loading state

    // Fetch commits for branch
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/commits/${selectedRepo.fullName}?branch=${branch}&defaultBranch=${selectedRepo.defaultBranch}`,
    )
      .then((res) => res.json())
      .then((data) => setCommits(data))
      .catch((err) => console.error("Failed to load branch commits", err));

    // Fetch files for branch
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/files/${selectedRepo.fullName}?branch=${branch}`,
    )
      .then((res) => res.json())
      .then((data) => setRepoFiles(data))
      .catch((err) => console.error("Failed to load branch files", err));
  };

  const handleCommitClick = (commit) => {
    setSelectedCommit(commit);
    setIsSearchExpanded(false);
    setCommitDetails(null);
    setCommitFilesTree(null);
    setExpandedFile(null);
    setCommitCurrentPath("");

    // Fetch the specific files that changed
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/commit/${selectedRepo.fullName}/${commit.hash}/details`,
    )
      .then((res) => res.json())
      .then((data) => setCommitDetails(data))
      .catch((err) => console.error("Failed to fetch commit details", err));

    // ALSO fetch the entire repository file tree AT THIS EXACT COMMIT HASH!
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/files/${selectedRepo.fullName}?branch=${commit.hash}`,
    )
      .then((res) => res.json())
      .then((data) => setCommitFilesTree(data))
      .catch((err) => console.error("Failed to fetch commit file tree", err));
  };

  // Folder Navigation Handlers
  const navigateFolder = (path) => {
    setCurrentPath(path);
    setRepoFiles(null);
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/files/${selectedRepo.fullName}?branch=${activeBranch}&path=${encodeURIComponent(path)}`,
    )
      .then((res) => res.json())
      .then((data) => setRepoFiles(data))
      .catch((err) => console.error("Failed to load folder", err));
  };

  const navigateCommitFolder = (path) => {
    setCommitCurrentPath(path);
    setCommitFilesTree(null);
    fetchWithAuth(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/files/${selectedRepo.fullName}?branch=${selectedCommit.hash}&path=${encodeURIComponent(path)}`,
    )
      .then((res) => res.json())
      .then((data) => setCommitFilesTree(data))
      .catch((err) => console.error("Failed to fetch commit folder", err));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedRepo || !chatBranch) return;

    const messageText = chatInput;
    setChatInput(""); // Optimistic clear

    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/chat/${selectedRepo.fullName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            branch: chatBranch,
            text: messageText,
            author: user.username,
            avatarUrl: user.avatarUrl,
          }),
        },
      );

      if (res.ok) {
        const savedMessage = await res.json();
        setChatMessages((prev) => [...prev, savedMessage]);
        setTimeout(() => {
          scrollToBottom();
          teamInputRef.current?.focus();
        }, 50);
      } else {
        console.error("Failed to save message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const renderBreadcrumbs = (path, setPathFn) => {
    if (!path) return null;

    const parts = path.split("/");
    let cumulativePath = "";

    return (
      <div className="flex items-center text-sm px-4 py-2 bg-black/40 backdrop-blur-2xl border-b border-white/10 text-gray-500 dark:text-gray-400">
        <button
          onClick={() => setPathFn("")}
          className="hover:text-white transition-colors"
        >
          root
        </button>
        {parts.map((part, index) => {
          cumulativePath += index === 0 ? part : `/${part}`;
          const currentCumulativePath = cumulativePath; // closure
          return (
            <React.Fragment key={index}>
              <span className="mx-2">/</span>
              <button
                onClick={() => setPathFn(currentCumulativePath)}
                className={`hover:text-white transition-colors ${index === parts.length - 1 ? "text-gray-200 font-medium" : ""}`}
              >
                {part}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const openFileModal = (e, filePath, commit) => {
    e.stopPropagation(); // Prevent expanding the diff view

    // Check if this file was one of the ones changed in this commit
    const isChanged =
      commitDetails && commitDetails.files
        ? !!commitDetails.files.find((f) => f.filename === filePath)
        : false;

    setFileModal({ name: filePath, loading: true, isDiff: isChanged });

    if (isChanged) {
      const parentHash = commit.parentIds && commit.parentIds.length > 0 ? commit.parentIds[0] : null;

      const fetchOld = parentHash 
        ? fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/file-content/${selectedRepo.fullName}?path=${encodeURIComponent(filePath)}&ref=${parentHash}`).then(r => r.json())
        : Promise.resolve({ content: "", isImage: false, mimeType: "" }); // Initial commit has no old content

      const fetchNew = fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/file-content/${selectedRepo.fullName}?path=${encodeURIComponent(filePath)}&ref=${commit.hash}`).then(r => r.json());

      Promise.all([fetchOld, fetchNew])
        .then(([oldData, newData]) => {
          const isImage = newData.isImage || oldData.isImage;

          setFileModal({
            name: filePath,
            oldContent: oldData.content,
            newContent: newData.content,
            isImage: isImage,
            mimeType: newData.mimeType,
            loading: false,
            isDiff: !isImage && isChanged, // Don't use code diff viewer for images!
          });
        })
        .catch((err) =>
          setFileModal({
            name: filePath,
            content: "Failed to load diff content.",
            loading: false,
            isDiff: false,
          }),
        );
    } else {
      // If it didn't change, just fetch the normal content at this commit
      fetchWithAuth(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/file-content/${selectedRepo.fullName}?path=${encodeURIComponent(filePath)}&ref=${commit.hash}`,
      )
        .then((res) => res.json())
        .then((data) =>
          setFileModal({
            name: filePath,
            content: data.content,
            isImage: data.isImage,
            mimeType: data.mimeType,
            loading: false,
            isDiff: false,
          }),
        )
        .catch((err) =>
          setFileModal({
            name: filePath,
            content: "Failed to load file content.",
            loading: false,
            isDiff: false,
          }),
        );
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-transparent text-gray-200 font-sans overflow-hidden relative">
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* 1. Sidebar (Repositories) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col flex-shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
        >
          <div
            onClick={() => setSelectedRepo(null)}
            className="p-4 border-b border-white/10 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors"
            title="Home"
          >
            <img
              src="/logo.jpg"
              alt="CodeCanvas Logo"
              className="w-8 h-8 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.3)] object-cover logo-img scale-[1.05]"
            />
            <span className="font-bold text-lg text-white">CodeCanvas</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Your Repositories
            </div>
            <div className="space-y-1">
              {repos
                .filter(
                  (repo) =>
                    selectedRepo ||
                    !globalSearchQuery ||
                    repo.name
                      .toLowerCase()
                      .includes(globalSearchQuery.toLowerCase()),
                )
                .map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedRepo?.id === repo.id
                        ? "bg-blue-500/15 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Box size={16} className="mr-3 flex-shrink-0" />
                    <span className="truncate" title={repo.name}>{repo.name}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-white/5 flex items-center space-x-3 bg-transparent hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSettingsModal({ isOpen: true, activeTab: "profile" })}>
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate" title={user.username}>
                {user.username}
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSettingsModal({ isOpen: true, activeTab: "settings" }); }}>
              <Settings
                size={16}
                className="text-gray-500 dark:text-gray-400 hover:text-white transition-colors"
              />
            </button>
          </div>
        </div>

        {/* 2. Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Top Header */}
          <header className="relative z-50 h-16 border-b border-white/10 flex items-center justify-between px-3 md:px-6 bg-black/40 backdrop-blur-2xl flex-shrink-0">
            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-1 mr-4">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden mr-3 text-gray-500 dark:text-gray-400 hover:text-white flex-shrink-0"
              >
                <Menu size={20} />
              </button>
              {selectedRepo ? (
                <div className="flex items-center min-w-0">
                  <button
                    onClick={() => setSelectedRepo(null)}
                    className="hidden sm:inline-block text-gray-200 hover:text-white hover:underline cursor-pointer truncate max-w-[100px] lg:max-w-[150px]"
                    title="Home"
                  >
                    {user.username}
                  </button>
                  <ChevronRight
                    size={16}
                    className="hidden sm:block mx-1 md:mx-2 flex-shrink-0"
                  />
                  <button
                    onClick={() => handleSelectRepo(selectedRepo)}
                    className="text-blue-400 font-semibold truncate min-w-0 max-w-[100px] sm:max-w-[150px] lg:max-w-[250px] hover:underline cursor-pointer"
                    title={selectedRepo.name}
                  >
                    {selectedRepo.name}
                  </button>
                  <ChevronRight
                    size={16}
                    className="mx-1 md:mx-2 flex-shrink-0"
                  />

                  {/* Branch Selector Dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() =>
                        setIsBranchDropdownOpen(!isBranchDropdownOpen)
                      }
                      className="flex items-center whitespace-nowrap bg-white/5 hover:bg-white/10 px-2 py-1 md:px-3 rounded-md text-gray-200 transition-colors"
                    >
                      <GitBranch
                        size={14}
                        className="mr-1 md:mr-2 text-blue-400"
                      />
                      <span className="truncate max-w-[80px] sm:max-w-xs">
                        {activeBranch}
                      </span>
                      <ChevronDown
                        size={14}
                        className="ml-1 md:ml-2 opacity-50"
                      />
                    </button>

                    {isBranchDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-dark-800/60 backdrop-blur-2xl border border-white/10 rounded-md shadow-2xl z-50 py-1 max-h-64 flex flex-col">
                        {branches.length > 5 && (
                          <div className="px-2 py-1 border-b border-white/10">
                            <input
                              type="text"
                              value={branchSearchQuery}
                              onChange={(e) =>
                                setBranchSearchQuery(e.target.value)
                              }
                              placeholder="Search branches"
                              className="w-full bg-black/20 border border-white/10 text-xs rounded py-1 px-2 text-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}

                        <div className="overflow-y-auto flex-1">
                          {branches
                            .filter(
                              (b) =>
                                !branchSearchQuery ||
                                b
                                  .toLowerCase()
                                  .includes(branchSearchQuery.toLowerCase()),
                            )
                            .map((branch) => (
                              <button
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

            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {((!selectedRepo && repos.length > 0) || selectedRepo) && (
              <>
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="md:hidden p-2 text-gray-400 hover:text-white rounded-full transition-colors"
                >
                  <Search size={18} />
                </button>
                <div className={`absolute inset-0 z-50 bg-[#121212] md:bg-transparent px-4 md:px-0 flex items-center md:relative md:w-48 lg:w-64 md:flex ${isSearchExpanded ? "flex" : "hidden"}`}>
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
                          saveNotificationState();
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
                              saveNotificationState();
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
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(notification.time).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                              {notification.message}
                            </p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Split Pane Content */}
          <main className="flex-1 flex overflow-hidden">
            {!selectedRepo ? (
              <div className="w-full h-full flex flex-col items-center text-gray-500 bg-transparent overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl w-full flex flex-col items-center m-auto py-8">
                  <div className="mb-12 text-center flex flex-col items-center animate-spring-up">
                    <img src="/logo.jpg" className="logo-img transition-all duration-300 w-24 h-24 mb-6 rounded-[2rem] object-cover shadow-[0_0_50px_rgba(168,85,247,0.4)] border border-white/10" alt="CodeCanvas" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text pb-2 leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 mb-4 tracking-tight" style={{ backgroundSize: '200% auto', animation: 'gradient-x 4s linear infinite' }}>
                      Good {getGreeting()}, {user?.username || 'Developer'}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                      Select a repository from the sidebar to dive into your
                      codebase, analyze commits, and collaborate with your team.
                    </p>
                  </div>

                  {repos.length > 0 && (
                    <div className="w-full animate-spring-up" style={{ animationDelay: '0.1s' }}>
                      <div className="w-full text-left mb-4">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                          <Activity size={14} className="mr-2" /> Jump Back In
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {isRecommending ? [1, 2, 3].map(i => (
                          <div key={i} className="flex flex-col items-start p-5 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden animate-pulse h-[110px]">
                            <div className="flex items-center space-x-3 mb-3 w-full mt-1">
                              <div className="w-[38px] h-[38px] bg-white/5 rounded-xl flex items-center justify-center">
                                <Sparkles size={16} className="text-blue-400/50" />
                              </div>
                              <div className="h-5 bg-white/10 rounded w-1/2"></div>
                            </div>
                            <div className="text-xs text-blue-400/60 mt-2 font-medium flex items-center">
                               <Activity size={12} className="mr-1.5 animate-spin-slow" /> AI is suggesting...
                            </div>
                          </div>
                        )) : (recommendedRepos.length > 0 ? repos.filter(r => recommendedRepos.find(rec => String(rec.id) === String(r.id))).slice(0,3) : repos.slice(0, 3)).map((repo) => {
                          const aiRec = recommendedRepos.find(rec => String(rec.id) === String(repo.id));
                          return (
                          <button
                            key={repo.id}
                            onClick={() => handleSelectRepo(repo)}
                            className="flex flex-col items-start p-5 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-white/[0.08] transition-all text-left group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] relative overflow-hidden"
                          >
                            {aiRec && (
                              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center shadow-md">
                                <Sparkles size={8} className="mr-1" /> AI PICK
                              </div>
                            )}
                            <div className="flex items-center space-x-3 mb-3 w-full mt-1">
                              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                                <Folder size={18} />
                              </div>
                              <span className="text-white font-bold truncate flex-1 pr-6" title={repo.name}>{repo.name}</span>
                            </div>
                            {aiRec ? (
                              <p className="text-xs text-blue-300 font-medium line-clamp-2 w-full flex items-start mt-1">
                                <Sparkles size={12} className="mr-1.5 mt-0.5 flex-shrink-0 opacity-70" /> {aiRec.reason}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 line-clamp-2 w-full group-hover:text-gray-500 dark:text-gray-400 transition-colors">
                                {repo.description || "No description provided."}
                              </p>
                            )}
                          </button>
                        )})}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6 animate-spring-up" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                      <div className="flex items-center space-x-4 mb-3 relative z-10">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                          <Sparkles size={20} />
                        </div>
                        <h3 className="text-white font-bold text-lg">AI-Powered Insights</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 relative z-10 leading-relaxed">
                        Select text anywhere in your code or chat directly with CodeCanvas AI for instant architectural explanations and debugging.
                      </p>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                      <div className="flex items-center space-x-4 mb-3 relative z-10">
                        <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                          <MessageSquare size={20} />
                        </div>
                        <h3 className="text-white font-bold text-lg">Team Collaboration</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 relative z-10 leading-relaxed">
                        Hop into a repository's team chat to discuss decisions in real-time. CodeCanvas perfectly syncs your branch's context.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Left Side: Commits OR Files */}
                <div className="flex-1 overflow-hidden flex flex-col border-r border-white/10">
                  {/* Tabs */}
                  <div className="flex space-x-6 px-6 pt-4 border-b border-white/10">
                    <button
                      onClick={() => setActiveTab("commits")}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "commits" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-200"}`}
                    >
                      Commit History (DAG)
                    </button>
                    <button
                      onClick={() => setActiveTab("files")}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === "files" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-200"}`}
                    >
                      <FileCode size={16} className="mr-2" /> Browse Code
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-auto p-6">
                    {/* Commits Tab */}
                    {activeTab === "commits" && (
                      <div className="space-y-3 w-full">
                        {selectedCommit ? (
                          // Detailed Single Commit View
                          <div className="bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-6">
                            <button
                              onClick={() => setSelectedCommit(null)}
                              className="text-blue-400 text-sm mb-4 flex items-center hover:text-blue-300 transition-colors"
                            >
                              &larr; Back to all commits
                            </button>
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-bold text-white mb-2 pr-4">
                                {selectedCommit.message}
                              </h3>
                              <button
                                onClick={() => {
                                  setIsAiChatOpen(true);
                                  setAiMessage(`Can you explain the changes in commit ${selectedCommit.hash.substring(0,7)}?`);
                                }}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 hover:text-white rounded-lg transition-all border border-purple-500/30 hover:border-purple-400 shadow-sm flex-shrink-0 mt-1"
                                title="Ask AI to analyze this commit"
                              >
                                <Sparkles size={14} className="text-purple-400" />
                                <span className="text-xs font-semibold tracking-wide">Explain with AI</span>
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                              Committed by{" "}
                              <span className="text-gray-200">
                                {selectedCommit.author}
                              </span>{" "}
                              on{" "}
                              {new Date(
                                selectedCommit.date,
                              ).toLocaleDateString()}
                            </p>

                            <div className="bg-white/[0.04] backdrop-blur-3xl border border-white/20 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col mt-4">
                              <div className="p-4 border-b border-white/20 font-semibold text-gray-200 flex items-center bg-black/40 shadow-sm">
                                <Folder
                                  size={18}
                                  className="mr-2 text-blue-400"
                                />
                                REPOSITORY STATE AT THIS COMMIT
                              </div>

                              {renderBreadcrumbs(
                                commitCurrentPath,
                                navigateCommitFolder,
                              )}

                              <div className="overflow-auto max-h-[60vh]">
                                {!commitFilesTree || !commitDetails ? (
                                  <div className="text-gray-500 text-sm">
                                    Loading complete file tree...
                                  </div>
                                ) : (
                                  <div className="divide-y divide-white/10 bg-transparent">
                                    {commitFilesTree.map((file, idx) => {
                                      // Check if this file was changed in the commit
                                      const changedFile = commitDetails.files
                                        ? commitDetails.files.find(
                                            (f) => f.filename === file.path,
                                          )
                                        : null;

                                      // Did files INSIDE this folder change in this commit?
                                      const hasNestedChanges =
                                        file.type === "folder" &&
                                        commitDetails.files &&
                                        commitDetails.files.some((f) =>
                                          f.filename.startsWith(
                                            file.path + "/",
                                          ),
                                        );

                                      const isChanged =
                                        !!changedFile || hasNestedChanges;

                                      // Show badges for additions/deletions if it's the exact file
                                      let adds = changedFile
                                        ? changedFile.additions
                                        : 0;
                                      let dels = changedFile
                                        ? changedFile.deletions
                                        : 0;

                                      if (
                                        hasNestedChanges &&
                                        commitDetails.files
                                      ) {
                                        // SUM the nested changes for the folder badge
                                        commitDetails.files
                                          .filter((f) =>
                                            f.filename.startsWith(
                                              file.path + "/",
                                            ),
                                          )
                                          .forEach((f) => {
                                            adds += f.additions;
                                            dels += f.deletions;
                                          });
                                      }

                                      const isExpanded =
                                        expandedFile === file.path;

                                      return (
                                        <div
                                          key={idx}
                                          className="flex flex-col"
                                        >
                                          <div
                                            onClick={() => {
                                              if (file.type === "folder") {
                                                navigateCommitFolder(file.path);
                                              } else if (isChanged) {
                                                setExpandedFile(
                                                  isExpanded ? null : file.path,
                                                );
                                              }
                                            }}
                                            className={`flex items-center justify-between px-4 py-2.5 transition-colors group ${file.type === "folder" || isChanged ? "cursor-pointer hover:bg-white/5" : ""}`}
                                          >
                                            <div className="flex items-center text-sm truncate">
                                              {file.type === "folder" ? (
                                                <Folder
                                                  size={18}
                                                  className="text-blue-400 mr-3 flex-shrink-0"
                                                />
                                              ) : (
                                                <FileText
                                                  size={18}
                                                  className="text-gray-500 mr-3 flex-shrink-0"
                                                />
                                              )}

                                              <span
                                                className={`truncate transition-colors ${isChanged ? "text-blue-300 font-semibold" : "text-gray-300 group-hover:text-white"}`}
                                              >
                                                {file.name}
                                              </span>
                                            </div>

                                            <div className="flex items-center">
                                              {isChanged && (
                                                <div className="text-xs font-mono flex items-center flex-shrink-0 ml-4">
                                                  {file.type === "folder" && (
                                                    <span className="text-gray-500 mr-3 italic text-[10px] uppercase tracking-wider">
                                                      Changes inside
                                                    </span>
                                                  )}
                                                  <div className="space-x-2 flex items-center">
                                                    {adds > 0 && (
                                                      <span className="text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
                                                        +{adds}
                                                      </span>
                                                    )}
                                                    {dels > 0 && (
                                                      <span className="text-red-400 bg-red-900/20 px-2 py-0.5 rounded">
                                                        -{dels}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              {file.type === "file" && (
                                                <button
                                                  onClick={(e) =>
                                                    openFileModal(
                                                      e,
                                                      file.path,
                                                      selectedCommit,
                                                    )
                                                  }
                                                  className="ml-4 p-1.5 rounded bg-white/10 hover:bg-blue-500/50 text-gray-500 dark:text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                  title="View Full File"
                                                >
                                                  <Eye size={14} />
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {/* Code Diff Viewer with Line Numbers! */}
                                          {isExpanded &&
                                            changedFile &&
                                            changedFile.patch && (
                                              <div className="bg-[#0d1117] overflow-x-auto border-t border-dark-700 font-mono text-xs leading-relaxed">
                                                {(() => {
                                                  let oldLine = 0;
                                                  let newLine = 0;

                                                  return changedFile.patch
                                                    .split("\n")
                                                    .map((line, i) => {
                                                      let colorClass =
                                                        "text-gray-300";
                                                      let bgClass =
                                                        "hover:bg-white/5";
                                                      let oldNum = "";
                                                      let newNum = "";

                                                      if (
                                                        line.startsWith("@@")
                                                      ) {
                                                        colorClass =
                                                          "text-blue-400";
                                                        bgClass =
                                                          "bg-blue-900/10";

                                                        // Parse the chunk header to extract starting line numbers
                                                        const match =
                                                          line.match(
                                                            /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/,
                                                          );
                                                        if (match) {
                                                          oldLine = parseInt(
                                                            match[1],
                                                            10,
                                                          );
                                                          newLine = parseInt(
                                                            match[2],
                                                            10,
                                                          );
                                                        }
                                                      } else if (
                                                        line.startsWith("+")
                                                      ) {
                                                        colorClass =
                                                          "text-green-400";
                                                        bgClass =
                                                          "bg-green-900/20";
                                                        newNum = newLine++;
                                                      } else if (
                                                        line.startsWith("-")
                                                      ) {
                                                        colorClass =
                                                          "text-red-400";
                                                        bgClass =
                                                          "bg-red-900/20";
                                                        oldNum = oldLine++;
                                                      } else if (
                                                        line.startsWith("\\")
                                                      ) {
                                                        colorClass =
                                                          "text-gray-500 italic";
                                                      } else {
                                                        // Context line (unchanged code)
                                                        oldNum = oldLine++;
                                                        newNum = newLine++;
                                                      }

                                                      return (
                                                        <div
                                                          key={i}
                                                          className={`flex ${bgClass}`}
                                                        >
                                                          <div className="w-12 flex-shrink-0 text-right pr-3 py-0.5 text-gray-600 border-r border-white/10 select-none bg-white dark:bg-[#050505]/30">
                                                            {oldNum}
                                                          </div>
                                                          <div className="w-12 flex-shrink-0 text-right pr-3 py-0.5 text-gray-600 border-r border-white/10 select-none bg-white dark:bg-[#050505]/30">
                                                            {newNum}
                                                          </div>
                                                          <div
                                                            className={`px-4 py-0.5 whitespace-pre flex-1 ${colorClass}`}
                                                          >
                                                            {line}
                                                          </div>
                                                        </div>
                                                      );
                                                    });
                                                })()}
                                              </div>
                                            )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : // Normal Commit List View
                        commits.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            Loading branch history...
                          </div>
                        ) : (
                          commits
                            .filter(
                              (c) =>
                                !globalSearchQuery ||
                                c.message
                                  .toLowerCase()
                                  .includes(globalSearchQuery.toLowerCase()) ||
                                c.author
                                  .toLowerCase()
                                  .includes(globalSearchQuery.toLowerCase()) ||
                                c.hash.includes(globalSearchQuery),
                            )
                            .map((commit) => {
                              const isInherited =
                                !commit.isBranchSpecific &&
                                activeBranch !== selectedRepo?.defaultBranch;

                              return (
                                <div
                                  key={commit.hash}
                                  onClick={() => handleCommitClick(commit)}
                                  className={`bg-black/60 backdrop-blur-3xl border ${isInherited ? "border-white/5 opacity-60" : "border-white/10"} rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-blue-500/50 hover:opacity-100 transition-all cursor-pointer group relative overflow-hidden`}
                                >
                                  {commit.isBranchSpecific && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50"></div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex space-x-2 items-center">
                                      <span className="font-mono text-sm text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
                                        {commit.id}
                                      </span>
                                      {commit.isBranchSpecific && (
                                        <span className="text-[10px] uppercase font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-800/50 flex items-center tracking-wider">
                                          <GitBranch
                                            size={10}
                                            className="mr-1"
                                          />{" "}
                                          Unique
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        commit.date,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-200 font-medium text-sm mb-3 group-hover:text-blue-300 transition-colors">
                                    {commit.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mr-2 text-white">
                                        {commit.author.charAt(0).toUpperCase()}
                                      </div>
                                      {commit.author}
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setIsAiChatOpen(true); setAiMessage(`Can you explain the changes in commit ${commit.hash.substring(0,7)}?`); }}
                                      className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 px-2 py-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded transition-all border border-purple-500/20"
                                      title="Ask AI to explain this commit"
                                    >
                                      <Sparkles size={12} />
                                      <span className="text-[10px] font-medium">Explain</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}

                    {/* Files Tab */}
                    {activeTab === "files" && (
                      <div className="max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300 flex items-center">
                            <img
                              src={user.avatarUrl}
                              className="w-5 h-5 rounded-full mr-2"
                              alt="Avatar"
                            />
                            {user.username}{" "}
                            <span className="text-gray-500 mx-2">•</span>{" "}
                            Initial commit on {activeBranch}
                          </span>
                          <span className="text-xs text-gray-500">
                            2 days ago
                          </span>
                        </div>

                        <div className="bg-black/20 border-t border-white/10 flex flex-col flex-1 overflow-hidden">
                          {renderBreadcrumbs(currentPath, navigateFolder)}

                          <div className="divide-y divide-dark-700 overflow-auto">
                            {!repoFiles ? (
                              <div className="text-center py-8 text-gray-500">
                                Loading files...
                              </div>
                            ) : (
                              repoFiles
                                .filter(
                                  (f) =>
                                    !globalSearchQuery ||
                                    f.name
                                      .toLowerCase()
                                      .includes(
                                        globalSearchQuery.toLowerCase(),
                                      ) ||
                                    f.path
                                      .toLowerCase()
                                      .includes(
                                        globalSearchQuery.toLowerCase(),
                                      ),
                                )
                                .map((file, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() =>
                                      file.type === "folder"
                                        ? navigateFolder(file.path)
                                        : null
                                    }
                                    className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors group ${file.type === "folder" ? "cursor-pointer" : ""}`}
                                  >
                                    <div className="flex items-center text-sm truncate">
                                      {file.type === "folder" ? (
                                        <Folder
                                          size={18}
                                          className="text-blue-400 mr-3 flex-shrink-0"
                                        />
                                      ) : (
                                        <FileCode
                                          size={18}
                                          className="text-gray-500 mr-3 flex-shrink-0"
                                        />
                                      )}

                                      <span
                                        className={`truncate transition-colors ${file.type === "folder" ? "text-blue-300 font-medium group-hover:text-blue-200" : "text-gray-300 group-hover:text-white"}`}
                                      >
                                        {file.name}
                                      </span>
                                    </div>
                                    {file.type === "file" && (
                                      <button
                                        onClick={(e) =>
                                          openFileModal(e, file.path, {
                                            hash: activeBranch,
                                          })
                                        }
                                        className="p-1.5 rounded bg-white/10 hover:bg-blue-500/50 text-gray-500 dark:text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        title="View Full File"
                                      >
                                        <Eye size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Right Side: Team/Branch Chat (FULLY INTERACTIVE) */}
              </>
            )}
          </main>
        </div>

        {fileModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setFileModal(null)}>
            <div className="bg-black/20 border border-white/10 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center space-x-3">
                  <FileCode className="text-blue-400" size={20} />
                  <h3 className="text-white font-mono font-semibold">
                    {fileModal.name}
                  </h3>
                  {fileModal.isDiff && (
                    <span className="ml-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-900/50 text-blue-400 rounded-full">
                      Unified Diff Viewer
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {fileModal.isDiff && (
                    <button
                      onClick={() => {
                        setIsAiChatOpen(true);
                        setAiMessage(`Can you explain the code changes in ${fileModal.name}?`);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 text-teal-300 hover:text-white rounded-lg transition-all border border-teal-500/30 hover:border-teal-400 shadow-sm mr-2"
                      title="Ask AI to analyze these code changes"
                    >
                      <Sparkles size={14} className="text-teal-400" />
                      <span className="text-xs font-semibold tracking-wide">Explain the code changes with AI</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsAiChatOpen(true);
                      setAiMessage(`Can you explain the code in ${fileModal.name}?`);
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 hover:text-white rounded-lg transition-all border border-purple-500/30 hover:border-purple-400 shadow-sm"
                    title="Ask AI to analyze this file"
                  >
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-xs font-semibold tracking-wide">Explain with AI</span>
                  </button>
                  <button
                    onClick={() => setFileModal(null)}
                    className="text-gray-500 dark:text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ml-2 border border-transparent"
                  >
                    <span className="text-sm font-medium">Close</span>
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 overflow-auto ${fileModal.isDiff ? "" : "bg-[#0d1117] p-4"} flex justify-center items-center`}
              >
                {fileModal.loading ? (
                  <div className="text-gray-500 font-medium">
                    Fetching file content from GitHub...
                  </div>
                ) : fileModal.isImage ? (
                  // RENDER RAW IMAGES!
                  <div className="bg-transparent w-full h-full flex items-center justify-center p-8">
                    <img
                      src={`data:${fileModal.mimeType};base64,${fileModal.isDiff ? fileModal.newContent : fileModal.content}`}
                      alt={fileModal.name}
                      className="max-w-full max-h-full object-contain rounded shadow-2xl border border-dark-700 bg-white/5"
                    />
                  </div>
                ) : fileModal.isDiff ? (
                  // RENDER THE FULL UNIFIED DIFF VIEWER!
                  <div className="text-sm custom-diff-viewer w-full h-full">
                    <style>{`
                    /* Disable sticky positioning to completely fix the leaky scrolling glitch */
                    .custom-diff-viewer * {
                      position: static !important;
                    }
                    
                    /* Hide the ugly 'code fold' bars since we are rendering the whole file anyway */
                    .custom-diff-viewer [class*="codeFold"] {
                      display: none !important;
                    }
                    
                    /* Beautiful typography polish */
                    .custom-diff-viewer pre, .custom-diff-viewer span {
                      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace !important;
                      font-size: 13px !important;
                      line-height: 1.6 !important;
                    }
                  `}</style>
                    <ReactDiffViewer
                      oldValue={
                        fileModal.oldContent ===
                        "// Cannot display file content (might be a binary or image)."
                          ? ""
                          : fileModal.oldContent
                      }
                      newValue={
                        fileModal.newContent ===
                        "// Cannot display file content (might be a binary or image)."
                          ? ""
                          : fileModal.newContent
                      }
                      splitView={false}
                      useDarkTheme={true}
                      showDiffOnly={false}
                      styles={diffStyles}
                    />
                  </div>
                ) : (
                  // Normal plain file viewer
                  <pre
                    onMouseUp={handleMouseUp}
                    className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto w-full h-full"
                  >
                    {fileModal.content}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}


{/* Settings & Profile Modal */}
{settingsModal.isOpen && (
  <div className="fixed inset-0 bg-black/80 z-[250] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm" onClick={() => setSettingsModal({ isOpen: false, activeTab: "profile" })}>
    <div className="bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl h-[85vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
      
      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white font-bold text-lg flex items-center">
            <Settings size={20} className="mr-2 text-blue-400" />
            Preferences
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setSettingsModal({ ...settingsModal, activeTab: "profile" })}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${settingsModal.activeTab === "profile" ? "bg-blue-500/15 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] text-blue-400 border border-blue-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            <Users size={16} className="mr-3" />
            User Profile
          </button>
          <button
            onClick={() => setSettingsModal({ ...settingsModal, activeTab: "settings" })}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${settingsModal.activeTab === "settings" ? "bg-blue-500/15 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] text-blue-400 border border-blue-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            <Settings size={16} className="mr-3" />
            General Settings
          </button>
          <button
            onClick={() => setSettingsModal({ ...settingsModal, activeTab: "ai" })}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${settingsModal.activeTab === "ai" ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            <Sparkles size={16} className="mr-3" />
            AI Assistant
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#0d1117] relative">
        <button
          onClick={() => setSettingsModal({ ...settingsModal, isOpen: false })}
          className="absolute top-6 right-6 text-gray-500 dark:text-gray-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {settingsModal.activeTab === "profile" && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">My Profile</h3>
              
              <div className="flex items-start space-x-8 mb-10">
                <img src={user?.avatarUrl} className="w-24 h-24 rounded-full border-2 border-dark-600 shadow-xl" alt="Avatar" />
                <div>
                  <h4 className="text-xl font-bold text-white">{user?.username}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">GitHub Connected Account</p>
                  <p className="text-xs text-blue-400 mt-3 bg-blue-500/10 inline-block px-3 py-1 rounded-full border border-blue-500/20">Pro Tier</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Display Name</label>
                  <input type="text" defaultValue={user?.username} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Email Address</label>
                  <input type="email" placeholder="Linked to GitHub" disabled className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {settingsModal.activeTab === "settings" && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">General Settings</h3>
              
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Light Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Switch between dark and light themes (Beta).</p>
                  </div>
                  <button onClick={() => setIsLightMode(!isLightMode)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isLightMode ? 'bg-blue-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute transform transition-transform ${isLightMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg flex items-center justify-between opacity-75">
                  <div>
                    <h4 className="text-white font-medium">Desktop Notifications</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive alerts for team chat and build failures.</p>
                  </div>
                  <button className="w-12 h-6 rounded-full transition-colors relative flex items-center bg-gray-600 cursor-not-allowed">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute transform transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsModal.activeTab === "ai" && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center">
                <Sparkles size={24} className="text-purple-400 mr-3" />
                AI Assistant Preferences
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-dark-800 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-purple-300 font-medium mb-4">Model Selection</h4>
                  <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] py-3 text-white focus:outline-none focus:border-purple-500">
                    <option>CodeCanvas Smart Router (Default)</option>
                    <option>GPT-4o (OpenAI)</option>
                    <option>Claude 3.5 Sonnet (Anthropic)</option>
                    <option>Llama 3 120B (Groq Fast)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-3">Smart router automatically switches between fast local models for UI actions and heavy models for logic reasoning.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto-Fetch Context</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Allow AI to read repository files automatically without asking.</p>
                  </div>
                  <button className="w-12 h-6 rounded-full transition-colors relative flex items-center bg-purple-500">
                    <div className="w-4 h-4 bg-white rounded-full absolute transform transition-transform translate-x-7" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* GLOBAL CHAT DOCK (Separated Windows and Buttons) */}
        <div className="fixed bottom-6 right-6 z-[150] pointer-events-none flex flex-col items-end gap-4">
          
          {/* WINDOWS CONTAINER */}
          <div className="flex flex-row-reverse items-end gap-4">
            {/* Team Chat Window */}
            {selectedRepo && (
              <div className={`transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] ${isChatOpen ? "opacity-100 h-[500px] w-[350px]" : "opacity-0 h-0 w-0 !min-w-0 !min-h-0 !p-0 border-0"}`} style={{ minWidth: isChatOpen ? "300px" : "0px", minHeight: isChatOpen ? "400px" : "0px", resize: "both", borderRadius: isTeamExpanded ? "0" : "16px" }}>
                <div className={`bg-[#0f111a]/95 backdrop-blur-xl border border-blue-500/20 overflow-hidden flex flex-col ${isTeamExpanded ? "fixed inset-0 z-[200] !w-full !h-full rounded-none" : "w-full h-full rounded-2xl"}`}>
<div className="p-3 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
                  <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-white flex items-center">
                      <Users size={16} className="mr-2 text-blue-400" /> Team
                      Chat
                    </h3>
                    <div className="ml-3 relative flex items-center">
                      <GitBranch
                        size={10}
                        className="absolute left-1.5 text-blue-400 pointer-events-none"
                      />
                      <select
                        value={chatBranch}
                        onChange={(e) => setChatBranch(e.target.value)}
                        className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded pl-4 pr-1 py-0.5 max-w-[120px] appearance-none cursor-pointer focus:outline-none focus:border-blue-500 hover:bg-blue-900/50 transition-colors"
                        title="Switch chat branch"
                      >
                        {branches.map((b) => (
                          <option
                            key={b}
                            value={b}
                            className="bg-transparent text-gray-200"
                          >
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-transparent relative" ref={chatScrollContainerRef} onScroll={handleChatScroll} onClick={(e) => {
                    if (window.getSelection().toString().length === 0 && (e.target === e.currentTarget || !['BUTTON', 'A', 'INPUT'].includes(e.target.tagName))) {
                      teamInputRef.current?.focus();
                    }
                  }}>
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-[-20px] opacity-60">
                      <Users size={32} className="text-blue-500 mb-4 opacity-50" />
                      <div className="text-blue-100 text-sm font-medium mb-2">Start the discussion</div>
                      <div className="text-xs text-blue-200/50 leading-relaxed">
                        No messages in this branch yet. Say hi to your team!
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isSelf = msg.author === user?.username;
                      const timeString = new Date(
                        msg.createdAt,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div key={msg._id || msg.id} className={`flex space-x-3 ${isSelf ? 'justify-end' : ''}`}>
                          {!isSelf && (
                            msg.avatarUrl ? (
                              <img
                                src={msg.avatarUrl}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full flex-shrink-0 border border-dark-600"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold border border-blue-500/50">
                                {msg.author.substring(0, 2).toUpperCase()}
                              </div>
                            )
                          )}
                          <div className={`min-w-0 max-w-[85%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            {!isSelf && (
                              <div className="flex items-baseline space-x-2 ml-1 mb-1">
                                <span className="text-xs font-semibold text-gray-300">
                                  {msg.author}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {timeString}
                                </span>
                              </div>
                            )}
                            <div className={`text-[13px] px-4 py-2.5 rounded-2xl break-words whitespace-pre-wrap shadow-sm ${isSelf ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm' : 'bg-dark-800/80 border border-white/5 text-gray-200 rounded-tl-sm'}`}>
                              {msg.text}
                            </div>
                            {isSelf && (
                              <span className="text-[10px] text-gray-500 mt-1 mr-1">
                                {timeString}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                
                  {unreadScrollCount > 0 && (
                    <button 
                      onClick={scrollToBottom}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-[60] flex items-center space-x-1 animate-bounce"
                    >
                      <ArrowDown size={14} />
                      <span>{unreadScrollCount} new message{unreadScrollCount > 1 ? 's' : ''}</span>
                    </button>
                  )}
                  <div className="p-3 bg-transparent border-t border-white/5 relative z-10 backdrop-blur-md">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(e);
                    }}
                    className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-inner"
                  >
                    <input
                      ref={teamInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Message team..."
                      className="w-full bg-transparent text-sm py-3 pl-4 pr-12 focus:outline-none text-gray-200 placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="absolute right-2 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-blue-400 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
                </div>
              </div>
            )}

            {/* AI Chat Window */}
            <div className={`transition-all duration-300 ease-in-out pointer-events-auto overflow-hidden shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] ${isAiChatOpen ? "opacity-100 h-[500px] w-[350px]" : "opacity-0 h-0 w-0 !min-w-0 !min-h-0 !p-0 border-0"}`} style={{ minWidth: isAiChatOpen ? "300px" : "0px", minHeight: isAiChatOpen ? "400px" : "0px", resize: "both", borderRadius: isAiExpanded ? "0" : "16px" }}>
              <div className={`bg-[#0f111a]/95 backdrop-blur-xl border border-purple-500/20 overflow-hidden flex flex-col ${isAiExpanded ? "fixed inset-0 z-[200] !w-full !h-full rounded-none" : "w-full h-full rounded-2xl"}`}>
                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
                  <h3 className="text-sm font-semibold text-white flex items-center select-none">
                    <Sparkles size={16} className="mr-2 text-purple-400" />{" "}
                    CodeCanvas AI
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsAiExpanded(!isAiExpanded)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => setIsAiChatOpen(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent relative" onClick={(e) => {
                    if (window.getSelection().toString().length === 0 && (e.target === e.currentTarget || !['BUTTON', 'A', 'INPUT'].includes(e.target.tagName))) {
                      aiInputRef.current?.focus();
                    }
                  }}>
                  {aiContext && (
                    <div className="text-xs text-purple-200/70 bg-purple-900/10 p-3 rounded-lg border border-purple-500/20 backdrop-blur-sm shadow-inner mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                          Attached Context
                        </span>
                        <button
                          onClick={() => setAiContext("")}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="truncate font-mono opacity-80">{aiContext}</div>
                    </div>
                  )}
                  {aiChatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-[-20px] opacity-60">
                      <Sparkles size={32} className="text-purple-500 mb-4 opacity-50" />
                      <div className="text-purple-100 text-sm font-medium mb-2">CodeCanvas AI is ready</div>
                      <div className="text-xs text-purple-200/50 leading-relaxed">
                        Ask questions about the codebase, or select text in the editor to attach it as context.
                      </div>
                    </div>
                  ) : (
                    aiChatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`min-w-0 max-w-[95%] w-fit overflow-x-auto text-[13px] break-words ${msg.role === "user" ? "px-4 py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md ml-auto" : "text-gray-200"}`}
                        >
                          {msg.role === "user" ? (
                            msg.content
                          ) : (
                            <div className="prose prose-invert prose-sm max-w-none break-words prose-p:leading-relaxed prose-p:mb-3 prose-ul:my-3 prose-li:mb-1 prose-li:marker:text-purple-500
                                            prose-blockquote:border-l-2 prose-blockquote:border-purple-500 prose-blockquote:pl-3 prose-blockquote:text-gray-500 dark:text-gray-400 prose-blockquote:italic
                                            prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:bg-black/40 prose-pre:backdrop-blur-md prose-pre:p-3 prose-pre:rounded-md prose-pre:border prose-pre:border-white/10
                                            prose-table:w-full prose-table:text-left prose-table:auto
                                            prose-thead:border-b-2 prose-thead:border-purple-500/30
                                            prose-th:px-2 prose-th:py-3 prose-th:text-gray-300 prose-th:font-semibold prose-th:whitespace-nowrap
                                            prose-tr:border-b prose-tr:border-dark-700/50 hover:prose-tr:bg-white/5 transition-colors
                                            prose-td:px-2 prose-td:py-3 prose-td:align-top prose-td:break-words">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content.replace(
                                  /\{"action":\s*"[^"]*",?\s*"target":\s*"[^"]*"\}/g,
                                  "> *(Executing UI Action...)*",
                                )}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex items-center space-x-2 text-xs text-purple-400/70 font-medium">
                      <Sparkles size={12} className="animate-spin-slow" />
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  )}
                  <div ref={aiChatEndRef} />
                </div>

                <div className="p-3 bg-transparent border-t border-white/5 relative z-10 backdrop-blur-md">
                  <form
                    onSubmit={handleAiSubmit}
                    className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all shadow-inner"
                  >
                    <input
                      ref={aiInputRef}
                      type="text"
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Ask CodeCanvas AI..."
                      className="w-full bg-transparent text-sm py-3 pl-4 pr-12 focus:outline-none text-gray-200 placeholder-gray-500"
                      disabled={aiLoading}
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiMessage.trim()}
                      className="absolute right-2 p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-purple-400 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS CONTAINER */}
          <div className="flex flex-row-reverse items-center gap-4 pointer-events-auto h-14">
            {/* Team Chat Button */}
            {selectedRepo && (
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  setUnreadChatCount(0);
                }}
                className={`flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full cursor-pointer transition-all duration-500 group animate-team-pulse hover:animate-none ${!isChatOpen ? "w-14 h-14 scale-100 opacity-100 delay-200" : "w-0 h-0 scale-0 opacity-0 pointer-events-none overflow-hidden"}`}
              >
                <MessageSquare
                  size={24}
                  className="text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 flex-shrink-0"
                />
                {unreadChatCount > 0 && !isChatOpen && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-dark-900 shadow-sm animate-bounce">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            )}

            {/* AI Chat Button */}
            <button
              onClick={() => setIsAiChatOpen(true)}
              className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer transition-all duration-500 group animate-ai-pulse hover:animate-none ${!isAiChatOpen ? "w-14 h-14 scale-100 opacity-100 delay-200" : "w-0 h-0 scale-0 opacity-0 pointer-events-none overflow-hidden"}`}
            >
              <Sparkles
                size={24}
                className="text-white transition-all duration-500 group-hover:rotate-180 group-hover:scale-110 flex-shrink-0"
              />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
