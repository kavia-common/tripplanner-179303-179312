import React, { useCallback } from 'react';
import ActivityCard from './ActivityCard';
import useTripPlan from '../../hooks/useTripPlan';
import { useDropZone } from '../../dnd/useDragDrop';

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
  const { actions: { updateActivity, moveActivity, reorderActivities } } = useTripPlan();

  const handleAddActivity = useCallback(() => {
    const event = new CustomEvent('wp:add-activity', { detail: { dayId } });
    window.dispatchEvent(event);
  }, [dayId]);

  const handleSelectActivity = useCallback((activity) => {
    updateActivity(activity.id, { note: activity.note ? activity.note : 'Tap to edit notes' });
  }, [updateActivity]);

  // Accept drops into this day (append to end by default)
  const { dropZoneProps } = useDropZone({
    onDrop: (data) => {
      // data: { activityId, source, index }
      // Determine 'from'
      let fromDayId = null;
      if (String(data.source).startsWith('day:')) {
        fromDayId = String(data.source).slice(4) || null;
      }
      const from = { dayId: fromDayId, index: Number(data.index) };

      // default insert at end
      const to = { dayId: String(dayId), index: activities.length };
      moveActivity({ activityId: data.activityId, from, to });
    }
  });

  // Optional: handle reordering within same day by dropping over the list header area
  const handleMoveToTop = useCallback((activityId, fromIndex) => {
    // simple action to demonstrate accessible "Move to..." quick option
    const sameDay = true;
    if (sameDay) reorderActivities(dayId, fromIndex, 0);
  }, [dayId, reorderActivities]);

  return (
    <section
      className="wp-day-column"
      aria-label={`${title}${date ? ` - ${date}` : ''}`}
      data-dnd-over={dropZoneProps['data-dnd-over']}
    >
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

      <div className="wp-activities" {...dropZoneProps}>
        {activities.length === 0 ? (
          <div className="wp-empty">
            <span className="wp-empty-icon" aria-hidden="true">🗺️</span>
            <span className="wp-empty-text">Drag activities here from the pool</span>
          </div>
        ) : (
          activities.map((act, idx) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onClick={() => handleSelectActivity(act)}
              dndSource={{ type: 'day', dayId: String(dayId), index: idx }}
              onTouchMoveTo={() => handleMoveToTop(act.id, idx)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default DayColumn;
