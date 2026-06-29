import React from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { FileText, Sparkles, Copy, ShieldAlert, Code } from "lucide-react";
import prism from "prismjs";

const parseMetrics = (markdownText) => {
  if (!markdownText) return null;
  
  // Count crucial issues (look for bullet points or numbered lists under Crucial Issues)
  let issueCount = 0;
  const crucialIssuesIndex = markdownText.toLowerCase().indexOf("crucial issues");
  if (crucialIssuesIndex !== -1) {
    const sectionText = markdownText.slice(crucialIssuesIndex, crucialIssuesIndex + 1000);
    // count bullet points or numbered items
    const matches = sectionText.match(/^\s*[-*•\d+.]\s+.+/gm);
    issueCount = matches ? matches.length : 0;
  } else {
    // Fallback search for general bullet count
    const matches = markdownText.match(/^\s*[-*•]\s+.+/gm);
    issueCount = matches ? Math.min(matches.length, 4) : 0;
  }
  
  // Calculate score
  let score = 100 - (issueCount * 12);
  if (score < 30) score = 30;
  
  // Determine Grade
  let grade = "A+";
  let gradeColor = "#10b981"; // success green
  if (score < 90 && score >= 80) { grade = "A"; gradeColor = "#10b981"; }
  else if (score < 80 && score >= 70) { grade = "B"; gradeColor = "#38bdf8"; }
  else if (score < 70 && score >= 50) { grade = "C"; gradeColor = "#f59e0b"; }
  else if (score < 50) { grade = "D"; gradeColor = "#ef4444"; }
  
  return {
    issueCount,
    score,
    grade,
    gradeColor,
    timeSaved: issueCount * 5 + 5
  };
};

export default function ReviewOutputPanel({
  activeTab,
  setActiveTab,
  currentImprovedCode,
  extractAndCopyImprovedCode,
  isLoading,
  error,
  review,
  language,
  preset,
}) {
  const metrics = parseMetrics(review);

  return (
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
                {metrics && (
                  <div className="metrics-dashboard">
                    <div className="metric-card">
                      <span className="metric-label">Quality Score</span>
                      <span className="metric-value" style={{ color: metrics.gradeColor }}>{metrics.grade} ({metrics.score}%)</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Crucial Issues</span>
                      <span className="metric-value" style={{ color: metrics.issueCount > 0 ? '#ef4444' : '#10b981' }}>{metrics.issueCount} Found</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Review Focus</span>
                      <span className="metric-value" style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{preset}</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Est. Time Saved</span>
                      <span className="metric-value" style={{ color: '#10b981' }}>~{metrics.timeSaved} mins</span>
                    </div>
                  </div>
                )}
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            ) : (
              <div className="improved-code-view">
                <div className="improved-header-meta">
                  <span>Optimized Rewrite ({language})</span>
                </div>
                <pre className="improved-pre">
                  <code 
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let grammar = prism.languages[language];
                        if (!grammar) {
                          grammar = prism.languages.javascript;
                        }
                        return prism.highlight(currentImprovedCode || "", grammar, language);
                      })()
                    }}
                  />
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
