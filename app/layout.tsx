import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Inter, Manrope } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '4SEAS // Chiang Mai Base — Co-living for Builders',
  description:
    'An all-inclusive co-living base in Chiang Mai for founders, engineers, and creators. Rooms, community, and the full operating system for deep work.',
  generator: 'v0.app',
  // The 4Seas clover, cropped out of public/4seas-logo.png. It reads the
  // same on light and dark tab chrome, so unlike the v0 mark it replaced
  // there is no need for per-scheme variants — both filenames are kept
  // only because nginx already routes them.
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f3ed',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  )
}
