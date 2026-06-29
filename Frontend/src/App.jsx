import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";

// Import Lucide Icons
import {
  Sparkles,
  Plus,
  History,
  User,
  LogIn,
  LogOut,
  Trash2,
  Copy,
  Download,
  Terminal,
  Check,
  AlertCircle,
  X,
  Play,
  FileText,
  Lock,
  Globe,
  Settings,
  HelpCircle,
  ShieldAlert,
  Code,
  Pencil
} from "lucide-react";

// Prism highlighting languages
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";

import "highlight.js/styles/github-dark.css";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CODE_TEMPLATES = {
  javascript: `function fetchUserData(userId) {
  // Synchronous XHR blocking UI thread & hardcoded URL
  var url = "http://api.example.com/users/" + userId;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false); 
  xhr.send();
  
  if (xhr.status == 200) {
    return JSON.parse(xhr.responseText);
  }
}`,
  typescript: `interface User {
  id: number;
  role: string;
}

function getAdminUser(users: User[]): User {
  // Potential runtime error if array is empty or search fails (returns undefined instead of User)
  return users.find(u => u.role === "admin");
}`,
  python: `def calculate_factorial(n):
    # Potential infinite recursion and no type validation
    if n == 0:
        return 1
    return n * calculate_factorial(n - 1)
`,
  go: `package main
import "fmt"

func main() {
    // Nil pointer dereference crash (undefined memory access)
    var p *int
    fmt.Println(*p)
}`,
  rust: `fn get_element(vector: Vec<i32>, index: usize) -> i32 {
    // rust panics if index is out of bounds
    vector[index]
}`,
  java: `public class DataStore {
    // Security risk: public static credentials
    public static final String API_KEY = "gsk_secret_auth_39281a82";
    
    public void processData(String query) {
        // Potential SQL injection risk
        String sql = "SELECT * FROM users WHERE name = '" + query + "'";
        System.out.println("Executing: " + sql);
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};
    // Out of bounds buffer read (undefined behavior)
    for(int i = 0; i <= 5; ++i) {
        cout << numbers[i] << " ";
    }
    return 0;
}`,
  sql: `-- Unsafe query vulnerable to SQL Injection
SELECT * FROM users 
WHERE username = '` + `admin` + `' AND password = '` + `12345` + `';`,
  html: `<!-- Unsecured and inaccessible HTML structure -->
<div class="header">
  <img src="banner.png"> <!-- Missing alt tag -->
  <button onclick="deleteAccount()">Delete Account</button>
  <a href="#" onclick="logout()">Log out</a> <!-- Bad navigation practice -->
</div>`,
  css: `/* Inefficient selectors and bad formatting standards */
div ul li div a span {
  color: red !important; /* Overuse of !important */
  font-size: 14px;
}`
};

