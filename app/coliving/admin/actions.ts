'use server'

import { createHash, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cookies } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import {
  applications,
  emailTemplates,
  guides,
  residents,
  rooms,
  siteSettings,
  statusLogs,
  RESIDENT_CATEGORIES,
  PAYMENT_METHODS,
} from '@/lib/db/schema'
import { ADMIN_SECRET } from '@/lib/config'

const ADMIN_COOKIE = 'admin_access'

function sessionToken() {
  return createHash('sha256').update(ADMIN_SECRET).digest('hex')
}

export async function unlockAdmin(password: string) {
  if (password !== ADMIN_SECRET) {
    return { ok: false as const, error: 'Incorrect password.' }
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/coliving/admin',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { ok: true as const }
}

export async function hasAdminAccess() {
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === sessionToken()
}

async function assertSecret(_secret: string) {
  if (!(await hasAdminAccess())) throw new Error('Unauthorized')
}

export async function updateApplication(
  secret: string,
  id: number,
  data: {
    status?: string
    checkInDate?: string | null
    checkOutDate?: string | null
  },
) {
  await assertSecret(secret)

  // Compare against the current row (not client state) so a status log is
  // written exactly once per real transition — date-only edits to an
  // already-Approved application don't create noise entries.
  const [existing] = await db
    .select({ status: applications.status })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1)

  await db.update(applications).set(data).where(eq(applications.id, id))

  if (data.status && existing && data.status !== existing.status) {
    await db.insert(statusLogs).values({
      applicationId: id,
      fromStatus: existing.status,
      toStatus: data.status,
      emailSent: false,
    })
  }

  revalidatePath('/coliving/admin')
}

