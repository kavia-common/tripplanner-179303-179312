import React from 'react';

/**
 * @typedef Activity
 * @property {string|number} id
 * @property {string} title
 * @property {string} [time]   - e.g., "09:00"
 * @property {string} [location]
 * @property {string} [note]
 * @property {string} [emoji]  - visual hint like "🏛️"
 */

/**
 * PUBLIC_INTERFACE
 * ActivityCard
 * A compact, clickable card representing an itinerary activity.
 * Props:
 * - activity: Activity
 * - onClick?: function
 */
function ActivityCard({ activity, onClick }) {
  const { title, time, location, note, emoji } = activity || {};
  return (
    <article className="wp-activity-card" role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}>
      <div className="wp-activity-left">
        <div className="wp-activity-icon" aria-hidden="true">
          {emoji || '📍'}
        </div>
      </div>
      <div className="wp-activity-main">
        <div className="wp-activity-top">
          {time && <span className="wp-activity-time">{time}</span>}
          <h4 className="wp-activity-title">{title || 'Untitled Activity'}</h4>
        </div>
        {(location || note) && (
          <div className="wp-activity-meta">
            {location && <span className="wp-activity-location">{location}</span>}
            {note && <span className="wp-activity-note">{note}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

export default ActivityCard;
