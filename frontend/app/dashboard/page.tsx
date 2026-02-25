'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
          <p style={{ marginTop: '0.5rem', fontSize: '1.05rem' }}>
            Добре дошъл, <strong>{user.name}</strong>! Ти си с роля: <strong>{user.role}</strong>.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="profile-header">
              <div className="profile-avatar">
                {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
              </div>
            </div>

            <div className="profile-rows">
              <div className="profile-row">
                <span className="profile-row-label">User ID</span>
                <span className="profile-row-value">#{user.id}</span>
              </div>
              <div className="profile-row">
                <span className="profile-row-label">Role</span>
                <span className="profile-row-value">{user.role}</span>
              </div>
              <div className="profile-row">
                <span className="profile-row-label">Time</span>
                <span className="profile-row-value">{time}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
