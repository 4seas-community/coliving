'use client'

import { useState } from 'react'
import { Loader2, CalendarIcon, CheckCircle2, MessageCircle, Send, Check } from 'lucide-react'
import { format } from 'date-fns'
import { submitApplication } from '@/app/coliving/actions'
import { estimateStayCost } from '@/lib/pricing'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

type RoomOption = {
  slug: string
  title: string
  imageUrl: string | null
}

const CONTACT_METHODS = ['Telegram', 'WhatsApp'] as const
const STAY_DURATIONS = ['1 week', '2 weeks', '1 month'] as const
const OCCUPANCY = ['1 person', '2 people'] as const

const DURATION_LABELS: Record<(typeof STAY_DURATIONS)[number], string> = {
  '1 week': '1 Week',
  '2 weeks': '2 Weeks',
  '1 month': '1 Month',
}

function PricePreview({ occupancy, duration }: { occupancy: string; duration: string }) {
  const { amount, suffix } = estimateStayCost(occupancy, duration)
  return (
    <div className="flex items-center justify-between rounded-xl border border-neon/30 bg-neon/5 px-4 py-3.5">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Estimated cost
      </span>
      <span className="text-lg font-bold text-neon">
        ${amount.toLocaleString()}{' '}
        <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
      </span>
    </div>
  )
}

const COMMONS = [
  {
    id: 'quiet',
    title: 'Quiet Hours',
    text: 'I agree to keep public areas quiet after 11:00 PM to respect everyone\u2019s deep sleep and focus.',
  },
  {
    id: 'kitchen',
    title: 'Kitchen Sovereignty',
    text: 'I agree to clear my dishes and place them in the dishwasher (or wash them) within 15 minutes of finishing my meal.',
  },
]

function QuestionLabel({
  index,
  children,
  htmlFor,
}: {
  index: string
  children: React.ReactNode
  htmlFor?: string
}) {
  return (
    <Label htmlFor={htmlFor} className="flex gap-2 text-base leading-relaxed">
      <span className="font-mono text-sm text-neon">{index}</span>
      <span>{children}</span>
    </Label>
  )
}

function CheckInDateTrigger({
  value,
  hasError,
}: {
  value: string
  hasError: boolean
}) {
  return (
    <span
      className={cn(
        'group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border bg-card px-4 py-5 text-center transition-all hover:border-neon/60 hover:bg-neon/5 active:bg-neon/5 focus:outline-none focus:ring-2 focus:ring-neon/30',
        value ? 'border-neon/40' : 'border-border',
        hasError && 'border-destructive',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
          value
            ? 'border-neon/40 bg-neon/10 text-neon'
            : 'border-border bg-background text-muted-foreground group-hover:border-neon/40 group-hover:text-neon',
        )}
      >
        <CalendarIcon className="size-4" />
      </span>
      <span className="flex flex-col items-center">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Check-in date
        </span>
        <span
          className={cn(
            'mt-0.5 text-sm font-bold',
            value ? 'text-foreground' : 'text-muted-foreground/60',
          )}
        >
          {value ? format(new Date(value + 'T00:00:00'), 'EEEE, MMM d, yyyy') : 'Select a date'}
        </span>
      </span>
    </span>
  )
}

/**
 * Check-in date picker. Renders as a bottom sheet on mobile (a friendlier
 * touch target than a floating popover on small screens) and as an
 * anchored popover from the tablet breakpoint up.
 */
function CheckInDatePicker({
  value,
  hasError,
  onChange,
}: {
  value: string
  hasError: boolean
  onChange: (value: string) => void
}) {
  const isTabletUp = useMediaQuery('(min-width: 640px)')
  const [open, setOpen] = useState(false)

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined

  function handleSelect(date: Date | undefined) {
    onChange(date ? format(date, 'yyyy-MM-dd') : '')
    setOpen(false)
  }

  if (isTabletUp) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button id="checkin" type="button">
              <CheckInDateTrigger value={value} hasError={hasError} />
            </button>
          }
        />
        <PopoverContent
          className="w-[calc(100vw-2rem)] max-w-md rounded-xl border border-border bg-card p-0 shadow-lg"
          align="center"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => date < new Date()}
            className="w-full [--cell-size:--spacing(9)] p-4"
            classNames={{ root: 'w-full' }}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-full text-left" id="checkin">
        <CheckInDateTrigger value={value} hasError={hasError} />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Select a check-in date</SheetTitle>
        </SheetHeader>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => date < new Date()}
          className="w-full px-2 pb-4 [--cell-size:--spacing(11)]"
          classNames={{ root: 'w-full' }}
        />
      </SheetContent>
    </Sheet>
  )
}

