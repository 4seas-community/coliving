import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ApplyForm } from '@/components/coliving/apply-form'
import { getEnabledRooms } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Apply // 4SEAS Chiang Mai Base',
  description: 'A 6-question soul form. Fillable in under 2 minutes.',
}

export default async function ApplyPage() {
  const rooms = await getEnabledRooms()
  const roomOptions = rooms.map((r) => ({
    slug: r.slug,
    title: r.title,
    imageUrl: r.imageUrl,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <ApplyForm roomOptions={roomOptions} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
