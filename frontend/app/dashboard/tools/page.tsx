'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getTools, getCategories, Tool, Category, ToolFilters } from '@/lib/tools'

const ALL_ROLES = ['owner', 'backend', 'frontend', 'qa', 'designer', 'pm']

const roleColors: Record<string, string> = {
  owner:    '#6366f1',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools]           = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [loading, setLoading]       = useState(true)

  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('')
  const [catFilter, setCat]     = useState('')

  useEffect(() => {
    getUser().catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    const filters: ToolFilters = { page }
    if (search)     filters.search   = search
    if (roleFilter) filters.role     = roleFilter
    if (catFilter)  filters.category = catFilter

    setLoading(true)
    getTools(filters)
      .then(res => {
        setTools(res.data)
        setTotal(res.meta.total)
        setLastPage(res.meta.last_page)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, roleFilter, catFilter, page])

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  // reset page when filters change
  useEffect(() => { setPage(1) }, [search, roleFilter, catFilter])

  return (
    <div className="page">
      <div className="tools-header">
        <div>
          <h1>AI Инструменти</h1>
          <p>{total} инструмента в платформата</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard" className="btn btn-primary">
            ← Dashboard
          </Link>
          <Link href="/dashboard/tools/new" className="btn btn-primary">
            + Добави инструмент
          </Link>
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

        {(search || roleFilter || catFilter) && (
          <button
            className="btn btn-outline"
            onClick={() => { setSearch(''); setRole(''); setCat('') }}
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
          <Link href="/dashboard/tools/new" className="btn btn-primary">
            Добави първия инструмент
          </Link>
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map(tool => (
            <Link key={tool.id} href={`/dashboard/tools/${tool.id}`} className="tool-card">
              <div className="tool-card-header">
                <h3 className="tool-card-name">{tool.name}</h3>
                <button
                  className="tool-card-link"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(tool.url, '_blank', 'noopener,noreferrer') }}
                >
                  ↗
                </button>
              </div>

              <p className="tool-card-desc">{tool.description}</p>

              <div className="tool-card-footer">
                <div className="tool-card-roles">
                  {tool.roles.slice(0, 3).map(role => (
                    <span
                      key={role}
                      className="role-chip"
                      style={{ backgroundColor: roleColors[role] + '22', color: roleColors[role] }}
                    >
                      {role}
                    </span>
                  ))}
                  {tool.roles.length > 3 && (
                    <span className="role-chip-more">+{tool.roles.length - 3}</span>
                  )}
                </div>

                {tool.categories[0] && (
                  <span className="cat-chip">{tool.categories[0].name}</span>
                )}
              </div>
            </Link>
          ))}
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
