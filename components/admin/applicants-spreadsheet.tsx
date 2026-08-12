'use client'

import type { Application, RoomUnit } from '@/lib/db/schema'
import { formatAdminDate, statusColor } from '@/lib/admin-utils'
import { cn } from '@/lib/utils'

// Every column shown for each applicant, in display order. Kept as data
// (not hardcoded JSX per column) so the header row and body rows can never
// drift out of sync.
const COLUMNS: {
  key: string
  label: string
  width: string
  sticky?: boolean
  render: (app: Application, assignedUnit?: RoomUnit) => React.ReactNode
}[] = [
  {
    key: 'name',
    label: 'Name',
    width: 'w-[160px]',
    sticky: true,
    render: (app) => <span className="font-bold text-foreground">{app.name}</span>,
  },
  {
    key: 'email',
    label: 'Email',
    width: 'w-[200px]',
    render: (app) => app.email,
  },
  {
    key: 'contactMethod',
    label: 'Contact Method',
    width: 'w-[130px]',
    render: (app) => app.contactMethod || EMPTY,
  },
  {
    key: 'imContact',
    label: 'IM Contact',
    width: 'w-[160px]',
    render: (app) => app.imContact || EMPTY,
  },
  {
    key: 'status',
    label: 'Status',
    width: 'w-[140px]',
    render: (app) => (
      <span
        className={cn(
          'inline-flex rounded border px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
          statusColor(app.status),
        )}
      >
        {app.status}
      </span>
    ),
  },
  {
    key: 'assignedRoom',
    label: 'Assigned Room',
    width: 'w-[130px]',
    render: (_app, assignedUnit) =>
      assignedUnit ? `${assignedUnit.building} ${assignedUnit.roomNo}` : EMPTY,
  },
  {
    key: 'stayDuration',
    label: 'Stay Duration',
    width: 'w-[130px]',
    render: (app) => app.stayDuration || EMPTY,
  },
  {
    key: 'desiredCheckIn',
    label: 'Desired Check-in',
    width: 'w-[140px]',
    render: (app) => app.desiredCheckIn || EMPTY,
  },
  {
    key: 'checkInDate',
    label: 'Check-in Date',
    width: 'w-[130px]',
    render: (app) => formatAdminDate(app.checkInDate) || EMPTY,
  },
  {
    key: 'checkOutDate',
    label: 'Check-out Date',
    width: 'w-[130px]',
    render: (app) => formatAdminDate(app.checkOutDate) || EMPTY,
  },
  {
    key: 'roomPreference',
    label: 'Room Preference',
    width: 'w-[150px]',
    render: (app) => app.roomPreference || EMPTY,
  },
  {
    key: 'occupancy',
    label: 'Occupancy',
    width: 'w-[110px]',
    render: (app) => app.occupancy || EMPTY,
  },
  {
    key: 'roomNote',
    label: 'Room Note',
    width: 'w-[220px]',
    render: (app) => app.roomNote || EMPTY,
  },
  {
    key: 'currentProject',
    label: 'Current Project',
    width: 'w-[220px]',
    render: (app) => app.currentProject || EMPTY,
  },
  {
    key: 'vibe',
    label: 'Vibe / Bio',
    width: 'w-[260px]',
    render: (app) => app.vibe || EMPTY,
  },
  {
    key: 'roomAssignment',
    label: 'Room Assignment Note',
    width: 'w-[200px]',
    render: (app) => app.roomAssignment || EMPTY,
  },
  {
    key: 'contribution',
    label: 'Contribution',
    width: 'w-[220px]',
    render: (app) => app.contribution || EMPTY,
  },
  {
    key: 'internalFeedback',
    label: 'Internal Feedback',
    width: 'w-[220px]',
    render: (app) => app.internalFeedback || EMPTY,
  },
  {
    key: 'tags',
    label: 'Tags',
    width: 'w-[180px]',
    render: (app) => {
      let tags: string[] = []
      try {
        const parsed = JSON.parse(app.tags ?? '[]')
        if (Array.isArray(parsed)) tags = parsed
      } catch {
        tags = []
      }
      if (tags.length === 0) return EMPTY
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )
    },
  },
  {
    key: 'createdAt',
    label: 'Applied',
    width: 'w-[110px]',
    render: (app) => formatAdminDate(app.createdAt) || EMPTY,
  },
]

const EMPTY = <span className="opacity-40">&mdash;</span>

// A dense, Excel-style read-only overview: every applicant field sits in
// its own cell in a single row, with real grid lines and a sticky header +
// sticky first column so wide data stays scannable while scrolling.
export function ApplicantsSpreadsheet({
  applications,
  roomUnitById,
}: {
  applications: Application[]
  roomUnitById: Map<number, RoomUnit>
}) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No applicants to show.
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-xl border border-border bg-card">
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-xs">
        <thead className="sticky top-0 z-20 bg-muted">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'whitespace-nowrap border-b border-r border-border p-2 font-bold uppercase tracking-wide text-muted-foreground',
                  col.width,
                  col.sticky && 'sticky left-0 z-30 bg-muted',
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app, rowIndex) => {
            const assignedUnit =
              app.roomUnitId != null ? roomUnitById.get(app.roomUnitId) : undefined
            const striped = rowIndex % 2 === 1
            return (
              <tr key={app.id} className="group">
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'overflow-hidden truncate border-b border-r border-border p-2 align-top text-foreground/90 transition-colors group-hover:bg-accent',
                      col.width,
                      striped ? 'bg-muted' : 'bg-card',
                      col.sticky && 'sticky left-0 z-10',
                    )}
                  >
                    {col.render(app, assignedUnit)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
