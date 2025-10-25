//
//
// Tiny hash-based router utility for WanderPlan.
// Handles route changes via location.hash and notifies listeners.
//
// PUBLIC_INTERFACE
export const ROUTES = {
  LOGIN: '#/login',
  SIGNUP: '#/signup',
  APP: '#/app',
  DESTINATIONS: '#/destinations',
  BOOKING: '#/booking',
  BUDGET: '#/budget', // budget plans section (aliased to Booking page with anchor scroll)
};

 // PUBLIC_INTERFACE
export function getCurrentRoute() {
  /**
   * Returns the current route (hash) or default APP route if none set.
   * Note: App.js implements guards to reroute unauthenticated users to LOGIN
   * and booking/budget access requires a selectedDestination.
   */
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  return h || ROUTES.APP;
}

// PUBLIC_INTERFACE
export function navigate(to) {
  /** Navigate to a new hash route without reloading. */
  if (typeof window === 'undefined') return;
  if (window.location.hash === to) {
    // force notify when navigating to same route
    const ev = new HashChangeEvent('hashchange');
    window.dispatchEvent(ev);
  } else {
    window.location.hash = to;
  }
}

// PUBLIC_INTERFACE
export function onRouteChange(callback) {
  /**
   * Subscribe to hashchange events.
   * Returns an unsubscribe function.
   */
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getCurrentRoute());
  window.addEventListener('hashchange', handler);
  // initial fire
  setTimeout(handler, 0);
  return () => window.removeEventListener('hashchange', handler);
}
