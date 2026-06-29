import React from "react";
import { X } from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  setMode,
  form,
  setForm,
  onSubmit,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 relative backdrop-blur-xl transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-800/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-300 rounded-lg p-3 text-xs font-semibold">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-username" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Username
              </label>
              <input
                type="text"
                id="modal-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
                placeholder="student123"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              id="modal-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
              placeholder="student@college.edu"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              type="password"
              id="modal-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow-lg shadow-sky-500/15 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center mt-6 text-xs text-slate-400">
          {mode === "login" ? (
            <p>
              New here?{" "}
              <button
                onClick={() => {
                  setMode("register");
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold underline ml-1 cursor-pointer"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                onClick={() => {
                  setMode("login");
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold underline ml-1 cursor-pointer"
              >
                Log in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
