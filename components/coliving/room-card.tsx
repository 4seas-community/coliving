import { RoomGallery } from '@/components/coliving/room-gallery'
import { PricingGrid } from '@/components/coliving/pricing-grid'
import type { Room } from '@/lib/db/schema'
import { parseRoomImages } from '@/lib/room-images'
import { cn } from '@/lib/utils'

export function RoomCard({ room }: { room: Room }) {
  const soldOut = room.status === 'sold_out' || room.status === 'Sold Out'
  const images = parseRoomImages(room)

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-transform duration-200',
        soldOut ? 'opacity-60' : 'hover:scale-[1.02]',
      )}
    >
      <div className="relative overflow-hidden border-b border-border">
        {images.length > 0 ? (
          <RoomGallery images={images} alt={room.title} soldOut={soldOut} />
        ) : (
          <div className="grid-noise aspect-[4/3] w-full" />
        )}
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-2 rounded-br-lg bg-background/80 px-3 py-1.5 text-xs uppercase tracking-widest backdrop-blur">
          <span
            className={cn(
              'size-2',
              soldOut ? 'diamond-destructive bg-destructive' : 'diamond bg-neon',
            )}
            aria-hidden="true"
          />
          {soldOut ? 'Sold Out' : 'Available'}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{room.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {room.description}
          </p>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
          <PricingGrid itemClassName="p-3" />
        </dl>
      </div>
    </div>
  )
}
