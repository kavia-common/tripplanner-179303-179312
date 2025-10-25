import React, { useMemo, useState } from 'react';
import './Destinations.css';
import DestinationCard from './DestinationCard';
import useTripPlan from '../../hooks/useTripPlan';
import { navigate, ROUTES } from '../../utils/router';

/**
 * PUBLIC_INTERFACE
 * Destinations
 * Browse curated destinations with placeholder images and fake hotel data.
 * Selecting a destination stores it in tripMeta (city, country, hotel, rating, pricePerNight)
 * and navigates to the booking flow route.
 */
export default function Destinations() {
  const { state: { tripMeta }, actions: { renameTrip } } = useTripPlan();
  const [q, setQ] = useState('');

  // Curated destinations with Unsplash placeholders
  const destinations = useMemo(() => {
    const base = [
      { city: 'Barcelona', country: 'Spain', topic: 'barcelona city' },
      { city: 'Lisbon', country: 'Portugal', topic: 'lisbon city' },
      { city: 'Kyoto', country: 'Japan', topic: 'kyoto temple' },
      { city: 'Bali', country: 'Indonesia', topic: 'bali beach' },
      { city: 'Reykjavík', country: 'Iceland', topic: 'iceland nature' },
      { city: 'Vancouver', country: 'Canada', topic: 'vancouver skyline' },
      { city: 'Paris', country: 'France', topic: 'paris eiffel' },
      { city: 'Rome', country: 'Italy', topic: 'rome colosseum' },
      { city: 'Marrakesh', country: 'Morocco', topic: 'marrakesh market' },
    ];
    const hotels = [
      'Grand Vista Hotel', 'Aurora Suites', 'Harborview Inn', 'Golden Palm Resort',
      'Skyline Boutique', 'Seabreeze Lodge', 'Mountain Crest Hotel', 'Urban Oasis',
      'Azure Bay Resort', 'Cedar & Stone'
    ];
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    return base.map((b, i) => {
      const seed = `${b.city}-${i}-${Math.random().toString(36).slice(2,6)}`;
      const image = `https://source.unsplash.com/featured/800x500?${encodeURIComponent(b.topic)}&sig=${encodeURIComponent(seed)}`;
      return {
        id: `dest-${i}-${seed}`,
        ...b,
        image,
        hotel: pick(hotels),
        rating: (Math.random() * 2 + 3.2), // 3.2 - 5.2
        pricePerNight: rand(80, 320),
        perks: pickPerks(),
      };
    });

    function pickPerks() {
      const all = ['Breakfast included', 'Free Wi‑Fi', 'Rooftop pool', 'Airport pickup', 'City center', 'Ocean view', 'Spa access'];
      // choose 2-4 unique perks
      const copy = [...all].sort(() => 0.5 - Math.random());
      return copy.slice(0, 3 + (Math.random() > 0.6 ? 1 : 0));
    }
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return destinations;
    return destinations.filter(d => `${d.city} ${d.country}`.toLowerCase().includes(k));
  }, [q, destinations]);

  const onSelect = (dest) => {
    try {
      // Store selection in tripMeta using localStorage direct to preserve design of hook,
      // then trigger renameTrip to bump updatedAt and possibly reflect name.
      const raw = window.localStorage.getItem('wanderplan.trip.v1');
      const payload = raw ? JSON.parse(raw) : null;
      const data = payload?.data || null;
      if (data && data.tripMeta) {
        data.tripMeta = {
          ...data.tripMeta,
          selectedDestination: {
            city: dest.city,
            country: dest.country,
            hotel: dest.hotel,
            rating: Number(dest.rating.toFixed(1)),
            pricePerNight: dest.pricePerNight,
            image: dest.image,
            perks: dest.perks,
          },
        };
        // Set trip name if default
        if (!data.tripMeta.name || data.tripMeta.name === 'My Trip') {
          data.tripMeta.name = `${dest.city} Getaway`;
          renameTrip(data.tripMeta.name);
        } else {
          // still bump timestamp
          renameTrip(data.tripMeta.name);
        }
        const next = { ...payload, data, savedAt: new Date().toISOString() };
        window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(next));
      } else {
        // Fallback: just call rename to bump state
        if (!tripMeta?.name || tripMeta?.name === 'My Trip') {
          renameTrip(`${dest.city} Getaway`);
        } else {
          renameTrip(tripMeta.name);
        }
      }
    } catch {
      // ignore storage errors
    }
    // Navigate to booking route
    navigate(ROUTES.BOOKING);
  };

  const refreshGrid = () => {
    // Force a refresh by changing state key; simplest is bumping query then resetting.
    const prev = q;
    setQ(prev + ' ');
    setTimeout(() => setQ(prev), 0);
  };

  return (
    <div className="wp-destinations-page">
      <div className="wp-destinations-header">
        <div>
          <h2 className="wp-destinations-title">Explore Destinations</h2>
          <p className="wp-destinations-subtitle">
            Browse hand-picked places with inspiring photos. Select one to tailor your trip.
          </p>
        </div>
        <div className="wp-destinations-controls">
          <input
            className="trip-input"
            type="text"
            placeholder="Search city or country"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search destinations"
            style={{ minWidth: 220 }}
          />
          <button type="button" className="btn btn-outline" onClick={refreshGrid} title="Shuffle images">
            Shuffle
          </button>
        </div>
      </div>

      <div className="wp-destinations-grid">
        {filtered.map((d) => (
          <DestinationCard key={d.id} destination={d} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
