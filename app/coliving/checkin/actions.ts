'use server'

import { cookies } from 'next/headers'
import { CHECKIN_PASSWORD } from '@/lib/config'

const COOKIE = 'checkin_access'

export async function unlockCheckin(password: string) {
  if (password !== CHECKIN_PASSWORD) {
    return { ok: false as const, error: 'Incorrect password.' }
  }
  const store = await cookies()
  store.set(COOKIE, CHECKIN_PASSWORD, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/coliving/checkin',
    maxAge: 60 * 60 * 24 * 7,
  })
  return { ok: true as const }
}

export async function hasCheckinAccess() {
  const store = await cookies()
  return store.get(COOKIE)?.value === CHECKIN_PASSWORD
}

export async function lockCheckin() {
  const store = await cookies()
  store.delete(COOKIE)
}
