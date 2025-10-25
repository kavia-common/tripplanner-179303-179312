import React, { useCallback } from 'react';
import './Board.css';
import DayColumn from './DayColumn';
import useTripPlan from '../../hooks/useTripPlan';

/**
 * PUBLIC_INTERFACE
 * Board
 * Displays a responsive, scrollable set of DayColumn components representing each day of an itinerary.
 * This version sources state from the useTripPlan hook and persists to localStorage.
 */
function Board() {
  const {
    state: { days },
    actions: { addDay },
  } = useTripPlan();

  const handleAddDay = useCallback(() => {
    addDay();
  }, [addDay]);

  return (
    <div className="wp-board">
      {days.map((day) => (
        <DayColumn
          key={day.id}
          dayId={day.id}
          title={day.title}
          date={day.date}
          activities={day.activities}
        />
      ))}
      <div className="wp-day-column wp-day-column--add">
        <button
          className="wp-add-day-btn"
          onClick={handleAddDay}
          type="button"
        >
          + Add Day
        </button>
      </div>
    </div>
  );
}

export default Board;
