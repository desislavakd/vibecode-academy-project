'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getTools, getCategories, Tool, Category, ToolFilters } from '@/lib/tools'
import { ALL_ROLES, roleColors, catPalette } from '@/lib/constants'
import { getFaviconUrl, handleTilt, handleTiltReset } from '@/lib/utils'
import Pagination from '@/components/Pagination'

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools]           = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [loading, setLoading]       = useState(true)

  const [search, setSearch]         = useState('')
  const [roleFilter, setRole]       = useState('')
  const [catFilter, setCat]         = useState('')
  const [ratingFilter, setRating]   = useState('')

  useEffect(() => {
    getUser().catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    const filters: ToolFilters = { page }
    if (search)       filters.search     = search
    if (roleFilter)   filters.role       = roleFilter
    if (catFilter)    filters.category   = catFilter
    if (ratingFilter) filters.min_rating = Number(ratingFilter)

    setLoading(true)
    getTools(filters)
      .then(res => {
        setTools(res.data)
        setTotal(res.meta.total)
        setLastPage(res.meta.last_page)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, roleFilter, catFilter, ratingFilter, page])

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  // reset page when filters change
  useEffect(() => { setPage(1) }, [search, roleFilter, catFilter, ratingFilter])

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

  return (
    <div className="page">
      <div className="tools-header">
        <div>
          <h1>AI Инструменти</h1>
          <p>{total} инструмента в платформата</p>
        </div>
        <Link href="/dashboard/tools/new" className="btn btn-primary btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Добави инструмент
        </Link>
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
          value={ratingFilter}
          onChange={e => setRating(e.target.value)}
        >
          <option value="">Всички оценки</option>
          <option value="5">★★★★★ 5</option>
          <option value="4">★★★★☆ 4+</option>
          <option value="3">★★★☆☆ 3+</option>
          <option value="2">★★☆☆☆ 2+</option>
          <option value="1">★☆☆☆☆ 1+</option>
        </select>

        {(search || roleFilter || catFilter || ratingFilter) && (
          <button
            className="btn btn-outline"
            onClick={() => { setSearch(''); setRole(''); setCat(''); setRating('') }}
          >
            Изчисти
          </button>
        )}
      </div>

      {/* Tools grid */}
      {loading ? (
        <div className="tools-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tool-card-wrapper">
              <div className="tool-card-skeleton">
                <div className="skel-header">
                  <div className="skel-favicon skeleton-base" />
                  <div className="skel-title skeleton-base" />
                </div>
                <div className="skel-line skeleton-base" />
                <div className="skel-line skel-line--short skeleton-base" />
                <div className="skel-line skel-line--short skeleton-base" style={{ width: '50%' }} />
                <div className="skel-footer">
                  <div className="skel-chip skeleton-base" />
                  <div className="skel-chip skeleton-base" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="tools-empty">
          <p>Няма намерени инструменти.</p>
          <Link href="/dashboard/tools/new" className="btn btn-primary">
            Добави първия инструмент
          </Link>
        </div>
      ) : (
        <div className="tools-grid tools-grid--loaded">
          {tools.map(tool => {
            const cat     = tool.categories[0]
            const palette = cat ? catPalette[cat.id % catPalette.length] : null
            const favicon = getFaviconUrl(tool.url)

            return (
              <div
                key={tool.id}
                className="tool-card-wrapper"
                onMouseMove={handleTilt}
                onMouseLeave={handleTiltReset}
              >
                <a
                  href={`/dashboard/tools/edit/${tool.id}`}
                  className="tool-card-edit-btn"
                  onClick={e => e.stopPropagation()}
                  aria-label="Редактирай"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </a>

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
                  </div>

                  <p className="tool-card-desc">{tool.description}</p>

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

      <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
    </div>
  )
}
