import React from "react";
import { Sparkles, Plus, History, Trash2, User, LogIn, LogOut, Pencil, X } from "lucide-react";

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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-0 w-[290px] bg-[#0c101d] border-r border-slate-900/80 flex flex-col flex-shrink-0 h-full select-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-950/40 border border-sky-500/20 shadow-md shadow-sky-500/5">
              <Sparkles size={20} className="text-sky-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-wide bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                CodeRev.AI
              </h3>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                AI Code Auditor
              </span>
            </div>
          </div>
          {/* Close Sidebar Button for Mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/40"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Button: New Review */}
        <div className="px-4 pt-4">
          <button
            onClick={() => {
              onNewReview();
              onClose(); // Close mobile drawer when action clicked
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer"
          >
            <Plus size={14} className="text-slate-400" />
            <span>New Review</span>
          </button>
        </div>

        {/* History Snapshots List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <h4 className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <History size={12} className="text-slate-500" />
              <span>Recent Reviews</span>
            </h4>
            {currentUser && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 uppercase tracking-wide">
                Cloud
              </span>
            )}
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No recent reviews.</p>
            ) : (
              history.map((item) => {
                const id = item._id || item.id;
                const isActive = selectedHistoryId === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      onLoadItem(item);
                      onClose(); // Close mobile drawer when loaded
                    }}
                    className={`group relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? "bg-sky-950/10 border-sky-500/40 shadow-sm shadow-sky-500/5"
                        : "bg-slate-900/10 border-slate-900/50 hover:bg-slate-900/30 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-bold bg-slate-800/80 border border-slate-700/30 px-1.5 py-0.5 rounded text-slate-300 uppercase tracking-wide">
                        {item.language}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 mr-1">{item.timestamp}</span>
                        <button
                          onClick={(e) => onRenameItem(e, item)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-sky-950/40 hover:text-sky-400 text-slate-500 p-1 rounded transition-all cursor-pointer"
                          title="Rename review"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={(e) => onDeleteItem(e, id)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-rose-950/40 hover:text-rose-400 text-slate-500 p-1 rounded transition-all cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-300 truncate pr-4">
                      {item.title}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions & Signatures */}
        <div className="p-4 border-t border-slate-900/60 flex flex-col gap-3 bg-slate-950/20">
          {history.length > 0 && !currentUser && (
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-1.5 bg-transparent border border-red-950/30 hover:border-red-900/40 text-red-400 hover:bg-red-950/10 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear Local History</span>
            </button>
          )}

          {/* User Authentication Row */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-lg p-2.5">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <User size={14} className="text-sky-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {currentUser.username}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Log Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginPrompt();
                  onClose(); // Close mobile drawer
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer"
              >
                <LogIn size={13} />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