// Flags the most recent status-log entry for this applicant as "email
// sent" — fired when the admin actually clicks one of the quick-reach
// mailto links, so the log distinguishes real sends from status changes
// that were made without notifying the applicant.
export async function markStatusEmailSent(secret: string, applicationId: number) {
  await assertSecret(secret)
  const [latest] = await db
    .select({ id: statusLogs.id })
    .from(statusLogs)
    .where(eq(statusLogs.applicationId, applicationId))
    .orderBy(desc(statusLogs.createdAt))
    .limit(1)
  if (!latest) return { ok: false as const, error: 'No status change to flag.' }
  await db
    .update(statusLogs)
    .set({ emailSent: true })
    .where(eq(statusLogs.id, latest.id))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

// Explicitly records that the admin chose to update the status without
// sending the matching email — an intentional, visible entry rather than
// a silent no-op, so the activity log always tells the whole story.
export async function skipStatusEmail(secret: string, applicationId: number) {
  await assertSecret(secret)
  const [latest] = await db
    .select({ id: statusLogs.id })
    .from(statusLogs)
    .where(eq(statusLogs.applicationId, applicationId))
    .orderBy(desc(statusLogs.createdAt))
    .limit(1)
  if (!latest) return { ok: false as const, error: 'No status change to update.' }
  await db
    .update(statusLogs)
    .set({ note: 'Updated without sending an email.' })
    .where(eq(statusLogs.id, latest.id))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function updateResidentRecord(
  secret: string,
  id: number,
  data: {
    roomAssignment: string
    contribution: string
    internalFeedback: string
  },
) {
  await assertSecret(secret)

  const roomAssignment = data.roomAssignment.trim()
  const contribution = data.contribution.trim()
  const internalFeedback = data.internalFeedback.trim()

  if (roomAssignment.length > 200) {
    return { ok: false as const, error: 'Room assignment is too long.' }
  }
  if (contribution.length > 10000 || internalFeedback.length > 10000) {
    return { ok: false as const, error: 'Notes must be under 10,000 characters.' }
  }

  await db
    .update(applications)
    .set({
      roomAssignment: roomAssignment || null,
      contribution: contribution || null,
      internalFeedback: internalFeedback || null,
    })
    .where(eq(applications.id, id))

  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function updateTags(secret: string, id: number, tags: string[]) {
  await assertSecret(secret)
  await db
    .update(applications)
    .set({ tags: JSON.stringify(tags) })
    .where(eq(applications.id, id))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function deleteApplication(secret: string, id: number) {
  await assertSecret(secret)
  await db.delete(applications).where(eq(applications.id, id))
  revalidatePath('/coliving/admin')
}

export async function assignRoomUnit(
  secret: string,
  applicationId: number,
  roomUnitId: number | null,
) {
  await assertSecret(secret)
  await db
    .update(applications)
    .set({ roomUnitId })
    .where(eq(applications.id, applicationId))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function updateEmailTemplate(
  secret: string,
  type: string,
  data: { subject: string; body: string },
) {
  await assertSecret(secret)
  await db
    .update(emailTemplates)
    .set(data)
    .where(eq(emailTemplates.type, type))
  revalidatePath('/coliving/admin')
}

export async function updateRoom(
  secret: string,
  slug: string,
  data: {
    title?: string
    description?: string
    imageUrl?: string | null
    imageUrls?: string | null
    singlePrice?: number | null
    doublePrice?: number | null
    status?: string
    enabled?: boolean
  },
) {
  await assertSecret(secret)
  await db.update(rooms).set(data).where(eq(rooms.slug, slug))
  revalidatePath('/coliving/admin')
  revalidatePath('/coliving')
}

export type ResidentInput = {
  roomUnitId: number
  name: string
  category: string
  checkInDate: string | null
  checkOutDate: string | null
  amount: number | null
  amountUnit: string | null
  paid: boolean
  paymentMethod: string | null
  note: string | null
}

function validateResidentInput(data: ResidentInput) {
  const name = data.name.trim()
  if (!name) return { ok: false as const, error: 'Name is required.' }
  if (name.length > 200) {
    return { ok: false as const, error: 'Name is too long.' }
  }
  if (!(RESIDENT_CATEGORIES as readonly string[]).includes(data.category)) {
    return { ok: false as const, error: 'Invalid category.' }
  }
  if (
    data.amount != null &&
    (!Number.isInteger(data.amount) || data.amount < 0)
  ) {
    return { ok: false as const, error: 'Amount must be a positive number.' }
  }
  if (
    data.paymentMethod &&
    !(PAYMENT_METHODS as readonly string[]).includes(data.paymentMethod)
  ) {
    return { ok: false as const, error: 'Invalid payment method.' }
  }
  if (
    data.checkInDate &&
    data.checkOutDate &&
    data.checkOutDate < data.checkInDate
  ) {
    return {
      ok: false as const,
      error: 'Check-out date must be after check-in date.',
    }
  }
  return { ok: true as const }
}

export async function addResident(secret: string, data: ResidentInput) {
  await assertSecret(secret)

  const validation = validateResidentInput(data)
  if (!validation.ok) return validation

  await db.insert(residents).values({
    roomUnitId: data.roomUnitId,
    name: data.name.trim(),
    category: data.category,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    amount: data.amount,
    amountUnit: data.amountUnit,
    paid: data.paid,
    paymentMethod: data.paid ? data.paymentMethod : null,
    note: data.note?.trim() || null,
  })
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function updateResident(
  secret: string,
  id: number,
  data: ResidentInput,
) {
  await assertSecret(secret)

  const validation = validateResidentInput(data)
  if (!validation.ok) return validation

  await db
    .update(residents)
    .set({
      roomUnitId: data.roomUnitId,
      name: data.name.trim(),
      category: data.category,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      amount: data.amount,
      amountUnit: data.amountUnit,
      paid: data.paid,
      paymentMethod: data.paid ? data.paymentMethod : null,
      note: data.note?.trim() || null,
    })
    .where(eq(residents.id, id))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function deleteResident(secret: string, id: number) {
  await assertSecret(secret)
  await db.delete(residents).where(eq(residents.id, id))
  revalidatePath('/coliving/admin')
  return { ok: true as const }
}

export async function updateGuide(
  secret: string,
  slug: string,
  data: { content: string },
) {
  await assertSecret(secret)
  await db
    .update(guides)
    .set({ content: data.content, updatedAt: new Date() })
    .where(eq(guides.slug, slug))
  revalidatePath('/coliving/admin')
  revalidatePath(slug === 'chiangmai' ? '/coliving/chiangmai' : '/coliving/welcome-internal-2026')
}

// Saves a JSON-encoded value into the generic site_settings key-value
// store (see lib/site-content.ts). Used by the Settings tab to persist
// the Check-in Guide content and the Coliving landing page images.
export async function updateSiteSetting(secret: string, key: string, value: unknown) {
  await assertSecret(secret)
  const json = JSON.stringify(value)
  await db
    .insert(siteSettings)
    .values({ key, value: json })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: json, updatedAt: new Date() },
    })
  revalidatePath('/coliving/admin')
  revalidatePath('/coliving')
  revalidatePath('/coliving/checkin')
  return { ok: true as const }
}

// Uploads an image file for use in editable site content (Check-in Guide
// photos, Coliving landing images). Returns the public URL, which the
// client stores directly as the field's value — no separate "confirm"
// step needed since the old file is simply left orphaned on disk (images
// are small and infrequent).
//
// Files land in UPLOAD_DIR, which must live OUTSIDE the release tree
// (/var/lib/4seas-coliving/uploads in production) so uploads survive a
// deploy, and is served by nginx at /coliving/uploads/.
export async function uploadSiteImage(secret: string, formData: FormData) {
  await assertSecret(secret)
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false as const, error: 'No file provided.' }
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false as const, error: 'File must be an image.' }
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false as const, error: 'Image must be under 8MB.' }
  }

  // Never trust the client's filename for a path: strip directories and
  // anything outside a safe charset, then add a random suffix so two
  // uploads of "photo.jpg" don't clobber each other.
  const ext = (file.name.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0] ?? '').toLowerCase()
  const stem = file.name
    .slice(0, file.name.length - ext.length)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^[.-]+/, '')
    .slice(0, 60)
  const name = `${stem || 'image'}-${randomUUID().slice(0, 8)}${ext}`

  const dir = process.env.UPLOAD_DIR ?? './uploads'
  await mkdir(dir, { recursive: true })
  await writeFile(
    join(dir, name),
    Buffer.from(await file.arrayBuffer()),
  )
  return { ok: true as const, url: `/coliving/uploads/${name}` }
}
