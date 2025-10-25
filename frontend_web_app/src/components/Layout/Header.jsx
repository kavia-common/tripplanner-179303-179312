import React from 'react';
import TripControls from '../Header/TripControls';
import { getSession, logout } from '../../utils/authStorage';
import { navigate, ROUTES } from '../../utils/router';

/**
 * PUBLIC_INTERFACE
 * Header
 * A top navigation bar featuring the WanderPlan brand and the theme toggle control.
 * Renders TripControls as a secondary subheader when authenticated.
 */
function Header({ theme, onToggleTheme, authed }) {
  const session = getSession();

  const onLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">✈️</div>
            <div className="brand-text">
              <h1 className="brand-title">WanderPlan</h1>
              <span className="brand-subtitle">Plan brilliantly</span>
            </div>
          </div>

          <div className="header-actions">
            {authed && session?.email && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13, marginRight: 8 }}>
                {session.email}
              </span>
            )}
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            {authed && (
              <button
                className="btn btn-outline"
                style={{ marginLeft: 8 }}
                type="button"
                onClick={onLogout}
                aria-label="Log out"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        <style>{`
          .app-header {
            position: sticky;
            top: 0;
            z-index: 10;
            background: linear-gradient(0deg, var(--color-surface), var(--color-surface));
            border-bottom: 1px solid var(--color-border);
            box-shadow: var(--shadow-sm);
          }
          .app-header__inner {
            max-width: 1440px;
            margin: 0 auto;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-mark {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            background: var(--color-primary-weak);
            color: var(--color-primary);
            box-shadow: var(--shadow-sm);
          }
          .brand-title {
            margin: 0;
            font-size: 18px;
            color: var(--color-text);
          }
          .brand-subtitle {
            display: block;
            margin-top: 2px;
            font-size: 12px;
            color: var(--color-text-muted);
          }
          .header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        `}</style>
      </header>
      {authed && <TripControls />}
    </>
  );
}

export default Header;
