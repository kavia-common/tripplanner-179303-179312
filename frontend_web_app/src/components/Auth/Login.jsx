import React, { useEffect, useState } from 'react';
import './Auth.css';
import { getSession, login } from '../../utils/authStorage';
import { navigate, ROUTES } from '../../utils/router';

// PUBLIC_INTERFACE
export default function Login() {
  /** Login page allowing existing users to sign in. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    // redirect if already logged in
    const s = getSession();
    if (s) navigate(ROUTES.APP);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      navigate(ROUTES.APP);
    } catch (ex) {
      setErr(ex?.message || 'Login failed');
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
            onClick={() => navigate(ROUTES.SIGNUP)}
            type="button"
            aria-label="Go to signup"
          >
            Create account
          </button>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to access your planner</p>

        {err && <div className="auth-error" role="alert">{err}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="auth-actions">
            <span />
            <button type="submit" className="btn btn-primary">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
