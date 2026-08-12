'use client'

import { unlockAdmin } from '@/app/coliving/admin/actions'
import { PasswordGateCard } from '@/components/password-gate-card'

export function AdminLock() {
  return (
    <main className="grid-noise flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <PasswordGateCard
          title="Admin access"
          description="Enter the administrator password to open the 4Seas dashboard."
          placeholder="Admin password"
          buttonLabel="Unlock Dashboard"
          autoComplete="current-password"
          onUnlock={unlockAdmin}
        />
      </div>
    </main>
  )
}
