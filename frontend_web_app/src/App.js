import React, { useState, useEffect } from 'react';
import './App.css';
import './theme.css';
import './components/Header/Header.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import Board from './components/Board/Board';
import useTripPlan from './hooks/useTripPlan';
import { STORAGE_KEYS, getFlag, setFlag, loadFromStorage, saveToStorage, makeVersionedPayload } from './utils/storage';
import { onRouteChange, getCurrentRoute, ROUTES, navigate } from './utils/router';
import { isAuthenticated } from './utils/authStorage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Destinations from './components/Destinations/Destinations';
import Booking from './components/Booking/Booking';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace with Board).
   * Includes auth gating and hash-based routing with simple flow guards.
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [route, setRoute] = useState(getCurrentRoute());
  const authed = isAuthenticated();

  // Hook for trip plan state/actions
  const {
    state: { days, tripMeta },
    actions: { addDay },
  } = useTripPlan();

  // Apply theme to the html element (data-theme used by CSS variables)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Subscribe to route changes
  useEffect(() => {
    const unsub = onRouteChange((r) => setRoute(r));
    return () => unsub && unsub();
  }, []);

  // Route guards & redirects
  useEffect(() => {
    // Unauthed: only allow auth routes
    if (!authed) {
      if (route !== ROUTES.LOGIN && route !== ROUTES.SIGNUP) {
        navigate(ROUTES.LOGIN);
      }
      return;
    }

    // After login/signup, go to app
    if (authed && (route === ROUTES.LOGIN || route === ROUTES.SIGNUP || route === '')) {
      navigate(ROUTES.APP);
      return;
    }

    // Authed: prevent direct access to Booking/Budget without a destination
    const hasDestination = !!tripMeta?.selectedDestination;
    if ((route === ROUTES.BOOKING || route === ROUTES.BUDGET) && !hasDestination) {
      navigate(ROUTES.DESTINATIONS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, route, tripMeta?.selectedDestination]);

  // On first load, determine onboarding visibility and seed sample content if empty
  useEffect(() => {
    const seen = getFlag(STORAGE_KEYS.ONBOARDING_SEEN);
    setShowOnboarding(!seen);

    // Seed sample trip if no existing trip data and not already seeded
    const seeded = getFlag(STORAGE_KEYS.SEEDED_SAMPLE);
    const existing = loadFromStorage(STORAGE_KEYS.TRIP_PLAN);
    if (!existing && !seeded) {
      const sample = {
        tripMeta: {
          id: 'sample-trip',
          name: 'Barcelona Weekend',
          startDate: '',
          endDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        days: [
          {
            id: 'day-1',
            title: 'Day 1',
            date: 'Fri',
            activities: [
              { id: 'a-1', title: 'Sagrada Família', time: '09:30', location: 'Eixample', note: 'Prebook tickets', emoji: '⛪' },
              { id: 'a-2', title: 'Tapas Lunch', time: '12:30', location: 'Gothic Quarter', note: '', emoji: '🍤' },
            ],
          },
          {
            id: 'day-2',
            title: 'Day 2',
            date: 'Sat',
            activities: [
              { id: 'a-3', title: 'Park Güell', time: '10:00', location: 'Gràcia', note: 'Great views', emoji: '🌳' },
            ],
          },
        ],
        unassignedActivities: [
          { id: 'a-4', title: 'Beach Walk', time: '', location: 'Barceloneta', note: '', emoji: '🏖️' },
          { id: 'a-5', title: 'Coffee', time: '', location: 'Born', note: 'Try local roasters', emoji: '☕' },
        ],
      };
      try {
        saveToStorage(STORAGE_KEYS.TRIP_PLAN, makeVersionedPayload(sample));
        setFlag(STORAGE_KEYS.SEEDED_SAMPLE, true);
      } catch {
        // ignore
      }
    }
  }, []);

  // Listen to custom add-activity events from DayColumn and create an activity in that day.
  useEffect(() => {
    const handler = (e) => {
      const { dayId } = e.detail || {};
      if (!dayId) {
        addDay();
        return;
      }
      // Currently no direct action to add activity to a day in the hook; this will be expanded later.
    };
    window.addEventListener('wp:add-activity', handler);
    return () => window.removeEventListener('wp:add-activity', handler);
  }, [addDay]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCloseOnboarding = () => {
    setFlag(STORAGE_KEYS.ONBOARDING_SEEN, true);
    setShowOnboarding(false);
  };

  // Auth routes
  if (!authed && (route === ROUTES.LOGIN || route === ROUTES.SIGNUP || route === ROUTES.APP)) {
    return route === ROUTES.SIGNUP ? <Signup /> : <Login />;
  }

  // Destinations route
  if (route === ROUTES.DESTINATIONS) {
    return (
      <div className="app-root">
        <Header theme={theme} onToggleTheme={toggleTheme} authed={authed} />
        <div className="app-shell">
          {/* Sidebar hidden on destinations to maximize gallery space */}
          <div style={{ display: 'none' }} aria-hidden="true" />
          <main className="app-main">
            <section className="board-surface">
              <Destinations />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => navigate(ROUTES.APP)}
                  aria-label="Skip to Planner"
                >
                  Skip to Planner →
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // Booking and Budget routes render the Booking page (Budget anchored)
  if (route === ROUTES.BOOKING || route === ROUTES.BUDGET) {
    return (
      <div className="app-root">
        <Header theme={theme} onToggleTheme={toggleTheme} authed={authed} />
        <div className="app-shell">
          <Sidebar />
          <main className="app-main">
            <section className="board-surface">
              <div className="board-header">
                <h2 className="board-title">Booking</h2>
                <p className="board-subtitle">
                  {tripMeta?.selectedDestination
                    ? `Selected: ${tripMeta.selectedDestination.city}, ${tripMeta.selectedDestination.country} • ${tripMeta.selectedDestination.hotel}`
                    : 'No destination selected yet. Pick one to tailor your booking.'}
                </p>
              </div>
              <Booking scrollToBudget={route === ROUTES.BUDGET} />
            </section>
          </main>
        </div>
      </div>
    );
  }

  // Default: Planner (App) route
  return (
    <div className="app-root">
      <Header theme={theme} onToggleTheme={toggleTheme} authed={authed} />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <section className="board-surface">
            <div className="board-header">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <h2 className="board-title">WanderPlan Board</h2>
                  <p className="board-subtitle">
                    {days.length === 0
                      ? 'No days yet — use “+ Add Day” to get started.'
                      : (tripMeta?.startDate
                          ? `Itinerary: ${tripMeta.startDate}${tripMeta.endDate ? ` → ${tripMeta.endDate}` : ''} • ${days.length} ${days.length === 1 ? 'day' : 'days'}`
                          : `Plan your trip across ${days.length} ${days.length === 1 ? 'day' : 'days'}.`)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" type="button" onClick={() => navigate(ROUTES.DESTINATIONS)}>
                    Browse Destinations
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => navigate(ROUTES.BOOKING)}
                    aria-label="Go to Booking"
                    title="Open booking to set room/meals and budget"
                  >
                    Booking & Budget →
                  </button>
                </div>
              </div>
            </div>
            <Board />
          </section>
        </main>
      </div>

      <OnboardingModal open={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
}

export default App;
