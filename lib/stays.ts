import type { Application, Resident } from '@/lib/db/schema'

// A "stay" is a single occupancy span in a room, regardless of whether it
// came from the coliving application flow or a manually-added resident
// record. Merging both sources into one shape lets the Occupancy table and
// calendar render them side by side without special-casing either type.
export type RoomStay = {
  id: string
  roomUnitId: number
  name: string
  checkIn: string | null
  checkOut: string | null
  kind: 'application' | 'resident'
  category?: string
  amount?: number | null
  amountUnit?: string | null
  applicationId?: number
  residentId?: number
}

export function buildRoomStays(
  applications: Application[],
  residents: Resident[],
): RoomStay[] {
  const applicationStays: RoomStay[] = applications
    .filter((a) => a.status === 'Approved' && a.roomUnitId != null)
    .map((a) => ({
      id: `app-${a.id}`,
      roomUnitId: a.roomUnitId as number,
      name: a.name,
      checkIn: a.checkInDate,
      checkOut: a.checkOutDate,
      kind: 'application',
      applicationId: a.id,
    }))

  const residentStays: RoomStay[] = residents.map((r) => ({
    id: `res-${r.id}`,
    roomUnitId: r.roomUnitId,
    name: r.name,
    checkIn: r.checkInDate,
    checkOut: r.checkOutDate,
    kind: 'resident',
    category: r.category,
    amount: r.amount,
    amountUnit: r.amountUnit,
    residentId: r.id,
  }))

  return [...applicationStays, ...residentStays]
}

export function groupStaysByUnit(stays: RoomStay[]) {
  const map = new Map<number, RoomStay[]>()
  for (const stay of stays) {
    const list = map.get(stay.roomUnitId) ?? []
    list.push(stay)
    map.set(stay.roomUnitId, list)
  }
  return map
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

// A stay with no check-in date is treated as "ongoing since always", and one
// with no check-out date as "ongoing indefinitely" — matching how the rest
// of the admin already treats missing dates as open-ended.
export function isStayActiveOn(stay: RoomStay, date: Date): boolean {
  const checkIn = parseDate(stay.checkIn)
  const checkOut = parseDate(stay.checkOut)
  if (checkIn && checkIn > date) return false
  if (checkOut && checkOut < date) return false
  return true
}
