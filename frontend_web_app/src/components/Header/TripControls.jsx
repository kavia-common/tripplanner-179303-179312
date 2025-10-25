import React, { useEffect, useMemo, useState } from 'react';
import './Header.css';
import useTripPlan from '../../hooks/useTripPlan';

// PUBLIC_INTERFACE
function TripControls() {
  /**
   * TripControls
   * Toolbar for trip metadata and day management.
   * Controls:
   * - Trip name (text)
   * - Start date (date)
   * - Length in days (number)
   * - Add Day / Remove Last Day (with date recalculation)
   */
  const {
    state: { tripMeta, days },
    actions: {
      renameTrip,
      setStartDate,
      setTripLength,
      addDay,
      removeDay
    },
  } = useTripPlan();

  // Local controlled inputs reflecting state
  const [name, setName] = useState(tripMeta?.name || 'My Trip');
  const [startDate, setStartDateLocal] = useState(tripMeta?.startDate || '');
  const [length, setLength] = useState(days?.length || 1);

  useEffect(() => setName(tripMeta?.name || 'My Trip'), [tripMeta?.name]);
  useEffect(() => setStartDateLocal(tripMeta?.startDate || ''), [tripMeta?.startDate]);
  useEffect(() => setLength(days?.length || 1), [days?.length]);

  const endDateDisplay = useMemo(() => tripMeta?.endDate || '', [tripMeta?.endDate]);

  // Debounced updates for name
  useEffect(() => {
    const t = setTimeout(() => renameTrip(name.trim() || 'My Trip'), 300);
    return () => clearTimeout(t);
  }, [name, renameTrip]);

  // Start date update
  const onStartDateChange = (val) => {
    setStartDateLocal(val);
    setStartDate(val || '');
  };

  // Length change ensures min 1
  const onLengthChange = (val) => {
    const n = Math.max(1, Number(val) || 1);
    setLength(n);
    setTripLength(n);
  };

  // Derived label for length pluralization
  const lengthLabel = length === 1 ? 'day' : 'days';

  const handleAddDay = () => addDay();
  const handleRemoveDay = () => {
    if (days.length === 0) return;
    const lastId = days[days.length - 1].id;
    removeDay(lastId);
  };

  return (
    <div className="app-subheader" role="region" aria-label="Trip Controls">
      <div className="app-subheader__inner">
        <div className="trip-controls">
          <div className="trip-field">
            <label htmlFor="trip-name">Trip</label>
            <input
              id="trip-name"
              className="trip-input"
              type="text"
              placeholder="Trip name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="trip-field">
            <label htmlFor="trip-start">Start</label>
            <input
              id="trip-start"
              className="trip-input"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          <div className="trip-field">
            <label htmlFor="trip-length">Length</label>
            <input
              id="trip-length"
              className="trip-input"
              type="number"
              min={1}
              value={length}
              onChange={(e) => onLengthChange(e.target.value)}
              style={{ width: 100 }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {lengthLabel}
            </span>
          </div>

          <div className="trip-field">
            <label>End</label>
            <input
              className="trip-input"
              type="text"
              value={endDateDisplay}
              readOnly
              aria-readonly="true"
              style={{ minWidth: 140 }}
            />
          </div>
        </div>

        <div className="trip-actions">
          <button type="button" className="btn btn-outline" onClick={handleAddDay}>
            + Add Day
          </button>
          <button type="button" className="btn btn-danger" onClick={handleRemoveDay}>
            Remove Last Day
          </button>
        </div>
      </div>
    </div>
  );
}

export default TripControls;
