import React from 'react';

/**
 * PUBLIC_INTERFACE
 * DestinationCard
 * Card displaying destination image, name, rating, hotel and perks with a Select button.
 * Props:
 * - destination: { id, city, country, image, rating, hotel, pricePerNight, perks: string[] }
 * - onSelect: (destination) => void
 */
export default function DestinationCard({ destination, onSelect }) {
  const { city, country, image, rating, hotel, pricePerNight, perks = [] } = destination || {};

  return (
    <article className="wp-destination-card" role="group" aria-label={`${city}, ${country}`}>
      <img className="wp-destination-media" src={image} alt={`${city}, ${country}`} loading="lazy" />
      <div className="wp-destination-body">
        <h4 className="wp-destination-name">
          {city}, {country}
        </h4>
        <div className="wp-destination-meta">
          <span title="Hotel">{hotel}</span>
          <span title="Rating">⭐ {rating.toFixed(1)}</span>
          <span title="Avg price">~ ${pricePerNight}/night</span>
        </div>
        {perks.length > 0 && (
          <div className="wp-destination-perks" aria-label="Perks">
            {perks.map((p, idx) => (
              <span key={`${p}-${idx}`} className="wp-destination-perk">{p}</span>
            ))}
          </div>
        )}
        <div className="wp-destination-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => onSelect?.(destination)}
            aria-label={`Select ${city}`}
            title="Select and proceed"
          >
            Select
          </button>
        </div>
      </div>
    </article>
  );
}
