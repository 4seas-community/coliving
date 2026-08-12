'use server'

import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { internalPassword } from '@/lib/secrets'

const COOKIE = 'internal_access'

// The cookie carries a hash, not the password itself, so the shared house
// password never sits in plaintext in anyone's browser.
function sessionToken() {
  return createHash('sha256').update(internalPassword()).digest('hex')
}

export async function unlockInternal(password: string) {
  // Shared house password — forgive stray whitespace and phone
  // auto-capitalisation rather than bounce a resident who typed it right.
  if (password.trim().toLowerCase() !== internalPassword().toLowerCase()) {
    return { ok: false as const, error: 'Incorrect password.' }
  }
  const store = await cookies()
  store.set(COOKIE, sessionToken(), {
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
  return store.get(COOKIE)?.value === sessionToken()
}

export async function lockInternal() {
  const store = await cookies()
  store.delete(COOKIE)
}
