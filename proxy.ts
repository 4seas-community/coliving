import { NextResponse, type NextRequest } from 'next/server'

// Temporary: the public coliving pages are withdrawn while the hotel license
// is pending, so every public /coliving page sends visitors to the 4Seas
// homepage. /coliving/admin stays reachable for operators.
//
// 307, not 301/308: a permanent redirect is cached by browsers and Cloudflare
// with no way to recall it, and this has to be undone once the license is in
// place. no-store keeps even the temporary redirect out of every cache.
// To reinstate the pages, delete this file.
const HOME = 'https://4seas.xyz/'

export function proxy(_request: NextRequest) {
  const response = NextResponse.redirect(HOME, 307)
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}

export const config = {
  // Page routes only: admin, Next internals, uploads and any path with a
  // file extension (images, icons, site-chrome assets) pass through.
  matcher: ['/coliving', '/coliving/((?!admin(?:/|$)|uploads/|site-chrome/|.*\\.[^/]+$).*)'],
}
