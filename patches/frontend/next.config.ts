import type { NextConfig } from 'next'

/**
 * Inside Docker the Next.js server (node container) reaches Laravel via the
 * internal nginx service name. Outside Docker (bare npm run dev) it falls
 * back to localhost:8000.
 *
 * The rewrites make the browser talk only to localhost:3000, so all cookies
 * (XSRF-TOKEN, laravel_session) are set on the same origin as the JS code.
 * That eliminates every cross-origin cookie / CSRF issue.
 */
const API_INTERNAL = process.env.API_INTERNAL_URL ?? 'http://localhost:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/sanctum/:path*',
        destination: `${API_INTERNAL}/sanctum/:path*`,
      },
      // Fortify auth routes use prefix "auth" (config/fortify.php)
      // to avoid conflicting with Next.js app/login/page.tsx
      {
        source: '/auth/:path*',
        destination: `${API_INTERNAL}/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_INTERNAL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
