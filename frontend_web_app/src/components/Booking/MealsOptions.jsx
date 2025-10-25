import React from 'react';

/**
 * PUBLIC_INTERFACE
 * MealsOptions
 * Renders a list of meal plan toggles (breakfast/lunch/dinner) with pricing.
 * Props:
 * - value: { breakfast: boolean, lunch: boolean, dinner: boolean }
 * - onChange: (next) => void
 * - pricing: { breakfast: number, lunch: number, dinner: number } // per person per day
 */
export default function MealsOptions({ value = { breakfast: false, lunch: false, dinner: false }, onChange, pricing }) {
  const plans = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🥐' },
    { key: 'lunch', label: 'Lunch', emoji: '🍲' },
    { key: 'dinner', label: 'Dinner', emoji: '🍽️' },
  ];

  const toggle = (key) => {
    const next = { ...value, [key]: !value[key] };
    onChange?.(next);
  };

  return (
    <div className="wp-meal-grid" role="group" aria-label="Meal Plans">
      {plans.map((p) => {
        const price = pricing?.[p.key] ?? 0;
        const selected = !!value[p.key];
        return (
          <button
            key={p.key}
            type="button"
            className={`wp-card ${selected ? 'selected' : ''}`}
            onClick={() => toggle(p.key)}
            aria-pressed={selected}
            aria-label={`${p.label} ${selected ? 'selected' : 'not selected'}`}
          >
            <div className="wp-card-top">
              <h4 className="wp-card-title">{p.emoji} {p.label}</h4>
              <span className="wp-card-price">${price}/pp/day</span>
            </div>
            <div className="wp-card-meta">
              <span className="wp-badge">{selected ? 'Included' : 'Optional'}</span>
              <span className="wp-summary-muted">Per person per day</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

