import React from "react";
import { Sparkles, Plus, History, Trash2, User, LogIn, LogOut, Pencil } from "lucide-react";

export default function Sidebar({
  history,
  selectedHistoryId,
  currentUser,
  onNewReview,
  onLoadItem,
  onDeleteItem,
  onRenameItem,
  onClearHistory,
  onLoginPrompt,
  onLogout,
  isOpen,
  onClose,
}) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">
            <Sparkles size={24} color="#38bdf8" />
          </div>
          <div className="brand-name">
            <h3>CodeRev.AI</h3>
            <span>AI Code Auditor</span>
          </div>
        </div>

        <button className="btn btn-secondary new-btn" onClick={() => { onNewReview(); onClose(); }}>
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
              history.map((item) => {
                const id = item._id || item.id;
                return (
                  <div
                    key={id}
                    className={`history-item ${selectedHistoryId === id ? "active" : ""}`}
                    onClick={() => { onLoadItem(item); onClose(); }}
                  >
                    <div className="history-meta">
                      <span className="lang-tag">{item.language}</span>
                      <div className="history-meta-right">
                        <span className="time-tag">{item.timestamp}</span>
                        <button 
                           className="rename-history-btn" 
                           onClick={(e) => onRenameItem(e, item)}
                           title="Rename review"
                         >
                           <Pencil size={12} />
                         </button>
                        <button 
                           className="delete-history-btn" 
                           onClick={(e) => onDeleteItem(e, id)}
                           title="Delete review"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                    </div>
                    <div className="history-title">{item.title}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          {history.length > 0 && !currentUser && (
            <button className="clear-history-btn" onClick={onClearHistory}>
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
                <button className="logout-btn" onClick={onLogout} title="Log Out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary login-prompt-btn" onClick={() => { onLoginPrompt(); onClose(); }}>
                <LogIn size={14} /> Log In / Sign Up
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
