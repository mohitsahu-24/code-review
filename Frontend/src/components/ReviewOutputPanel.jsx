import React from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { FileText, Sparkles, Copy, ShieldAlert, Code } from "lucide-react";

export default function ReviewOutputPanel({
  activeTab,
  setActiveTab,
  currentImprovedCode,
  extractAndCopyImprovedCode,
  isLoading,
  error,
  review,
  language,
}) {
  return (
    <section className="panel review-panel flex flex-col" aria-label="AI review">
      <div className="panel-header tabbed-header flex justify-between items-center">
        <div className="tabs flex gap-2">
          <button
            type="button"
            className={`tab-btn flex items-center gap-1.5 ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            <FileText size={14} /> 
            <span>AI Review</span>
          </button>
          <button
            type="button"
            className={`tab-btn flex items-center gap-1.5 ${activeTab === "improved" ? "active" : ""}`}
            onClick={() => setActiveTab("improved")}
            disabled={!currentImprovedCode}
          >
            <Sparkles size={14} /> 
            <span>Improved Code</span>
          </button>
        </div>
        {activeTab === "improved" && currentImprovedCode && (
          <button className="btn-copy-code flex items-center gap-1" onClick={extractAndCopyImprovedCode}>
            <Copy size={12} /> 
            <span>Copy Improved Code</span>
          </button>
        )}
      </div>

      <div className="review-content flex-1 overflow-y-auto">
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
            <h4 className="flex items-center gap-1.5"><ShieldAlert size={18} /> Review Failed</h4>
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
  );
}