function App() {
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [preset, setPreset] = useState("general");
  
  // UI Tabs & History states
  const [activeTab, setActiveTab] = useState("review"); // "review" | "improved"
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [reviewName, setReviewName] = useState("");

  // Load user details & local history on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("coderev_token");
    const savedUser = localStorage.getItem("coderev_user");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Auth state load failed", e);
      }
    } else {
      loadGuestHistory();
    }
  }, []);

  // Fetch reviews history from database when token is set/changed
  useEffect(() => {
    if (token) {
      fetchDBHistory();
    }
  }, [token]);

  const loadGuestHistory = () => {
    const saved = localStorage.getItem("coderev_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
      setHistory([]);
    }
  };

  const fetchDBHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (e) {
      console.error("DB history fetch failed", e);
      addToast("Failed to fetch cloud history", "error");
      loadGuestHistory();
    }
  };

  const addToast = (message, type = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Change default code on language selection
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (CODE_TEMPLATES[lang]) {
      setCode(CODE_TEMPLATES[lang]);
      setReview("");
      setSelectedHistoryId(null);
    }
  };

  // Trigger code review API
  async function reviewCode() {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setReview(""); // Clear previous review on load
    setActiveTab("review");

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/ai/get-review`,
        { code, language, preset, title: reviewName },
        { headers }
      );

      const reviewData = response.data;
      setReview(reviewData.review);
      addToast("Review generated successfully!", "success");

      if (token && reviewData.id) {
        // Logged-in: reload MongoDB history
        fetchDBHistory();
        setSelectedHistoryId(reviewData.id);
      } else {
        // Guest: save to local storage
        const newHistoryItem = {
          id: Date.now().toString(),
          title: code.trim().split("\n")[0].slice(0, 24) || "Untitled Snippet",
          code,
          review: reviewData.review,
          language,
          preset,
          timestamp: reviewData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const updated = [newHistoryItem, ...history.slice(0, 19)];
        setHistory(updated);
        localStorage.setItem("coderev_history", JSON.stringify(updated));
        setSelectedHistoryId(newHistoryItem.id);
      }
    } catch (err) {
      const errMsg = err.response?.data?.details || err.response?.data?.error || err.message || "Review failed";
      setError(errMsg);
      addToast("Failed to generate review", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Load a review from history
  const loadHistoryItem = (item) => {
    setCode(item.code);
    setReview(item.review);
    setLanguage(item.language);
    setPreset(item.preset);
    setSelectedHistoryId(item._id || item.id);
    setReviewName(item.title || "");
    setError("");
    setActiveTab("review");
    addToast("Loaded review snapshot", "info");
  };

  // Start a fresh review
  const startNewReview = () => {
    setCode(CODE_TEMPLATES[language] || "");
    setReview("");
    setReviewName("");
    setSelectedHistoryId(null);
    setError("");
    addToast("Reset workspace", "info");
  };

  // Delete a review snapshot
  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation(); // Avoid triggering card loading
    try {
      if (token) {
        await axios.delete(`${API_BASE_URL}/ai/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (selectedHistoryId === id) startNewReview();
        addToast("Review deleted from cloud");
      } else {
        const updated = history.filter((item) => item.id !== id);
        setHistory(updated);
        localStorage.setItem("coderev_history", JSON.stringify(updated));
        if (selectedHistoryId === id) startNewReview();
        addToast("Review deleted locally");
      }
    } catch (e) {
      console.error("Delete failed", e);
      addToast("Failed to delete item", "error");
    }
  };
  // Rename a review title
  const renameHistoryItem = async (e, item) => {
    e.stopPropagation();
    const id = item._id || item.id;
    const newTitle = prompt("Rename review:", item.title);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === item.title) return;
    const trimmed = newTitle.trim().slice(0, 60);
    if (token) {
      try {
        await axios.patch(`${API_BASE_URL}/ai/history/${id}`, { title: trimmed }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDBHistory();
        addToast("Review renamed", "success");
      } catch (err) {
        addToast("Failed to rename review", "error");
      }
    } else {
      const updated = history.map((h) => (h.id === id ? { ...h, title: trimmed } : h));
      setHistory(updated);
      localStorage.setItem("coderev_history", JSON.stringify(updated));
      addToast("Review renamed", "info");
    }
  };

  // Clear history
  const clearAllHistory = () => {
    if (token) {
      addToast("Cloud history deletion must be handled item-by-item", "info");
    } else {
      setHistory([]);
      localStorage.removeItem("coderev_history");
      setSelectedHistoryId(null);
      addToast("Local history cleared", "info");
    }
  };

  // Auth Forms Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const urlSuffix = authMode === "login" ? "login" : "register";
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/${urlSuffix}`, authForm);
      const data = response.data;
      
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem("coderev_token", data.token);
      localStorage.setItem("coderev_user", JSON.stringify(data.user));
      
      setIsAuthModalOpen(false);
      setAuthForm({ username: "", email: "", password: "" });
      addToast(`Welcome back, ${data.user.username}!`, "success");
    } catch (err) {
      setAuthError(err.response?.data?.error || "Authentication failed");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("coderev_token");
    localStorage.removeItem("coderev_user");
    loadGuestHistory();
    setSelectedHistoryId(null);
    startNewReview();
    addToast("Logged out successfully", "info");
  };

  // Copy full review markdown to clipboard
  const copyReviewToClipboard = () => {
    if (!review) return;
    navigator.clipboard.writeText(review);
    addToast("Copied review report!");
  };

  // Extract code from AI response markdown and copy it
  const extractAndCopyImprovedCode = () => {
    const codeBlock = extractImprovedCode(review);
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock);
      addToast("Copied optimized code snippet!");
    } else {
      addToast("No code block found to copy", "info");
    }
  };

  // Helper to isolate improved code block from markdown
  const extractImprovedCode = (markdownText) => {
    if (!markdownText) return "";
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let matches;
    while ((matches = codeBlockRegex.exec(markdownText)) !== null) {
      blocks.push(matches[1]);
    }
    if (blocks.length === 0) return "";
    return blocks.reduce((a, b) => (a.length > b.length ? a : b), "");
  };

  // Download review markdown file
  const downloadReview = () => {
    if (!review) return;
    const element = document.createElement("a");
    const file = new Blob([review], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code-review-${language}-${preset}-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast("Downloaded review markdown report!");
  };

  // Highlighting function for simple editor
  const highlightCode = (value) => {
    let grammar = prism.languages.javascript;
    if (prism.languages[language]) {
      grammar = prism.languages[language];
    }
    return prism.highlight(value, grammar, language);
  };

  const currentImprovedCode = extractImprovedCode(review);

  return (
    <div className="app-container">
      {/* Toast Notification Area */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "success" && <Check size={16} />}
            {t.type === "error" && <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel">
            <div className="modal-header">
              <h3>{authMode === "login" ? "Welcome Back" : "Create Account"}</h3>
              <button className="close-btn" onClick={() => setIsAuthModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authError && <div className="auth-error">{authError}</div>}
              
              {authMode === "register" && (
                <div className="input-group">
                  <label htmlFor="auth-username">Username</label>
                  <input
                    type="text"
                    id="auth-username"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    required
                    placeholder="student123"
                  />
                </div>
              )}
              
              <div className="input-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  type="email"
                  id="auth-email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  placeholder="student@college.edu"
                />
              </div>

              <div className="input-group">
                <label htmlFor="auth-password">Password</label>
                <input
                  type="password"
                  id="auth-password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn">
                {authMode === "login" ? "Log In" : "Sign Up"}
              </button>
            </form>

            <div className="auth-toggle">
              {authMode === "login" ? (
                <p>
                  New here?{" "}
                  <button onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create an account</button>
                </p>
              ) : (
                <p>
                  Already registered?{" "}
                  <button onClick={() => { setAuthMode("login"); setAuthError(""); }}>Log in here</button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for History & Student Info */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Sparkles size={24} color="#38bdf8" />
          </div>
          <div className="brand-name">
            <h3>CodeRev.AI</h3>
            <span>AI Code Auditor</span>
          </div>
        </div>

        <button className="btn btn-secondary new-btn" onClick={startNewReview}>
          <Plus size={16} /> New Review
        </button>

        <div className="sidebar-section">
          <div className="section-title-row">
            <h4><History size={12} style={{ marginRight: '6px' }} /> Recent Reviews</h4>
            {currentUser && <span className="cloud-badge">Cloud</span>}
          </div>
          
          <div className="history-list">
            {history.length === 0 ? (
              <p className="empty-history">No recent reviews.</p>
            ) : (
              history.map((item) => (
                <div
                  key={item._id || item.id}
                  className={`history-item ${selectedHistoryId === (item._id || item.id) ? "active" : ""}`}
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="history-meta">
                    <span className="lang-tag">{item.language}</span>
                    <div className="history-meta-right">
                      <span className="time-tag">{item.timestamp}</span>
                      <button 
                         className="rename-history-btn" 
                         onClick={(e) => renameHistoryItem(e, item)}
                         title="Rename review"
                       >
                         <Pencil size={12} />
                       </button>
                    <button 
                         className="delete-history-btn" 
                         onClick={(e) => deleteHistoryItem(e, item._id || item.id)}
                         title="Delete review"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </div>
                  <div className="history-title">{item.title}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          {history.length > 0 && !currentUser && (
            <button className="clear-history-btn" onClick={clearAllHistory}>
              <Trash2 size={12} /> Clear Local History
            </button>
          )}

          {/* User Authentication Panel */}
          <div className="user-auth-panel">
            {currentUser ? (
              <div className="logged-user-info">
                <div className="user-details">
                  <User size={16} color="#38bdf8" />
                  <span className="username-txt">{currentUser.username}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Log Out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary login-prompt-btn" onClick={() => { setIsAuthModalOpen(true); setAuthMode("login"); setAuthError(""); }}>
                <LogIn size={14} /> Log In / Sign Up
              </button>
            )}
          </div>


        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        <header className="workspace-header">
          <div className="control-group">
            <div className="select-wrapper">
              <label htmlFor="language-select">Language</label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                disabled={isLoading}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>

            <div className="select-wrapper">
              <label htmlFor="preset-select">Review Focus</label>
              <select
                id="preset-select"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                disabled={isLoading}
              >
                <option value="general">📊 General Review</option>
                <option value="security">⚠️ Security Audit</option>
                <option value="performance">🚀 Performance Tuning</option>
                <option value="refactor">💡 Clean Code Refactor</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            {review && (
              <>
                <button className="btn btn-secondary btn-icon" onClick={copyReviewToClipboard} title="Copy Review">
                  <Copy size={14} /> Copy Review
                </button>
                <button className="btn btn-secondary btn-icon" onClick={downloadReview} title="Download Report">
                  <Download size={14} /> Download Report
                </button>
              </>
            )}
            <button className="btn btn-primary" onClick={reviewCode} disabled={isLoading || !code.trim()}>
              {isLoading ? (
                <>
                  <span className="spinner"></span> Reviewing...
                </>
              ) : (
                <>
                  <Play size={14} style={{ fill: '#0f172a' }} /> Review Code
                </>
              )}
            </button>
          </div>
        </header>

        {/* Panel Split Grid */}
        <div className="workspace-panels">
          {/* Code Input Panel */}
          <section className="panel editor-panel" aria-label="Code editor">
            <div className="panel-header">
              <div className="panel-title-with-icon">
                <Terminal size={16} color="#38bdf8" />
                <h3>Source Code</h3>
              </div>
              <span className="panel-subtitle">Write or paste your code snippet below</span>
            </div>
            <div className="code-shell">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={highlightCode}
                padding={20}
                textareaClassName="editor-textarea"
                preClassName="editor-preview"
              />
            </div>
          </section>

          {/* AI Review Output Panel */}
          <section className="panel review-panel" aria-label="AI review">
            <div className="panel-header tabbed-header">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
                  onClick={() => setActiveTab("review")}
                >
                  <FileText size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> AI Review
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "improved" ? "active" : ""}`}
                  onClick={() => setActiveTab("improved")}
                  disabled={!currentImprovedCode}
                >
                  <Sparkles size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Improved Code
                </button>
              </div>
              {activeTab === "improved" && currentImprovedCode && (
                <button className="btn-copy-code" onClick={extractAndCopyImprovedCode}>
                  <Copy size={12} style={{ marginRight: '4px' }} /> Copy Improved Code
                </button>
              )}
            </div>

            <div className="review-content">
              {isLoading && (
                <div className="skeleton-loader">
                  <div className="skeleton-bar title"></div>
                  <div className="skeleton-bar body-line"></div>
                  <div className="skeleton-bar body-line"></div>
                  <div className="skeleton-bar body-line half"></div>
                  <div className="skeleton-box"></div>
                  <div className="skeleton-bar body-line"></div>
                </div>
              )}

              {!isLoading && error && (
                <div className="error-message">
                  <h4><ShieldAlert size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Review Failed</h4>
                  <p>{error}</p>
                </div>
              )}

              {!isLoading && !error && !review && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Code size={48} color="#38bdf8" />
                  </div>
                  <h3>Waiting for input</h3>
                  <p>Select your language, write your code, and click <strong>Review Code</strong> above to run an AI-powered code audit.</p>
                </div>
              )}

              {!isLoading && !error && review && (
                <>
                  {activeTab === "review" ? (
                    <div className="markdown-body">
                      <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                    </div>
                  ) : (
                    <div className="improved-code-view">
                      <div className="improved-header-meta">
                        <span>Optimized Rewrite ({language})</span>
                      </div>
                      <pre className="improved-pre">
                        <code className={`language-${language}`}>
                          {currentImprovedCode}
                        </code>
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
