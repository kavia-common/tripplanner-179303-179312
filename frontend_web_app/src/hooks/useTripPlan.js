import { useCallback, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, makeVersionedPayload, readVersionedPayload } from '../utils/storage';

// Initial default state if nothing in storage
const DEFAULT_TRIP = {
  tripMeta: {
    id: 'trip-1',
    name: 'My Trip',
    startDate: '',
    endDate: '',
    createdAt: null,
    updatedAt: null,
  },
  days: [
    { id: 'day-1', title: 'Day 1', date: 'Mon', activities: [] },
  ],
  unassignedActivities: [],
};

function createActivity(partial = {}) {
  const id = partial.id || `a-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    title: partial.title || 'New Activity',
    time: partial.time || '',
    location: partial.location || '',
    note: partial.note || '',
    emoji: partial.emoji || '📍',
  };
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * PUBLIC_INTERFACE
 * useTripPlan
 * React hook that exposes trip planning state and actions.
 * State:
 * - tripMeta: { id, name, startDate, endDate, createdAt, updatedAt }
 * - days: [{ id, title, date?, activities: Activity[] }]
 * - unassignedActivities: Activity[]
 *
 * Actions:
 * - addDay(title?: string, date?: string)
 * - removeDay(dayId: string)
 * - addActivityToPool(activityPartial)
 * - updateActivity(activityId, updates) // searches both pool and all days
 * - moveActivity({ activityId, from: { dayId|null, index }, to: { dayId|null, index } })
 * - reorderActivities(dayId, fromIndex, toIndex)
 * - renameTrip(name: string)
 */
export default function useTripPlan() {
  // Load state from localStorage once at mount
  const initial = useMemo(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.TRIP_PLAN);
    const { valid, data } = readVersionedPayload(loaded);
    if (valid && data) {
      return data;
    }
    const created = {
      ...DEFAULT_TRIP,
      tripMeta: {
        ...DEFAULT_TRIP.tripMeta,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    };
    return created;
  }, []);

  const [tripMeta, setTripMeta] = useState(initial.tripMeta);
  const [days, setDays] = useState(initial.days);
  const [unassignedActivities, setUnassignedActivities] = useState(initial.unassignedActivities);

  // Persist whenever state changes
  useEffect(() => {
    const payload = {
      tripMeta,
      days,
      unassignedActivities,
    };
    saveToStorage(STORAGE_KEYS.TRIP_PLAN, makeVersionedPayload(payload));
  }, [tripMeta, days, unassignedActivities]);

  const addDay = useCallback((title = '', date = '') => {
    setDays(prev => {
      const nextIndex = prev.length + 1;
      const newDay = {
        id: `day-${Math.random().toString(36).slice(2, 8)}`,
        title: title || `Day ${nextIndex}`,
        date,
        activities: [],
      };
      return [...prev, newDay];
    });
    setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
  }, []);

  const removeDay = useCallback((dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId));
    setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
  }, []);

  const addActivityToPool = useCallback((activityPartial = {}) => {
    setUnassignedActivities(prev => [...prev, createActivity(activityPartial)]);
    setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
  }, []);

  const updateActivity = useCallback((activityId, updates) => {
    let found = false;

    setUnassignedActivities(prev => {
      const next = prev.map(a => {
        if (a.id === activityId) {
          found = true;
          return { ...a, ...updates };
        }
        return a;
      });
      return next;
    });

    setDays(prev =>
      prev.map(day => {
        const acts = day.activities.map(a => {
          if (a.id === activityId) {
            found = true;
            return { ...a, ...updates };
          }
          return a;
        });
        return { ...day, activities: acts };
      })
    );

    if (found) {
      setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
    }
  }, []);

  const moveActivity = useCallback(({ activityId, from, to }) => {
    // from: { dayId: string|null, index: number }
    // to: { dayId: string|null, index: number }
    setDays(prevDays => {
      let workingDays = [...prevDays];
      let activity = null;

      // Remove from source
      if (from.dayId === null) {
        // from pool
        setUnassignedActivities(prevPool => {
          const nextPool = [...prevPool];
          activity = nextPool.splice(from.index, 1)[0];
          return nextPool;
        });
      } else {
        // from a day
        workingDays = workingDays.map(d => {
          if (d.id !== from.dayId) return d;
          const acts = [...d.activities];
          activity = acts.splice(from.index, 1)[0];
          return { ...d, activities: acts };
        });
      }

      if (!activity) return workingDays;

      // Insert into destination
      if (to.dayId === null) {
        setUnassignedActivities(prevPool => {
          const nextPool = [...prevPool];
          nextPool.splice(to.index, 0, activity);
          return nextPool;
        });
      } else {
        workingDays = workingDays.map(d => {
          if (d.id !== to.dayId) return d;
          const acts = [...d.activities];
          acts.splice(to.index, 0, activity);
          return { ...d, activities: acts };
        });
      }

      setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
      return workingDays;
    });
  }, []);

  const reorderActivities = useCallback((dayId, fromIndex, toIndex) => {
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const acts = [...d.activities];
      const [moved] = acts.splice(fromIndex, 1);
      acts.splice(toIndex, 0, moved);
      return { ...d, activities: acts };
    }));
    setTripMeta(prev => ({ ...prev, updatedAt: nowIso() }));
  }, []);

  const renameTrip = useCallback((name) => {
    setTripMeta(prev => ({ ...prev, name, updatedAt: nowIso() }));
  }, []);

  return {
    state: { tripMeta, days, unassignedActivities },
    actions: {
      addDay,
      removeDay,
      addActivityToPool,
      updateActivity,
      moveActivity,
      reorderActivities,
      renameTrip,
    },
  };
}
