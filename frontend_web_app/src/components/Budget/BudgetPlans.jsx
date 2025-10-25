import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency, buildSuggestedPlans, computeBaseSubtotals, applyDiscounts, computeTaxesAndFees, DEFAULT_MEAL_PRICES } from '../../utils/pricing';
import useTripPlan from '../../hooks/useTripPlan';
import { ROUTES, navigate } from '../../utils/router';

/**
 * PUBLIC_INTERFACE
 * BudgetPlans
 * Displays pricing breakdown (room, meals, discounts, taxes) and suggested budget plans.
 * Allows selecting a plan to persist into tripMeta and provides CTA to proceed to Planner.
 *
 * Data sources:
 * - tripMeta.selectedDestination?.pricePerNight
 * - tripMeta.nights, tripMeta.people, tripMeta.roomType, tripMeta.mealPlan
 *
 * Persistence:
 * - Writes selected plan properties into localStorage tripMeta (roomType, mealPlan, pricingSnapshot)
 * - Then nudges state update by renaming trip (no change) to update updatedAt
 */
export default function BudgetPlans() {
  const { state: { tripMeta }, actions: { renameTrip } } = useTripPlan();

  // Read context defaults from tripMeta/destination
  const baseNight = tripMeta?.selectedDestination?.pricePerNight ?? 120;
  const nights = Math.max(1, Number(tripMeta?.nights || 1));
  const people = Math.max(1, Math.min(8, Number(tripMeta?.people || 2)));
  const roomType = tripMeta?.roomType || 'standard';
  const mealPlan = tripMeta?.mealPlan || { breakfast: true, lunch: false, dinner: true };

  // Compute detailed current breakdown for the currently set room/meal combo
  const current = useMemo(() => {
    const base = computeBaseSubtotals({
      nights,
      people,
      baseNightPrice: baseNight,
      roomType,
      mealPlan,
      mealPrices: DEFAULT_MEAL_PRICES,
    });
    const { discounts, discountedSubtotal } = applyDiscounts(base, { nights, people, mealPlan });
    const taxes = computeTaxesAndFees(discountedSubtotal, { nights });
    const grandTotal = discountedSubtotal + taxes.totalTaxesAndFees;
    return { base, discounts, taxes, grandTotal };
  }, [nights, people, baseNight, roomType, mealPlan]);

  // Suggested plan cards
  const suggestions = useMemo(
    () => buildSuggestedPlans({ baseNightPrice: baseNight, nights, people }),
    [baseNight, nights, people]
  );

  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Persist selected plan into tripMeta
  const persistSelectedPlan = (plan) => {
    if (!plan) return;
    try {
      const raw = window.localStorage.getItem('wanderplan.trip.v1');
      const payload = raw ? JSON.parse(raw) : null;
      const data = payload?.data || null;
      if (data && data.tripMeta) {
        data.tripMeta = {
          ...data.tripMeta,
          roomType: plan.roomType,
          mealPlan: { ...plan.mealPlan },
          // store snapshot for review
          pricingSnapshot: {
            selectedPlanId: plan.id,
            totals: plan.totals,
            calculatedAt: new Date().toISOString(),
          },
        };
        payload.data = data;
        payload.savedAt = new Date().toISOString();
        window.localStorage.setItem('wanderplan.trip.v1', JSON.stringify(payload));
        // nudge state timestamp
        renameTrip(data.tripMeta.name || 'My Trip');
      }
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    if (!selectedPlanId) return;
    const found = suggestions.find((s) => s.id === selectedPlanId);
    if (found) persistSelectedPlan(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  const goPlanner = () => navigate(ROUTES.APP);

  return (
    <div className="wp-booking" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div className="wp-booking-left">
        <div className="wp-booking-header">
          <h3 className="wp-booking-title">Your Cost Breakdown</h3>
          <p className="wp-booking-subtitle">
            Based on your current selections and smart discounts.
          </p>
        </div>

        <div className="wp-summary" aria-live="polite">
          <div className="wp-summary-row">
            <span>Room ({roomType}) × {nights} night(s)</span>
            <strong>{formatCurrency(current.base.roomTotal)}</strong>
          </div>
          <div className="wp-summary-row">
            <span>Meals per day</span>
            <span className="wp-summary-muted">
              {Object.entries(mealPlan).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None'}
            </span>
          </div>
          <div className="wp-summary-row">
            <span>Meals × {people} people × {nights} night(s)</span>
            <strong>{formatCurrency(current.base.mealsTotal)}</strong>
          </div>

          {current.discounts.total > 0 && (
            <>
              <div className="wp-summary-row" style={{ color: 'var(--color-success)' }}>
                <span>Discounts</span>
                <strong>-{formatCurrency(current.discounts.total)}</strong>
              </div>
              <div className="wp-summary-row wp-summary-muted" style={{ fontSize: 12 }}>
                <span>Includes</span>
                <span>
                  {[
                    current.discounts.roomDiscount ? `Longer stay: -${formatCurrency(current.discounts.roomDiscount)}` : null,
                    current.discounts.groupDiscount ? `Group: -${formatCurrency(current.discounts.groupDiscount)}` : null,
                    current.discounts.mealBundleDiscount ? `Meal bundle: -${formatCurrency(current.discounts.mealBundleDiscount)}` : null,
                  ].filter(Boolean).join(' • ')}
                </span>
              </div>
            </>
          )}

          <div className="wp-summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 6 }}>
            <span>Subtotal (after discounts)</span>
            <strong>{formatCurrency(current.base.roomTotal + current.base.mealsTotal - current.discounts.total)}</strong>
          </div>

          <div className="wp-summary-row">
            <span>City tax</span>
            <span>{formatCurrency(current.taxes.cityTax)}</span>
          </div>
          <div className="wp-summary-row">
            <span>Service fee</span>
            <span>{formatCurrency(current.taxes.serviceFee)}</span>
          </div>
          {current.taxes.resortFee > 0 && (
            <div className="wp-summary-row">
              <span>Resort fee</span>
              <span>{formatCurrency(current.taxes.resortFee)}</span>
            </div>
          )}

          <div className="wp-summary-row wp-summary-total">
            <span>Estimated Total</span>
            <span>{formatCurrency(current.grandTotal)}</span>
          </div>

          <div className="wp-actions">
            <button className="btn btn-outline" type="button" onClick={goPlanner}>
              ← Back to Planner
            </button>
          </div>
        </div>
      </div>

      <aside className="wp-booking-right">
        <div className="wp-booking-header">
          <h3 className="wp-booking-title">Suggested Plans</h3>
          <p className="wp-booking-subtitle">Pick a plan; you can still customize later.</p>
        </div>

        <div className="wp-room-grid" role="list" aria-label="Suggested budget plans">
          {suggestions.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="listitem"
                className={`wp-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedPlanId(plan.id)}
                aria-pressed={isSelected}
                aria-label={`${plan.label} plan ${isSelected ? 'selected' : 'not selected'}`}
                style={{ textAlign: 'left' }}
              >
                <div className="wp-card-top">
                  <h4 className="wp-card-title">{plan.label}</h4>
                  <span className="wp-card-price">{formatCurrency(plan.totals.grandTotal)}</span>
                </div>
                <div className="wp-card-meta">
                  <span className="wp-badge">{plan.badges?.[0] || 'Suggested'}</span>
                  <span className="wp-summary-muted">{plan.description}</span>
                </div>
                <div className="wp-card-meta" style={{ marginTop: 6 }}>
                  <span>Room: {plan.roomType}</span>
                  <span>Meals: {Object.entries(plan.mealPlan).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None'}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="wp-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={goPlanner}
            disabled={!selectedPlanId}
            aria-disabled={!selectedPlanId}
            title={!selectedPlanId ? 'Select a plan to continue' : 'Proceed to Planner'}
          >
            Use Selected Plan → Planner
          </button>
        </div>
      </aside>
    </div>
  );
}
