import React from "react";
import useCodeReview from "./hooks/useCodeReview";

// Prism highlighting languages & themes
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

function App() {
  const {
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
  } = useCodeReview();

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
