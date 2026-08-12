'use server'

import { cookies } from 'next/headers'
import { INTERNAL_PASSWORD } from '@/lib/config'

const COOKIE = 'internal_access'

export async function unlockInternal(password: string) {
  // Shared house password — forgive stray whitespace and phone
  // auto-capitalisation rather than bounce a resident who typed it right.
  if (password.trim().toLowerCase() !== INTERNAL_PASSWORD.toLowerCase()) {
    return { ok: false as const, error: 'Incorrect password.' }
  }
  const store = await cookies()
  store.set(COOKIE, INTERNAL_PASSWORD, {
    httpOnly: true,
    // 'none' is for cookies sent on cross-site requests; it makes the
    // cookie depend on third-party cookie permission, which Safari's ITP
    // and most blockers deny — the gate then silently never unlocks.
    // This is a same-site form post, so 'lax' is both correct and safe.
    sameSite: 'lax',
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
