import React from 'react';
import '../Sidebar/Sidebar.css';
import ActivityPool from '../Sidebar/ActivityPool';

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Left-side column that hosts the Activity Pool and potential trip controls.
 */
function Sidebar() {
  return (
    <aside className="app-sidebar">
      <section className="sidebar-card">
        <ActivityPool />
      </section>

      {/* Placeholder for future Trip Controls card */}
      <section className="sidebar-card" aria-label="Trip Controls">
        <div style={{ padding: '14px' }}>
          <h3 className="sidebar-title">Trip Controls</h3>
          <p className="sidebar-subtitle">Additional options coming soon.</p>
          <div style={{ height: 8 }} />
          <div className="controls">
            <button className="btn btn-outline" type="button">New Trip</button>
            <button className="btn btn-outline" type="button">Add Day</button>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
