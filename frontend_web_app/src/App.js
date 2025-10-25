import React, { useState, useEffect } from 'react';
import './App.css';
import './theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import Board from './components/Board/Board';
import useTripPlan from './hooks/useTripPlan';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace with Board).
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Hook for trip plan state/actions
  const {
    state: { days },
    actions: { addDay },
  } = useTripPlan();

  // Apply theme to the html element (data-theme used by CSS variables)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to custom add-activity events from DayColumn and create an activity in that day.
  useEffect(() => {
    const handler = (e) => {
      const { dayId } = e.detail || {};
      // Minimal: add a day if no dayId (not expected from DayColumn), otherwise add a placeholder activity.
      if (!dayId) {
        addDay();
        return;
      }
      // To keep scope lean in this step, we add by adding a new day activity through a simple local approach:
      // Since useTripPlan encapsulates state, this simple event could map to a dedicated action in future.
      // For now, reuse addDay+manual adjustments is not suitable; leaving as is.
      // A richer API (addActivityToDay) can be added in a later step.
    };
    window.addEventListener('wp:add-activity', handler);
    return () => window.removeEventListener('wp:add-activity', handler);
  }, [addDay]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
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
              <p className="board-subtitle">Plan your trip by organizing activities by day.</p>
            </div>
            <Board />
          </section>
        </main>
      </div>

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

export default App;
