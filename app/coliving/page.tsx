import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { UnifiedRoomCard } from '@/components/coliving/unified-room-card'
import { getEnabledRooms, getSiteSetting } from '@/lib/queries'
import { DEFAULT_COLIVING_IMAGES, SITE_SETTINGS_KEYS, type ColivingImages } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

const PERKS = [
  {
    title: '24/7 Co-working Space',
    body: 'Dedicated co-working areas, always open. Build at whatever hour suits you.',
  },
  {
    title: 'Commons & Public Areas',
    body: 'Shared kitchen, living spaces, and hangout areas — where the community actually happens.',
  },
  {
    title: 'Longevity Food',
    body: '30 healthy lunch vouchers included. Self pick-up, no hassle.',
  },
  {
    title: 'The Playground',
    body: 'CMU gym access, 5 minutes on foot. Move your body, clear your head.',
  },
  {
    title: 'Residents-only Activities',
    body: 'Regular events and rituals made for and by the people living here.',
  },
  {
    title: 'Weekly Cleaning',
    body: 'Your room and shared spaces cleaned once a week. One less thing to think about.',
  },
]

export default async function ColivingPage() {
  const rooms = await getEnabledRooms()
  const savedImages = await getSiteSetting<Partial<ColivingImages>>(SITE_SETTINGS_KEYS.colivingImages)
  const images: ColivingImages = { ...DEFAULT_COLIVING_IMAGES, ...savedImages }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <Image
            src={images.hero}
            alt="Aerial view of the 4Seas Chiang Mai Base at dusk"
            fill
            priority
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-neon backdrop-blur">
              <span className="diamond size-2 bg-neon" />
              4Seas Nimman Coliving
            </p>
            <h1 className="max-w-2xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              A co-living base for builders,{' '}
              <span className="text-neon neon-text">researchers</span> & creators.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              All-inclusive living for digital nomads in northern Thailand. We
              accept around 20% of applicants — people who show up, contribute,
              and make the community better for everyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/coliving/apply"
                className="inline-flex items-center justify-center rounded-lg border border-neon bg-neon px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon"
              >
                Apply to Live
              </Link>
            </div>
          </div>
        </section>

        {/* Coliving intro */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-neon">
                  <span className="diamond size-2 bg-secondary" />
                  Coliving
                </p>
                <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  4Seas Nimman
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-relaxed text-muted-foreground">
                <p>
                  Our coliving is built around shared daily life, where people
                  from different backgrounds live, work, and spend time together
                  naturally.
                </p>
                <p>
                  It fosters a lifestyle where genuine human connection emerges
                  through everyday interactions, shared experiences, and simply
                  being together — within a space that balances focus and
                  openness: private rooms for longer stays and shared areas for
                  deep connection, continuously shaping a shared culture.
                </p>
              </div>
            </div>

            {/* 4-photo grid */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { src: images.community1, alt: 'Panel talk at Zuzalu Library Chiang Mai' },
                { src: images.community2, alt: '4Seas community kitchen gathering' },
                { src: images.community3, alt: 'Community event at Zuzalu Library' },
                { src: images.community4, alt: '4Seas residents Christmas dinner' },
              ].map((photo) => (
                <div
                  key={photo.src}
                  className="aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="text-neon">{'// '}</span>One Price covers all
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Everything bundled in — utilities, internet, and all the perks below. No surprises.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PERKS.map((perk, i) => (
                <div key={perk.title} className="rounded-xl border border-border bg-card p-6 transition-transform duration-200 hover:scale-[1.02]">
                  <h3 className="mb-2 flex items-baseline gap-2.5 text-base font-bold leading-snug">
                    <span className="shrink-0 font-mono text-sm font-normal text-neon">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {perk.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spaces & Pricing */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="text-neon">{'// '}</span>Spaces & Pricing
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                One flat price — no room type tiers, no peak season markup. All-inclusive.
              </p>
            </div>
            <UnifiedRoomCard rooms={rooms} />
            <div className="mt-10 flex justify-center">
              <Link
                href="/coliving/apply"
                className="inline-flex items-center justify-center rounded-lg border border-neon bg-neon px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-neon"
              >
                Apply to Live
              </Link>
            </div>
          </div>
        </section>

        {/* Group callout */}
        <section id="group">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="rounded-xl border border-neon/40 bg-card p-8 sm:p-12">
              <div className="flex flex-wrap gap-2">
                {['Come as a family?', 'Come as a group?', 'Need more rooms?'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neon/50 bg-neon/5 px-4 py-1.5 font-mono text-base font-medium text-neon"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Drop us a line directly with your group size, expected dates,
                and alignment. We will curate a bespoke living and hacking setup
                for your team.
              </p>
              <a
                href="mailto:Residency@4Seas.xyz"
                className="mt-6 inline-flex items-center justify-center rounded-lg border border-neon bg-neon px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-transparent hover:text-neon"
              >
                Residency@4Seas.xyz
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
