'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, submitTwoFactorCode, submitRecoveryCode } from '@/lib/auth'

type Step = 'credentials' | 'otp' | 'recovery'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep]         = useState<Step>('credentials')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.twoFactor) {
        setStep('otp')
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await submitTwoFactorCode(code)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await submitRecoveryCode(code)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid recovery code.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const Logo = () => (
    <Link href="/" className="logo logo-lg" style={{ justifyContent: 'center' }}>
      <span className="logo-hex">
        <span className="hex-row">⬢⬢</span>
        <span className="hex-row hex-row-offset">⬢⬢</span>
      </span>
      ToolHive
    </Link>
  )

  if (step === 'otp' || step === 'recovery') {
    const isRecovery = step === 'recovery'

    return (
      <main className="auth-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '420px' }}>
          <Logo />
          <div className="card auth-card" style={{ width: '100%' }}>
            <h1>Двустепенна автентикация</h1>
            <p style={{ marginBottom: '1.5rem' }}>
              {isRecovery
                ? 'Въведи твой recovery code.'
                : 'Въведи 6-цифрения код от Google Authenticator.'}
            </p>

            <form className="form" onSubmit={isRecovery ? handleRecovery : handleOtp}>
              {error && <div className="alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="code">
                  {isRecovery ? 'Recovery Code' : 'Код за автентикация'}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode={isRecovery ? 'text' : 'numeric'}
                  pattern={isRecovery ? undefined : '[0-9]{6}'}
                  maxLength={isRecovery ? undefined : 6}
                  autoComplete="one-time-code"
                  required
                  autoFocus
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={isRecovery ? 'xxxx-xxxx-xxxx' : '123456'}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Проверява се…' : 'Продължи'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                className="btn-link-muted"
                onClick={() => { setStep(isRecovery ? 'otp' : 'recovery'); setCode(''); setError('') }}
              >
                {isRecovery ? '← Назад към кода' : 'Използвай recovery code'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '420px' }}>
        <Logo />

        <div className="card auth-card" style={{ width: '100%' }}>
          <h1>Sign in</h1>
          <p style={{ marginBottom: '1.5rem' }}>Enter your credentials to access the platform.</p>

          <form className="form" onSubmit={handleCredentials}>
            {error && (
              <div className="alert-error">{error}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
