import { csrfHeaders } from './auth'

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

export async function getTools(filters: ToolFilters = {}): Promise<PaginatedTools> {
  const params = new URLSearchParams()
  if (filters.search)   params.set('search', filters.search)
  if (filters.role)     params.set('role', filters.role)
  if (filters.category) params.set('category', filters.category)
  if (filters.tag)      params.set('tag', filters.tag)
  if (filters.status)   params.set('status', filters.status)
  if (filters.page)     params.set('page', String(filters.page))

  const res = await fetch(`/api/tools?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch tools')
  return res.json()
}

export async function getTool(id: number): Promise<Tool> {
  const res = await fetch(`/api/tools/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Tool not found')
  const json = await res.json()
  return json.data
}

export async function createTool(data: ToolFormData): Promise<Tool> {
  const res = await fetch('/api/tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw err
  }
  const json = await res.json()
  return json.data
}

export async function updateTool(id: number, data: Partial<ToolFormData>): Promise<Tool> {
  const res = await fetch(`/api/tools/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw err
  }
  const json = await res.json()
  return json.data
}

export async function deleteTool(id: number): Promise<void> {
  const res = await fetch(`/api/tools/${id}`, {
    method: 'DELETE',
    headers: csrfHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete tool')
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch categories')
  const json = await res.json()
  return json.data
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw err
  }
  const json = await res.json()
  return json.data
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch('/api/tags', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch tags')
  const json = await res.json()
  return json.data
}

export async function approveTool(id: number): Promise<Tool> {
  const res = await fetch(`/api/tools/${id}/approve`, {
    method: 'POST',
    headers: csrfHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to approve tool')
  const json = await res.json()
  return json.data
}

export async function rejectTool(id: number): Promise<Tool> {
  const res = await fetch(`/api/tools/${id}/reject`, {
    method: 'POST',
    headers: csrfHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to reject tool')
  const json = await res.json()
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
  const params = new URLSearchParams()
  if (filters.action)  params.set('action',  filters.action)
  if (filters.search)  params.set('search',  filters.search)
  if (filters.from)    params.set('from',    filters.from)
  if (filters.to)      params.set('to',      filters.to)
  if (filters.user_id) params.set('user_id', String(filters.user_id))
  if (filters.page)    params.set('page',    String(filters.page))

  const res = await fetch(`/api/audit-logs?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch audit logs')
  return res.json()
}

export async function deleteAuditLog(id: number): Promise<void> {
  const res = await fetch(`/api/audit-logs/${id}`, {
    method: 'DELETE',
    headers: csrfHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete audit log entry')
}
