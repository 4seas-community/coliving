import 'server-only'

// The two gating secrets live here rather than in lib/config.ts because
// this repo is public. They are read lazily, per request — not at module
// load — so `next build` does not need them, only the running service.
//
// Both are set in /opt/4seas-coliving/env (root:root 0600). See
// deploy/DEPLOY.md.
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to the service env file — see deploy/DEPLOY.md.`,
    )
  }
  return value
}

/** Admin dashboard password. Guards every applicant's name/email/handle. */
export function adminSecret(): string {
  return required('ADMIN_SECRET')
}

/**
 * House password for /coliving/welcome-internal-2026. Meant to be easy to
 * say out loud — everyone staying in the house is supposed to get in.
 */
export function internalPassword(): string {
  return required('INTERNAL_PASSWORD')
}
