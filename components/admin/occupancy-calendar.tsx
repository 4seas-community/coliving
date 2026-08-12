'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import type { Application, Resident, RoomUnit } from '@/lib/db/schema'
import { BUILDING_ORDER, RESIDENT_CATEGORY_META } from '@/lib/config'
import { buildRoomStays, groupStaysByUnit, type RoomStay } from '@/lib/stays'
import { cn } from '@/lib/utils'

const DAY_WIDTH = 34
const LABEL_WIDTH = 200

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function clampDate(d: Date, min: Date, max: Date) {
  if (d < min) return min
  if (d > max) return max
  return d
}

type Bar = {
  left: number
  span: number
  flushLeft: boolean
  flushRight: boolean
}

function computeBar(
  stay: RoomStay,
  monthStart: Date,
  monthEnd: Date,
): Bar | null {
  const checkIn = parseDate(stay.checkIn)
  const checkOut = parseDate(stay.checkOut)
  if (!checkIn) return null

  const rangeEnd = checkOut ?? monthEnd
  const overlaps = checkIn <= monthEnd && rangeEnd >= monthStart
  if (!overlaps) return null

  const start = clampDate(checkIn, monthStart, monthEnd)
  const end = clampDate(rangeEnd, monthStart, monthEnd)
  return {
    left: start.getDate() - 1,
    span: Math.max(1, end.getDate() - start.getDate() + 1),
    flushLeft: checkIn < monthStart,
    flushRight: checkOut ? checkOut > monthEnd : true,
  }
}

