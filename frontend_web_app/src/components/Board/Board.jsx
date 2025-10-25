import React from 'react';
import './Board.css';
import DayColumn from './DayColumn';

/**
 * PUBLIC_INTERFACE
 * Board
 * Displays a responsive, scrollable set of DayColumn components representing each day of an itinerary.
 * Props:
 * - days: Array<{ id: string|number, title: string, date?: string, activities: Activity[] }>
 * - onAddActivity?: function(dayId)
 * - onSelectActivity?: function(activity)
 * This component currently renders static layout scaffolding (no drag-and-drop).
 */
function Board({ days = [], onAddActivity, onSelectActivity }) {
  return (
    <div className="wp-board">
      {days.map((day) => (
        <DayColumn
          key={day.id}
          dayId={day.id}
          title={day.title}
          date={day.date}
          activities={day.activities}
          onAddActivity={onAddActivity}
          onSelectActivity={onSelectActivity}
        />
      ))}
      <div className="wp-day-column wp-day-column--add">
        <button
          className="wp-add-day-btn"
          onClick={() => {
            // noop placeholder; parent should handle in future steps
            if (typeof onAddActivity === 'function') onAddActivity(null);
          }}
          type="button"
        >
          + Add Day
        </button>
      </div>
    </div>
  );
}

export default Board;
