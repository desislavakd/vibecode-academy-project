import { csrfHeaders } from './auth'
import { buildQueryString } from './utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface ToolAuthor {
  id: number
  name: string
}

export interface Screenshot {
  id: number
  url: string
  caption: string | null
}

export interface Example {
  id: number
  title: string
  description: string | null
  url: string | null
}

export interface Tool {
  id: number
  name: string
  url: string
  description: string
  how_to_use: string | null
  documentation_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_by: ToolAuthor
  categories: Category[]
  tags: Tag[]
  roles: string[]
  screenshots: Screenshot[]
  examples: Example[]
  created_at: string
  ratings_avg: number | null
  ratings_count: number | null
  user_rating: number | null
}

export interface PaginatedTools {
  data: Tool[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ToolFilters {
  search?: string
  role?: string
  category?: string
  tag?: string
  status?: string
  min_rating?: number
  page?: number
}

export interface ToolFormData {
  name: string
  url: string
  description: string
  how_to_use?: string | null
  documentation_url?: string | null
  categories?: number[]
  roles?: string[]
  tags?: string[]
  screenshots?: { url: string; caption?: string }[]
  examples?: { title: string; description?: string; url?: string }[]
}

export interface RatingResult {
  average: number
  count: number
  user_rating: number
}

/** Unified error shape thrown by all API functions. */
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ─── Internal fetch helper ───────────────────────────────────────────────────

/**
 * Wraps fetch with shared concerns: credentials, CSRF headers, JSON body,
 * and a unified error model. All API functions delegate to this helper.
 */
async function apiFetch<T = void>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        ...(method !== 'GET' ? csrfHeaders() : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw { message: 'Мрежова грешка. Проверете връзката си с интернет.' } as ApiError
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Невалиден отговор от сървъра.' }))
    throw { message: data.message ?? 'Request failed', errors: data.errors } as ApiError
  }

  // 204 No Content (e.g. DELETE responses)
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export async function getTools(filters: ToolFilters = {}): Promise<PaginatedTools> {
  const qs = buildQueryString(filters)
  return apiFetch<PaginatedTools>('GET', `/api/tools?${qs}`)
}

export async function getTool(id: number): Promise<Tool> {
  const json = await apiFetch<{ data: Tool }>('GET', `/api/tools/${id}`)
  return json.data
}

export async function createTool(data: ToolFormData): Promise<Tool> {
  const json = await apiFetch<{ data: Tool }>('POST', '/api/tools', data)
  return json.data
}

export async function updateTool(id: number, data: Partial<ToolFormData>): Promise<Tool> {
  const json = await apiFetch<{ data: Tool }>('PUT', `/api/tools/${id}`, data)
  return json.data
}

export async function deleteTool(id: number): Promise<void> {
  await apiFetch('DELETE', `/api/tools/${id}`)
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const json = await apiFetch<{ data: Category[] }>('GET', '/api/categories')
  return json.data
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const json = await apiFetch<{ data: Category }>('POST', '/api/categories', { name, description })
  return json.data
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const json = await apiFetch<{ data: Tag[] }>('GET', '/api/tags')
  return json.data
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export async function rateTool(id: number, rating: number): Promise<RatingResult> {
  return apiFetch<RatingResult>('POST', `/api/tools/${id}/rate`, { rating })
}

// ─── Approve / Reject ────────────────────────────────────────────────────────

export async function approveTool(id: number): Promise<Tool> {
  const json = await apiFetch<{ data: Tool }>('POST', `/api/tools/${id}/approve`)
  return json.data
}

export async function rejectTool(id: number): Promise<Tool> {
  const json = await apiFetch<{ data: Tool }>('POST', `/api/tools/${id}/reject`)
  return json.data
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: number
  user_id: number | null
  user_name: string
  user_role: string
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'deleted'
  tool_id: number | null
  tool_name: string
  tool_url: string | null
  metadata: Record<string, { old: string | null; new: string | null }> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}

export interface AuditLogFilters {
  action?: string
  search?: string
  from?: string    // YYYY-MM-DD
  to?: string      // YYYY-MM-DD
  user_id?: number
  page?: number
}

export interface PaginatedAuditLog {
  data: AuditEntry[]
  meta: { total: number; page: number; last_page: number }
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedAuditLog> {
  const qs = buildQueryString(filters)
  return apiFetch<PaginatedAuditLog>('GET', `/api/audit-logs?${qs}`)
}

export async function deleteAuditLog(id: number): Promise<void> {
  await apiFetch('DELETE', `/api/audit-logs/${id}`)
}
