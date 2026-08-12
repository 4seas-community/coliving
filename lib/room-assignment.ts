import type { Application, RoomUnit } from '@/lib/db/schema'

// Keyword lists used to infer applicant preferences from their free-text
// answers (special requests, vibe, room preference). Kept in one place so
// the placement rules below stay easy to audit and extend.
const FAMILY_KEYWORDS = [
  'family',
  'families',
  'kid',
  'kids',
  'child',
  'children',
  'toddler',
  'baby',
  'spouse',
  'wife',
  'husband',
  'partner and',
  '家庭',
  '孩子',
  '小孩',
  '家人',
  '夫妻',
  '亲子',
]

const PRIVATE_BATHROOM_KEYWORDS = [
  'private bathroom',
  'own bathroom',
  'ensuite',
  'en-suite',
  'en suite',
  'personal bathroom',
  'private toilet',
  'not share bathroom',
  'not sharing bathroom',
  'no shared bathroom',
  'don\u2019t want to share a bathroom',
  '独立卫生间',
  '单独卫生间',
  '私人卫生间',
  '独立浴室',
]

const COMMUNITY_KEYWORDS = [
  'community',
  'communal',
  'social',
  'socializing',
  'socialize',
  'hang out',
  'meet people',
  'meet new people',
  'connect with',
  'roommates',
  'co-living community',
  '社区',
  '社群',
  '社交',
  '交流',
  '认识朋友',
]

export type RankedRoomUnit = {
  unit: RoomUnit
  score: number
  paxMatch: boolean
}

function textBlob(app: Application) {
  return `${app.roomNote ?? ''} ${app.vibe ?? ''} ${app.roomPreference ?? ''}`.toLowerCase()
}

function matchesAny(haystack: string, keywords: string[]) {
  return keywords.some((k) => haystack.includes(k))
}

function requiredPax(app: Application) {
  const source = `${app.occupancy ?? ''} ${app.roomPreference ?? ''}`.toLowerCase()
  if (/2\s*(people|person|guests?|pax)|double|couple/.test(source)) return 2
  return 1
}

function keywordScore(app: Application, unit: RoomUnit) {
  const needle = textBlob(app)
  const haystack = `${unit.specialNotes ?? ''} ${unit.bedType ?? ''} ${unit.bathroom ?? ''} ${unit.roomType ?? ''} ${unit.building ?? ''}`.toLowerCase()
  if (!needle.trim()) return 0
  const words = needle.match(/[a-z]{4,}/g) ?? []
  let score = 0
  for (const w of new Set(words)) {
    if (haystack.includes(w)) score += 1
  }
  return score
}

// Ranks bookable units for an applicant using the community's placement
// guidelines, layered as additive bonuses so a stronger signal (e.g. a
// family request) always outranks a weaker one (e.g. a generic keyword
// overlap), while pax match remains the baseline everyone gets scored on.
export function rankRoomUnits(
  app: Application,
  units: RoomUnit[],
): RankedRoomUnit[] {
  const pax = requiredPax(app)
  const blob = textBlob(app)
  const isMonthStay = app.stayDuration === '1 month'
  const wantsPrivateBathroom = matchesAny(blob, PRIVATE_BATHROOM_KEYWORDS)
  const wantsCommunity = matchesAny(blob, COMMUNITY_KEYWORDS)
  const isFamily = matchesAny(blob, FAMILY_KEYWORDS)

  return [...units]
    .map((unit) => {
      const paxMatch = unit.pax != null && unit.pax === pax
      const paxClose = unit.pax != null && Math.abs(unit.pax - pax) === 1
      const isBaiyoke = unit.building === 'Baiyoke'
      const isEF = unit.building === 'E' || unit.building === 'F'
      const isPatitta = unit.building === 'Patitta'
      const kw = keywordScore(app, unit)

      let score = paxMatch ? 100 : paxClose ? 40 : 0

      // Families: prioritize Baiyoke's double rooms.
      if (isFamily && isBaiyoke && unit.pax === 2) score += 500
      // Month-long stays wanting their own bathroom: prioritize Patitta.
      if (isMonthStay && wantsPrivateBathroom && isPatitta) score += 400
      // Wants a strong community feel: prioritize E and F.
      if (wantsCommunity && isEF) score += 300
      // Two guests with no stronger signal above: prioritize E/F big rooms.
      if (pax === 2 && isEF && unit.roomType === 'Big') score += 200
      // Baiyoke suits anyone easygoing with no strong preference — a light
      // nudge only, never enough to beat an explicit signal above.
      if (isBaiyoke && !isFamily) score += 5

      score += kw * 10

      return { unit, score, paxMatch }
    })
    .sort((a, b) => b.score - a.score)
}

// Bookable units the applicant could move into: currently vacant units,
// plus whichever unit they're already assigned to (so it still shows up
// as the selected option).
export function bookableUnitsFor(
  roomUnits: RoomUnit[],
  occupiedUnitIds: Set<number>,
  currentRoomUnitId: number | null,
) {
  return roomUnits.filter(
    (u) => u.bookable && (!occupiedUnitIds.has(u.id) || u.id === currentRoomUnitId),
  )
}

export const TOP_SUGGESTION_COUNT = 3
