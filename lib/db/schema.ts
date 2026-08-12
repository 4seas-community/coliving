import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  contactMethod: text('contact_method'),
  imContact: text('im_contact'),
  stayDuration: text('stay_duration'),
  desiredCheckIn: text('desired_check_in'),
  roomPreference: text('room_preference'),
  occupancy: text('occupancy'),
  roomNote: text('room_note'),
  currentProject: text('current_project'),
  vibe: text('vibe'),
  status: text('status').notNull().default('pending'),
  checkInDate: text('check_in_date'),
  checkOutDate: text('check_out_date'),
  roomAssignment: text('room_assignment'),
  contribution: text('contribution'),
  internalFeedback: text('internal_feedback'),
  tags: text('tags'),
  roomUnitId: integer('room_unit_id'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const roomUnits = pgTable('room_units', {
  id: serial('id').primaryKey(),
  building: text('building').notNull(),
  roomNo: text('room_no').notNull(),
  roomType: text('room_type').notNull(),
  sizeSqm: integer('size_sqm'),
  bedType: text('bed_type'),
  bathroom: text('bathroom'),
  pax: integer('pax'),
  specialNotes: text('special_notes'),
  bookable: boolean('bookable').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Manual occupancy records for non-coliving guests (community, staff,
// friends, etc.) who occupy a room outside the application/approval flow.
export const residents = pgTable('residents', {
  id: serial('id').primaryKey(),
  roomUnitId: integer('room_unit_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('other'),
  checkInDate: text('check_in_date'),
  checkOutDate: text('check_out_date'),
  amount: integer('amount'),
  amountUnit: text('amount_unit'),
  paid: boolean('paid').notNull().default(false),
  paymentMethod: text('payment_method'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Audit trail of every status change made to an application from the
// Application Hub. Written automatically whenever the status Select
// changes, and additionally flagged with emailSent when the admin clicks
// one of the quick-reach email links — so "updated the status without
// emailing" is a first-class, visible fact rather than silently lost.
export const statusLogs = pgTable('status_logs', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  emailSent: boolean('email_sent').notNull().default(false),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  imageUrls: text('image_urls'),
  singlePrice: integer('single_price'),
  doublePrice: integer('double_price'),
  status: text('status').notNull().default('available'),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().unique(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
})

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Generic key-value JSON store for editable site content that doesn't
// need its own relational table — e.g. the Check-in Guide's full text
// and photos, and the Coliving landing page's hero/community images.
// `value` holds a JSON-encoded blob matching the shape expected by the
// corresponding consumer (see lib/site-content.ts).
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Application = typeof applications.$inferSelect
export type Room = typeof rooms.$inferSelect
export type RoomUnit = typeof roomUnits.$inferSelect
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type Guide = typeof guides.$inferSelect
export type Resident = typeof residents.$inferSelect
export type StatusLog = typeof statusLogs.$inferSelect
export type SiteSetting = typeof siteSettings.$inferSelect

export const RESIDENT_CATEGORIES = [
  'community',
  'residency',
  'complimentary',
  'group',
  'friend',
  'walk-in',
  'staff',
  'other',
] as const
export type ResidentCategory = (typeof RESIDENT_CATEGORIES)[number]

export const AMOUNT_UNITS = ['day', 'week', 'month'] as const
export type AmountUnit = (typeof AMOUNT_UNITS)[number]

export const PAYMENT_METHODS = ['cash', 'qr', 'crypto'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
