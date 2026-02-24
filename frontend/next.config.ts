import type { NextConfig } from 'next'

/**
 * Inside Docker the Next.js server (node container) reaches Laravel via the
 * internal nginx service name. Outside Docker (bare npm run dev) it falls
 * back to localhost:8000.
 *
 * Using /auth/* prefix for Fortify routes avoids conflicts with Next.js
 * page routes at /login and /logout. Next.js App Router page routes take
 * precedence over rewrites for the same path, so Fortify must use a
 * prefix that has no corresponding app/page.tsx (config/fortify.php: prefix=auth).
 */
const API_INTERNAL = process.env.API_INTERNAL_URL ?? 'http://localhost:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Sanctum CSRF cookie — no app page at /sanctum/*
      {
        source: '/sanctum/:path*',
        destination: `${API_INTERNAL}/sanctum/:path*`,
      },
      // Fortify auth routes (prefix = "auth" in config/fortify.php)
      {
        source: '/auth/:path*',
        destination: `${API_INTERNAL}/auth/:path*`,
      },
      // Laravel API routes (GET /api/me from routes/web.php)
      {
        source: '/api/:path*',
        destination: `${API_INTERNAL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
