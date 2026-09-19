export function languageFromPathname(pathname: string): 'zh' | 'en' | 'th' {
  const firstSegment = pathname.split('/')[1] ?? ''
  return firstSegment === 'zh' || firstSegment === 'zh-CN' ? 'zh' : firstSegment === 'th' ? 'th' : 'en'
}
