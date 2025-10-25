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

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace with Board).
   * Now includes simple auth gating and hash-based routing.
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [route, setRoute] = useState(getCurrentRoute());
  const authed = isAuthenticated();

  // Hook for trip plan state/actions (only used in APP view)
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

  // Redirect unauthenticated users away from app route
  useEffect(() => {
    if (!authed && route === ROUTES.APP) {
      navigate(ROUTES.LOGIN);
    }
    if (authed && (route === ROUTES.LOGIN || route === ROUTES.SIGNUP || route === '')) {
      navigate(ROUTES.APP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, route]);

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
        // soft reload state for current hook users on next mount; current session will still show default until interactions
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

  // Route rendering
  if (!authed && (route === ROUTES.LOGIN || route === ROUTES.SIGNUP || route === ROUTES.APP)) {
    return route === ROUTES.SIGNUP ? <Signup /> : <Login />;
  }

  // Default: Authenticated app view
  return (
    <div className="app-root">
      <Header theme={theme} onToggleTheme={toggleTheme} authed={authed} />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <section className="board-surface">
            <div className="board-header">
              <h2 className="board-title">WanderPlan Board</h2>
              <p className="board-subtitle">
                {days.length === 0
                  ? 'No days yet — use “+ Add Day” to get started.'
                  : (tripMeta?.startDate
                      ? `Itinerary: ${tripMeta.startDate}${tripMeta.endDate ? ` → ${tripMeta.endDate}` : ''} • ${days.length} ${days.length === 1 ? 'day' : 'days'}`
                      : `Plan your trip across ${days.length} ${days.length === 1 ? 'day' : 'days'}.`)}
              </p>
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
