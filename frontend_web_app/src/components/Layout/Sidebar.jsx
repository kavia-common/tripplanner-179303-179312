import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Left-side column for the activity pool and trip controls placeholder.
 */
function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Activity Pool</h3>
        <p className="sidebar-subtitle">Drag activities into your trip days.</p>
        <div className="sidebar-placeholder">
          <div className="chip">🏛️ Museum</div>
          <div className="chip">🍜 Local Eats</div>
          <div className="chip">🌅 Sunset Point</div>
          <div className="chip">🚶 Walking Tour</div>
        </div>
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">Trip Controls</h3>
        <div className="controls">
          <button className="btn btn-primary">New Trip</button>
          <button className="btn btn-outline">Add Day</button>
        </div>
      </div>

      <style>{`
        .app-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sidebar-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          padding: 14px;
        }
        .sidebar-title {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: var(--color-text);
        }
        .sidebar-subtitle {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--color-text-muted);
        }
        .sidebar-placeholder {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--color-background);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          font-size: 12px;
        }
        .controls {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .btn {
          appearance: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
          box-shadow: var(--shadow-sm);
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .btn-primary {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }
        .btn-outline {
          background: var(--color-surface);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
