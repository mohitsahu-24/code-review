import { useEffect, useState } from "react";
import prism from "prismjs";
import axios from "axios";

// Import Lucide Icons (only what's needed now, or keep them for clean reference)
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

// Import modular components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import ToastContainer from "./components/ToastContainer";
import CodeEditorPanel from "./components/CodeEditorPanel";
import ReviewOutputPanel from "./components/ReviewOutputPanel";

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

  // Responsive UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="app-container relative flex h-screen w-screen overflow-hidden bg-[#090d16] text-[#f1f5f9]">
      {/* Toast Notification Area */}
      <ToastContainer toasts={toasts} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onSubmit={handleAuthSubmit}
        error={authError}
      />

      {/* Sidebar for History & Student Info */}
      <Sidebar
        history={history}
        selectedHistoryId={selectedHistoryId}
        currentUser={currentUser}
        onNewReview={startNewReview}
        onLoadItem={loadHistoryItem}
        onDeleteItem={deleteHistoryItem}
        onRenameItem={renameHistoryItem}
        onClearHistory={clearAllHistory}
        onLoginPrompt={() => {
          setIsAuthModalOpen(true);
          setAuthMode("login");
          setAuthError("");
        }}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <main className="main-workspace flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navigation / Header Bar */}
        <Navbar
          language={language}
          onLanguageChange={handleLanguageChange}
          preset={preset}
          setPreset={setPreset}
          isLoading={isLoading}
          review={review}
          code={code}
          onReviewCode={reviewCode}
          onCopyReview={copyReviewToClipboard}
          onDownloadReview={downloadReview}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Panel Split Grid */}
        <div className="workspace-panels flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto lg:overflow-hidden min-h-0">
          {/* Code Input Panel */}
          <CodeEditorPanel
            code={code}
            onChange={setCode}
            language={language}
            highlightCode={highlightCode}
          />

          {/* AI Review Output Panel */}
          <ReviewOutputPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentImprovedCode={currentImprovedCode}
            extractAndCopyImprovedCode={extractAndCopyImprovedCode}
            isLoading={isLoading}
            error={error}
            review={review}
            language={language}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
