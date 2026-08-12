'use server'

import { cookies } from 'next/headers'
import { INTERNAL_PASSWORD } from '@/lib/config'

const COOKIE = 'internal_access'

export async function unlockInternal(password: string) {
  if (password !== INTERNAL_PASSWORD) {
    return { ok: false as const, error: 'Incorrect password.' }
  }
  const store = await cookies()
  store.set(COOKIE, INTERNAL_PASSWORD, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/coliving/welcome-internal-2026',
    maxAge: 60 * 60 * 24 * 7,
  })
  return { ok: true as const }
}

export async function hasInternalAccess() {
  const store = await cookies()
  return store.get(COOKIE)?.value === INTERNAL_PASSWORD
}

export async function lockInternal() {
  const store = await cookies()
  store.delete(COOKIE)
}
