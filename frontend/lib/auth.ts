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
  two_factor_enabled: boolean
}

/** Result of calling login() — either the user, or a signal to show OTP challenge. */
export type LoginResult =
  | { twoFactor: false; user: User }
  | { twoFactor: true }

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
export function csrfHeaders(): Record<string, string> {
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

/**
 * Attempt login. Returns { twoFactor: true } when Fortify responds with
 * {"two_factor": true} (user has confirmed 2FA enabled).
 * Returns { twoFactor: false, user } on immediate success.
 * Throws on bad credentials or network failure.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
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

  // Fortify SPA 2FA response: HTTP 200 with body {"two_factor": true}
  const body = await res.json().catch(() => ({}))
  if (body?.two_factor === true) {
    return { twoFactor: true }
  }

  const user = await getUser()
  return { twoFactor: false, user }
}

/** Submit TOTP code to complete 2FA login challenge. */
export async function submitTwoFactorCode(code: string): Promise<User> {
  const res = await fetch('/auth/two-factor-challenge', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
    body: JSON.stringify({ code }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message ?? 'Invalid code')
  }

  return getUser()
}

/** Submit a recovery code instead of a TOTP code. */
export async function submitRecoveryCode(recoveryCode: string): Promise<User> {
  const res = await fetch('/auth/two-factor-challenge', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
    body: JSON.stringify({ recovery_code: recoveryCode }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message ?? 'Invalid recovery code')
  }

  return getUser()
}

// ─── 2FA Setup helpers ────────────────────────────────────────────────────────

/** Step 1: Enable 2FA on the account (generates secret, NOT yet confirmed). */
export async function enableTwoFactor(): Promise<void> {
  const res = await fetch('/auth/user/two-factor-authentication', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
  })
  if (!res.ok) throw new Error('Failed to enable 2FA')
}

/** Step 2: Fetch QR code SVG string. Render via dangerouslySetInnerHTML. */
export async function getTwoFactorQrCode(): Promise<string> {
  const res = await fetch('/auth/user/two-factor-qr-code', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch QR code')
  const data = await res.json()
  return data.svg as string
}

/** Step 2b: Fetch the raw secret key for manual entry in Google Authenticator. */
export async function getTwoFactorSecretKey(): Promise<string> {
  const res = await fetch('/auth/user/two-factor-secret-key', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch secret key')
  const data = await res.json()
  return data.secretKey as string
}

/** Step 3: Confirm 2FA by submitting first TOTP code from authenticator app. */
export async function confirmTwoFactor(code: string): Promise<void> {
  const res = await fetch('/auth/user/confirmed-two-factor-authentication', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders(),
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message ?? 'Invalid confirmation code')
  }
}

/** Step 4: Fetch recovery codes (shown after confirmation). */
export async function getRecoveryCodes(): Promise<string[]> {
  const res = await fetch('/auth/user/two-factor-recovery-codes', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch recovery codes')
  return res.json()
}

/** Disable 2FA entirely. */
export async function disableTwoFactor(): Promise<void> {
  const res = await fetch('/auth/user/two-factor-authentication', {
    method: 'DELETE',
    credentials: 'include',
    headers: csrfHeaders(),
  })
  if (!res.ok) throw new Error('Failed to disable 2FA')
}

/** Fetch the currently authenticated user. Throws if not authenticated. */
export async function getUser(): Promise<User> {
  const res = await fetch('/api/me', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Not authenticated')
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
