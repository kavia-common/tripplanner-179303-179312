import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ActivityForm
 * A small form used to create or edit an activity within the pool sidebar.
 * Props:
 * - mode: 'create' | 'edit'
 * - initial?: { title, time, location, note, emoji }
 * - onSubmit: (payload) => void
 * - onCancel?: () => void
 */
function ActivityForm({ mode = 'create', initial = {}, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial.title || '');
  const [time, setTime] = useState(initial.time || '');
  const [location, setLocation] = useState(initial.location || '');
  const [note, setNote] = useState(initial.note || '');
  const [emoji, setEmoji] = useState(initial.emoji || '📍');

  useEffect(() => {
    setTitle(initial.title || '');
    setTime(initial.time || '');
    setLocation(initial.location || '');
    setNote(initial.note || '');
    setEmoji(initial.emoji || '📍');
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim() || 'New Activity',
      time: time.trim(),
      location: location.trim(),
      note: note.trim(),
      emoji: emoji.trim() || '📍',
    };
    onSubmit?.(payload);
  };

  return (
    <form className="wp-activity-form" onSubmit={handleSubmit}>
      <div className="wp-form-row">
        <label className="wp-label">Title</label>
        <input
          className="wp-input"
          type="text"
          placeholder="e.g., Museum, Coffee, Trail"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="wp-form-grid">
        <div className="wp-form-row">
          <label className="wp-label">Time</label>
          <input
            className="wp-input"
            type="text"
            placeholder="09:00"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="wp-form-row">
          <label className="wp-label">Emoji</label>
          <input
            className="wp-input"
            type="text"
            maxLength={4}
            placeholder="📍"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          />
        </div>
      </div>

      <div className="wp-form-row">
        <label className="wp-label">Location</label>
        <input
          className="wp-input"
          type="text"
          placeholder="City, place, area"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="wp-form-row">
        <label className="wp-label">Note</label>
        <textarea
          className="wp-textarea"
          rows={2}
          placeholder="Add an optional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="wp-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-plain" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {mode === 'edit' ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  );
}

export default ActivityForm;
