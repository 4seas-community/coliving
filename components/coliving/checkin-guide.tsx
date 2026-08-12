import Image from 'next/image'
import {
  Clock,
  MapPin,
  Building2,
  Moon,
  Key,
  Wifi,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import type { CheckinGuideContent } from '@/lib/site-content'

/* ─── Reusable sub-components ─────────────────────────────────────── */

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
        <Icon className="size-4" />
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-neon">{label}</span>
    </div>
  )
}

function PhotoSlot({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
      {caption && (
        <figcaption className="border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm border-b border-border last:border-0">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  )
}

function ExternalLinkPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-neon/30 bg-neon/5 px-3 py-1.5 text-xs font-medium text-neon transition-colors hover:bg-neon/15"
    >
      <ExternalLink className="size-3" />
      {label}
    </a>
  )
}

// Renders a block of editable text where blank-line-separated chunks
// become paragraphs and any chunk made entirely of "- " lines becomes a
// bullet list — so admins can write plain text in a textarea without
// needing to know HTML.
function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim())
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim())
        const isList = lines.length > 0 && lines.every((l) => l.trim().startsWith('- '))
        if (isList) {
          return (
            <ul key={i} className={`list-disc pl-5 space-y-1 ${className ?? ''}`}>
              {lines.map((l, j) => (
                <li key={j}>{l.trim().replace(/^-\s*/, '')}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className={i > 0 ? `mt-3 ${className ?? ''}` : className}>
            {lines.map((l, j) => (
              <span key={j}>
                {l}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </>
  )
}

/* ─── Main guide component ────────────────────────────────────────── */

export function CheckinGuide({ content }: { content: CheckinGuideContent }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      {/* Header */}
      <div className="mb-12">
        <p className="mb-4 inline-flex items-center gap-2 border border-neon/40 bg-card px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-neon">
          <span className="diamond size-2 bg-neon" />
          Guest Check-in Info &middot; Private
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          4Seas – Check-in Guide
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Everything you need to know for a smooth arrival at 4Seas Nimman.
        </p>
      </div>

      {/* TDAC Banner */}
      <div className="mb-12 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-50/60 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Before You Fly – Thailand Digital Arrival Card (TDAC)</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            All travelers must complete the TDAC before entering Thailand. Make sure your info
            matches your passport and travel details.
          </p>
          <div className="mt-3">
            <ExternalLinkPill href="https://tdac.immigration.go.th/" label="Official TDAC Website" />
          </div>
        </div>
      </div>

      <div className="space-y-14">
        {/* ── Section 1: Times ─────────────────────────── */}
        <section>
          <SectionLabel icon={Clock} label="1. Check-in & Check-out Times" />
          <div className="rounded-xl border border-border bg-card px-5">
            <InfoRow label="Check-in" value={content.checkIn} />
            <InfoRow label="Check-out" value={content.checkOut} />
            <InfoRow label="Early check-in" value={content.earlyCheckIn} />
            <InfoRow label="Late check-out" value={content.lateCheckOut} />
          </div>
        </section>

        {/* ── Section 2: Address ───────────────────────── */}
        <section>
          <SectionLabel icon={MapPin} label="2. Check-in Address" />
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
              <div>
                <p className="font-bold text-foreground">{content.addressName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {content.addressLines.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < content.addressLines.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
              <ExternalLinkPill href={content.addressMapsUrl} label="Open in Google Maps" />
            </div>
            {/* Building photo */}
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={content.addressPhoto}
                alt="4SEAS Nimman building exterior"
                className="w-full object-cover"
                style={{ maxHeight: '420px' }}
              />
            </div>
            {/* Google Maps embed */}
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="4Seas Nimman on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.8577897788!2d98.96714!3d18.79698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a9bde748a1f%3A0x66e9e75b6e1adf2b!2s4Seas%20Nimman!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth"
                width="100%"
                height="320"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* ── Section 3: Front Desk ────────────────────── */}
        <section>
          <SectionLabel icon={Building2} label="3. Front Desk (Welcome Desk)" />
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              <RichText text={content.frontDeskText} />
            </div>
            {/* Welcome Desk sign photo */}
            <PhotoSlot
              src={content.frontDeskPhoto}
              alt="4Seas Welcome Desk & Coffee sign"
              caption={content.frontDeskPhotoCaption}
            />
          </div>
        </section>

        {/* ── Section 4: Check-in Hours ────────────────── */}
        <section>
          <SectionLabel icon={Clock} label="4. Check-in Hours" />
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left font-semibold text-foreground">Building</th>
                  <th className="px-5 py-3 text-right font-semibold text-foreground">Check-in Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {content.checkinHours.map((row) => (
                  <tr key={row.building}>
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.building}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 5: Late Check-in ─────────────────── */}
        <section>
          <SectionLabel icon={Moon} label="5. Late Check-in (After 8:30 PM)" />
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground space-y-3">
              <RichText text={content.lateCheckinText} />
              {content.lateCheckinNotice && (
                <p className="rounded-lg border border-neon/30 bg-neon/5 px-3 py-2 text-neon font-medium text-xs uppercase tracking-wider">
                  {content.lateCheckinNotice}
                </p>
              )}
              <RichText text={content.lateCheckinBaiyokeText} />
            </div>
            <PhotoSlot
              src={content.lateCheckinPhoto}
              alt="4Seas reception desk where late check-in keys are left"
              caption={content.lateCheckinPhotoCaption}
            />
          </div>
        </section>

        {/* ── Section 6: Our Buildings ─────────────────── */}
        <section>
          <SectionLabel icon={Key} label="6. Our Buildings" />
          <div className="space-y-5">
            {/* Overview table */}
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Building</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Check In At</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Key Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {content.buildingsTable.map((row) => (
                    <tr key={row.building}>
                      <td className="px-4 py-3.5 font-medium text-foreground">{row.building}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.checkin}</td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground">{row.card}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground px-1">{content.buildingsWalkNote}</p>
            <PhotoSlot
              src={content.buildingsOverviewPhoto}
              alt="Aerial night view of the 4Seas building complex in Nimman"
              caption={content.buildingsOverviewPhotoCaption}
            />
          </div>
        </section>

        {/* ── Section 7: About Each Building ──────────── */}
        <section>
          <SectionLabel icon={Building2} label="7. About Each Building" />
          <div className="space-y-10">
            {content.buildings.map((b) => (
              <div key={b.key} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold tracking-tight">{b.name}</h3>
                  <ExternalLinkPill href={b.mapsUrl} label="Maps" />
                </div>
                <p className="text-sm text-muted-foreground">{b.address}</p>
                {b.warning && (
                  <div className="flex gap-2 rounded-lg border border-amber-400/40 bg-amber-50/60 px-3 py-2 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {b.warning}
                  </div>
                )}
                <PhotoSlot src={b.photo} alt={b.photoAlt} caption={b.photoCaption} />
                <p className="text-sm leading-relaxed text-muted-foreground rounded-xl border border-border bg-muted/40 px-4 py-3">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 8: WiFi ──────────────────────────── */}
        <section>
          <SectionLabel icon={Wifi} label="8. WiFi" />
          <div className="space-y-3 rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
            <p>{content.wifiText}</p>
            <p>{content.wifiPattitaNote}</p>
            {content.wifiLibraryWarning && (
              <div className="flex gap-2 rounded-lg border border-amber-400/40 bg-amber-50/60 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {content.wifiLibraryWarning}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 9: Links ─────────────────────────── */}
        <section>
          <SectionLabel icon={MapPin} label="9. Chiang Mai Guide & Community" />
          <div className="space-y-3 rounded-xl border border-border bg-card px-5 py-5 text-sm">
            <p className="text-muted-foreground">
              Check out our local guide for tips on food, cafés, sights, and things to do around Chiang Mai. Join
              the community channels to connect with residents and stay in the loop.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <a
                href={content.chiangmaiGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:border-neon/40 hover:bg-neon/5"
              >
                <MapPin className="size-4 shrink-0 text-neon" />
                <span className="flex-1">Chiang Mai Guide</span>
                <span className="text-xs text-muted-foreground">Open guide &rarr;</span>
              </a>
              <a
                href={content.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:border-neon/40 hover:bg-neon/5"
              >
                <ExternalLink className="size-4 shrink-0 text-[#25D366]" />
                <span className="flex-1">WhatsApp Community</span>
                <span className="text-xs text-muted-foreground">Join group &rarr;</span>
              </a>
              <a
                href={content.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:border-neon/40 hover:bg-neon/5"
              >
                <ExternalLink className="size-4 shrink-0 text-[#2AABEE]" />
                <span className="flex-1">Telegram Channel</span>
                <span className="text-xs text-muted-foreground">Join channel &rarr;</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Need Help ────────────────────────────────── */}
        <section className="rounded-xl border border-neon/30 bg-neon/5 px-5 py-5">
          <p className="text-sm font-semibold text-neon uppercase tracking-wider mb-2">Need Help?</p>
          <p className="text-sm text-muted-foreground">
            Contact information coming soon — WhatsApp / Line / Phone / Email will be listed here.
          </p>
        </section>
      </div>
    </div>
  )
}
