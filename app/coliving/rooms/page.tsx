'use server'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getEnabledRooms } from '@/lib/queries'
import { parseRoomImages } from '@/lib/room-images'

export default async function RoomsGalleryPage() {
  const rooms = await getEnabledRooms()

  const sections = rooms.map((room) => ({
    room,
    images: parseRoomImages(room),
  }))

  const totalPhotos = sections.reduce((n, s) => n + s.images.length, 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/coliving"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to Co-living"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold">Rooms</h1>
          <span className="ml-auto text-xs text-muted-foreground">{totalPhotos} photos</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {sections.map(({ room, images }) => (
          <section key={room.id} className="mb-14">
            {/* Section label */}
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-base font-bold">{room.title}</h2>
              {room.description && (
                <p className="text-sm text-muted-foreground">{room.description}</p>
              )}
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {images.length} {images.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Masonry-style grid */}
            <div className="columns-2 gap-3 sm:columns-3">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="mb-3 overflow-hidden rounded-xl break-inside-avoid"
                >
                  <Image
                    src={src}
                    alt={`${room.title} — photo ${i + 1}`}
                    width={800}
                    height={600}
                    className="w-full object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {totalPhotos === 0 && (
          <p className="py-24 text-center text-sm text-muted-foreground">
            No photos yet.
          </p>
        )}

        {/* CTA */}
        <div className="mt-4 border-t border-border pt-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Ready to book your room?
          </p>
          <Link
            href="/coliving/apply"
            className="inline-flex items-center justify-center rounded-lg border border-neon bg-neon px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon"
          >
            Apply to Live
          </Link>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  )
}
