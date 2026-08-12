'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, MapPin, PenLine, Menu } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Co-living', href: '/coliving', icon: Home },
  { label: 'Apply', href: '/coliving/apply', icon: PenLine },
  { label: 'Chiang Mai', href: '/coliving/chiangmai', icon: MapPin },
]

function isActive(pathname: string, href: string) {
  return (
    pathname === href || (href !== '/coliving' && pathname.startsWith(href))
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container relative mx-auto flex h-16 items-center px-6">
        {/* Left — Logo */}
        <Link
          href="/coliving"
          className="flex shrink-0 items-center transition-opacity hover:opacity-80"
          aria-label="4SEAS home"
        >
          <BrandLogo className="h-11" />
        </Link>

        {/* Center — Desktop nav (absolutely centered, independent of side widths) */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors hover:text-foreground',
                  active
                    ? 'font-semibold text-foreground'
                    : 'font-normal text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile — Sheet drawer */}
        <div className="ml-auto md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent" aria-label="Open menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <BrandLogo className="h-10" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 px-2">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <SheetClose
                      key={item.href}
                      nativeButton={false}
                      render={
                        <Link
                          href={item.href}
                          className={cn(
                            'flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors active:bg-muted',
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        />
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
