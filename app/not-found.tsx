import { SiteNotFound } from '@/components/site-not-found'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return <div className="min-h-screen flex flex-col"><SiteHeader /><SiteNotFound /><SiteFooter /></div>
}
