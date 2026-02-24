'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getUser, type User } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [time, setTime] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Fetch authenticated user on mount
  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => {
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <>
        <Header isLoggedIn />
        <main className="page">
          <p style={{ color: 'var(--color-muted)' }}>Loading…</p>
        </main>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Header isLoggedIn />

      <main className="page">
        <div className="card">
          <h1>Dashboard</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.125rem' }}>
            Добре дошъл, <strong>{user.name}</strong>! Ти си с роля:{' '}
            <strong>{user.role}</strong>
          </p>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">User ID</div>
              <div className="info-value">#{user.id}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value" style={{ fontSize: '0.95rem' }}>{user.email}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Role</div>
              <div className="info-value">{user.role}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Current Time</div>
              <div className="info-value">{time}</div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
