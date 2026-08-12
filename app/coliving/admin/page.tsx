import type { Metadata } from 'next'
import {
  getApplications,
  getEmailTemplates,
  getGuide,
  getResidents,
  getRoomUnits,
  getRooms,
  getSiteSetting,
  getStatusLogs,
} from '@/lib/queries'
import {
  DEFAULT_CHECKIN_GUIDE,
  DEFAULT_COLIVING_IMAGES,
  SITE_SETTINGS_KEYS,
  type CheckinGuideContent,
  type ColivingImages,
} from '@/lib/site-content'
import { hasAdminAccess } from '@/app/coliving/admin/actions'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLock } from '@/components/admin/admin-lock'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin // 4SEAS',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  if (!(await hasAdminAccess())) {
    return <AdminLock />
  }

  const [
    applications,
    rooms,
    roomUnits,
    residents,
    templates,
    statusLogs,
    chiangmai,
    internal,
    savedCheckinGuide,
    savedColivingImages,
  ] = await Promise.all([
    getApplications(),
    getRooms(),
    getRoomUnits(),
    getResidents(),
    getEmailTemplates(),
    getStatusLogs(),
    getGuide('chiangmai'),
    getGuide('welcome-internal'),
    getSiteSetting<Partial<CheckinGuideContent>>(SITE_SETTINGS_KEYS.checkinGuide),
    getSiteSetting<Partial<ColivingImages>>(SITE_SETTINGS_KEYS.colivingImages),
  ])

  return (
    <AdminDashboard
      secret=""
      applications={applications}
      rooms={rooms}
      roomUnits={roomUnits}
      residents={residents}
      templates={templates}
      statusLogs={statusLogs}
      chiangmaiContent={chiangmai?.content ?? ''}
      internalContent={internal?.content ?? ''}
      checkinGuide={{ ...DEFAULT_CHECKIN_GUIDE, ...savedCheckinGuide }}
      colivingImages={{ ...DEFAULT_COLIVING_IMAGES, ...savedColivingImages }}
    />
  )
}
