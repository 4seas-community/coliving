'use client'

import {
  Loader2,
  Mail,
  Send,
  Calendar,
  Save,
  Check,
  Tag,
  X,
  BedDouble,
  Sparkles,
  History,
  MailX,
  ArrowRight,
} from 'lucide-react'
import type { Application, RoomUnit, StatusLog } from '@/lib/db/schema'
import type { RankedRoomUnit } from '@/lib/room-assignment'
import { formatAdminDate } from '@/lib/admin-utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Inline check-in/check-out scheduler shown once an applicant is Approved.
export function StayScheduler({
  checkIn,
  onCheckInChange,
  onCheckInCommit,
  checkOut,
  onCheckOutChange,
  onCheckOutCommit,
}: {
  checkIn: string
  onCheckInChange: (value: string) => void
  onCheckInCommit: () => void
  checkOut: string
  onCheckOutChange: (value: string) => void
  onCheckOutCommit: () => void
}) {
  return (
    <tr className="bg-card/50">
      <td colSpan={7} className="px-3 pb-3">
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-neon/30 bg-card p-3">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon">
            <Calendar className="size-4" /> Stay
          </span>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Check-in
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              onBlur={onCheckInCommit}
              className="h-8 w-auto"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Check-out
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              onBlur={onCheckOutCommit}
              className="h-8 w-auto"
            />
          </label>
        </div>
      </td>
    </tr>
  )
}

// Quick-reach action bar: appears after a status change to Need Info or
// Approved, so the admin can immediately send the matching email.
export function QuickReachToolbar({
  status,
  needInfoMail,
  approvedMail,
  approvedReady,
  chat,
  onEmailLinkClick,
  onSkipEmail,
}: {
  status: string
  needInfoMail: string
  approvedMail: string
  approvedReady: boolean
  chat: { href: string; label: string } | null
  onEmailLinkClick: () => void
  onSkipEmail: () => void
}) {
  return (
    <tr className="bg-card/50">
      <td colSpan={7} className="px-3 pb-3">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3">
          {status === 'Need Info' && (
            <a
              href={needInfoMail}
              onClick={onEmailLinkClick}
              className="inline-flex items-center gap-2 rounded-lg border border-neon bg-neon px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon"
            >
              <Mail className="size-4" /> Send Info Request Email
            </a>
          )}
          {status === 'Approved' && (
            <a
              href={approvedReady ? approvedMail : undefined}
              onClick={approvedReady ? onEmailLinkClick : undefined}
              aria-disabled={!approvedReady}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors',
                approvedReady
                  ? 'border-neon bg-neon text-primary-foreground hover:bg-transparent hover:text-neon'
                  : 'pointer-events-none border-border bg-card text-muted-foreground',
              )}
            >
              <Send className="size-4" /> Send Welcome Onboarding Email
            </a>
          )}
          {status === 'Approved' && !approvedReady && (
            <span className="text-xs text-muted-foreground">
              Set check-in &amp; check-out dates to enable.
            </span>
          )}
          {chat && (
            <a
              href={chat.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-neon hover:text-neon"
            >
              <Send className="size-4" /> {chat.label}
            </a>
          )}
          <button
            type="button"
            onClick={onSkipEmail}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <MailX className="size-4" /> Update Without Email
          </button>
        </div>
      </td>
    </tr>
  )
}

