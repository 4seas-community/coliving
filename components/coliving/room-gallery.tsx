'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export function RoomGallery({
  images,
  alt,
  soldOut,
}: {
  images: string[]
  alt: string
  soldOut: boolean
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => { api.off('select', onSelect) }
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="group/gallery relative">
      <CarouselContent className="ml-0">
        {images.map((src, i) => (
          <CarouselItem key={src} className="pl-0">
            <Link
              href="/coliving/rooms"
              className="relative block aspect-[16/7] w-full overflow-hidden focus:outline-none"
              aria-label={`View all room photos`}
            >
              <Image
                src={src || '/placeholder.svg'}
                alt={`${alt} — photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className={cn(
                  'object-cover transition-transform duration-300 hover:scale-[1.02]',
                  soldOut && 'grayscale'
                )}
              />
              {/* Hover hint */}
              <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-hover/gallery:opacity-100">
                <span className="rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
                  View all photos →
                </span>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => { e.preventDefault(); api?.scrollPrev() }}
            className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronLeft className="size-4 text-foreground" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => { e.preventDefault(); api?.scrollNext() }}
            className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronRight className="size-4 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={(e) => { e.preventDefault(); api?.scrollTo(i) }}
                className={cn(
                  'h-1.5 rounded-full bg-background/60 transition-all',
                  current === i ? 'w-5 bg-background' : 'w-1.5'
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  )
}
