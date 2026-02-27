'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUser, type User,
  enableTwoFactor, getTwoFactorQrCode, getTwoFactorSecretKey,
  confirmTwoFactor, getRecoveryCodes, disableTwoFactor,
} from '@/lib/auth'

type SetupStep = 'idle' | 'enabling' | 'confirmed' | 'disabling'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser]               = useState<User | null>(null)
  const [step, setStep]               = useState<SetupStep>('idle')
  const [qrSvg, setQrSvg]             = useState('')
  const [secretKey, setSecretKey]     = useState('')
  const [recoveryCodes, setRecovery]  = useState<string[]>([])
  const [code, setCode]               = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    getUser()
      .then(u => { setUser(u); setPageLoading(false) })
      .catch(() => router.push('/login'))
  }, [router])

  const handleEnable = async () => {
    setError('')
    setLoading(true)
    try {
      await enableTwoFactor()
      const [svg, key] = await Promise.all([
        getTwoFactorQrCode(),
        getTwoFactorSecretKey(),
      ])
      setQrSvg(svg)
      setSecretKey(key)
      setStep('enabling')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await confirmTwoFactor(code)
      const codes = await getRecoveryCodes()
      setRecovery(codes)
      const refreshed = await getUser()
      setUser(refreshed)
      setStep('confirmed')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Try again.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setError('')
    setLoading(true)
    try {
      await disableTwoFactor()
      const refreshed = await getUser()
      setUser(refreshed)
      setStep('idle')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="page">
        <p style={{ color: 'var(--color-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (!user) return null

  const twoFaEnabled = user.two_factor_enabled

  return (
    <div className="page">
      <h1 style={{ marginBottom: '1.75rem' }}>Настройки</h1>

      <div className="card settings-2fa-card">
        <div className="settings-2fa-header">
          <div className="settings-2fa-title-row">
            <span className="settings-2fa-icon">🔐</span>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Двустепенна автентикация</h2>
              <p>Защити акаунта си с Google Authenticator.</p>
            </div>
          </div>
          {step === 'idle' && (
            <span className={`twofa-badge ${twoFaEnabled ? 'twofa-badge--on' : 'twofa-badge--off'}`}>
              {twoFaEnabled ? 'Активна' : 'Изключена'}
            </span>
          )}
        </div>

        {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* IDLE */}
        {step === 'idle' && (
          <div style={{ marginTop: '1rem' }}>
            {twoFaEnabled ? (
              <button
                className="btn btn-danger"
                onClick={() => setStep('disabling')}
                disabled={loading}
              >
                Изключи 2FA
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleEnable}
                disabled={loading}
              >
                {loading ? 'Подготвя се…' : 'Активирай 2FA'}
              </button>
            )}
          </div>
        )}

        {/* ENABLING: QR + secret + confirm */}
        {step === 'enabling' && (
          <div className="twofa-setup-body">
            <p style={{ marginBottom: '1rem' }}>
              Сканирай QR кода с Google Authenticator или въведи кода ръчно.
            </p>

            <div
              className="twofa-qr-wrap"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <div className="twofa-secret-wrap">
              <span className="twofa-secret-label">Ръчен код:</span>
              <code className="twofa-secret-code">{secretKey}</code>
            </div>

            <form className="form" onSubmit={handleConfirm} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="totp-code">Потвърди с код от приложението</label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="123456"
                  style={{ maxWidth: '180px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Проверява се…' : 'Потвърди'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setStep('idle'); setCode(''); setError('') }}
                >
                  Откажи
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CONFIRMED: show recovery codes */}
        {step === 'confirmed' && (
          <div className="twofa-setup-body">
            <div className="alert-success" style={{ marginBottom: '1rem' }}>
              2FA е активирана успешно!
            </div>

            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Recovery кодове</h3>
            <p style={{ marginBottom: '1rem' }}>
              Запази тези кодове на сигурно място. Всеки може да се използва само веднъж
              ако нямаш достъп до телефона си.
            </p>

            <div className="twofa-recovery-grid">
              {recoveryCodes.map(c => (
                <code key={c} className="twofa-recovery-code">{c}</code>
              ))}
            </div>

            <button
              className="btn btn-outline"
              style={{ marginTop: '1.5rem' }}
              onClick={() => setStep('idle')}
            >
              Разбрах, запазих кодовете
            </button>
          </div>
        )}

        {/* DISABLING: confirm prompt */}
        {step === 'disabling' && (
          <div className="twofa-setup-body">
            <p style={{ marginBottom: '1rem' }}>
              Сигурен ли си? Изключването на 2FA ще направи акаунта ти по-малко защитен.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-danger"
                onClick={handleDisable}
                disabled={loading}
              >
                {loading ? 'Изключва се…' : 'Да, изключи 2FA'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setStep('idle'); setError('') }}
              >
                Откажи
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
