import React from 'react';
import ActivityCard from './ActivityCard';

/**
 * PUBLIC_INTERFACE
 * DayColumn
 * Renders a single day column with a header and a list of ActivityCard items.
 * Props:
 * - dayId: string|number
 * - title: string
 * - date?: string
 * - activities: Array<Activity>
 * - onAddActivity?: function(dayId)
 * - onSelectActivity?: function(activity)
 */
function DayColumn({ dayId, title, date, activities = [], onAddActivity, onSelectActivity }) {
  return (
    <section className="wp-day-column" aria-label={`${title}${date ? ` - ${date}` : ''}`}>
      <header className="wp-day-header">
        <div className="wp-day-title-wrap">
          <h3 className="wp-day-title">{title}</h3>
          {date && <span className="wp-day-date">{date}</span>}
        </div>
        <button
          className="wp-day-add"
          onClick={() => (typeof onAddActivity === 'function' ? onAddActivity(dayId) : null)}
          type="button"
          aria-label={`Add activity to ${title}`}
          title="Add activity"
        >
          +
        </button>
      </header>

      <div className="wp-activities">
        {activities.length === 0 ? (
          <div className="wp-empty">
            <span className="wp-empty-icon" aria-hidden="true">🗺️</span>
            <span className="wp-empty-text">No activities yet</span>
          </div>
        ) : (
          activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onClick={() => (typeof onSelectActivity === 'function' ? onSelectActivity(act) : null)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default DayColumn;
