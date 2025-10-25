import React from 'react';

/**
 * PUBLIC_INTERFACE
 * RoomOptions
 * Displays selectable room types with price per night, capacity, and availability.
 * Props:
 * - selected: 'standard' | 'deluxe' | 'suite'
 * - onSelect: (value) => void
 * - pricing: { standard: number, deluxe: number, suite: number } // per night
 * - availability: { standard: string, deluxe: string, suite: string } // 'Available' | 'Limited' | 'Sold Out'
 * - capacity: { standard: number, deluxe: number, suite: number } // people capacity
 */
export default function RoomOptions({
  selected = 'standard',
  onSelect,
  pricing,
  availability,
  capacity
}) {
  const rooms = [
    { key: 'standard', label: 'Standard', emoji: '🛏️' },
    { key: 'deluxe', label: 'Deluxe', emoji: '🛌' },
    { key: 'suite', label: 'Suite', emoji: '🏨' },
  ];

  const getBadgeClass = (state) => {
    if (state === 'Available') return 'ok';
    if (state === 'Limited') return 'warn';
    return '';
  };

  return (
    <div className="wp-room-grid" role="group" aria-label="Room Type">
      {rooms.map((r) => {
        const price = pricing?.[r.key] ?? 0;
        const cap = capacity?.[r.key] ?? 2;
        const avail = availability?.[r.key] ?? 'Available';
        const isSelected = selected === r.key;

        return (
          <button
            key={r.key}
            type="button"
            className={`wp-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect?.(r.key)}
            aria-pressed={isSelected}
            aria-label={`${r.label} room ${isSelected ? 'selected' : 'not selected'}`}
          >
            <div className="wp-card-top">
              <h4 className="wp-card-title">{r.emoji} {r.label}</h4>
              <span className="wp-card-price">${price}/night</span>
            </div>
            <div className="wp-card-meta">
              <span>Capacity: {cap}</span>
              <span className={`wp-badge ${getBadgeClass(avail)}`}>{avail}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

