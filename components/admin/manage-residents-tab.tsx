'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Application, Resident, RoomUnit } from '@/lib/db/schema'
import { deleteResident } from '@/app/coliving/admin/actions'
import { formatAdminDate } from '@/lib/admin-utils'
import {
  PAYMENT_METHOD_META,
  RESIDENT_CATEGORY_META,
  RESIDENT_FILTER_CATEGORIES,
} from '@/lib/config'
import { ResidentDialog } from '@/components/admin/resident-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PAYMENT_METHOD_ICON: Record<string, typeof Banknote> = {
  cash: Banknote,
  qr: QrCode,
  crypto: CircleDollarSign,
}

function PaymentBadge({
  paid,
  paymentMethod,
}: {
  paid: boolean | null
  paymentMethod: string | null
}) {
  if (!paid) {
    return (
      <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
        Unpaid
      </span>
    )
  }
  const Icon = paymentMethod ? PAYMENT_METHOD_ICON[paymentMethod] : undefined
  const label = paymentMethod
    ? PAYMENT_METHOD_META[paymentMethod]?.label ?? paymentMethod
    : null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/50 bg-neon/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon">
      {Icon && <Icon className="size-3" />}
      Paid{label ? ` · ${label}` : ''}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const meta = RESIDENT_CATEGORY_META[category] ?? RESIDENT_CATEGORY_META.other
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
        meta.colorClass,
      )}
    >
      {meta.label}
    </span>
  )
}

// A "resident row" unifies coliving applicants (approved + assigned to a
// room via the Application Hub) with manually recorded residents, so this
// view is a single source of truth for "who is staying where" regardless
// of which flow they came through.
type ResidentRow = {
  key: string
  roomUnitId: number
  name: string
  category: string
  checkIn: string | null
  checkOut: string | null
  amount: number | null
  amountUnit: string | null
  paid: boolean | null
  paymentMethod: string | null
  source: 'application' | 'manual'
  applicationId?: number
  resident?: Resident
}

export function ManageResidentsTab({
  secret,
  residents,
  applications,
  roomUnits,
  onSelectApplicant,
}: {
  secret: string
  residents: Resident[]
  applications: Application[]
  roomUnits: RoomUnit[]
  onSelectApplicant?: (id: number) => void
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Resident | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const [, bump] = useState(0)
  const refresh = () => bump((n) => n + 1)

  const unitById = new Map(roomUnits.map((u) => [u.id, u]))

  const rows: ResidentRow[] = useMemo(() => {
    const coliving: ResidentRow[] = applications
      .filter((a) => a.status === 'Approved' && a.roomUnitId != null)
      .map((a) => ({
        key: `app-${a.id}`,
        roomUnitId: a.roomUnitId as number,
        name: a.name,
        category: 'coliving',
        checkIn: a.checkInDate,
        checkOut: a.checkOutDate,
        amount: null,
        amountUnit: null,
        paid: null,
        paymentMethod: null,
        source: 'application',
        applicationId: a.id,
      }))

    const manual: ResidentRow[] = residents.map((r) => ({
      key: `res-${r.id}`,
      roomUnitId: r.roomUnitId,
      name: r.name,
      category: r.category,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      amount: r.amount,
      amountUnit: r.amountUnit,
      paid: r.paid,
      paymentMethod: r.paymentMethod,
      source: 'manual',
      resident: r,
    }))

    return [...coliving, ...manual]
  }, [applications, residents])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      counts.set(row.category, (counts.get(row.category) ?? 0) + 1)
    }
    return counts
  }, [rows])

  const filteredRows = useMemo(() => {
    if (categoryFilter === 'all') return rows
    return rows.filter((r) => r.category === categoryFilter)
  }, [rows, categoryFilter])

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(resident: Resident) {
    setEditing(resident)
    setDialogOpen(true)
  }

  function handleDelete(resident: Resident) {
    setPendingDeleteId(resident.id)
    startTransition(async () => {
      const result = await deleteResident(secret, resident.id)
      setPendingDeleteId(null)
      if (!result.ok) {
        toast.error('Failed to remove resident.')
        return
      }
      toast.success(`${resident.name} removed`)
      refresh()
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-neon">{'// '}</span>Manage Residents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone currently on the books, coliving applicants and manual
            occupants alike, in one place — filter by category to see who's
            who.
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Add Resident
        </Button>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          active={categoryFilter === 'all'}
          onClick={() => setCategoryFilter('all')}
          count={rows.length}
        >
          All
        </FilterPill>
        {RESIDENT_FILTER_CATEGORIES.map((c) => {
          const count = categoryCounts.get(c) ?? 0
          if (count === 0) return null
          return (
            <FilterPill
              key={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
              count={count}
            >
              {RESIDENT_CATEGORY_META[c]?.label ?? c}
            </FilterPill>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Name</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Room</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Category</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Check-in → Check-out</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Amount</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold">Payment</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-bold" />
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const unit = unitById.get(row.roomUnitId)
              const checkIn = formatAdminDate(row.checkIn)
              const checkOut = formatAdminDate(row.checkOut)
              const isDeleting =
                pending &&
                row.resident != null &&
                pendingDeleteId === row.resident.id
              return (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                    {row.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-bold text-foreground">
                    {unit ? `${unit.building} ${unit.roomNo}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <CategoryBadge category={row.category} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {checkIn && checkOut
                      ? `${checkIn} → ${checkOut}`
                      : checkIn
                        ? `From ${checkIn}`
                        : 'No dates set'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {row.amount != null
                      ? `฿${row.amount.toLocaleString()} / ${row.amountUnit ?? 'day'}`
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {row.source === 'manual' ? (
                      <PaymentBadge
                        paid={row.paid}
                        paymentMethod={row.paymentMethod}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {row.source === 'application' ? (
                        <button
                          type="button"
                          onClick={() =>
                            row.applicationId != null &&
                            onSelectApplicant?.(row.applicationId)
                          }
                          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          View in Application Hub
                          <ArrowUpRight className="size-3.5" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => row.resident && openEdit(row.resident)}
                            aria-label={`Edit ${row.name}`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => row.resident && handleDelete(row.resident)}
                            disabled={isDeleting}
                            aria-label={`Remove ${row.name}`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-sm text-muted-foreground"
                >
                  <Users className="mx-auto mb-2 size-5 text-muted-foreground/60" />
                  No residents match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ResidentDialog
        secret={secret}
        roomUnits={roomUnits}
        resident={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors',
        active
          ? 'border-neon bg-neon/10 text-neon'
          : 'border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
      <span
        className={cn(
          'flex size-4 items-center justify-center rounded-full text-[10px] font-bold',
          active
            ? 'bg-neon text-primary-foreground'
            : 'bg-muted-foreground/15 text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  )
}
