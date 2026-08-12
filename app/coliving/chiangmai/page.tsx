import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Markdown } from '@/components/coliving/markdown'
import { getGuide } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Chiang Mai Guide // 4SEAS',
  description: 'A curated local field guide from the residents of the 4Seas Base.',
}

export default async function ChiangMaiPage() {
  const guide = await getGuide('chiangmai')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-6 inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-neon">
            <span className="diamond size-2 bg-neon" />
            Public Field Guide
          </p>
          {guide ? (
            <Markdown content={guide.content} />
          ) : (
            <p className="text-muted-foreground">
              The guide is being written. Check back soon.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
