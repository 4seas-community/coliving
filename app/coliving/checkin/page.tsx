import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckinGuide } from '@/components/coliving/checkin-guide'
import { getSiteSetting } from '@/lib/queries'
import { DEFAULT_CHECKIN_GUIDE, SITE_SETTINGS_KEYS, type CheckinGuideContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Check-in Info // 4SEAS',
  description: 'Private guest check-in and arrival information.',
  // Open to anyone with the link since 2026-08-12 — arriving guests were
  // bouncing off the password prompt. Still kept out of search results:
  // unlisted, not public.
  robots: { index: false, follow: false },
}

export default async function CheckinPage() {
  const saved = await getSiteSetting<Partial<CheckinGuideContent>>(
    SITE_SETTINGS_KEYS.checkinGuide,
  )
  const content: CheckinGuideContent = { ...DEFAULT_CHECKIN_GUIDE, ...saved }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <CheckinGuide content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
