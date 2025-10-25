import { render, screen, fireEvent, within } from '@testing-library/react';
import ActivityPool from '../ActivityPool';

function resetStorage() {
  window.localStorage.clear();
}

function seedTrip(poolCount = 1) {
  const unassignedActivities = Array.from({ length: poolCount }).map((_, i) => ({
    id: `p-${i + 1}`,
    title: `Pooled ${i + 1}`,
    time: '',
    location: 'PoolVille',
    note: '',
    emoji: '🎯',
  }));
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    data: {
      tripMeta: { id: 'trip-1', name: 'My Trip', startDate: '', endDate: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      days: [{ id: 'day-1', title: 'Day 1', date: '', activities: [] }],
      unassignedActivities,
    },
  };
  window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(payload));
}

describe('ActivityPool smoke', () => {
  beforeEach(() => {
    resetStorage();
    seedTrip(1);
  });

  test('renders pool and existing pooled activity', () => {
    render(<ActivityPool />);
    expect(screen.getByText(/Activity Pool/i)).toBeInTheDocument();
    expect(screen.getByText(/Create activities and drag into your days/i)).toBeInTheDocument();

    // Existing item
    expect(screen.getByText(/Pooled 1/)).toBeInTheDocument();
  });

  test('can create a new activity via form', () => {
    render(<ActivityPool />);

    const title = screen.getByPlaceholderText(/e\.g\., Museum, Coffee, Trail/i);
    fireEvent.change(title, { target: { value: 'New Cafe' } });

    const time = screen.getByPlaceholderText('09:00');
    fireEvent.change(time, { target: { value: '11:00' } });

    const emoji = screen.getByPlaceholderText('📍');
    fireEvent.change(emoji, { target: { value: '☕' } });

    const location = screen.getByPlaceholderText(/City, place, area/i);
    fireEvent.change(location, { target: { value: 'Old Town' } });

    const note = screen.getByPlaceholderText(/Add an optional note/i);
    fireEvent.change(note, { target: { value: 'Try local beans' } });

    const addBtn = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addBtn);

    // New item shows up in the pool list
    expect(screen.getByText(/New Cafe/)).toBeInTheDocument();
  });

  test('filter/search narrows items', () => {
    render(<ActivityPool />);
    expect(screen.getByText(/Pooled 1/)).toBeInTheDocument();
    const search = screen.getByRole('textbox', { name: /search activities/i });
    fireEvent.change(search, { target: { value: 'nothing-matches' } });

    // Expect empty state visible
    expect(screen.getByText(/No activities yet/i)).toBeInTheDocument();
  });

  test('edit and delete existing pooled activity', () => {
    render(<ActivityPool />);

    // Locate pooled item row and click Edit
    const pooled = screen.getByText(/Pooled 1/).closest('.wp-pool-item');
    const editBtn = within(pooled).getByRole('button', { name: /Edit/i });
    fireEvent.click(editBtn);

    // Edit mode form appears, change title then Save
    const titleInput = within(pooled).getByPlaceholderText(/e\.g\., Museum, Coffee, Trail/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Pooled' } });
    const saveBtn = within(pooled).getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Updated Pooled/)).toBeInTheDocument();

    // Delete it
    const row = screen.getByText(/Updated Pooled/).closest('.wp-pool-item');
    const delBtn = within(row).getByRole('button', { name: /Delete/i });
    fireEvent.click(delBtn);

    // It should disappear
    expect(screen.queryByText(/Updated Pooled/)).not.toBeInTheDocument();
  });
});
