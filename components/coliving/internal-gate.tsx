'use client'

import { unlockInternal } from '@/app/coliving/welcome-internal-2026/actions'
import { PasswordGateCard } from '@/components/password-gate-card'

export function InternalGate() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <PasswordGateCard
        title="Residents only."
        titleClassName="text-2xl"
        description="This is the private 4Seas onboarding guide. Enter the house password to continue."
        placeholder="House password"
        buttonLabel="Unlock Guide"
        onUnlock={unlockInternal}
      />
    </div>
  )
}
