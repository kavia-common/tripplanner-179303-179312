import React from 'react';
import { useDraggable, buildDragPayload } from '../../dnd/useDragDrop';

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
 * A compact, clickable and draggable card representing an itinerary activity.
 * Props:
 * - activity: Activity
 * - onClick?: function
 * - dndSource: { type: 'pool' | 'day', dayId?: string, index: number }
 * - onTouchMoveTo?: () => void  // Optional touch fallback action (e.g., open Move to… UI)
 */
function ActivityCard({ activity, onClick, dndSource, onTouchMoveTo }) {
  const { title, time, location, note, emoji } = activity || {};

  // Prepare drag payload
  const source = dndSource?.type === 'pool' ? 'pool' : `day:${dndSource?.dayId ?? ''}`;
  const payloadObj = {
    activityId: String(activity?.id ?? ''),
    source,
    index: Number(dndSource?.index ?? 0),
  };
  const { draggableProps } = useDraggable({
    payload: buildDragPayload(payloadObj),
    getPreviewText: () => `${title || 'Activity'} • Move`,
  });

  return (
    <article
      className="wp-activity-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
      {...draggableProps}
      aria-label={`${title || 'Activity'}${time ? ` at ${time}` : ''} — draggable`}
    >
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
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-plain"
            onClick={(e) => { e.stopPropagation(); onTouchMoveTo?.(); }}
            aria-label="Move to…"
          >
            Move to…
          </button>
        </div>
      </div>
    </article>
  );
}

export default ActivityCard;
