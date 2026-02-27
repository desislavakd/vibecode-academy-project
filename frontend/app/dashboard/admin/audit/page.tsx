'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getAuditLogs, deleteAuditLog, AuditEntry, AuditLogFilters } from '@/lib/tools'

// ─── Action metadata ──────────────────────────────────────────────────────────

const actionMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  created: {
    label: 'Добавен',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  updated: {
    label: 'Редактиран',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  approved: {
    label: 'Одобрен',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  rejected: {
    label: 'Отказан',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  deleted: {
    label: 'Изтрит',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.10)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
    ),
  },
}

const fieldLabels: Record<string, string> = {
  name:              'Наименование',
  url:               'URL',
  description:       'Описание',
  how_to_use:        'Как се ползва',
  documentation_url: 'Документация URL',
}

const roleColors: Record<string, string> = {
  owner:    '#6366f1',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  if (min < 1)   return 'преди малко'
  if (min < 60)  return `преди ${min} мин`
  const hrs = Math.floor(min / 60)
  if (hrs < 24)  return `преди ${hrs} ч`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `преди ${days} д`
  return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString('bg-BG', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getUserInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function parseBrowser(ua: string | null): string {
  if (!ua) return 'Неизвестен'
  if (ua.includes('Edg'))                          return 'Edge'
  if (ua.includes('Chrome'))                       return 'Chrome'
  if (ua.includes('Firefox'))                      return 'Firefox'
  if (ua.includes('Safari'))                       return 'Safari'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'Браузър'
}

function parseOS(ua: string | null): string {
  if (!ua) return ''
  if (ua.includes('Windows'))                        return 'Windows'
  if (ua.includes('Mac'))                            return 'macOS'
  if (ua.includes('Android'))                        return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux'))                          return 'Linux'
  return ''
}

function truncate(text: string | null, max = 55): string {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_ACTIONS = ['created', 'updated', 'approved', 'rejected', 'deleted']

export default function AuditLogPage() {
  const router = useRouter()

  const [entries, setEntries]       = useState<AuditEntry[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [actionFilter, setActionFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [from, setFrom]                 = useState('')
  const [to, setTo]                     = useState('')

  // Per-row delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId]           = useState<number | null>(null)

  // Owner guard (middleware handles server-side; this is client-side fallback)
  useEffect(() => {
    getUser()
      .then(user => { if (user.role !== 'owner') router.replace('/dashboard') })
      .catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    const filters: AuditLogFilters = { page }
    if (actionFilter) filters.action = actionFilter
    if (search)       filters.search = search
    if (from)         filters.from   = from
    if (to)           filters.to     = to

    setLoading(true)
    getAuditLogs(filters)
      .then(res => {
        setEntries(res.data)
        setTotal(res.meta.total)
        setLastPage(res.meta.last_page)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [actionFilter, search, from, to, page])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [actionFilter, search, from, to])

  const hasFilters = actionFilter || search || from || to

  async function handleDeleteEntry(id: number) {
    setDeletingId(id)
    try {
      await deleteAuditLog(id)
      setEntries(prev => prev.filter(e => e.id !== id))
      setTotal(prev => prev - 1)
      setConfirmDeleteId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="tools-header">
        <div>
          <h1>Audit Log</h1>
          <p>{total} записа на активност</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Търси по потребител или инструмент..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          <option value="">Всички действия</option>
          {ALL_ACTIONS.map(a => (
            <option key={a} value={a}>{actionMeta[a].label}</option>
          ))}
        </select>

        <input
          className="filter-input audit-date-input"
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          title="От дата"
        />

        <input
          className="filter-input audit-date-input"
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          title="До дата"
        />

        {hasFilters && (
          <button
            className="btn btn-outline"
            onClick={() => { setSearch(''); setActionFilter(''); setFrom(''); setTo('') }}
          >
            Изчисти
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <p className="tools-loading">Зареждане...</p>
      ) : entries.length === 0 ? (
        <div className="tools-empty">
          <p>Няма намерени записи.</p>
        </div>
      ) : (
        <div className="audit-feed">
          {entries.map((entry, idx) => {
            const meta      = actionMeta[entry.action] ?? actionMeta.updated
            const roleColor = roleColors[entry.user_role] ?? '#94a3b8'
            const isLast    = idx === entries.length - 1
            const isOpen    = expandedId === entry.id
            const hasDiff   = entry.action === 'updated' && entry.metadata && Object.keys(entry.metadata).length > 0
            const hasDetails = hasDiff || entry.ip_address || entry.user_agent
            const isConfirmingDelete = confirmDeleteId === entry.id
            const isDeleting         = deletingId === entry.id

            return (
              <div key={entry.id} className="audit-row">
                {/* Timeline */}
                <div className="audit-timeline">
                  <div
                    className="audit-action-dot"
                    style={{ background: meta.bg, border: `1.5px solid ${meta.color}`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  {!isLast && <div className="audit-spine" />}
                </div>

                {/* Card */}
                <div className="audit-card">
                  {/* Avatar */}
                  <div
                    className="audit-avatar"
                    style={{ background: `${roleColor}22`, border: `1.5px solid ${roleColor}55`, color: roleColor }}
                    title={entry.user_name}
                  >
                    {getUserInitials(entry.user_name)}
                  </div>

                  {/* Content */}
                  <div className="audit-content">
                    <div className="audit-main">
                      <span className="audit-user">{entry.user_name}</span>
                      <span
                        className="audit-role-chip"
                        style={{ background: `${roleColor}18`, color: roleColor, borderColor: `${roleColor}44` }}
                      >
                        {entry.user_role}
                      </span>
                      <span
                        className="audit-action-badge"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {entry.tool_id ? (
                        <Link href={`/dashboard/tools/${entry.tool_id}`} className="audit-tool-link">
                          {entry.tool_name}
                        </Link>
                      ) : (
                        <span className="audit-tool-deleted">{entry.tool_name}</span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isOpen && hasDetails && (
                      <div className="audit-expanded">
                        {/* Field diff */}
                        {hasDiff && (
                          <div className="audit-diff-section">
                            {Object.entries(entry.metadata!).map(([field, val]) => (
                              <div key={field} className="audit-diff-row">
                                <span className="audit-diff-field">
                                  {fieldLabels[field] ?? field}
                                </span>
                                <span className="audit-diff-old" title={val.old ?? '(празно)'}>
                                  {truncate(val.old)}
                                </span>
                                <span className="audit-diff-arrow">→</span>
                                <span className="audit-diff-new" title={val.new ?? '(празно)'}>
                                  {truncate(val.new)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* IP + Browser + full timestamp */}
                        <div className="audit-meta-row">
                          {entry.ip_address && (
                            <span className="audit-meta-item">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                              {entry.ip_address}
                            </span>
                          )}
                          {entry.user_agent && (
                            <span className="audit-meta-item">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                              </svg>
                              {parseBrowser(entry.user_agent)}
                              {parseOS(entry.user_agent) ? ` / ${parseOS(entry.user_agent)}` : ''}
                            </span>
                          )}
                          <span className="audit-meta-item audit-meta-full-time">
                            {absoluteTime(entry.created_at)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Per-row delete confirmation */}
                    {isConfirmingDelete && (
                      <div className="audit-delete-confirm">
                        <span>Изтрий този запис?</span>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Изтриване...' : 'Да'}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={isDeleting}
                        >
                          Не
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: timestamp + expand + delete buttons */}
                  <div className="audit-right">
                    <span className="audit-time" title={absoluteTime(entry.created_at)}>
                      {relativeTime(entry.created_at)}
                    </span>
                    {hasDetails && (
                      <button
                        className={`audit-expand-btn${isOpen ? ' open' : ''}`}
                        onClick={() => setExpandedId(isOpen ? null : entry.id)}
                        title={isOpen ? 'Скрий детайли' : 'Покажи детайли'}
                      >
                        <ChevronIcon open={isOpen} />
                      </button>
                    )}
                    <button
                      className={`audit-delete-btn${isConfirmingDelete ? ' active' : ''}`}
                      onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : entry.id)}
                      title="Изтрий запис"
                      disabled={isDeleting}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
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
