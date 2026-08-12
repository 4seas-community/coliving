'use server'

import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'

export type ApplyInput = {
  name: string
  email: string
  contactMethod: string
  imContact: string
  stayDuration: string
  desiredCheckIn: string
  roomPreference: string
  occupancy?: string
  currentProject: string
  vibe: string
  roomNote?: string
}

export async function submitApplication(input: ApplyInput) {
  const name = input.name?.trim()
  const email = input.email?.trim()

  if (!name || !email) {
    return { ok: false as const, error: 'Name and email are required.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: 'Please enter a valid email.' }
  }

  await db.insert(applications).values({
    name,
    email,
    contactMethod: input.contactMethod?.trim() || null,
    imContact: input.imContact?.trim() || null,
    stayDuration: input.stayDuration?.trim() || null,
    desiredCheckIn: input.desiredCheckIn?.trim() || null,
    roomPreference: input.roomPreference?.trim() || null,
    occupancy: input.occupancy?.trim() || null,
    roomNote: input.roomNote?.trim() || null,
    currentProject: input.currentProject?.trim() || null,
    vibe: input.vibe?.trim() || null,
    status: 'Pending',
  })

  return { ok: true as const }
}
