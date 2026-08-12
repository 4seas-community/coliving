import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Markdown } from '@/components/coliving/markdown'
import { InternalGate } from '@/components/coliving/internal-gate'
import { getGuide } from '@/lib/queries'
import { hasInternalAccess } from './actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Resident Onboarding // 4SEAS',
  description: 'Private resident onboarding guide.',
  robots: { index: false, follow: false },
}

export default async function WelcomeInternalPage() {
  const unlocked = await hasInternalAccess()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {unlocked ? <UnlockedGuide /> : <InternalGate />}
      </main>
      <SiteFooter />
    </div>
  )
}

async function UnlockedGuide() {
  const guide = await getGuide('welcome-internal')

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="mb-6 inline-flex items-center gap-2 border border-neon/40 bg-card px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-neon">
        <span className="diamond size-2 bg-neon" />
        Private &middot; Residents Only
      </p>
      {guide ? (
        <Markdown content={guide.content} />
      ) : (
        <p className="text-muted-foreground">Onboarding content coming soon.</p>
      )}
    </div>
  )
}
