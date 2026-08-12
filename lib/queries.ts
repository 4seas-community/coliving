import 'server-only'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  applications,
  emailTemplates,
  guides,
  residents,
  roomUnits,
  rooms,
  siteSettings,
  statusLogs,
} from '@/lib/db/schema'

export async function getRooms() {
  return db.select().from(rooms).orderBy(asc(rooms.sortOrder))
}

export async function getRoomUnits() {
  return db.select().from(roomUnits).orderBy(asc(roomUnits.sortOrder))
}

export async function getEnabledRooms() {
  return db
    .select()
    .from(rooms)
    .where(eq(rooms.enabled, true))
    .orderBy(asc(rooms.sortOrder))
}

export async function getGuide(slug: string) {
  const rows = await db
    .select()
    .from(guides)
    .where(eq(guides.slug, slug))
    .limit(1)
  return rows[0] ?? null
}

export async function getApplications() {
  return db.select().from(applications).orderBy(desc(applications.createdAt))
}

export async function getEmailTemplates() {
  return db.select().from(emailTemplates)
}

export async function getResidents() {
  return db.select().from(residents).orderBy(desc(residents.createdAt))
}

// Full status-change audit trail across all applicants, newest first.
// Filtered client-side per applicant in the Application Hub so every
// status transition — and whether an email actually went out for it —
// stays visible instead of being silently overwritten.
export async function getStatusLogs() {
  return db.select().from(statusLogs).orderBy(desc(statusLogs.createdAt))
}

// Reads a JSON-encoded value from the generic site_settings key-value
// store (see lib/site-content.ts for the shapes this is used for).
// Returns null when the key hasn't been saved yet or fails to parse, so
// callers can safely merge the result over their hardcoded defaults.
export async function getSiteSetting<T>(key: string): Promise<T | null> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  try {
    return JSON.parse(row.value) as T
  } catch {
    return null
  }
}
