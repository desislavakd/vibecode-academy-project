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
  status: 'draft' | 'published'
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
  page?: number
}

export interface ToolFormData {
  name: string
  url: string
  description: string
  how_to_use?: string
  documentation_url?: string
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
