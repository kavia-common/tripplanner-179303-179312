//
// Pricing utilities for WanderPlan
// Encapsulates room and meal pricing, taxes, fees, and discount tiers.
//
// PUBLIC_INTERFACE
export const TAX_RULES = {
  // percentage applied on pre-tax subtotal (room + meals - discounts)
  cityTaxPct: 0.05, // 5%
  serviceFeePct: 0.03, // 3%
  // flat fees (optional)
  resortFeePerNight: 0, // set to >0 if needed
};

// PUBLIC_INTERFACE
export const DEFAULT_MEAL_PRICES = {
  breakfast: 12,
  lunch: 18,
  dinner: 26,
};

// PUBLIC_INTERFACE
export const DEFAULT_ROOM_MULTIPLIERS = {
  standard: 1.0,
  deluxe: 1.35,
  suite: 1.8,
};

// PUBLIC_INTERFACE
export function getRoomPricePerNight(baseNightPrice = 120, roomType = 'standard') {
  /**
   * Returns computed price per night for the selected room type using multipliers.
   */
  const mult = DEFAULT_ROOM_MULTIPLIERS[roomType] ?? DEFAULT_ROOM_MULTIPLIERS.standard;
  return Math.round(Number(baseNightPrice || 0) * mult);
}

// PUBLIC_INTERFACE
export function getMealsPerPersonPerDay(mealPlan = {}, mealPrices = DEFAULT_MEAL_PRICES) {
  /**
   * Sum of selected meals per person per day.
   */
  const { breakfast = false, lunch = false, dinner = false } = mealPlan || {};
  const sum =
    (breakfast ? (mealPrices.breakfast || 0) : 0) +
    (lunch ? (mealPrices.lunch || 0) : 0) +
    (dinner ? (mealPrices.dinner || 0) : 0);
  return Number(sum);
}

// PUBLIC_INTERFACE
export function applyDiscounts(subtotals, context) {
  /**
   * Apply discount tiers and return { discounts, discountedSubtotal }
   * Tiers:
   * - Longer stays: 5% off room for 5-6 nights; 10% off room for 7+ nights
   * - Group size: $10 off per person per night for groups >= 4 (applies to meal total cap 20% of meals)
   * - Meal bundles: if all three meals selected, 8% off meals subtotal
   */
  const { roomTotal = 0, mealsTotal = 0 } = subtotals || {};
  const { nights = 1, people = 1, mealPlan = {} } = context || {};

  let roomDiscount = 0;
  // Longer stays discount on room
  if (nights >= 7) roomDiscount += roomTotal * 0.10;
  else if (nights >= 5) roomDiscount += roomTotal * 0.05;

  // Group size discount primarily benefiting meal costs (cap 20% of meals)
  let groupDiscount = 0;
  if (people >= 4) {
    // $10 off per person per night, but do not exceed 20% of meals subtotal
    groupDiscount = Math.min(people * nights * 10, mealsTotal * 0.20);
  }

  // Meal bundle discount: if all three meals selected
  const allMeals = !!(mealPlan?.breakfast && mealPlan?.lunch && mealPlan?.dinner);
  const mealBundleDiscount = allMeals ? mealsTotal * 0.08 : 0;

  const totalDiscounts = Math.round(roomDiscount + groupDiscount + mealBundleDiscount);
  const discountedSubtotal = Math.max(0, Math.round(roomTotal + mealsTotal - totalDiscounts));

  return {
    discounts: {
      roomDiscount: Math.round(roomDiscount),
      groupDiscount: Math.round(groupDiscount),
      mealBundleDiscount: Math.round(mealBundleDiscount),
      total: totalDiscounts,
    },
    discountedSubtotal,
  };
}

// PUBLIC_INTERFACE
export function computeTaxesAndFees(subtotal, { nights = 1 }, taxRules = TAX_RULES) {
  /**
   * Compute taxes and fees from a discounted subtotal.
   * Returns { cityTax, serviceFee, resortFee, totalTaxesAndFees }
   */
  const base = Number(subtotal || 0);
  const cityTax = Math.round(base * (taxRules.cityTaxPct || 0));
  const serviceFee = Math.round(base * (taxRules.serviceFeePct || 0));
  const resortFee = Math.round((taxRules.resortFeePerNight || 0) * Math.max(1, Number(nights || 1)));
  const total = cityTax + serviceFee + resortFee;
  return { cityTax, serviceFee, resortFee, totalTaxesAndFees: total };
}

// PUBLIC_INTERFACE
export function computeBaseSubtotals({ nights = 1, people = 1, baseNightPrice = 120, roomType = 'standard', mealPlan = {}, mealPrices = DEFAULT_MEAL_PRICES }) {
  /**
   * Compute base room and meals subtotals (pre-discount, pre-tax).
   */
  const n = Math.max(1, Number(nights) || 1);
  const p = Math.max(1, Math.min(8, Number(people) || 1));
  const roomPerNight = getRoomPricePerNight(baseNightPrice, roomType);
  const mealsPerPersonPerDay = getMealsPerPersonPerDay(mealPlan, mealPrices);

  const roomTotal = Math.round(roomPerNight * n);
  const mealsTotal = Math.round(mealsPerPersonPerDay * p * n);
  return { roomTotal, mealsTotal, nights: n, people: p };
}

// PUBLIC_INTERFACE
export function buildSuggestedPlans(context) {
  /**
   * Build suggested budget plans with different meal/room combinations and discounts applied.
   * Returns an array of plans: { id, label, description, mealPlan, roomType, totals, badges[] }
   */
  const { baseNightPrice = 120, nights = 1, people = 2 } = context || {};
  const candidates = [
    {
      id: 'value',
      label: 'Value',
      description: 'Standard room + breakfast only — smart essentials',
      roomType: 'standard',
      mealPlan: { breakfast: true, lunch: false, dinner: false },
      badges: ['Most affordable'],
    },
    {
      id: 'balanced',
      label: 'Balanced',
      description: 'Deluxe room + breakfast & dinner — comfort & convenience',
      roomType: 'deluxe',
      mealPlan: { breakfast: true, lunch: false, dinner: true },
      badges: ['Popular choice'],
    },
    {
      id: 'premium',
      label: 'Premium',
      description: 'Suite + all meals — everything covered',
      roomType: 'suite',
      mealPlan: { breakfast: true, lunch: true, dinner: true },
      badges: ['All-inclusive feel'],
    },
  ];

  return candidates.map((c) => {
    const base = computeBaseSubtotals({
      nights,
      people,
      baseNightPrice,
      roomType: c.roomType,
      mealPlan: c.mealPlan,
    });
    const { discounts, discountedSubtotal } = applyDiscounts(base, { nights, people, mealPlan: c.mealPlan });
    const taxes = computeTaxesAndFees(discountedSubtotal, { nights });
    const grandTotal = discountedSubtotal + taxes.totalTaxesAndFees;
    return {
      ...c,
      totals: {
        ...base,
        discounts,
        discountedSubtotal,
        taxes,
        grandTotal,
      },
    };
  });
}

// PUBLIC_INTERFACE
export function formatCurrency(n) {
  /** Simple USD currency formatting without i18n for lightweight footprint. */
  const v = Number(n || 0);
  return `$${v.toLocaleString('en-US')}`;
}