export function ApplyForm({ roomOptions }: { roomOptions: RoomOption[] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactMethod: 'Telegram',
    imContact: '',
    roomPreference: '',
    occupancy: '1 person',
    stayDuration: '1 week',
    desiredCheckIn: '',
    currentProject: '',
    vibe: '',
    roomNote: '',
  })
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const allChecked = COMMONS.every((c) => checks[c.id])

  const missing = {
    name: !form.name.trim(),
    email: !form.email.trim(),
    imContact: !form.imContact.trim(),
    roomPreference: false,
    desiredCheckIn: !form.desiredCheckIn.trim(),
    currentProject: !form.currentProject.trim(),
    vibe: !form.vibe.trim(),
    commons: false, // Q07 hidden — re-enable when Community Commons is restored
  }

  const canSubmit = Object.values(missing).every((v) => !v) && !submitting

  function touch(key: string) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function fieldError(key: string) {
    return touched[key] && missing[key as keyof typeof missing]
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      const allTouched = {
        name: true,
        email: true,
        imContact: true,
        roomPreference: true,
        desiredCheckIn: true,
        currentProject: true,
        vibe: true,
        commons: true,
      }
      setTouched(allTouched)
      // scroll to first error field
      const order = ['name', 'email', 'imContact', 'desiredCheckIn', 'currentProject', 'vibe'] as const
      const firstError = order.find((k) => missing[k as keyof typeof missing])
      if (firstError) {
        const el = document.querySelector(`[data-field="${firstError}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const input = el.querySelector('input, textarea') as HTMLElement | null
          input?.focus()
        }
      }
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await submitApplication(form)
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setError(res.error)
    }
  }

  if (done) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-neon/40 bg-card p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-neon/60 bg-neon/10">
            <CheckCircle2 className="size-8 text-neon" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Application received.</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Thanks, <span className="font-medium text-foreground">{form.name || 'friend'}</span>. We read every application personally and will get back to you within{' '}
            <span className="font-medium text-foreground">3 business days</span>.
          </p>
        </div>

        {/* Price preview for their selected stay */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Your estimated cost
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Based on {form.occupancy} for {DURATION_LABELS[form.stayDuration as (typeof STAY_DURATIONS)[number]]}. We&apos;ll confirm your exact room and price when we get back to you.
          </p>
          <div className="mt-4">
            <PricePreview occupancy={form.occupancy} duration={form.stayDuration} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            We accept <span className="font-medium text-foreground">crypto</span>,{' '}
            <span className="font-medium text-foreground">cash</span>, and{' '}
            <span className="font-medium text-foreground">Thai PromptPay</span>. We&apos;ll follow up with payment details once your application is confirmed.
          </p>
        </div>

        {/* Community links */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Join the community
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            While you wait, join our community channels to get a feel for the vibe.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href="https://chat.whatsapp.com/BeHrYvwwepbIN9m1L859I9?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:border-neon/40 hover:bg-neon/5"
            >
              <MessageCircle className="size-4 shrink-0 text-[#25D366]" />
              <span className="flex-1">WhatsApp Community</span>
              <span className="text-xs text-muted-foreground">Join group &rarr;</span>
            </a>
            <a
              href="https://t.me/NomadsBase"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:border-neon/40 hover:bg-neon/5"
            >
              <Send className="size-4 shrink-0 text-[#2AABEE]" />
              <span className="flex-1">Telegram Channel</span>
              <span className="text-xs text-muted-foreground">Join channel &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Page header — only shown while filling in the form */}
      <div className="mb-2">
        <p className="mb-4 inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-neon">
          <span className="diamond size-2 bg-neon" />
          Residency Application
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Tell us a bit about yourself.
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          No resume needed — just a few honest questions so we get a feel for who you are and what you&apos;re working on. The last two are worth sitting with for a moment.
        </p>
      </div>

      <div className="space-y-2" data-field="name">
        <QuestionLabel index="01" htmlFor="name">
          What is your name?
        </QuestionLabel>
        <Input
          id="name"
          required
          placeholder="e.g., Tak Shire"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          onBlur={() => touch('name')}
          className={cn(fieldError('name') && 'border-destructive')}
        />
        {fieldError('name') && (
          <p className="text-xs text-destructive">Name is required.</p>
        )}
      </div>

      <div className="space-y-2" data-field="email">
        <QuestionLabel index="02" htmlFor="email">
          Your email
        </QuestionLabel>
        <Input
          id="email"
          type="email"
          required
          placeholder="e.g., tak@example.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => touch('email')}
          className={cn(fieldError('email') && 'border-destructive')}
        />
        {fieldError('email') && (
          <p className="text-xs text-destructive">Email is required.</p>
        )}
      </div>

      <div className="space-y-3" data-field="imContact">
        <QuestionLabel index="03" htmlFor="im">
          Other contact
        </QuestionLabel>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {CONTACT_METHODS.map((method) => {
            const active = form.contactMethod === method
            return (
              <button
                type="button"
                key={method}
                onClick={() => update('contactMethod', method)}
                aria-pressed={active}
                className={cn(
                  'min-h-11 bg-card px-4 py-3 text-sm font-bold transition-colors active:bg-accent',
                  active
                    ? 'bg-neon/5 text-neon'
                    : 'text-muted-foreground hover:bg-accent',
                )}
              >
                {method}
              </button>
            )
          })}
        </div>
        <Input
          id="im"
          required
          placeholder={
            form.contactMethod === 'Telegram'
              ? 'e.g., @username'
              : 'e.g., +66 81 234 5678'
          }
          value={form.imContact}
          onChange={(e) => update('imContact', e.target.value)}
          onBlur={() => touch('imContact')}
          className={cn(fieldError('imContact') && 'border-destructive')}
        />
        {fieldError('imContact') && (
          <p className="text-xs text-destructive">{form.contactMethod} handle is required.</p>
        )}
        <p className="text-xs text-muted-foreground">
          Pick your preferred messenger, then enter your{' '}
          {form.contactMethod} handle so we can reach you fast.
        </p>
      </div>

      <fieldset className="space-y-4">
        <QuestionLabel index="04">
          Room & stay duration
        </QuestionLabel>

        {/* Room info */}
        <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            We have rooms in the <span className="font-medium text-foreground">main building</span> (Studio Room, Nest Room) and in the <span className="font-medium text-foreground">annex building</span> (Patitta Room, Annex Room). All rooms are private, fully furnished, and all-inclusive.
          </p>
          <p className="mt-2">
            Room assignment is based on your stay duration, preferences, and room availability. We&apos;ll confirm your room with you after review.
          </p>
        </div>

        {/* Occupancy + duration — stack on mobile, side-by-side from tablet up */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Number of guests
            </Label>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {OCCUPANCY.map((o) => {
                const active = form.occupancy === o
                return (
                  <button
                    type="button"
                    key={o}
                    onClick={() => update('occupancy', o)}
                    aria-pressed={active}
                    className={cn(
                      'min-h-11 bg-card px-4 py-3 text-sm font-bold transition-colors active:bg-accent',
                      active ? 'bg-neon/5 text-neon' : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {o === '1 person' ? '1 Person' : '2 People'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              How long would you like to stay?
            </Label>
            <div className="grid w-full grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {STAY_DURATIONS.map((duration) => {
                const active = form.stayDuration === duration
                return (
                  <button
                    type="button"
                    key={duration}
                    onClick={() => update('stayDuration', duration)}
                    aria-pressed={active}
                    className={cn(
                      'min-h-11 bg-card px-2 py-3 text-center text-sm font-bold transition-colors active:bg-accent',
                      active
                        ? 'bg-neon/5 text-neon'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {DURATION_LABELS[duration]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <PricePreview occupancy={form.occupancy} duration={form.stayDuration} />

        {/* Special requests */}
        <div className="space-y-2">
          <Label htmlFor="roomNote" className="text-xs uppercase tracking-widest text-muted-foreground">
            Special requests <span className="text-muted-foreground/50">(optional)</span>
          </Label>
          <Textarea
            id="roomNote"
            rows={2}
            placeholder="e.g. prefer a private bathroom, hoping to stay in the main building, would love to soak up the community vibe..."
            value={form.roomNote}
            onChange={(e) => update('roomNote', e.target.value)}
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-2" data-field="desiredCheckIn">
          <Label htmlFor="checkin" className="text-sm font-medium">
            When would you like to start?
          </Label>
          <CheckInDatePicker
            value={form.desiredCheckIn}
            hasError={!!fieldError('desiredCheckIn')}
            onChange={(value) => {
              update('desiredCheckIn', value)
              touch('desiredCheckIn')
            }}
          />
          {fieldError('desiredCheckIn') && (
            <p className="text-xs text-destructive">Please pick a check-in date.</p>
          )}
        </div>
      </fieldset>

      <div className="space-y-2" data-field="currentProject">
        <QuestionLabel index="05" htmlFor="project">
          What are you actively building, researching, or creating right now?
        </QuestionLabel>
        <Textarea
          id="project"
          required
          rows={4}
          maxLength={500}
          value={form.currentProject}
          onChange={(e) => update('currentProject', e.target.value)}
          onBlur={() => touch('currentProject')}
          className={cn(fieldError('currentProject') && 'border-destructive')}
        />
        {fieldError('currentProject') && (
          <p className="text-xs text-destructive">Please tell us what you&apos;re building.</p>
        )}
        <p className="text-right text-xs text-muted-foreground">
          {form.currentProject.length}/500
        </p>
      </div>

      <div className="space-y-2" data-field="vibe">
        <QuestionLabel index="06" htmlFor="vibe">
          Why do you want to co-live with us, and what are you hoping to experience here &mdash; community, culture, local exploration, or something else entirely?
        </QuestionLabel>
        <Textarea
          id="vibe"
          required
          rows={5}
          maxLength={700}
          value={form.vibe}
          onChange={(e) => update('vibe', e.target.value)}
          onBlur={() => touch('vibe')}
          className={cn(fieldError('vibe') && 'border-destructive')}
        />
        {fieldError('vibe') && (
          <p className="text-xs text-destructive">Please share a bit about why you want to co-live here.</p>
        )}
        <p className="text-right text-xs text-muted-foreground">
          {form.vibe.length}/700
        </p>
      </div>

      {/* Q07 hidden — restore by changing `false` to `true` below */}
      {false && (
      <fieldset>
        <QuestionLabel index="07">
          Do you agree with our Community Commons?
        </QuestionLabel>
        <p className="mb-5 mt-2 text-sm text-muted-foreground">
          All boxes must be checked to submit the application.
        </p>
        <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
          {COMMONS.map((c) => {
            const checked = !!checks[c.id]
            return (
              <button
                type="button"
                key={c.id}
                onClick={() =>
                  setChecks((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                }
                className={cn(
                  'flex items-start gap-3 bg-card px-4 py-3.5 text-left transition-colors',
                  checked ? 'bg-neon/5' : 'hover:bg-accent',
                )}
                aria-pressed={checked}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    checked
                      ? 'border-neon bg-neon text-primary-foreground'
                      : 'border-border text-transparent',
                  )}
                >
                  <Check className="size-3" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-foreground leading-snug">
                    {c.title}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {c.text}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        {touched['commons'] && missing.commons && (
          <p className="mt-2 text-xs text-destructive">Please agree to all Community Commons.</p>
        )}
      </fieldset>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-6 py-3.5 text-sm font-bold uppercase tracking-widest transition-colors',
            canSubmit
              ? 'border-neon bg-neon text-primary-foreground hover:bg-transparent hover:text-neon active:bg-transparent active:text-neon'
              : 'cursor-not-allowed border-border bg-card text-muted-foreground',
          )}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
        {!canSubmit && !submitting && (
          <p className="text-center text-xs text-muted-foreground">
            Complete all required fields to submit.
          </p>
        )}
      </div>
    </form>
  )
}
