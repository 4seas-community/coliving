'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import './site-not-found.css'

const copy = {
  "en": {
    "title": "Page not found",
    "description": "The link may be outdated, or the address may be incorrect. Let’s get you back to the community.",
    "home": "Back to home",
    "events": "Browse events",
    "explore": "Explore 4Seas",
    "routes": [
      "Community events",
      "Coliving",
      "Residency programs",
      "Room booking"
    ]
  },
  "zh": {
    "title": "这个页面找不到了",
    "description": "链接可能已过期，或网址输入有误。你可以返回首页，或从这里继续探索 4Seas。",
    "home": "返回首页",
    "events": "查看活动",
    "explore": "继续探索 4Seas",
    "routes": [
      "社区活动",
      "共享居住",
      "驻留计划",
      "会议室预订"
    ]
  },
  "th": {
    "title": "ไม่พบหน้านี้",
    "description": "ลิงก์อาจหมดอายุหรือที่อยู่ไม่ถูกต้อง กลับไปที่หน้าแรกหรือสำรวจชุมชน 4Seas ต่อได้ที่นี่",
    "home": "กลับหน้าแรก",
    "events": "ดูกิจกรรม",
    "explore": "สำรวจ 4Seas",
    "routes": [
      "กิจกรรมชุมชน",
      "โคลิฟวิ่ง",
      "โปรแกรมพำนัก",
      "จองห้องประชุม"
    ]
  }
} as const
const languages = [['zh', '中文'], ['en', 'English'], ['th', 'ไทย']] as const
const destinations = ['https://4seas.xyz/event', 'https://4seas.xyz/coliving', 'https://4seas.xyz/residency', 'https://booking.4seas.xyz']

export function SiteNotFound() {
  const pathname = usePathname()
  const initial = /(?:^|\/)(?:zh|zh-CN)(?:\/|$)/.test(pathname) ? 'zh' : /(?:^|\/)th(?:\/|$)/.test(pathname) ? 'th' : 'en'
  const [language, setLanguage] = useState<'zh' | 'en' | 'th'>(initial)
  const t = copy[language]
  return <main className="siteNotFound" lang={language === 'zh' ? 'zh-CN' : language}>
    <div className="errorContainer">
      <nav className="errorLanguages" aria-label="404 language">
        {languages.map(([code, label]) => <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</button>)}
      </nav>
      <div className="errorLayout">
        <div>
          <span className="errorNumber">404</span>
          <h1>{t.title}</h1>
          <p className="errorDescription">{t.description}</p>
          <div className="errorActions"><a href="https://4seas.xyz/">{t.home}</a><a href="https://4seas.xyz/event">{t.events}</a></div>
        </div>
        <nav className="errorRoutes" aria-label={t.explore}><h2>{t.explore}</h2>
          {destinations.map((href, index) => <a key={href} href={href} className="errorRoute"><span>{t.routes[index]}</span><span aria-hidden="true">↗</span></a>)}
        </nav>
      </div>
    </div>
  </main>
}
