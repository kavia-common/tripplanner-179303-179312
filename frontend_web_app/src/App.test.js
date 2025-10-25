import { render, screen, act, fireEvent } from '@testing-library/react';
import App from './App';
import { ROUTES } from './utils/router';

// Helper to set hash route
function go(to) {
  act(() => {
    window.location.hash = to;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

function seedSession(email = 'test@example.com') {
  window.localStorage.setItem('wanderplan.auth.session.v1', JSON.stringify({ email, loggedInAt: new Date().toISOString() }));
}

function clearStorage() {
  window.localStorage.clear();
}

describe('App smoke', () => {
  beforeEach(() => {
    clearStorage();
    // Ensure some deterministic hash initial state
    window.location.hash = ROUTES.LOGIN;
  });

  test('unauthenticated user sees auth screens', async () => {
    render(<App />);
    // Should render Login by default
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();

    // Navigate to signup
    act(() => { go(ROUTES.SIGNUP); });
    expect(await screen.findByText(/Create your account/i)).toBeInTheDocument();
  });

  test('authenticated user can see Planner (Header + Sidebar + Board)', async () => {
    seedSession();
    render(<App />);
    // App redirects authed users to #/app; header should show brand and theme toggle
    expect(await screen.findByText(/WanderPlan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();

    // Planner page should have wanderplan board title and Add Day button
    expect(screen.getByText(/WanderPlan Board/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /\+ Add Day/i })[0]).toBeInTheDocument();

    // Sidebar Activity Pool present
    expect(screen.getByText(/Activity Pool/i)).toBeInTheDocument();
  });

  test('Destinations route renders destination UI and CTA back to planner', async () => {
    seedSession();
    render(<App />);

    // Navigate to destinations
    go(ROUTES.DESTINATIONS);
    expect(await screen.findByText(/Explore Destinations/i)).toBeInTheDocument();
    // Skip to Planner button exists
    const skip = screen.getByRole('button', { name: /Skip to Planner/i });
    expect(skip).toBeInTheDocument();

    // Click skip should move back to planner
    fireEvent.click(skip);
    expect(await screen.findByText(/WanderPlan Board/i)).toBeInTheDocument();
  });

  test('Booking route renders booking page and budget CTA', async () => {
    seedSession();
    render(<App />);

    // First go to destinations and select one to satisfy guard
    go(ROUTES.DESTINATIONS);
    const selectButtons = await screen.findAllByRole('button', { name: /Select/i });
    // Click the first Select to store selectedDestination and auto-navigate to booking
    selectButtons[0].click();

    // Booking header and preview present
    expect(await screen.findByText(/Booking Options/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview & Subtotal/i)).toBeInTheDocument();

    // Navigate to Budget (alias)
    go(ROUTES.BUDGET);
    expect(await screen.findByText(/Suggested Plans/i)).toBeInTheDocument();
  });
});
