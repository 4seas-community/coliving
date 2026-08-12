import type { EmailTemplate } from '@/lib/db/schema'

// Formats any date shown in the admin dashboard consistently as English
// numeric month/day/year (e.g. "8/15/2026") — the year is always kept so
// spans across a year boundary stay unambiguous. Plain "YYYY-MM-DD"
// strings (check-in/check-out dates) are anchored to UTC midnight, and
// the display itself is pinned to the UTC timezone. This keeps the
// rendered day identical on the server and in the browser regardless of
// which timezone either one is running in — without it, a full
// timestamp like `createdAt` can render as a different calendar day on
// the server (UTC) vs. a browser ahead of UTC, causing a hydration
// mismatch.
export function formatAdminDate(
  value: string | Date | null | undefined,
): string | null {
  if (!value) return null
  let d: Date
  if (value instanceof Date) {
    d = value
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    d = new Date(`${value}T00:00:00Z`)
  } else {
    d = new Date(value)
  }
  if (Number.isNaN(d.getTime())) {
    return typeof value === 'string' ? value : null
  }
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function statusColor(status: string) {
  switch (status) {
    case 'Approved':
      return 'border-neon/50 bg-neon/10 text-neon'
    case 'Need Info':
      return 'border-chart-3/50 bg-chart-3/10 text-chart-3'
    case 'Rejected':
      return 'border-destructive/50 bg-destructive/10 text-destructive'
    case 'No Room Available':
      return 'border-muted-foreground/40 bg-muted text-muted-foreground'
    default:
      return 'border-border bg-card text-muted-foreground'
  }
}

export function fillTemplate(
  template: EmailTemplate | undefined,
  vars: { name: string; checkIn?: string | null; checkOut?: string | null },
) {
  if (!template) return { subject: '', body: '' }
  const replace = (s: string) =>
    s
      .replaceAll('[Name]', vars.name || 'there')
      .replaceAll('[Check-in Date]', vars.checkIn || '')
      .replaceAll('[Check-out Date]', vars.checkOut || '')
  return { subject: replace(template.subject), body: replace(template.body) }
}

export function mailtoLink(
  email: string,
  subject: string,
  body: string,
) {
  return `mailto:${email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
}

// Parse a Telegram handle from a free-text IM contact field.
export function telegramLink(imContact: string | null): string | null {
  if (!imContact) return null
  if (!/telegram|tg|t\.me/i.test(imContact)) return null
  const handle = imContact.match(/@([a-z0-9_]{3,})/i)?.[1]
  if (handle) return `https://t.me/${handle}`
  const url = imContact.match(/t\.me\/([a-z0-9_]+)/i)?.[1]
  return url ? `https://t.me/${url}` : null
}

// Build a direct chat link from the applicant's chosen messenger + handle.
export function contactLink(
  method: string | null,
  contact: string | null,
): { label: string; href: string } | null {
  if (!contact) return null
  if (method === 'Telegram') {
    const handle = contact.match(/@?([a-z0-9_]{3,})/i)?.[1]
    return handle
      ? { label: 'Open Telegram Chat', href: `https://t.me/${handle}` }
      : null
  }
  if (method === 'WhatsApp') {
    const digits = contact.replace(/[^\d]/g, '')
    return digits
      ? { label: 'Open WhatsApp Chat', href: `https://wa.me/${digits}` }
      : null
  }
  return null
}
