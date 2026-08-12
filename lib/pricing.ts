// Single source of truth for the two occupancy tiers offered across the
// public pricing displays (room cards) and the apply form's live estimate.
// Keeping the numbers in one place avoids the amounts drifting out of sync.
export const OCCUPANCY_RATES = {
  '1 person': { perWeek: 380, perMonth: 1300 },
  '2 people': { perWeek: 650, perMonth: 2300 },
} as const

export type OccupancyOption = keyof typeof OCCUPANCY_RATES

// Flat pricing grid shown on the public room cards.
export const PRICING_DISPLAY = [
  {
    label: '1 person / month',
    price: `$${OCCUPANCY_RATES['1 person'].perMonth.toLocaleString()}`,
  },
  {
    label: '2 people / month',
    price: `$${OCCUPANCY_RATES['2 people'].perMonth.toLocaleString()}`,
  },
  {
    label: '1 person / week',
    price: `$${OCCUPANCY_RATES['1 person'].perWeek.toLocaleString()}`,
  },
  {
    label: '2 people / week',
    price: `$${OCCUPANCY_RATES['2 people'].perWeek.toLocaleString()}`,
  },
]

// Estimates the cost shown live on the apply form as the applicant picks
// their occupancy and stay duration.
export function estimateStayCost(occupancy: string, duration: string) {
  const rates =
    OCCUPANCY_RATES[occupancy as OccupancyOption] ?? OCCUPANCY_RATES['1 person']
  if (duration === '1 week') return { amount: rates.perWeek, suffix: '/ week' }
  if (duration === '2 weeks') {
    return { amount: rates.perWeek * 2, suffix: '/ 2 weeks' }
  }
  return { amount: rates.perMonth, suffix: '/ month' }
}
