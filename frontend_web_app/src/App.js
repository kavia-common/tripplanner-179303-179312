import React, { useState, useEffect } from 'react';
import './App.css';
import './theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingModal from './components/Onboarding/OnboardingModal';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace placeholder).
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Apply theme to the html element (data-theme used by CSS variables)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
            <div className="board-placeholder">
              <div className="placeholder-card">Day 1</div>
              <div className="placeholder-card">Day 2</div>
              <div className="placeholder-card">Day 3</div>
            </div>
          </section>
        </main>
      </div>

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

export default App;
