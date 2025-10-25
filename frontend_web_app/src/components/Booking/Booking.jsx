import React, { useEffect, useMemo, useState } from 'react';
import './Booking.css';
import RoomOptions from './RoomOptions';
import MealsOptions from './MealsOptions';
import useTripPlan from '../../hooks/useTripPlan';
import { ROUTES, navigate } from '../../utils/router';
import BudgetPlans from '../Budget/BudgetPlans';

/**
 * PUBLIC_INTERFACE
 * Booking
 * Booking flow page capturing nights and people with validation,
 * selects room and meal plan, shows running subtotal preview, and
 * persists a booking draft into localStorage via useTripPlan state.
 *
 * tripMeta additions stored:
 * - destinationId? (if available from selectedDestination; else undefined)
 * - roomType: 'standard' | 'deluxe' | 'suite'
 * - nights: number
 * - people: number
 * - mealPlan: { breakfast: boolean, lunch: boolean, dinner: boolean }
 */
export default function Booking() {
  const { state: { tripMeta }, actions: { renameTrip } } = useTripPlan();

  // Defaults derived from destination price if present
  const baseNight = tripMeta?.selectedDestination?.pricePerNight ?? 120;

  const roomPricing = useMemo(() => ({
    standard: Math.round(baseNight * 1.0),
    deluxe: Math.round(baseNight * 1.35),
    suite: Math.round(baseNight * 1.8),
  }), [baseNight]);

  const roomAvailability = useMemo(() => ({
    standard: 'Available',
    deluxe: Math.random() > 0.5 ? 'Available' : 'Limited',
    suite: Math.random() > 0.7 ? 'Limited' : 'Available',
  }), []);

  const roomCapacity = { standard: 2, deluxe: 3, suite: 4 };

  const mealPricing = { breakfast: 12, lunch: 18, dinner: 26 };

  // Form state
  const [nights, setNights] = useState(Math.max(1, (tripMeta?.nights || 1)));
  const [people, setPeople] = useState(Math.max(1, Math.min(8, (tripMeta?.people || 2))));
  const [roomType, setRoomType] = useState(tripMeta?.roomType || 'standard');
  const [mealPlan, setMealPlan] = useState(tripMeta?.mealPlan || { breakfast: true, lunch: false, dinner: true });

  const [errors, setErrors] = useState({ nights: '', people: '' });

  // Validation
  useEffect(() => {
    const e = { nights: '', people: '' };
    if (!Number.isFinite(Number(nights)) || Number(nights) < 1) e.nights = 'Nights must be at least 1';
    if (!Number.isFinite(Number(people)) || Number(people) < 1) e.people = 'People must be at least 1';
    if (Number(people) > 8) e.people = 'Maximum 8 people supported';
    if (Number(people) > (roomCapacity[roomType] || 2)) {
      e.people = `Selected room capacity is ${roomCapacity[roomType]} people`;
    }
    setErrors(e);
  }, [nights, people, roomType]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    const n = Math.max(1, Number(nights) || 1);
    const p = Math.max(1, Math.min(8, Number(people) || 1));
    const room = roomPricing[roomType] || 0;
    const mealsPerPersonPerDay =
      (mealPlan.breakfast ? mealPricing.breakfast : 0) +
      (mealPlan.lunch ? mealPricing.lunch : 0) +
      (mealPlan.dinner ? mealPricing.dinner : 0);
    const roomTotal = room * n;
    const mealsTotal = mealsPerPersonPerDay * p * n;
    return {
      roomTotal,
      mealsTotal,
      grand: roomTotal + mealsTotal,
    };
  }, [nights, people, roomType, mealPlan, roomPricing]);

  // Persist draft into localStorage schema used by useTripPlan
  const persistDraft = () => {
    try {
      const raw = window.localStorage.getItem('wanderplan.trip.v1');
      const payload = raw ? JSON.parse(raw) : null;
      const data = payload?.data || null;
      const destinationId = tripMeta?.selectedDestination?.id || undefined;

      if (data && data.tripMeta) {
        data.tripMeta = {
          ...data.tripMeta,
          destinationId,
          roomType,
          nights: Math.max(1, Number(nights) || 1),
          people: Math.max(1, Math.min(8, Number(people) || 1)),
          mealPlan: { ...mealPlan },
        };
        payload.data = data;
        payload.savedAt = new Date().toISOString();
        window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(payload));
        // bump updatedAt via renameTrip (no name change needed)
        renameTrip(data.tripMeta.name || 'My Trip');
      }
    } catch {
      // ignore
    }
  };

  // Persist on change (debounced)
  useEffect(() => {
    const t = setTimeout(persistDraft, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nights, people, roomType, mealPlan]);

  const onBack = () => navigate(ROUTES.DESTINATIONS);
  const onFinish = () => navigate(ROUTES.APP);

  const hasErrors = !!(errors.nights || errors.people);

  return (
    <div className="wp-booking">
      <div className="wp-booking-left">
        <div className="wp-booking-header">
          <h3 className="wp-booking-title">Booking Options</h3>
          <p className="wp-booking-subtitle">
            {tripMeta?.selectedDestination
              ? `Selected: ${tripMeta.selectedDestination.city}, ${tripMeta.selectedDestination.country} • ${tripMeta.selectedDestination.hotel}`
              : 'No destination selected yet. Pick one to tailor your booking.'}
          </p>
        </div>

        <div className="wp-section">
          <h4 className="wp-section-title">Trip Details</h4>
          <div className="wp-field">
            <label className="wp-label" htmlFor="bk-nights">Nights</label>
            <input
              id="bk-nights"
              className="wp-input"
              type="number"
              min={1}
              value={nights}
              onChange={(e) => setNights(e.target.value)}
            />
            {errors.nights && <div className="wp-error" role="alert">{errors.nights}</div>}
          </div>
          <div className="wp-field">
            <label className="wp-label" htmlFor="bk-people">People</label>
            <input
              id="bk-people"
              className="wp-input"
              type="number"
              min={1}
              max={8}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
            />
            {errors.people && <div className="wp-error" role="alert">{errors.people}</div>}
          </div>
        </div>

        <div className="wp-section">
          <h4 className="wp-section-title">Room Type</h4>
          <RoomOptions
            selected={roomType}
            onSelect={setRoomType}
            pricing={roomPricing}
            availability={roomAvailability}
            capacity={roomCapacity}
          />
        </div>

        <div className="wp-section">
          <h4 className="wp-section-title">Meal Plan</h4>
          <MealsOptions
            value={mealPlan}
            onChange={setMealPlan}
            pricing={mealPricing}
          />
        </div>

        <div className="wp-actions">
          <button className="btn btn-outline" type="button" onClick={onBack}>← Back to Destinations</button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onFinish}
            disabled={hasErrors}
            aria-disabled={hasErrors}
            title={hasErrors ? 'Fix errors before finishing' : 'Finish and return to Board'}
          >
            Finish and return to Board
          </button>
        </div>
      </div>

      <aside className="wp-booking-right">
        <div className="wp-booking-header">
          <h3 className="wp-booking-title">Preview & Subtotal</h3>
          <p className="wp-booking-subtitle">A quick estimate before taxes and fees.</p>
        </div>
        <div className="wp-summary">
          <div className="wp-summary-row">
            <span>Room ({roomType}) × {Math.max(1, Number(nights) || 1)} night(s)</span>
            <strong>${subtotal.roomTotal}</strong>
          </div>
          <div className="wp-summary-row">
            <span>Meals per day</span>
            <span className="wp-summary-muted">
              {Object.entries(mealPlan).filter(([k, v]) => v).map(([k]) => k).join(', ') || 'None'}
            </span>
          </div>
          <div className="wp-summary-row">
            <span>Meals × {Math.max(1, Number(people) || 1)} people × {Math.max(1, Number(nights) || 1)} night(s)</span>
            <strong>${subtotal.mealsTotal}</strong>
          </div>
          <div className="wp-summary-row wp-summary-total">
            <span>Estimated Total</span>
            <span>${subtotal.grand}</span>
          </div>
        </div>
      </aside>

      {/* Budget plans & detailed taxes/discounts section */}
      <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
        <BudgetPlans />
      </div>
    </div>
  );
}

