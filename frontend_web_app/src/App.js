import React, { useState, useEffect } from 'react';
import './App.css';
import './theme.css';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import Board from './components/Board/Board';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component responsible for global theme management
   * and the layout shell (Header, Sidebar, Main workspace with Board).
   */
  const [theme, setTheme] = useState('light');
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Temporary mock data for the board until persistence is added
  const [days, setDays] = useState([
    {
      id: 'day-1',
      title: 'Day 1',
      date: 'Mon',
      activities: [
        { id: 'a-1', title: 'Old Town Walking Tour', time: '09:00', location: 'City Center', emoji: '🚶', note: 'Meet at fountain' },
        { id: 'a-2', title: 'Local Market Lunch', time: '12:30', location: 'Riverside Market', emoji: '🍜' },
      ],
    },
    {
      id: 'day-2',
      title: 'Day 2',
      date: 'Tue',
      activities: [
        { id: 'a-3', title: 'Museum of Art', time: '10:00', location: 'Museum District', emoji: '🏛️' },
        { id: 'a-4', title: 'Sunset Point', time: '18:45', location: 'Cliffside', emoji: '🌅', note: 'Bring jacket' },
      ],
    },
    {
      id: 'day-3',
      title: 'Day 3',
      date: 'Wed',
      activities: [],
    },
  ]);

  // Apply theme to the html element (data-theme used by CSS variables)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Placeholder handlers until interactions are added
  const handleAddActivity = (dayId) => {
    if (!dayId) {
      // For "+ Add Day" tile
      setDays(prev => ([
        ...prev,
        { id: `day-${prev.length + 1}`, title: `Day ${prev.length + 1}`, date: '', activities: [] }
      ]));
      return;
    }
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const newAct = {
        id: `a-${Math.random().toString(36).slice(2, 7)}`,
        title: 'New Activity',
        time: '',
        location: '',
        emoji: '📍'
      };
      return { ...d, activities: [...d.activities, newAct] };
    }));
  };

  const handleSelectActivity = (activity) => {
    // For now simply log; future step can open a details panel/edit modal
    // eslint-disable-next-line no-console
    console.log('Selected activity:', activity);
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
            <Board
              days={days}
              onAddActivity={handleAddActivity}
              onSelectActivity={handleSelectActivity}
            />
          </section>
        </main>
      </div>

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

export default App;
