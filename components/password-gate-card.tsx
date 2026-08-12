'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type UnlockResult = { ok: true } | { ok: false; error: string }

// Shared "enter a password to unlock this area" card. Used by both the
// admin dashboard lock screen and the private resident guide gate — they
// differ only in copy and which server action verifies the password.
export function PasswordGateCard({
  title,
  titleClassName = 'text-xl',
  description,
  placeholder,
  buttonLabel,
  autoComplete,
  onUnlock,
}: {
  title: string
  titleClassName?: string
  description: string
  placeholder: string
  buttonLabel: string
  autoComplete?: string
  onUnlock: (password: string) => Promise<UnlockResult>
}) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const result = await onUnlock(password)
    if (result.ok) {
      router.refresh()
      return
    }

    setError(result.error)
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="mb-6 flex size-12 items-center justify-center rounded-lg border border-neon bg-neon/10 text-neon">
        <Lock className="size-5" />
      </div>
      <h1 className={cn('font-bold tracking-tight', titleClassName)}>
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          type="password"
          autoFocus
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors',
            loading || !password
              ? 'cursor-not-allowed border-border bg-card text-muted-foreground'
              : 'border-neon bg-neon text-primary-foreground hover:bg-transparent hover:text-neon',
          )}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? 'Unlocking...' : buttonLabel}
        </button>
      </form>
    </div>
  )
}
