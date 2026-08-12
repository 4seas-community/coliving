// Gating secrets are NOT here — this file is imported by client
// components, and the repo is public. See lib/secrets.ts.
//
// /coliving/checkin used to sit behind a password too. It is now open to
// anyone with the link (noindex, so still unlisted) — guests arriving with
// luggage should not have to hunt for a password.

export const APPLICATION_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Need Info',
  'No Room Available',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// Canonical building display order for occupancy views — matches the
// physical site layout so admins can scan buildings consistently.
export const BUILDING_ORDER = ['E', 'F', 'Patitta', 'Baiyoke']

// Display metadata for resident categories. Colors map to the existing
// chart-* design tokens so badges stay within the app's palette.
//
// "coliving" is not a stored resident category — it's a synthetic label
// used only in the Manage Residents view to represent residents who came
// through the Application Hub's approval flow (as opposed to a manually
// recorded occupant).
export const RESIDENT_CATEGORY_META: Record<
  string,
  { label: string; colorClass: string }
> = {
  coliving: {
    label: 'Coliving',
    colorClass: 'border-neon/50 bg-neon/15 text-neon',
  },
  community: {
    label: 'Community',
    colorClass: 'border-chart-1/50 bg-chart-1/15 text-chart-1',
  },
  residency: {
    label: 'Residency',
    colorClass: 'border-chart-2/50 bg-chart-2/15 text-chart-2',
  },
  complimentary: {
    label: 'Complimentary',
    colorClass: 'border-chart-4/50 bg-chart-4/15 text-chart-4',
  },
  group: {
    label: 'Group Booking',
    colorClass: 'border-primary/50 bg-primary/15 text-primary',
  },
  friend: {
    label: 'Friend',
    colorClass: 'border-chart-3/50 bg-chart-3/15 text-chart-3',
  },
  'walk-in': {
    label: 'Walk-in',
    colorClass: 'border-chart-2/50 bg-chart-2/10 text-chart-2',
  },
  staff: {
    label: 'Staff',
    colorClass: 'border-chart-5/50 bg-chart-5/15 text-chart-5',
  },
  other: {
    label: 'Other',
    colorClass: 'border-muted-foreground/40 bg-muted text-muted-foreground',
  },
}

// Display order for the Manage Residents category filter — "coliving"
// first since it's the primary resident type, followed by manual
// categories in the same order as RESIDENT_CATEGORIES plus "coliving".
export const RESIDENT_FILTER_CATEGORIES = [
  'coliving',
  'community',
  'residency',
  'complimentary',
  'group',
  'friend',
  'walk-in',
  'staff',
  'other',
] as const

// Display metadata for the manual-resident payment methods (cash, QR
// transfer, or crypto) shown in the Manage Residents table.
export const PAYMENT_METHOD_META: Record<string, { label: string }> = {
  cash: { label: 'Cash' },
  qr: { label: 'QR Code' },
  crypto: { label: 'Crypto' },
}
