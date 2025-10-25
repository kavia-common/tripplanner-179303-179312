import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ROUTES } from './utils/router';

if (!window.location.hash) {
  // Default to login if not authenticated; App will redirect accordingly.
  window.location.hash = ROUTES.LOGIN;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
