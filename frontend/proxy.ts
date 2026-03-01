import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Role-based route protection.
 *
 * /dashboard/admin  → owner role only
 *   1. Forwards session cookies to the internal Laravel API (/api/me)
 *   2. 401 response  → redirect to /login
 *   3. role ≠ owner  → redirect to /dashboard
 *
 * All other /dashboard/* routes are passed through unchanged;
 * page-level guards (getUser()) handle general auth for those.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard/admin')) {
    const apiBase = process.env.API_INTERNAL_URL ?? 'http://localhost:8000'

    try {
      const res = await fetch(`${apiBase}/api/me`, {
        headers: {
          cookie:  request.headers.get('cookie') ?? '',
          accept:  'application/json',
        },
      })

      if (!res.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const user = await res.json()

      if (user.role !== 'owner') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/admin', '/dashboard/admin/:path*'],
}
