import React from "react";
import { Play, Copy, Download, Menu } from "lucide-react";

export default function Navbar({
  language,
  onLanguageChange,
  preset,
  setPreset,
  isLoading,
  review,
  code,
  onReviewCode,
  onCopyReview,
  onDownloadReview,
  onToggleSidebar,
}) {
  return (
    <header className="workspace-header">
      <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          className="hamburger-btn"
          title="Toggle Sidebar"
          style={{ display: 'none' }} // Controlled via CSS media query
        >
          <Menu size={20} />
        </button>

        <div className="select-wrapper">
          <label htmlFor="language-select">Language</label>
          <select
            id="language-select"
            value={language}
            onChange={onLanguageChange}
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
            <button className="btn btn-secondary btn-icon" onClick={onCopyReview} title="Copy Review">
              <Copy size={14} /> <span>Copy Review</span>
            </button>
            <button className="btn btn-secondary btn-icon" onClick={onDownloadReview} title="Download Report">
              <Download size={14} /> <span>Download Report</span>
            </button>
          </>
        )}
        <button className="btn btn-primary" onClick={onReviewCode} disabled={isLoading || !code.trim()}>
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
  );
}
