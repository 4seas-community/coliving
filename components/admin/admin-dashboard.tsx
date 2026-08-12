'use client'

import { useState } from 'react'
import { Inbox, BookOpen, BedDouble, Settings2, Terminal, Users } from 'lucide-react'
import type {
  Application,
  EmailTemplate,
  Resident,
  Room,
  RoomUnit,
  StatusLog,
} from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { ApplicantsTab } from '@/components/admin/applicants-tab'
import { OccupancyTab } from '@/components/admin/occupancy-tab'
import { ManageResidentsTab } from '@/components/admin/manage-residents-tab'
import { KnowledgeHubTab } from '@/components/admin/knowledge-hub-tab'
import { SettingsTab } from '@/components/admin/settings-tab'
import type { CheckinGuideContent, ColivingImages } from '@/lib/site-content'

type Tab =
  | 'application-hub'
  | 'occupancy'
  | 'manage-residents'
  | 'knowledge-hub'
  | 'settings'

export function AdminDashboard({
  secret,
  applications,
  rooms,
  roomUnits,
  residents,
  templates,
  statusLogs,
  chiangmaiContent,
  internalContent,
  checkinGuide,
  colivingImages,
}: {
  secret: string
  applications: Application[]
  rooms: Room[]
  roomUnits: RoomUnit[]
  residents: Resident[]
  templates: EmailTemplate[]
  statusLogs: StatusLog[]
  chiangmaiContent: string
  internalContent: string
  checkinGuide: CheckinGuideContent
  colivingImages: ColivingImages
}) {
  const [tab, setTab] = useState<Tab>('application-hub')
  const [focusApplicantId, setFocusApplicantId] = useState<number | null>(null)

  function goToApplicant(id: number) {
    setFocusApplicantId(id)
    setTab('application-hub')
  }

  const nav: { id: Tab; label: string; icon: typeof Inbox }[] = [
    { id: 'application-hub', label: 'Application Hub', icon: Inbox },
    { id: 'occupancy', label: 'Occupancy', icon: BedDouble },
    { id: 'manage-residents', label: 'Manage Residents', icon: Users },
    { id: 'knowledge-hub', label: 'Knowledge Hub', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="border-b border-border bg-card md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 border-b border-border px-5 py-5 text-neon">
          <Terminal className="size-5" />
          <span className="font-bold tracking-tight text-foreground">
            4SEAS<span className="text-neon">/admin</span>
          </span>
        </div>
        <nav className="flex gap-1 p-3 md:flex-col">
          {nav.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors md:flex-none',
                  active
                    ? 'border-neon bg-neon/10 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-10">
        {tab === 'application-hub' && (
          <ApplicantsTab
            secret={secret}
            applications={applications}
            templates={templates}
            roomUnits={roomUnits}
            statusLogs={statusLogs}
            focusApplicantId={focusApplicantId}
            onFocusHandled={() => setFocusApplicantId(null)}
          />
        )}
        {tab === 'occupancy' && (
          <OccupancyTab
            secret={secret}
            roomUnits={roomUnits}
            applications={applications}
            residents={residents}
            onSelectApplicant={goToApplicant}
          />
        )}
        {tab === 'manage-residents' && (
          <ManageResidentsTab
            secret={secret}
            residents={residents}
            applications={applications}
            roomUnits={roomUnits}
            onSelectApplicant={goToApplicant}
          />
        )}
        {tab === 'knowledge-hub' && (
          <KnowledgeHubTab
            secret={secret}
            templates={templates}
            chiangmaiContent={chiangmaiContent}
            internalContent={internalContent}
          />
        )}
        {tab === 'settings' && (
          <SettingsTab
            secret={secret}
            rooms={rooms}
            checkinGuide={checkinGuide}
            colivingImages={colivingImages}
          />
        )}
      </main>
    </div>
  )
}
