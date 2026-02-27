'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getTools, getCategories, approveTool, rejectTool, Tool, Category, ToolFilters } from '@/lib/tools'

const ALL_ROLES = ['owner', 'backend', 'frontend', 'qa', 'designer', 'pm']

const roleColors: Record<string, string> = {
  owner:    '#6366f1',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

const catPalette = [
  { bg: 'rgba(99,102,241,0.15)',  border: '#6366f1', text: '#818cf8' },
  { bg: 'rgba(20,184,166,0.15)', border: '#14b8a6', text: '#2dd4bf' },
  { bg: 'rgba(249,115,22,0.15)', border: '#f97316', text: '#fb923c' },
  { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', text: '#f472b6' },
  { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', text: '#fbbf24' },
]

const statusLabels: Record<string, string> = {
  pending:  'В изчакване',
  approved: 'Одобрен',
  rejected: 'Отказан',
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [tools, setTools]           = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [loading, setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [search, setSearch]       = useState('')
  const [roleFilter, setRole]     = useState('')
  const [catFilter, setCat]       = useState('')
  const [statusFilter, setStatus] = useState('')

  useEffect(() => {
    getUser()
      .then(user => {
        if (user.role !== 'owner') router.replace('/dashboard')
      })
      .catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    const filters: ToolFilters = { page }
    if (search)     filters.search   = search
    if (roleFilter) filters.role     = roleFilter
    if (catFilter)  filters.category = catFilter
    // Always send status for admin panel — 'all' means no status filter (show everything)
    filters.status = statusFilter || 'all'

    setLoading(true)
    getTools(filters)
      .then(res => {
        setTools(res.data)
        setTotal(res.meta.total)
        setLastPage(res.meta.last_page)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, roleFilter, catFilter, statusFilter, page])

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => { setPage(1) }, [search, roleFilter, catFilter, statusFilter])

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const rotateY =  ((e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2)) * 8
    const rotateX = -((e.clientY - rect.top   - rect.height / 2) / (rect.height / 2)) * 8
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`
  }
  function handleTiltReset(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.transform = ''
  }

  async function handleApprove(e: React.MouseEvent, toolId: number) {
    e.preventDefault()
    e.stopPropagation()
    setActionLoading(toolId)
    try {
      const updated = await approveTool(toolId)
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: updated.status } : t))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(e: React.MouseEvent, toolId: number) {
    e.preventDefault()
    e.stopPropagation()
    setActionLoading(toolId)
    try {
      const updated = await rejectTool(toolId)
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, status: updated.status } : t))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const hasFilters = search || roleFilter || catFilter || statusFilter

  return (
    <div className="page">
      <div className="tools-header">
        <div>
          <h1>Admin Panel</h1>
          <p>{total} инструмента общо</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Търси по име..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={roleFilter}
          onChange={e => setRole(e.target.value)}
        >
          <option value="">Всички роли</option>
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={catFilter}
          onChange={e => setCat(e.target.value)}
        >
          <option value="">Всички категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">Всички статуси</option>
          <option value="pending">В изчакване</option>
          <option value="approved">Одобрени</option>
          <option value="rejected">Отказани</option>
        </select>

        {hasFilters && (
          <button
            className="btn btn-outline"
            onClick={() => { setSearch(''); setRole(''); setCat(''); setStatus('') }}
          >
            Изчисти
          </button>
        )}
      </div>

      {/* Tools grid */}
      {loading ? (
        <p className="tools-loading">Зареждане...</p>
      ) : tools.length === 0 ? (
        <div className="tools-empty">
          <p>Няма намерени инструменти.</p>
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map(tool => {
            const cat     = tool.categories[0]
            const palette = cat ? catPalette[cat.id % catPalette.length] : null
            const favicon = getFaviconUrl(tool.url)
            const isPending = tool.status === 'pending'
            const isLoading = actionLoading === tool.id

            return (
              <div
                key={tool.id}
                className="tool-card-wrapper"
                onMouseMove={handleTilt}
                onMouseLeave={handleTiltReset}
              >
                {/* Action buttons for pending tools */}
                {isPending && (
                  <div className="admin-card-actions">
                    <button
                      className="admin-action-btn admin-action-btn--approve"
                      onClick={e => handleApprove(e, tool.id)}
                      disabled={isLoading}
                      aria-label="Одобри"
                      title="Одобри"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button
                      className="admin-action-btn admin-action-btn--reject"
                      onClick={e => handleReject(e, tool.id)}
                      disabled={isLoading}
                      aria-label="Откажи"
                      title="Откажи"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                )}

                <Link href={`/dashboard/tools/${tool.id}`} className="tool-card-glass">
                  <div className="tool-card-header">
                    {favicon && (
                      <img
                        src={favicon}
                        alt=""
                        className="tool-card-favicon"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <h3 className="tool-card-name">{tool.name}</h3>
                    <span className={`admin-status-badge admin-status-badge--${tool.status}`}>
                      {statusLabels[tool.status] ?? tool.status}
                    </span>
                  </div>

                  <p className="tool-card-desc">{tool.description}</p>

                  <div className="tool-card-footer">
                    <div className="tool-card-roles">
                      {tool.roles.slice(0, 3).map(role => (
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
                      {tool.roles.length > 3 && (
                        <span className="role-chip-more">+{tool.roles.length - 3}</span>
                      )}
                    </div>

                    {cat && palette && (
                      <span
                        className="cat-chip-colored"
                        style={{ backgroundColor: palette.bg, borderColor: palette.border, color: palette.text }}
                      >{cat.name}</span>
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Предишна
          </button>
          <span className="pagination-info">{page} / {lastPage}</span>
          <button
            className="btn btn-outline"
            disabled={page === lastPage}
            onClick={() => setPage(p => p + 1)}
          >
            Следваща →
          </button>
        </div>
      )}
    </div>
  )
}
