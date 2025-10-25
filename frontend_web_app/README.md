# WanderPlan Frontend (React SPA)

WanderPlan is a single-page trip planning app with a minimalist, classic “Corporate Navy” UI. It uses only React, vanilla CSS, and localStorage. No external APIs or services are required.

Key highlights:
- Hash-based routing only (no react-router dependency)
- Local-only state with automatic persistence to localStorage
- Drag-and-drop using native HTML5 APIs
- Auth implemented fully client-side with salted SHA-256 hashing via Web Crypto

## Getting Started

In the project directory:

- npm start
  Runs the app in development mode at http://localhost:3000

- npm test
  Runs the test suite (non-interactive in CI)

- npm run build
  Builds the production bundle

Note: The app uses hash-based routes. The index bootstraps to #/login if no session is found.

## Core Flows

- Authentication:
  - Login and Signup are implemented purely on the client. Passwords are salted and hashed with Web Crypto and stored with a per-user salt in localStorage.
  - Successful login sets a session in localStorage, which gates access to the Planner and other routes.

- Planner (Board + Sidebar):
  - Board shows Day columns with an “+ Add Day” affordance.
  - Sidebar hosts the Activity Pool where you can create, edit, delete, and drag activities into days.
  - All changes persist to localStorage under the versioned key wanderplan.trip.v1.

- Destinations:
  - Browses curated destinations with placeholder Unsplash images (by topic keywords). No fetch is required; images are referenced by URL.
  - Selecting a destination writes a selectedDestination snapshot into tripMeta and navigates to Booking.

- Booking and Budget:
  - Booking captures nights, people, room type, and meal plan and shows a live subtotal preview.
  - Budget shows suggested plans and full breakdown (discounts, taxes, fees). Selecting a plan stores a pricingSnapshot.
  - Both are hash-routes and do not call any external APIs.

Routes:
- #/login
- #/signup
- #/app (Planner)
- #/destinations
- #/booking
- #/budget (Budget section on Booking page)

## Tests

We provide smoke tests that do not rely on any external services:
- src/App.test.js
  - Verifies unauthenticated auth views, authenticated planner, navigation to Destinations, and Booking/Budget pages using hash routing.
- src/components/Board/__tests__/Board.test.js
  - Renders Board with seeded localStorage; checks days and activity presence; verifies “+ Add Day” adds a new day.
- src/components/Sidebar/__tests__/ActivityPool.test.js
  - Seeds pool items; validates creation, filtering, editing, and deleting activities in the pool.

How to run:
- CI:
  npm test -- --watchAll=false
- Local interactive:
  npm test

These tests manipulate window.location.hash and localStorage directly to remain isolated and deterministic.

## Notes

- If you clear localStorage, the app seeds a sample trip on first run unless it detects prior data.
- The theme can be toggled in the header. CSS variables in src/theme.css control colors and tokens.
- Because routing is hash-based, deep linking does not require any server configuration.

