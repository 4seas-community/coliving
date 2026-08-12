'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentMethod, Resident, ResidentCategory, RoomUnit } from '@/lib/db/schema'
import { PAYMENT_METHODS, RESIDENT_CATEGORIES } from '@/lib/db/schema'
import { addResident, updateResident } from '@/app/coliving/admin/actions'
import { PAYMENT_METHOD_META, RESIDENT_CATEGORY_META, BUILDING_ORDER } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FormState = {
  roomUnitId: string
  name: string
  category: ResidentCategory
  checkInDate: string
  checkOutDate: string
  amount: string
  amountUnit: 'day' | 'week' | 'month'
  paid: boolean
  paymentMethod: PaymentMethod
  note: string
}

function emptyForm(defaultRoomUnitId?: number): FormState {
  return {
    roomUnitId: defaultRoomUnitId ? String(defaultRoomUnitId) : '',
    name: '',
    category: 'other',
    checkInDate: '',
    checkOutDate: '',
    amount: '',
    amountUnit: 'day',
    paid: false,
    paymentMethod: 'cash',
    note: '',
  }
}

function formFromResident(resident: Resident): FormState {
  return {
    roomUnitId: String(resident.roomUnitId),
    name: resident.name,
    category: (resident.category as ResidentCategory) ?? 'other',
    checkInDate: resident.checkInDate ?? '',
    checkOutDate: resident.checkOutDate ?? '',
    amount: resident.amount != null ? String(resident.amount) : '',
    amountUnit: (resident.amountUnit as FormState['amountUnit']) ?? 'day',
    paid: resident.paid ?? false,
    paymentMethod: (resident.paymentMethod as PaymentMethod) ?? 'cash',
    note: resident.note ?? '',
  }
}

export function ResidentDialog({
  secret,
  roomUnits,
  resident,
  defaultRoomUnitId,
  open,
  onOpenChange,
  onSaved,
}: {
  secret: string
  roomUnits: RoomUnit[]
  resident?: Resident | null
  defaultRoomUnitId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    resident ? formFromResident(resident) : emptyForm(defaultRoomUnitId),
  )
  const [pending, setPending] = useState(false)

  // Reset the form whenever a different resident is opened for editing, or
  // the dialog is reopened fresh for adding a new one.
  useEffect(() => {
    if (open) {
      setForm(resident ? formFromResident(resident) : emptyForm(defaultRoomUnitId))
    }
  }, [open, resident, defaultRoomUnitId])

  const sortedUnits = [...roomUnits].sort((a, b) => {
    const bi = BUILDING_ORDER.indexOf(a.building) - BUILDING_ORDER.indexOf(b.building)
    if (bi !== 0) return bi
    return a.sortOrder - b.sortOrder
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.roomUnitId) {
      toast.error('Please select a room.')
      return
    }
    if (!form.name.trim()) {
      toast.error('Please enter a name.')
      return
    }

    setPending(true)
    const payload = {
      roomUnitId: Number(form.roomUnitId),
      name: form.name,
      category: form.category,
      checkInDate: form.checkInDate || null,
      checkOutDate: form.checkOutDate || null,
      amount: form.amount ? Number(form.amount) : null,
      amountUnit: form.amount ? form.amountUnit : null,
      paid: form.paid,
      paymentMethod: form.paid ? form.paymentMethod : null,
      note: form.note || null,
    }

    const result = resident
      ? await updateResident(secret, resident.id, payload)
      : await addResident(secret, payload)

    setPending(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(resident ? 'Resident updated' : 'Resident added')
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{resident ? 'Edit Resident' : 'Add Resident'}</DialogTitle>
          <DialogDescription>
            Record a non-coliving occupant — community members, staff,
            friends, or other guests staying in a room.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Room</Label>
              <Select
                value={form.roomUnitId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, roomUnitId: v ?? '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                  {sortedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.building} {unit.roomNo} — {unit.roomType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Resident name"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ResidentCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {RESIDENT_CATEGORY_META[c]?.label ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Amount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                />
                <Select
                  value={form.amountUnit}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, amountUnit: v as FormState['amountUnit'] }))
                  }
                >
                  <SelectTrigger className="w-28 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">/ day</SelectItem>
                    <SelectItem value="week">/ week</SelectItem>
                    <SelectItem value="month">/ month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <Label htmlFor="resident-paid" className="cursor-pointer">
                  Paid
                </Label>
                <Switch
                  id="resident-paid"
                  checked={form.paid}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, paid: checked }))
                  }
                />
              </div>
            </div>

            {form.paid && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Payment Method</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, paymentMethod: v as PaymentMethod }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {PAYMENT_METHOD_META[m]?.label ?? m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Check-in</Label>
              <Input
                type="date"
                value={form.checkInDate}
                onChange={(e) => setForm((f) => ({ ...f, checkInDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Check-out</Label>
              <Input
                type="date"
                value={form.checkOutDate}
                onChange={(e) => setForm((f) => ({ ...f, checkOutDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Note</Label>
              <Textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional note (payment method, context, etc.)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {resident ? 'Save Changes' : 'Add Resident'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
