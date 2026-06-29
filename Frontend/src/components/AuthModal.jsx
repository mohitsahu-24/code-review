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
    <div className="modal-overlay">
      <div className="modal-box glass-panel">
        <div className="modal-header">
          <h3>{mode === "login" ? "Welcome Back" : "Create Account"}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          {mode === "register" && (
            <div className="input-group">
              <label htmlFor="auth-username">Username</label>
              <input
                type="text"
                id="auth-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                placeholder="student123"
              />
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="student@college.edu"
            />
          </div>

          <div className="input-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "login" ? (
            <p>
              New here?{" "}
              <button onClick={() => { setMode("register"); }}>Create an account</button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button onClick={() => { setMode("login"); }}>Log in here</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