export function OccupancyCalendar({
  roomUnits,
  applications,
  residents,
  buildingFilter,
}: {
  roomUnits: RoomUnit[]
  applications: Application[]
  residents: Resident[]
  buildingFilter: string
}) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month, daysInMonth)
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  function goToMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1))
  }

  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const staysByUnit = useMemo(() => {
    const stays = buildRoomStays(applications, residents)
    return groupStaysByUnit(stays)
  }, [applications, residents])

  const buildings = useMemo(() => {
    const set = new Set(roomUnits.map((u) => u.building))
    return BUILDING_ORDER.filter((b) => set.has(b)).concat(
      [...set].filter((b) => !BUILDING_ORDER.includes(b)).sort(),
    )
  }, [roomUnits])

  const groupedUnits = useMemo(() => {
    const filtered = roomUnits
      .filter((u) => u.bookable)
      .filter((u) => buildingFilter === 'all' || u.building === buildingFilter)
    return buildings
      .filter((b) => buildingFilter === 'all' || b === buildingFilter)
      .map((building) => ({
        building,
        units: filtered
          .filter((u) => u.building === building)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter((g) => g.units.length > 0)
  }, [roomUnits, buildings, buildingFilter])

  const gridTemplate = `${LABEL_WIDTH}px repeat(${daysInMonth}, ${DAY_WIDTH}px)`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-neon hover:text-neon"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="mx-1 min-w-[9rem] text-center text-sm font-bold text-foreground">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-neon hover:text-neon"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="ml-2 rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-neon hover:text-neon"
          >
            Today
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-neon" /> Coliving
          </span>
          {Object.entries(RESIDENT_CATEGORY_META).map(([key, meta]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={cn('size-2.5 rounded-sm border', meta.colorClass)} />
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <div style={{ minWidth: LABEL_WIDTH + daysInMonth * DAY_WIDTH }}>
          {/* Day header */}
          <div
            className="sticky top-0 z-20 grid border-b border-border bg-muted/60"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="sticky left-0 z-30 flex items-center bg-muted/60 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Room
            </div>
            {days.map((day) => {
              const date = new Date(year, month, day)
              const isToday = sameDay(date, today)
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              return (
                <div
                  key={day}
                  className={cn(
                    'flex flex-col items-center justify-center border-l border-border py-1.5 text-[10px]',
                    isWeekend && 'bg-background/60',
                    isToday && 'bg-neon/10',
                  )}
                >
                  <span
                    className={cn(
                      'text-muted-foreground',
                      isToday && 'font-bold text-neon',
                    )}
                  >
                    {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                  </span>
                  <span
                    className={cn(
                      'font-bold text-foreground',
                      isToday &&
                        'flex size-4 items-center justify-center rounded-full bg-neon text-[9px] text-primary-foreground',
                    )}
                  >
                    {day}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Body */}
          {groupedUnits.map((group) => (
            <div key={group.building}>
              <div
                className="sticky left-0 z-10 grid border-b border-border bg-card"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="sticky left-0 z-10 bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-neon">
                  {group.building}
                </div>
                <div
                  className="border-l border-border bg-card"
                  style={{ gridColumn: `2 / span ${daysInMonth}` }}
                />
              </div>
              {group.units.map((unit) => {
                const stays = staysByUnit.get(unit.id) ?? []
                const noDateStays = stays.filter((s) => !s.checkIn)
                const datedBars = stays
                  .map((stay) => ({ stay, bar: computeBar(stay, monthStart, monthEnd) }))
                  .filter((x): x is { stay: RoomStay; bar: Bar } => x.bar !== null)
                const stackCount = noDateStays.length + datedBars.length
                const rowHeight = Math.max(44, stackCount * 30 + 12)

                return (
                  <div
                    key={unit.id}
                    className="grid border-b border-border last:border-0 hover:bg-muted/20"
                    style={{ gridTemplateColumns: gridTemplate, minHeight: rowHeight }}
                  >
                    <div className="sticky left-0 z-10 flex items-center justify-between gap-2 border-r border-border bg-card px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {unit.roomNo}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {unit.roomType}
                        </p>
                      </div>
                    </div>
                    <div
                      className="relative"
                      style={{
                        gridColumn: `2 / span ${daysInMonth}`,
                        height: rowHeight,
                      }}
                    >
                      {/* background day grid lines */}
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${daysInMonth}, ${DAY_WIDTH}px)`,
                        }}
                      >
                        {days.map((day) => {
                          const date = new Date(year, month, day)
                          const isWeekend =
                            date.getDay() === 0 || date.getDay() === 6
                          const isToday = sameDay(date, today)
                          return (
                            <div
                              key={day}
                              className={cn(
                                'border-l border-border/60',
                                isWeekend && 'bg-background/60',
                                isToday && 'bg-neon/5',
                              )}
                              style={{ height: rowHeight }}
                            />
                          )
                        })}
                      </div>

                      {noDateStays.map((stay, i) => {
                        const meta =
                          stay.kind === 'resident'
                            ? RESIDENT_CATEGORY_META[stay.category ?? 'other'] ??
                              RESIDENT_CATEGORY_META.other
                            : null
                        return (
                          <div
                            key={stay.id}
                            className={cn(
                              'absolute inset-x-0 flex items-center rounded-md border px-2',
                              meta
                                ? meta.colorClass
                                : 'border-chart-3/40 bg-chart-3/10 text-chart-3',
                            )}
                            style={{
                              top: 6 + i * 30,
                              height: 26,
                            }}
                          >
                            <span className="truncate text-[11px] font-medium">
                              {stay.name} · no dates set
                            </span>
                          </div>
                        )
                      })}

                      {datedBars.map(({ stay, bar }, i) => {
                        const isCommunity = stay.kind === 'resident'
                        const meta = isCommunity
                          ? RESIDENT_CATEGORY_META[stay.category ?? 'other'] ??
                            RESIDENT_CATEGORY_META.other
                          : null
                        return (
                          <div
                            key={stay.id}
                            className={cn(
                              'absolute flex items-center gap-1 overflow-hidden border px-2',
                              meta
                                ? meta.colorClass
                                : 'border-neon/50 bg-neon/15 text-neon',
                              bar.flushLeft ? 'rounded-l-none' : 'rounded-l-md',
                              bar.flushRight ? 'rounded-r-none' : 'rounded-r-md',
                            )}
                            style={{
                              left: bar.left * DAY_WIDTH,
                              width: bar.span * DAY_WIDTH,
                              top: 6 + (noDateStays.length + i) * 30,
                              height: 26,
                            }}
                            title={`${stay.name}: ${stay.checkIn ?? '?'} → ${
                              stay.checkOut ?? 'ongoing'
                            }`}
                          >
                            {!meta && <UserRound className="size-3 shrink-0" />}
                            <span className="truncate text-[11px] font-bold">
                              {stay.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {groupedUnits.length === 0 && (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
              No rooms match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
