'use client'

import { useEffect, useState } from 'react'
import { LayoutList, Table2 } from 'lucide-react'
import type { Application, EmailTemplate, RoomUnit, StatusLog } from '@/lib/db/schema'
import { ApplicantRow } from '@/components/admin/applicant-row'
import { ApplicantsSpreadsheet } from '@/components/admin/applicants-spreadsheet'
import { PipelineFilterTabs, StatsGrid } from '@/components/admin/applicants-tab-sections'
import { cn } from '@/lib/utils'

const PIPELINE_FILTERS = [
  'All',
  'Pending',
  'Need Info',
  'Approved',
  'Rejected',
  'No Room Available',
] as const

type Filter = (typeof PIPELINE_FILTERS)[number]

export function ApplicantsTab({
  secret,
  applications,
  templates,
  roomUnits,
  statusLogs,
  focusApplicantId,
  onFocusHandled,
}: {
  secret: string
  applications: Application[]
  templates: EmailTemplate[]
  roomUnits: RoomUnit[]
  statusLogs: StatusLog[]
  focusApplicantId?: number | null
  onFocusHandled?: () => void
}) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline')

  // When arriving from the Occupancy tab's "waiting for a room" prompt,
  // make sure the target applicant is visible regardless of the current
  // pipeline filter, then let the row handle scrolling/expanding itself.
  useEffect(() => {
    if (!focusApplicantId) return
    const target = applications.find((a) => a.id === focusApplicantId)
    if (target && activeFilter !== 'All' && target.status !== activeFilter) {
      setActiveFilter('All')
    }
    setViewMode('pipeline')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusApplicantId])

  const countByStatus = (status: string) =>
    applications.filter((a) => a.status === status).length

  const stats = [
    { label: 'Total', value: applications.length, accent: true },
    { label: 'Pending', value: countByStatus('Pending') },
    { label: 'Approved', value: countByStatus('Approved') },
    { label: 'Need Info', value: countByStatus('Need Info') },
    { label: 'No Room', value: countByStatus('No Room Available') },
  ]

  const filtered =
    activeFilter === 'All'
      ? applications
      : applications.filter((a) => a.status === activeFilter)

  const occupiedUnitIds = new Set(
    applications
      .filter((a) => a.roomUnitId != null)
      .map((a) => a.roomUnitId as number),
  )
  const roomUnitById = new Map(roomUnits.map((u) => [u.id, u]))

  const logsByApplicationId = new Map<number, typeof statusLogs>()
  for (const log of statusLogs) {
    const existing = logsByApplicationId.get(log.applicationId)
    if (existing) existing.push(log)
    else logsByApplicationId.set(log.applicationId, [log])
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-neon">{'// '}</span>Application Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, route, and reach applicants. Status changes open a contextual
            email toolbar.
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setViewMode('pipeline')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors',
              viewMode === 'pipeline'
                ? 'bg-neon text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutList className="size-3.5" />
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors',
              viewMode === 'table'
                ? 'bg-neon text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Table2 className="size-3.5" />
            Table
          </button>
        </div>
      </header>

      <StatsGrid stats={stats} />

      <PipelineFilterTabs
        filters={PIPELINE_FILTERS}
        activeFilter={activeFilter}
        onSelect={setActiveFilter}
        countFor={(filter) =>
          filter === 'All' ? applications.length : countByStatus(filter)
        }
      />

      {viewMode === 'table' ? (
        <ApplicantsSpreadsheet applications={filtered} roomUnitById={roomUnitById} />
      ) : (
        <div className="overflow-hidden overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="hidden p-3 font-medium lg:table-cell">IM Contact</th>
                <th className="hidden p-3 font-medium xl:table-cell">Project</th>
                <th className="p-3 font-medium">Room</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t border-border">
                  <td
                    colSpan={7}
                    className="p-10 text-center text-sm text-muted-foreground"
                  >
                    {activeFilter === 'All'
                      ? 'No applications yet.'
                      : `No applicants with status "${activeFilter}".`}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <ApplicantRow
                    key={app.id}
                    secret={secret}
                    app={app}
                    templates={templates}
                    roomUnits={roomUnits}
                    assignedUnit={
                      app.roomUnitId != null
                        ? roomUnitById.get(app.roomUnitId)
                        : undefined
                    }
                    occupiedUnitIds={occupiedUnitIds}
                    logs={logsByApplicationId.get(app.id) ?? []}
                    autoOpen={app.id === focusApplicantId}
                    onAutoOpenHandled={onFocusHandled}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
