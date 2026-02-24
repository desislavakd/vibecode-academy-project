/**
 * All paths are relative — the browser calls localhost:3000/...
 * Next.js rewrites (next.config.ts) proxy them to the Laravel backend
 * on the internal Docker network.
 *
 * Cookies are therefore set on localhost:3000, which means
 * document.cookie is fully readable by this JS code.
 */

export interface User {
  id: number
  name: string
  email: string
  role: string
}

/** Read the XSRF-TOKEN cookie that Laravel sets after /sanctum/csrf-cookie. */
function getXsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
  if (!match) return ''
  const raw = match.indexOf('=')
  return decodeURIComponent(match.substring(raw + 1))
}

/** Headers required for every state-mutating request. */
function csrfHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-XSRF-TOKEN': getXsrfToken(),
  }
}

/** Prime the CSRF cookie before any POST. */
export async function fetchCsrfCookie(): Promise<void> {
  await fetch('/sanctum/csrf-cookie', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
}

/** Log in and return the authenticated user. Throws on failure. */
export async function login(email: string, password: string): Promise<User> {
  await fetchCsrfCookie()

  const res = await fetch('/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message ?? 'Login failed')
  }

  return getUser()
}

/** Fetch the currently authenticated user. Throws if not authenticated. */
export async function getUser(): Promise<User> {
  const res = await fetch('/api/me', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Not authenticated (${res.status}: ${body.slice(0, 120)})`)
  }

  return res.json()
}

/** Log out. */
export async function logout(): Promise<void> {
  await fetchCsrfCookie()

  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
  })
}
