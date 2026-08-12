import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type { Application, RoomUnit } from '@/lib/db/schema'
import {
  assignRoomUnit,
  markStatusEmailSent,
  skipStatusEmail,
  updateApplication,
  updateResidentRecord,
  updateTags,
} from '@/app/coliving/admin/actions'
import {
  bookableUnitsFor,
  rankRoomUnits,
  TOP_SUGGESTION_COUNT,
} from '@/lib/room-assignment'

// Owns the row's expand/collapse state, plus the "jump here from Occupancy"
// auto-open behavior: expand, scroll into view, briefly highlight, then
// notify the parent so it can clear the one-shot focus request.
export function useExpandableRow(
  autoOpen: boolean | undefined,
  onAutoOpenHandled: (() => void) | undefined,
) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const rowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    if (!autoOpen) return
    setOpen(true)
    setHighlight(true)
    const el = rowRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    const timeout = setTimeout(() => {
      setHighlight(false)
      onAutoOpenHandled?.()
    }, 2000)
    return () => clearTimeout(timeout)
    // Only re-run when a new auto-open request comes in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen])

  return { open, setOpen, highlight, rowRef }
}

// Bundles the room-assignment dropdown's ranked suggestions and the
// mutation used to assign/unassign a room, keeping the ranking algorithm
// itself (in lib/room-assignment) free of any React or persistence concerns.
export function useRoomAssignmentSuggestions(
  secret: string,
  app: Application,
  roomUnits: RoomUnit[],
  occupiedUnitIds: Set<number>,
) {
  const [roomPending, startRoomTransition] = useTransition()

  const assignableUnits = useMemo(
    () => bookableUnitsFor(roomUnits, occupiedUnitIds, app.roomUnitId),
    [roomUnits, occupiedUnitIds, app.roomUnitId],
  )

  const ranked = useMemo(
    () => rankRoomUnits(app, assignableUnits),
    [app, assignableUnits],
  )

  const suggestedIds = useMemo(
    () => new Set(ranked.slice(0, TOP_SUGGESTION_COUNT).map((r) => r.unit.id)),
    [ranked],
  )

  function assignRoom(idStr: string | null) {
    const unitId = idStr && idStr !== 'none' ? Number(idStr) : null
    startRoomTransition(async () => {
      await assignRoomUnit(secret, app.id, unitId)
    })
  }

  return { ranked, suggestedIds, roomPending, assignRoom }
}

// Status + stay-dates editor: persists via `updateApplication` and tracks
// whether the quick-reach email toolbar should be visible.
export function useApplicationStatus(secret: string, app: Application) {
  const [status, setStatus] = useState(app.status)
  const [checkIn, setCheckIn] = useState(app.checkInDate ?? app.desiredCheckIn ?? '')
  const [checkOut, setCheckOut] = useState(app.checkOutDate ?? '')
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function persist(next: Partial<Application>) {
    startTransition(async () => {
      await updateApplication(secret, app.id, {
        status: (next.status ?? status) as string,
        checkInDate: next.checkInDate ?? checkIn ?? null,
        checkOutDate: next.checkOutDate ?? checkOut ?? null,
      })
    })
  }

  function onStatusChange(value: string | null) {
    if (!value) return
    setStatus(value)
    setToolbarOpen(true)
    persist({ status: value })
  }

  function commitCheckIn() {
    persist({ checkInDate: checkIn })
  }

  function commitCheckOut() {
    persist({ checkOutDate: checkOut })
  }

  // Fire-and-forget: flags the just-created log entry once the admin
  // actually opens the mailto link, without blocking navigation to it.
  function markEmailSent() {
    void markStatusEmailSent(secret, app.id)
  }

  // Explicit "update without email" acknowledgement — closes the
  // quick-reach toolbar and leaves a note on the log entry so the skip
  // is recorded rather than just disappearing.
  function skipEmail() {
    setToolbarOpen(false)
    void skipStatusEmail(secret, app.id)
  }

  return {
    status,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    toolbarOpen,
    pending,
    onStatusChange,
    commitCheckIn,
    commitCheckOut,
    markEmailSent,
    skipEmail,
  }
}

// Private admin notes (room assignment text, contribution, internal
// feedback) — separate from the structured room-unit assignment above.
export function useResidentRecordForm(secret: string, app: Application) {
  const [roomAssignment, setRoomAssignment] = useState(app.roomAssignment ?? '')
  const [contribution, setContribution] = useState(app.contribution ?? '')
  const [internalFeedback, setInternalFeedback] = useState(
    app.internalFeedback ?? '',
  )
  const [message, setMessage] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null)
  const [pending, startTransition] = useTransition()

  function clearMessage() {
    setMessage(null)
  }

  function save() {
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await updateResidentRecord(secret, app.id, {
          roomAssignment,
          contribution,
          internalFeedback,
        })
        setMessage(
          result.ok
            ? { type: 'success', text: 'Resident record saved.' }
            : { type: 'error', text: result.error },
        )
      } catch {
        setMessage({
          type: 'error',
          text: 'Unable to save. Please try again.',
        })
      }
    })
  }

  return {
    roomAssignment,
    setRoomAssignment: (value: string) => {
      setRoomAssignment(value)
      clearMessage()
    },
    contribution,
    setContribution: (value: string) => {
      setContribution(value)
      clearMessage()
    },
    internalFeedback,
    setInternalFeedback: (value: string) => {
      setInternalFeedback(value)
      clearMessage()
    },
    message,
    pending,
    save,
  }
}

// Freeform tag chips, persisted immediately on add/remove.
export function useTagEditor(secret: string, app: Application) {
  const [tags, setTags] = useState<string[]>(() => {
    try {
      return app.tags ? (JSON.parse(app.tags) as string[]) : []
    } catch {
      return []
    }
  })
  const [tagInput, setTagInput] = useState('')
  const [pending, startTransition] = useTransition()

  function persist(next: string[]) {
    startTransition(async () => {
      await updateTags(secret, app.id, next)
    })
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag)) return
    const next = [...tags, tag]
    setTags(next)
    setTagInput('')
    persist(next)
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    persist(next)
  }

  return { tags, tagInput, setTagInput, pending, addTag, removeTag }
}
