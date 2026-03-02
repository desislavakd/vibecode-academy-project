'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, type User } from '@/lib/auth'
import { getTools, type Tool } from '@/lib/tools'

import { roleColors, catPalette } from '@/lib/constants'
import { getFaviconUrl } from '@/lib/utils'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser]               = useState<User | null>(null)
  const [time, setTime]               = useState<string>('')
  const [loading, setLoading]         = useState(true)
  const [recommended, setRecommended] = useState<Tool[]>([])
  const carouselRef                   = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateArrows() {
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  function scrollCarousel(dir: 'left' | 'right') {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' })
    setTimeout(updateArrows, 350)
  }

  useEffect(() => {
    // rAF alone fires before flex layout is computed; double-rAF + 150ms ensure DOM is settled
    requestAnimationFrame(() => requestAnimationFrame(() => {
      updateArrows()
      setTimeout(updateArrows, 150)
    }))
  }, [recommended])

  useEffect(() => {
    getUser()
      .then(user => {
        setUser(user)
        getTools({ role: user.role })
          .then(res => setRecommended(res.data.slice(0, 10)))
          .catch(() => {})
      })
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
    <div className="page dashboard-home-page">
      <h1 className="dashboard-greeting dash-fade-1">
        Добре дошъл, <strong>{user.name}</strong>! Ти си с роля: <strong>{user.role}</strong>.
      </h1>

      <div className="card card--glass dash-fade-2" style={{ marginTop: '1.5rem' }}>
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
            <div style={{ marginTop: '0.4rem' }}>
              <span className={`twofa-badge ${user.two_factor_enabled ? 'twofa-badge--on' : 'twofa-badge--off'}`}>
                {user.two_factor_enabled ? '🔐 2FA активна' : '2FA изключена'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row dash-fade-3">
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

          {/* Recommended for role */}
          {recommended.length > 0 && (
            <div className="dash-recommended dash-fade-4">
              <h2 className="dash-recommended-title">
                Препоръчани за {user.role}
              </h2>
              <div className={`dash-recommended-carousel${canScrollRight ? ' has-more' : ''}`}>
                <div
                  className="dash-recommended-track"
                  ref={carouselRef}
                  onScroll={updateArrows}
                >
                  {recommended.map(tool => {
                    const cat     = tool.categories[0]
                    const palette = cat ? catPalette[cat.id % catPalette.length] : null
                    const favicon = getFaviconUrl(tool.url)
                    return (
                      <div key={tool.id} className="tool-card-wrapper dash-reco-card">
                        <Link
                          href={`/dashboard/tools/${tool.id}`}
                          className="tool-card-glass tool-card-glass--compact"
                        >
                          <div className="tool-card-header">
                            {favicon && (
                              <img
                                src={favicon}
                                alt=""
                                className="tool-card-favicon"
                                onError={e => (e.currentTarget.style.display = 'none')}
                              />
                            )}
                            <h3 className="tool-card-name">{tool.name}</h3>
                          </div>
                          <p className="tool-card-desc tool-card-desc--compact">{tool.description}</p>
                          <div className="tool-card-footer">
                            <div className="card-rating">
                              <span className="card-rating-stars">
                                {tool.ratings_avg !== null
                                  ? '★'.repeat(Math.round(tool.ratings_avg)) + '☆'.repeat(5 - Math.round(tool.ratings_avg))
                                  : '☆☆☆☆☆'}
                              </span>
                              {tool.ratings_avg !== null && (
                                <span className="card-rating-avg">{tool.ratings_avg.toFixed(1)}</span>
                              )}
                            </div>
                            <div className="tool-card-roles">
                              {tool.roles.slice(0, 2).map(role => (
                                <span
                                  key={role}
                                  className="role-chip"
                                  style={{
                                    backgroundColor: roleColors[role] + '22',
                                    color: roleColors[role],
                                    border: `1px solid ${roleColors[role]}44`,
                                  }}
                                >{role}</span>
                              ))}
                            </div>
                            {cat && palette && (
                              <span
                                className="cat-chip-colored"
                                style={{
                                  backgroundColor: palette.bg,
                                  borderColor: palette.border,
                                  color: palette.text,
                                }}
                              >{cat.name}</span>
                            )}
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
                {canScrollLeft && (
                  <button className="carousel-arrow carousel-arrow--left" onClick={() => scrollCarousel('left')}>‹</button>
                )}
                {canScrollRight && (
                  <button className="carousel-arrow carousel-arrow--right" onClick={() => scrollCarousel('right')}>›</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card card--glass recent-activity-card">
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
