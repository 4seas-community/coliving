import type { Room } from '@/lib/db/schema'

// Rooms store their public gallery as a JSON array in `imageUrls`, falling
// back to the single `imageUrl` column for older rows that predate the
// gallery field. Used by every public-facing room display.
export function parseRoomImages(room: Room): string[] {
  let gallery: string[] = []
  try {
    const parsed = JSON.parse(room.imageUrls ?? '[]')
    if (Array.isArray(parsed)) gallery = parsed.filter(Boolean)
  } catch {
    gallery = []
  }
  const all = gallery.length > 0 ? gallery : room.imageUrl ? [room.imageUrl] : []
  return Array.from(new Set(all))
}
