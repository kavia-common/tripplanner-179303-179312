import React, { useCallback } from 'react';
import ActivityCard from './ActivityCard';
import useTripPlan from '../../hooks/useTripPlan';

/**
 * PUBLIC_INTERFACE
 * DayColumn
 * Renders a single day column with a header and a list of ActivityCard items.
 * Props:
 * - dayId: string|number
 * - title: string
 * - date?: string
 * - activities: Array<Activity>
 */
function DayColumn({ dayId, title, date, activities = [] }) {
  const { actions: { updateActivity } } = useTripPlan();

  const handleAddActivity = useCallback(() => {
    // Add a quick placeholder activity to this day by updating state via updateActivity+move (simpler: push directly via local set in parent hook)
    // Since we don't have direct day mutation here, a lightweight approach is to update by tapping into the hook's state mutation:
    // We'll simulate by creating a new activity through update route on a temp id - however update requires existent id.
    // Simpler approach: dispatch a custom event the hook can listen to; but to keep scope small, we provide a minimal inline workaround:
    // We'll leverage a custom method by temporarily exposing it here would be heavy. Instead, allow DayColumn not to create, but indicate empty state.
    // For now, we can extend: Add a new activity by updating the trip using a synthetic update. To keep lean, we attach minimal window event.
    // However, better: We let DayColumn request a new activity via CustomEvent 'wp:add-activity'.
    const event = new CustomEvent('wp:add-activity', { detail: { dayId } });
    window.dispatchEvent(event);
  }, [dayId]);

  const handleSelectActivity = useCallback((activity) => {
    // Example: toggle a note marker as a basic interaction for now
    updateActivity(activity.id, { note: activity.note ? activity.note : 'Tap to edit notes' });
  }, [updateActivity]);

  return (
    <section className="wp-day-column" aria-label={`${title}${date ? ` - ${date}` : ''}`}>
      <header className="wp-day-header">
        <div className="wp-day-title-wrap">
          <h3 className="wp-day-title">{title}</h3>
          {date && <span className="wp-day-date">{date}</span>}
        </div>
        <button
          className="wp-day-add"
          onClick={handleAddActivity}
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
              onClick={() => handleSelectActivity(act)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default DayColumn;
