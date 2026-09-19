'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GlobalHeader } from '@/components/site-chrome'
import styles from '@/components/site-chrome.module.css'

const links = [ ['Co-living', '/coliving'], ['Apply', '/coliving/apply'], ['Chiang Mai', '/coliving/chiangmai'] ] as const

export function SiteHeader() {
  const pathname = usePathname()
  return <><GlobalHeader /><div className={styles.moduleBar}><nav className={styles.moduleInner} aria-label="Coliving navigation"><div className={styles.moduleLinks}>
    {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
  </div></nav></div></>
}
