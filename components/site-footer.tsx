import { BrandLogo } from '@/components/brand-logo'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-amber-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Row 1 — brand group + social links */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center">
            <BrandLogo className="h-12" />
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Telegram
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              X / Twitter
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-6 h-px w-full bg-border" aria-hidden="true" />

        {/* Bottom — copyright */}
        <p className="text-center text-xs text-muted-foreground">
          © {year} 4Seas · Chiang Mai, Thailand
        </p>
      </div>
    </footer>
  )
}
