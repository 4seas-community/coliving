'use server'

import { cookies } from 'next/headers'
import { CHECKIN_PASSWORD } from '@/lib/config'

const COOKIE = 'checkin_access'

export async function unlockCheckin(password: string) {
  // Shared house password — forgive stray whitespace and phone
  // auto-capitalisation rather than bounce a guest who typed it right.
  if (password.trim().toLowerCase() !== CHECKIN_PASSWORD.toLowerCase()) {
    return { ok: false as const, error: 'Incorrect password.' }
  }
  const store = await cookies()
  store.set(COOKIE, CHECKIN_PASSWORD, {
    httpOnly: true,
    // 'none' is for cookies sent on cross-site requests; it makes the
    // cookie depend on third-party cookie permission, which Safari's ITP
    // and most blockers deny — the gate then silently never unlocks.
    // This is a same-site form post, so 'lax' is both correct and safe.
    sameSite: 'lax',
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
