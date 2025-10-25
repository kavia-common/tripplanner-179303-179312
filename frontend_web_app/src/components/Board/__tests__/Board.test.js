import { render, screen, fireEvent } from '@testing-library/react';
import Board from '../Board';
import '../../../setupTests';

// Utility to clear/preset storage
function resetStorage() {
  window.localStorage.clear();
}

function seedTrip(daysCount = 2) {
  const days = Array.from({ length: daysCount }).map((_, i) => ({
    id: `day-${i + 1}`,
    title: `Day ${i + 1}`,
    date: '',
    activities: i === 0 ? [{ id: 'a-1', title: 'Test Activity', time: '09:00', location: 'Somewhere', note: '', emoji: '📍' }] : [],
  }));
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    data: {
      tripMeta: { id: 'trip-1', name: 'My Trip', startDate: '', endDate: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      days,
      unassignedActivities: [],
    },
  };
  window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(payload));
}

describe('Board smoke', () => {
  beforeEach(() => {
    resetStorage();
    seedTrip(2);
  });

  test('renders day columns and activities', () => {
    render(<Board />);
    // Expect two day columns visible by titles
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();

    // Activity card from day 1 visible
    expect(screen.getByText(/Test Activity/i)).toBeInTheDocument();
  });

  test('can add a new day using + Add Day', () => {
    render(<Board />);
    const addDayBtn = screen.getByRole('button', { name: /\+ Add Day/i });
    fireEvent.click(addDayBtn);

    // New "Day 3" should appear
    expect(screen.getByText('Day 3')).toBeInTheDocument();
  });
});
