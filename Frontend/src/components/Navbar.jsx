import React from "react";
import { Play, Copy, Download, Loader2 } from "lucide-react";

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
}) {
  return (
    <header className="h-[72px] border-b border-slate-905/70 px-6 flex items-center justify-between bg-[#0e1322]/40 backdrop-blur-md flex-shrink-0 select-none">
      
      {/* Dropdown Filters */}
      <div className="flex gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="nav-lang" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Language
          </label>
          <select
            id="nav-lang"
            value={language}
            onChange={onLanguageChange}
            disabled={isLoading}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg py-1.5 px-3.5 text-xs font-semibold focus:border-sky-500/80 outline-none transition-all cursor-pointer min-w-[140px]"
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

        <div className="flex flex-col gap-1">
          <label htmlFor="nav-preset" className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Review Focus
          </label>
          <select
            id="nav-preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            disabled={isLoading}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg py-1.5 px-3.5 text-xs font-semibold focus:border-sky-500/80 outline-none transition-all cursor-pointer min-w-[170px]"
          >
            <option value="general">General Audit</option>
            <option value="security">Security Audit</option>
            <option value="performance">Performance Tuning</option>
            <option value="refactor">Clean Code Refactor</option>
          </select>
        </div>
      </div>

      {/* Main CTA & Utility Actions */}
      <div className="flex items-center gap-3">
        {review && (
          <div className="flex gap-2">
            <button
              onClick={onCopyReview}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Copy review markdown report"
            >
              <Copy size={13} />
              <span>Copy Review</span>
            </button>
            <button
              onClick={onDownloadReview}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Download review report as markdown"
            >
              <Download size={13} />
              <span>Download Report</span>
            </button>
          </div>
        )}

        <button
          onClick={onReviewCode}
          disabled={isLoading || !code.trim()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 disabled:from-sky-950 disabled:to-indigo-950 text-slate-950 disabled:text-slate-600 font-bold py-2 px-5 rounded-lg text-xs shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <Play size={13} className="fill-slate-950 stroke-slate-950" />
              <span>Review Code</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
