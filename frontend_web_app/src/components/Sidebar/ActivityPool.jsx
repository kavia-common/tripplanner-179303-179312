import React, { useMemo, useState } from 'react';
import useTripPlan from '../../hooks/useTripPlan';
import ActivityForm from './ActivityForm';
import ActivityCard from '../Board/ActivityCard';
import { useDropZone } from '../../dnd/useDragDrop';

/**
 * PUBLIC_INTERFACE
 * ActivityPool
 * Renders the unassigned activities pool with create and inline edit/delete.
 * Integrates with useTripPlan actions:
 * - addActivityToPool
 * - updateActivity
 * - delete from pool (handled by updating the unassigned list via a specific action pattern)
 * Also acts as a drop zone to move activities back from days to the pool.
 */
function ActivityPool() {
  const {
    state: { unassignedActivities },
    actions: { addActivityToPool, updateActivity, moveActivity },
  } = useTripPlan();

  // Track the activity id currently being edited inline
  const [editingId, setEditingId] = useState(null);
  // Local simple search/filter
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return unassignedActivities;
    return unassignedActivities.filter((a) => {
      return (
        (a.title || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.note || '').toLowerCase().includes(q)
      );
    });
  }, [unassignedActivities, query]);

  const handleCreate = (payload) => {
    addActivityToPool(payload);
  };

  const handleSaveEdit = (activityId, payload) => {
    updateActivity(activityId, payload);
    setEditingId(null);
  };

  const handleDelete = (activityId) => {
    try {
      const raw = window.localStorage.getItem('wanderplan.trip.v1');
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload || !payload.data) return;
      const data = payload.data;
      const nextPool = (data.unassignedActivities || []).filter((a) => a.id !== activityId);
      data.unassignedActivities = nextPool;
      payload.data = data;
      payload.savedAt = new Date().toISOString();
      window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(payload));
      updateActivity('__noop__', {});
    } catch {
      // ignore
    }
  };

  // Drop zone: dropping here moves to the pool at the end
  const { dropZoneProps } = useDropZone({
    onDrop: (data) => {
      // if source is pool already, optionally reorder; for simplicity append to end
      let fromDayId = null;
      if (String(data.source).startsWith('day:')) {
        fromDayId = String(data.source).slice(4) || null;
      }
      const from = { dayId: fromDayId, index: Number(data.index) };
      const to = { dayId: null, index: unassignedActivities.length };
      moveActivity({ activityId: data.activityId, from, to });
    }
  });

  return (
    <div className="wp-activity-pool">
      <div className="wp-pool-header">
        <div>
          <h3 className="sidebar-title">Activity Pool</h3>
          <p className="sidebar-subtitle">Create activities and drag into your days.</p>
        </div>
        <div className="wp-pool-search">
          <input
            className="wp-input"
            type="text"
            placeholder="Search activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search activities"
          />
        </div>
      </div>

      <div className="wp-pool-form">
        <ActivityForm mode="create" onSubmit={handleCreate} />
      </div>

      <div className="wp-pool-list" role="list" {...dropZoneProps}>
        {filtered.length === 0 ? (
          <div className="wp-empty">
            <span className="wp-empty-icon" aria-hidden="true">📦</span>
            <span className="wp-empty-text">No activities in pool</span>
          </div>
        ) : (
          filtered.map((a, idx) => (
            <div key={a.id} className="wp-pool-item" role="listitem">
              {editingId === a.id ? (
                <ActivityForm
                  mode="edit"
                  initial={a}
                  onSubmit={(payload) => handleSaveEdit(a.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="wp-pool-item-row">
                  <div className="wp-pool-item-main" style={{ width: '100%' }}>
                    {/* Reuse ActivityCard for consistent visuals and built-in draggable */}
                    <ActivityCard
                      activity={a}
                      onClick={() => setEditingId(a.id)}
                      dndSource={{ type: 'pool', index: idx }}
                      onTouchMoveTo={() => {
                        // For a simple touch fallback, we don't move inside pool; this could open a "choose day" UI later.
                        // No-op for now.
                      }}
                    />
                  </div>
                  <div className="wp-pool-item-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setEditingId(a.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityPool;
