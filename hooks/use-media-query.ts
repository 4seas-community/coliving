'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks whether a CSS media query currently matches.
 * Returns `false` on the server and during the first client render to avoid
 * hydration mismatches, then syncs to the real value after mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    setMatches(mediaQueryList.matches)

    function onChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    mediaQueryList.addEventListener('change', onChange)
    return () => mediaQueryList.removeEventListener('change', onChange)
  }, [query])

  return matches
}
