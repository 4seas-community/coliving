'use client'

import { unlockCheckin } from '@/app/coliving/checkin/actions'
import { PasswordGateCard } from '@/components/password-gate-card'

export function CheckinGate() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <PasswordGateCard
        title="Guest check-in info."
        titleClassName="text-2xl"
        description="This page contains your arrival and check-in details. Enter the access password to continue."
        placeholder="Access password"
        buttonLabel="View Check-in Info"
        onUnlock={unlockCheckin}
      />
    </div>
  )
}
