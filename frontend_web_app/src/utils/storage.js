//
// Local storage utilities with schema versioning and safe serialization.
//
// PUBLIC_INTERFACE
export const STORAGE_KEYS = {
  TRIP_PLAN: 'wanderplan.trip.v1',
  ONBOARDING_SEEN: 'wanderplan.onboarding.seen.v1',
  SEEDED_SAMPLE: 'wanderplan.sample.seeded.v1',
};

export const CURRENT_SCHEMA_VERSION = 1;

// PUBLIC_INTERFACE
export function safeParse(json, fallback = null) {
  /** Safely parse JSON; return fallback if invalid. */
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export function safeStringify(value) {
  /** Safely stringify to JSON; falls back to empty object string if fails. */
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

// PUBLIC_INTERFACE
export function loadFromStorage(key) {
  /** Load a value from localStorage by key, returning null if not found or invalid. */
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return safeParse(raw, null);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function saveToStorage(key, value) {
  /** Save a value to localStorage by key; no-op on errors. */
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, safeStringify(value));
  } catch {
    // ignore quota or security errors
  }
}

// PUBLIC_INTERFACE
export function makeVersionedPayload(data) {
  /**
   * Wrap a payload with version metadata.
   * data: object to persist
   */
  return {
    version: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
}

// PUBLIC_INTERFACE
export function readVersionedPayload(payload) {
  /**
   * Validate and read a versioned payload. If version mismatch or invalid,
   * return { valid: false, version: null, data: null }.
   */
  if (!payload || typeof payload !== 'object') {
    return { valid: false, version: null, data: null };
  }
  const version = payload.version ?? null;
  if (version !== CURRENT_SCHEMA_VERSION || !('data' in payload)) {
    return { valid: false, version, data: null };
  }
  return { valid: true, version, data: payload.data ?? null };
}

// PUBLIC_INTERFACE
export function getFlag(key) {
  /** Get a boolean flag (stored as '1') from localStorage. */
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  return raw === '1';
}

// PUBLIC_INTERFACE
export function setFlag(key, value = true) {
  /** Set a boolean flag in localStorage. */
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // ignore
  }
}
