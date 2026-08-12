import Link from 'next/link'
import { RoomGallery } from '@/components/coliving/room-gallery'
import { PricingGrid } from '@/components/coliving/pricing-grid'
import type { Room } from '@/lib/db/schema'
import { parseRoomImages } from '@/lib/room-images'

export function UnifiedRoomCard({ rooms }: { rooms: Room[] }) {
  // Collect all images from all rooms, interleaving so variety shows early
  const allImages: string[] = []
  const byRoom = rooms.map((r) => parseRoomImages(r))
  const maxLen = Math.max(...byRoom.map((imgs) => imgs.length), 0)
  for (let i = 0; i < maxLen; i++) {
    for (const imgs of byRoom) {
      if (imgs[i]) allImages.push(imgs[i])
    }
  }
  const deduped = Array.from(new Set(allImages))

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Gallery */}
      <div className="relative border-b border-border">
        {deduped.length > 0 ? (
          <RoomGallery images={deduped} alt="4Seas room" soldOut={false} />
        ) : (
          <div className="grid-noise aspect-[16/7] w-full" />
        )}
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-2 rounded-br-lg bg-background/80 px-3 py-1.5 text-xs uppercase tracking-widest backdrop-blur">
          <span className="diamond size-2 bg-neon" aria-hidden="true" />
          Available
        </div>
        {deduped.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md bg-background/70 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            {deduped.length} photos
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-8">
        {/* Description */}
        <div className="flex-1">
          <h3 className="text-sm font-bold tracking-tight">Private Rooms</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            All rooms are private, fully furnished, and all-inclusive.{' '}
            <Link href="/coliving/rooms" className="underline underline-offset-2 hover:text-foreground">
              Browse all photos
            </Link>
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/50">
            {rooms.map((r) => r.title).join(' · ')}
          </p>
        </div>

        {/* Pricing grid */}
        <dl className="w-full shrink-0 sm:w-64">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
            <PricingGrid itemClassName="px-3 py-2" />
          </div>
        </dl>
      </div>
    </div>
  )
}
