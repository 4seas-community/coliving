import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckinGate } from '@/components/coliving/checkin-gate'
import { CheckinGuide } from '@/components/coliving/checkin-guide'
import { getSiteSetting } from '@/lib/queries'
import { DEFAULT_CHECKIN_GUIDE, SITE_SETTINGS_KEYS, type CheckinGuideContent } from '@/lib/site-content'
import { hasCheckinAccess } from './actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Check-in Info // 4SEAS',
  description: 'Private guest check-in and arrival information.',
  robots: { index: false, follow: false },
}

export default async function CheckinPage() {
  const unlocked = await hasCheckinAccess()
  const saved = unlocked
    ? await getSiteSetting<Partial<CheckinGuideContent>>(SITE_SETTINGS_KEYS.checkinGuide)
    : null
  const content: CheckinGuideContent = { ...DEFAULT_CHECKIN_GUIDE, ...saved }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {unlocked ? <CheckinGuide content={content} /> : <CheckinGate />}
      </main>
      <SiteFooter />
    </div>
  )
}
