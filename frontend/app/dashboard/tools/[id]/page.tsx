'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getUser, User } from '@/lib/auth'
import { getTool, deleteTool, Tool } from '@/lib/tools'

const roleColors: Record<string, string> = {
  owner:    '#6366f1',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

export default function ToolDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [tool, setTool]   = useState<Tool | null>(null)
  const [user, setUser]   = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

  return (
    <div className="page">
      <div className="tool-detail-header">
        <Link href="/dashboard/tools" className="btn btn-primary">← Обратно</Link>
        {canEdit && (
          <div className="tool-detail-actions">
            <Link href={`/dashboard/tools/edit/${tool.id}`} className="btn btn-outline">
              Редактирай
            </Link>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Изтриване...' : 'Изтрий'}
            </button>
          </div>
        )}
      </div>

      <div className="tool-detail-card">
        {/* Title row */}
        <div className="tool-detail-title-row">
          <h1>{tool.name}</h1>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Отвори ↗
          </a>
        </div>

        {/* Meta */}
        <div className="tool-meta-row">
          <span className="tool-meta-author">от {tool.created_by.name}</span>
          <span className="tool-meta-date">{new Date(tool.created_at).toLocaleDateString('bg-BG')}</span>
        </div>

        {/* Roles */}
        {tool.roles.length > 0 && (
          <div className="tool-section">
            <h3>Роли</h3>
            <div className="role-chips">
              {tool.roles.map(role => (
                <span
                  key={role}
                  className="role-chip"
                  style={{ backgroundColor: roleColors[role] + '22', color: roleColors[role] }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories & Tags */}
        {(tool.categories.length > 0 || tool.tags.length > 0) && (
          <div className="tool-section">
            <div className="tool-chips-row">
              {tool.categories.map(c => (
                <span key={c.id} className="cat-chip">{c.name}</span>
              ))}
              {tool.tags.map(t => (
                <span key={t.id} className="tag-chip-plain">{t.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="tool-section">
          <h3>Описание</h3>
          <p>{tool.description}</p>
        </div>

        {/* How to use */}
        {tool.how_to_use && (
          <div className="tool-section">
            <h3>Как се използва</h3>
            <p className="tool-howto">{tool.how_to_use}</p>
          </div>
        )}

        {/* Documentation */}
        {tool.documentation_url && (
          <div className="tool-section">
            <h3>Документация</h3>
            <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer" className="tool-doc-link">
              {tool.documentation_url} ↗
            </a>
          </div>
        )}

        {/* Screenshots */}
        {tool.screenshots.length > 0 && (
          <div className="tool-section">
            <h3>Скрийншоти</h3>
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
            <h3>Реални примери</h3>
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
