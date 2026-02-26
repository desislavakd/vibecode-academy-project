'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getUser, User } from '@/lib/auth'
import { getTool, deleteTool, Tool } from '@/lib/tools'

const roleColors: Record<string, string> = {
  owner:    '#f97316',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

function IconAlignLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10"/>
      <line x1="21" y1="6" x2="3" y2="6"/>
      <line x1="21" y1="14" x2="3" y2="14"/>
      <line x1="17" y1="18" x2="3" y2="18"/>
    </svg>
  )
}

function IconLightbulb() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  )
}

function IconExternalLink() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

function IconImage() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

export default function ToolDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [tool, setTool]   = useState<Tool | null>(null)
  const [user, setUser]   = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    getUser()
      .then(u => setUser(u))
      .catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    if (!id) return
    getTool(Number(id))
      .then(setTool)
      .catch(() => router.replace('/dashboard/tools'))
      .finally(() => setLoading(false))
  }, [id, router])

  const canEdit = !!user && !!tool

  async function handleDelete() {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този инструмент?')) return
    setDeleting(true)
    try {
      await deleteTool(Number(id))
      router.push('/dashboard/tools')
    } catch {
      alert('Грешка при изтриване')
      setDeleting(false)
    }
  }

  if (loading) return <div className="page"><p>Зареждане...</p></div>
  if (!tool)   return null

  const favicon = tool.url
    ? `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`
    : null

  return (
    <div className="page">
      {/* Breadcrumb */}
      <nav className="tool-breadcrumb">
        <Link href="/dashboard/tools" className="tool-breadcrumb-link">← Инструменти</Link>
        <span className="tool-breadcrumb-sep">/</span>
        <span className="tool-breadcrumb-current">{tool.name}</span>
      </nav>

      {/* Hero card */}
      <div className="tool-hero-card tool-detail-animate">

        {/* Hero top: icon + info + actions */}
        <div className="tool-hero-top">
          {favicon && !iconError ? (
            <img
              src={favicon}
              alt=""
              className="tool-hero-icon"
              onError={() => setIconError(true)}
            />
          ) : (
            <div className="tool-hero-icon-placeholder">
              {tool.name[0].toUpperCase()}
            </div>
          )}

          <div className="tool-hero-body">
            <h1 className="tool-hero-title">{tool.name}</h1>
            <div className="tool-hero-meta">
              от {tool.created_by.name} · {new Date(tool.created_at).toLocaleDateString('bg-BG')}
            </div>
            <div className="tool-hero-actions">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Отвори ↗
              </a>
              {canEdit && (
                <>
                  <Link
                    href={`/dashboard/tools/edit/${tool.id}`}
                    className="tool-icon-btn"
                    title="Редактирай"
                  >
                    <IconPencil />
                  </Link>
                  <button
                    className="tool-icon-btn tool-icon-btn--danger"
                    onClick={handleDelete}
                    disabled={deleting}
                    title={deleting ? 'Изтриване...' : 'Изтрий'}
                  >
                    <IconTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="tool-hero-divider" />

        {/* Roles */}
        {tool.roles.length > 0 && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconUsers /></span>
              <span className="tool-section-label">Роли</span>
            </div>
            <div className="role-chips">
              {tool.roles.map(role => (
                <span
                  key={role}
                  className="role-chip"
                  style={{ backgroundColor: roleColors[role] + '22', color: roleColors[role], border: `1px solid ${roleColors[role]}44` }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {tool.categories.length > 0 && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconGrid /></span>
              <span className="tool-section-label">Категории</span>
            </div>
            <div className="tool-chips-row">
              {tool.categories.map(c => (
                <span key={c.id} className="cat-chip-detail">{c.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tool.tags.length > 0 && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconTag /></span>
              <span className="tool-section-label">Тагове</span>
            </div>
            <div className="tool-chips-row">
              {tool.tags.map(t => (
                <span key={t.id} className="tag-chip-detail">{t.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="tool-section">
          <div className="tool-section-header">
            <span className="tool-section-icon"><IconAlignLeft /></span>
            <span className="tool-section-label">Описание</span>
          </div>
          <p>{tool.description}</p>
        </div>

        {/* How to use */}
        {tool.how_to_use && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconLightbulb /></span>
              <span className="tool-section-label">Как се използва</span>
            </div>
            <p className="tool-howto">{tool.how_to_use}</p>
          </div>
        )}

        {/* Documentation */}
        {tool.documentation_url && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconExternalLink /></span>
              <span className="tool-section-label">Документация</span>
            </div>
            <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer" className="tool-doc-link">
              {tool.documentation_url} ↗
            </a>
          </div>
        )}

        {/* Screenshots */}
        {tool.screenshots.length > 0 && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconImage /></span>
              <span className="tool-section-label">Скрийншоти</span>
            </div>
            <div className="screenshots-grid">
              {tool.screenshots.map(s => (
                <div key={s.id} className="screenshot-item">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    <img src={s.url} alt={s.caption ?? tool.name} loading="lazy" />
                  </a>
                  {s.caption && <p className="screenshot-caption">{s.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {tool.examples.length > 0 && (
          <div className="tool-section">
            <div className="tool-section-header">
              <span className="tool-section-icon"><IconStar /></span>
              <span className="tool-section-label">Реални примери</span>
            </div>
            <div className="examples-list">
              {tool.examples.map(ex => (
                <div key={ex.id} className="example-item">
                  <strong>{ex.title}</strong>
                  {ex.description && <p>{ex.description}</p>}
                  {ex.url && (
                    <a href={ex.url} target="_blank" rel="noopener noreferrer">
                      {ex.url} ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
