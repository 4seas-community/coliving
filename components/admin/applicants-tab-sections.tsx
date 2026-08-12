'use client'

import { cn } from '@/lib/utils'

// Top summary strip: total applicants plus a per-status breakdown.
export function StatsGrid({
  stats,
}: {
  stats: { label: string; value: number; accent?: boolean }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
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
  )
}

// Pipeline status filter chips, each showing a live count for that status.
export function PipelineFilterTabs<Filter extends string>({
  filters,
  activeFilter,
  onSelect,
  countFor,
}: {
  filters: readonly Filter[]
  activeFilter: Filter
  onSelect: (filter: Filter) => void
  countFor: (filter: Filter) => number
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors',
              isActive
                ? 'border-neon bg-neon text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-neon/50 hover:text-foreground',
            )}
          >
            {filter}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                isActive ? 'bg-white/20' : 'bg-muted',
              )}
            >
              {countFor(filter)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
