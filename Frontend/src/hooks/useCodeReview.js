import { useEffect, useState } from "react";
import axios from "axios";
import prism from "prismjs";
import { CODE_TEMPLATES } from "../constants/templates";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function useCodeReview() {
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

  return {
    code,
    setCode,
    review,
    isLoading,
    error,
    language,
    preset,
    setPreset,
    activeTab,
    setActiveTab,
    history,
    selectedHistoryId,
    toasts,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    isSidebarOpen,
    setIsSidebarOpen,
    handleLanguageChange,
    reviewCode,
    loadHistoryItem,
    startNewReview,
    deleteHistoryItem,
    renameHistoryItem,
    clearAllHistory,
    handleAuthSubmit,
    handleLogout,
    copyReviewToClipboard,
    extractAndCopyImprovedCode,
    downloadReview,
    highlightCode,
    currentImprovedCode,
  };
}