// Chronological record of every status change for this applicant — from
// status, to status, whether an email actually went out, and any note —
// so progress is auditable at a glance instead of only showing the
// current state.
export function StatusHistory({ logs }: { logs: StatusLog[] }) {
  if (logs.length === 0) return null

  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <History className="size-4 text-neon" />
        Activity Log
      </h3>
      <ol className="mt-3 flex flex-col gap-2.5">
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-wrap items-center gap-2 border-t border-border pt-2.5 text-xs first:border-t-0 first:pt-0"
          >
            <span className="font-mono text-muted-foreground/70">
              {formatAdminDate(log.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              {log.fromStatus ?? 'Created'}
              <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
              {log.toStatus}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                log.emailSent
                  ? 'border-neon/50 bg-neon/10 text-neon'
                  : 'border-border text-muted-foreground',
              )}
            >
              {log.emailSent ? (
                <Mail className="size-3" />
              ) : (
                <MailX className="size-3" />
              )}
              {log.emailSent ? 'Email sent' : 'No email'}
            </span>
            {log.note && (
              <span className="text-muted-foreground">— {log.note}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

// Read-only grid of the applicant's original form answers.
export function ApplicantAnswers({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Currently building
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {app.currentProject || '—'}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Vibe &amp; contribution
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {app.vibe || '—'}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Requested stay
        </p>
        <p className="text-sm text-muted-foreground">
          {app.stayDuration || '—'}
          {app.desiredCheckIn && (
            <>
              {' · from '}
              <span className="text-foreground">{app.desiredCheckIn}</span>
            </>
          )}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Room preference
        </p>
        <p className="text-sm capitalize text-muted-foreground">
          {app.roomPreference || '—'}
          {app.occupancy && (
            <span className="ml-1 text-xs text-muted-foreground/70">
              ({app.occupancy})
            </span>
          )}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Reach via
        </p>
        <p className="text-sm text-muted-foreground">
          {app.contactMethod
            ? `${app.contactMethod}: ${app.imContact || '—'}`
            : app.imContact || '—'}
        </p>
      </div>
      <div className="md:col-span-2">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neon">
          Special requests
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {app.roomNote || '—'}
        </p>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs text-muted-foreground">
          Applied {formatAdminDate(app.createdAt)}
        </p>
      </div>
    </div>
  )
}

// The "Assign Room" panel: a select bound to real room_units plus quick
// "Suggested" shortcut chips for the top-ranked options.
export function RoomAssignmentSection({
  app,
  assignedUnit,
  ranked,
  suggestedIds,
  roomPending,
  onAssign,
}: {
  app: Application
  assignedUnit?: RoomUnit
  ranked: RankedRoomUnit[]
  suggestedIds: Set<number>
  roomPending: boolean
  onAssign: (idStr: string | null) => void
}) {
  const suggested = ranked.filter((r) => suggestedIds.has(r.unit.id))

  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <BedDouble className="size-4 text-neon" />
          Assign Room
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Assigning here keeps the Occupancy tab in sync automatically. Top
          picks follow the placement guidelines: month-long stays wanting
          their own bathroom lean Patitta, community-vibe requests lean E/F,
          two-guest stays lean E/F big rooms, and families lean Baiyoke
          doubles.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Select
          value={app.roomUnitId != null ? String(app.roomUnitId) : 'none'}
          onValueChange={onAssign}
        >
          <SelectTrigger className="h-9 w-full max-w-sm text-sm">
            <SelectValue placeholder="No room assigned">
              {assignedUnit
                ? `${assignedUnit.building} ${assignedUnit.roomNo} · ${assignedUnit.roomType}`
                : 'No room assigned'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No room assigned</SelectItem>
            {ranked.map(({ unit, paxMatch }) => (
              <SelectItem key={unit.id} value={String(unit.id)}>
                <span className="flex items-center gap-1.5">
                  {suggestedIds.has(unit.id) && (
                    <Sparkles className="size-3 shrink-0 text-neon" />
                  )}
                  {unit.building} {unit.roomNo}
                  {' · '}
                  {unit.roomType}
                  {unit.pax != null && (
                    <span className="text-muted-foreground">
                      ({unit.pax} pax{paxMatch ? ', match' : ''})
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
            {ranked.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No bookable rooms available.
              </div>
            )}
          </SelectContent>
        </Select>
        {roomPending && (
          <Loader2 className="size-4 shrink-0 animate-spin text-neon" />
        )}
      </div>

      {suggested.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Suggested
          </span>
          {suggested.map(({ unit }) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => onAssign(String(unit.id))}
              disabled={app.roomUnitId === unit.id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                app.roomUnitId === unit.id
                  ? 'border-neon bg-neon/10 text-neon'
                  : 'border-border text-muted-foreground hover:border-neon/50 hover:text-foreground',
              )}
            >
              <Sparkles className="size-3 shrink-0" />
              {unit.building} {unit.roomNo}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// Freeform tag chips with an inline add input. Enter/comma commits a tag;
// composing IME input (CJK) is respected so it doesn't submit mid-composition.
export function TagEditor({
  tags,
  tagInput,
  onTagInputChange,
  pending,
  onAdd,
  onRemove,
}: {
  tags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  pending: boolean
  onAdd: (raw: string) => void
  onRemove: (tag: string) => void
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neon">
        <Tag className="mr-1 inline size-3" />
        Tags
        {pending && (
          <Loader2 className="ml-2 inline size-3 animate-spin opacity-50" />
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 text-xs font-medium text-neon"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-0.5 rounded-full hover:text-destructive"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              onAdd(tagInput)
            }
          }}
          placeholder="Add tag, press Enter"
          className="h-7 min-w-[140px] rounded-full border border-dashed border-border bg-transparent px-3 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:border-neon focus:outline-none"
        />
      </div>
    </div>
  )
}

// Private admin-only notes: room assignment text, contribution log, and
// internal feedback. Distinct from the structured room-unit assignment.
export function ResidentRecordSection({
  tags,
  tagInput,
  onTagInputChange,
  tagsPending,
  onAddTag,
  onRemoveTag,
  roomAssignment,
  onRoomAssignmentChange,
  contribution,
  onContributionChange,
  internalFeedback,
  onInternalFeedbackChange,
  message,
  saving,
  onSave,
}: {
  tags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  tagsPending: boolean
  onAddTag: (raw: string) => void
  onRemoveTag: (tag: string) => void
  roomAssignment: string
  onRoomAssignmentChange: (value: string) => void
  contribution: string
  onContributionChange: (value: string) => void
  internalFeedback: string
  onInternalFeedbackChange: (value: string) => void
  message: { type: 'success' | 'error'; text: string } | null
  saving: boolean
  onSave: () => void
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">Resident Record</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Private admin notes. These details are never shown publicly or
          included in resident emails.
        </p>
      </div>

      <TagEditor
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={onTagInputChange}
        pending={tagsPending}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-neon">
            Room assignment
          </span>
          <Input
            value={roomAssignment}
            onChange={(event) => onRoomAssignmentChange(event.target.value)}
            maxLength={200}
            placeholder="e.g. Room 302, Premium Double"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-neon">
            Contribution
          </span>
          <Textarea
            value={contribution}
            onChange={(event) => onContributionChange(event.target.value)}
            maxLength={10000}
            rows={6}
            placeholder="Record their activities, projects, events, or other contributions..."
            className="min-h-36 resize-y"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-neon">
            Internal feedback
          </span>
          <Textarea
            value={internalFeedback}
            onChange={(event) => onInternalFeedbackChange(event.target.value)}
            maxLength={10000}
            rows={6}
            placeholder="Private feedback and notes for the 4Seas team..."
            className="min-h-36 resize-y"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-neon bg-neon px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? 'Saving...' : 'Save Record'}
        </button>
        {message && (
          <p
            role="status"
            className={cn(
              'inline-flex items-center gap-2 text-xs font-medium',
              message.type === 'success' ? 'text-neon' : 'text-destructive',
            )}
          >
            {message.type === 'success' && <Check className="size-4" />}
            {message.text}
          </p>
        )}
      </div>
    </section>
  )
}
