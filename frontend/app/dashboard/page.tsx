'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, type User } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [time, setTime] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => {
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="page">
        <p style={{ color: 'var(--color-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="page">
      <h1 className="dashboard-greeting">
        Добре дошъл, <strong>{user.name}</strong>! Ти си с роля: <strong>{user.role}</strong>.
      </h1>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <span className="profile-status-dot" />
          </div>
          <div className="profile-info">
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-meta">User ID: #{user.id} · {time}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        {/* Quick Actions */}
        <div className="dashboard-bottom-left">
          <h2 className="quick-actions-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link href="/dashboard/tools" className="quick-action-btn">
              <span className="quick-action-icon">🔧</span>
              AI Инструменти
            </Link>
            <Link href="/dashboard/tools/new" className="quick-action-btn">
              <span className="quick-action-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </span>
              Добави инструмент
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity-card">
          <h2 className="recent-activity-title">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon activity-icon--green">✓</span>
              <div className="activity-info">
                <span className="activity-label">Logged in</span>
                <span className="activity-time">Just now</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon activity-icon--purple">🔧</span>
              <div className="activity-info">
                <span className="activity-label">Разгледа AI инструменти</span>
                <span className="activity-time">1 час</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon activity-icon--orange">+</span>
              <div className="activity-info">
                <span className="activity-label">Добавен нов инструмент</span>
                <span className="activity-time">3 часа</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
