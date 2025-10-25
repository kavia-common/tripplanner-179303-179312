import React, { useEffect, useState } from 'react';
import './Auth.css';
import { getSession, signup } from '../../utils/authStorage';
import { navigate, ROUTES } from '../../utils/router';

// PUBLIC_INTERFACE
export default function Signup() {
  /** Signup page for creating an account. Passwords are hashed client-side. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    // redirect if already logged in
    const s = getSession();
    if (s) navigate(ROUTES.APP);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (password !== confirm) {
      setErr('Passwords do not match');
      return;
    }
    try {
      await signup(email, password);
      navigate(ROUTES.APP);
    } catch (ex) {
      setErr(ex?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-inline">
            <div className="mark" aria-hidden="true">✈️</div>
            <div>
              <div className="name">WanderPlan</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Plan brilliantly</div>
            </div>
          </div>
          <button
            className="link"
            onClick={() => navigate(ROUTES.LOGIN)}
            type="button"
            aria-label="Go to login"
          >
            Sign in
          </button>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start planning trips in seconds</p>

        {err && <div className="auth-error" role="alert">{err}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className="auth-input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <div className="field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              className="auth-input"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <div className="auth-actions">
            <span />
            <button type="submit" className="btn btn-primary">Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
