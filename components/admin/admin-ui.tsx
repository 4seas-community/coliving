'use client'

import { useTransition } from 'react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

// Small "save this section" button that shows its own pending state via
// useTransition. Shared across every admin editor panel (templates, room
// media, guides) so each one doesn't reimplement the same pending UI.
export function SaveButton({
  onSave,
  label = 'Save',
}: {
  onSave: () => Promise<void>
  label?: string
}) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(onSave)}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-neon bg-neon px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon',
        pending && 'opacity-70',
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {label}
    </button>
  )
}

// Titled card wrapper used to group related settings inside an admin tab.
export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
        <span className="text-neon">{'// '}</span>
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
