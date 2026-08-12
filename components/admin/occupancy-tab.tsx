'use client'

import { useMemo, useState, useTransition } from 'react'
import { CalendarRange, Loader2, TableProperties, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Application, Resident, RoomUnit } from '@/lib/db/schema'
import { assignRoomUnit } from '@/app/coliving/admin/actions'
import { OccupancyCalendar } from '@/components/admin/occupancy-calendar'
import { formatAdminDate } from '@/lib/admin-utils'
import { RESIDENT_CATEGORY_META } from '@/lib/config'
import { BUILDING_ORDER } from '@/lib/config'
import { buildRoomStays, isStayActiveOn } from '@/lib/stays'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function AssignCell({
  secret,
  unit,
  resident,
  assignable,
  onChanged,
}: {
  secret: string
  unit: RoomUnit
  resident: Application | undefined
  assignable: Application[]
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()

  function assign(idStr: string | null) {
    if (!idStr) return
    const appId = Number(idStr)
    startTransition(async () => {
      await assignRoomUnit(secret, appId, unit.id)
      onChanged()
    })
  }

  function unassign() {
    if (!resident) return
    startTransition(async () => {
      await assignRoomUnit(secret, resident.id, null)
      onChanged()
      toast.success(`${resident.name} unassigned`)
    })
  }

  if (!unit.bookable) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  if (resident) {
    const checkIn = formatAdminDate(resident.checkInDate)
    const checkOut = formatAdminDate(resident.checkOutDate)
    return (
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">
            {resident.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {checkIn && checkOut
              ? `${checkIn} → ${checkOut}`
              : checkIn
                ? `From ${checkIn}`
                : 'No dates set'}
          </p>
        </div>
        <button
          type="button"
          onClick={unassign}
          disabled={pending}
          aria-label={`Unassign ${resident.name}`}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={assign} value="">
        <SelectTrigger className="h-8 w-full min-w-[160px] text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <UserRound className="size-3.5" />
            <SelectValue placeholder="Assign resident..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {assignable.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No unassigned approved applicants
            </div>
          ) : (
            assignable.map((app) => (
              <SelectItem key={app.id} value={String(app.id)}>
                {app.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 shrink-0 animate-spin text-neon" />}
    </div>
  )
}

export function OccupancyTab({
  secret,
  roomUnits,
  applications,
  residents,
  onSelectApplicant,
}: {
  secret: string
  roomUnits: RoomUnit[]
  applications: Application[]
  residents: Resident[]
  onSelectApplicant?: (id: number) => void
}) {
  // Client-side revalidation is handled by the server actions'
  // revalidatePath call — this key just forces a light re-render nudge.
  const [, bump] = useState(0)
  const refresh = () => bump((n) => n + 1)

  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'occupied' | 'vacant'
  >('all')
  const [view, setView] = useState<'table' | 'calendar'>('table')

  const approved = useMemo(
    () => applications.filter((a) => a.status === 'Approved'),
    [applications],
  )

  const unassignedApproved = useMemo(
    () => approved.filter((a) => !a.roomUnitId),
    [approved],
  )

  const residentByUnit = useMemo(() => {
    const map = new Map<number, Application>()
    for (const app of approved) {
      if (app.roomUnitId) map.set(app.roomUnitId, app)
    }
    return map
  }, [approved])

  // Manual residents currently occupying (i.e. active today) a room —
  // used for the Status column / occupancy stats alongside coliving
  // applicants, so front-desk staff see one accurate occupied/vacant count.
  const activeManualResidentByUnit = useMemo(() => {
    const today = new Date()
    const map = new Map<number, Resident>()
    for (const stay of buildRoomStays([], residents)) {
      if (isStayActiveOn(stay, today)) {
        map.set(stay.roomUnitId, residents.find((r) => r.id === stay.residentId)!)
      }
    }
    return map
  }, [residents])

  const bookableUnits = useMemo(
    () => roomUnits.filter((u) => u.bookable),
    [roomUnits],
  )

  const totalUnits = bookableUnits.length
  const occupiedUnits = bookableUnits.filter(
    (u) => residentByUnit.has(u.id) || activeManualResidentByUnit.has(u.id),
  ).length
  const vacantUnits = totalUnits - occupiedUnits
  const occupancyRate =
    totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100)

  const stats = [
    { label: 'Total Rooms', value: totalUnits, accent: true },
    { label: 'Occupied', value: occupiedUnits },
    { label: 'Vacant', value: vacantUnits },
    { label: 'Occupancy Rate', value: `${occupancyRate}%` },
  ]

  const buildings = useMemo(() => {
    const set = new Set(roomUnits.map((u) => u.building))
    return BUILDING_ORDER.filter((b) => set.has(b)).concat(
      [...set].filter((b) => !BUILDING_ORDER.includes(b)).sort(),
    )
  }, [roomUnits])

  const sortedUnits = useMemo(() => {
    return [...roomUnits]
      .sort((a, b) => {
        const bi =
          BUILDING_ORDER.indexOf(a.building) -
          BUILDING_ORDER.indexOf(b.building)
        if (bi !== 0) return bi
        return a.sortOrder - b.sortOrder
      })
      .filter((u) => buildingFilter === 'all' || u.building === buildingFilter)
      .filter((u) => {
        if (statusFilter === 'all') return true
        if (!u.bookable) return false
        const occupied =
          residentByUnit.has(u.id) || activeManualResidentByUnit.has(u.id)
        return statusFilter === 'occupied' ? occupied : !occupied
      })
  }, [
    roomUnits,
    buildingFilter,
    statusFilter,
    residentByUnit,
    activeManualResidentByUnit,
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-neon">{'// '}</span>Occupancy
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live room status across all buildings, like a front desk ledger.
          Approved applicants from the Application Hub can be assigned to a
          room below.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
            <p
              className={cn(
                'mt-2 text-3xl font-bold',
                s.accent ? 'text-neon neon-text' : 'text-foreground',
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {unassignedApproved.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-chart-3/40 bg-chart-3/10 p-3 text-xs text-chart-3">
          <UserRound className="size-4 shrink-0" />
          <span className="font-medium">
            {unassignedApproved.length} approved applicant
            {unassignedApproved.length > 1 ? 's' : ''} waiting for a room
            assignment:
          </span>
          <span className="flex flex-wrap items-center gap-x-1.5">
            {unassignedApproved.map((a, i) => (
              <span key={a.id} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectApplicant?.(a.id)}
                  className="font-bold underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
                >
                  {a.name}
                </button>
                {i < unassignedApproved.length - 1 && (
                  <span className="ml-1.5 font-normal text-chart-3/70">,</span>
                )}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill
            active={buildingFilter === 'all'}
            onClick={() => setBuildingFilter('all')}
          >
            All Buildings
          </FilterPill>
          {buildings.map((b) => (
            <FilterPill
              key={b}
              active={buildingFilter === b}
              onClick={() => setBuildingFilter(b)}
            >
              {b}
            </FilterPill>
          ))}
          {view === 'table' && (
            <>
              <span className="mx-1 h-4 w-px bg-border" />
              <FilterPill
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </FilterPill>
              <FilterPill
                active={statusFilter === 'occupied'}
                onClick={() => setStatusFilter('occupied')}
              >
                Occupied
              </FilterPill>
              <FilterPill
                active={statusFilter === 'vacant'}
                onClick={() => setStatusFilter('vacant')}
              >
                Vacant
              </FilterPill>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors',
                view === 'table'
                  ? 'bg-neon text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <TableProperties className="size-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors',
                view === 'calendar'
                  ? 'bg-neon text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <CalendarRange className="size-3.5" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' && (
        <OccupancyCalendar
          roomUnits={roomUnits}
          applications={applications}
          residents={residents}
          buildingFilter={buildingFilter}
        />
      )}

      {/* Table */}
      {view === 'table' && (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Building
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Room No.
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Room Type
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Sqm
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Bed Type
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Bathroom
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Pax</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Notes
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Status
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                Resident / Assign
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUnits.map((unit) => {
              const resident = residentByUnit.get(unit.id)
              const manualResident = activeManualResidentByUnit.get(unit.id)
              const notBookable = !unit.bookable
              return (
                <tr
                  key={unit.id}
                  className={cn(
                    'border-b border-border last:border-0',
                    notBookable && 'bg-muted/30',
                  )}
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.building}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-bold text-foreground">
                    {unit.roomNo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.roomType}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.sizeSqm ? `${unit.sizeSqm} m²` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.bedType ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.bathroom ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.pax ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {unit.specialNotes ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {notBookable ? (
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Not Bookable
                      </span>
                    ) : resident ? (
                      <span className="rounded-full border border-neon/50 bg-neon/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon">
                        Occupied
                      </span>
                    ) : manualResident ? (
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                          (
                            RESIDENT_CATEGORY_META[manualResident.category] ??
                            RESIDENT_CATEGORY_META.other
                          ).colorClass,
                        )}
                      >
                        Occupied
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Vacant
                      </span>
                    )}
                  </td>
                  <td className="min-w-[220px] px-3 py-2.5">
                    {!notBookable && !resident && manualResident ? (
                      <p className="text-sm font-bold text-foreground">
                        {manualResident.name}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          (manual resident)
                        </span>
                      </p>
                    ) : (
                      <AssignCell
                        secret={secret}
                        unit={unit}
                        resident={resident}
                        assignable={unassignedApproved}
                        onChanged={refresh}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
            {sortedUnits.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-10 text-center text-sm text-muted-foreground"
                >
                  No rooms match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors',
        active
          ? 'border-neon bg-neon/10 text-neon'
          : 'border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
