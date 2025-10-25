import React, { useState, useEffect } from 'react';
import './App.css';
import './theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import Board from './components/Board/Board';
import useTripPlan from './hooks/useTripPlan';
import { STORAGE_KEYS, getFlag, setFlag, loadFromStorage, saveToStorage, makeVersionedPayload } from './utils/storage';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace with Board).
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Hook for trip plan state/actions
  const {
    state: { days },
    actions: { addDay },
  } = useTripPlan();

  // Apply theme to the html element (data-theme used by CSS variables)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  return (
    <div className="app-root">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <section className="board-surface">
            <div className="board-header">
              <h2 className="board-title">WanderPlan Board</h2>
              <p className="board-subtitle">
                {days.length === 0
                  ? 'No days yet — use “+ Add Day” to get started.'
                  : 'Plan your trip by organizing activities by day.'}
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
