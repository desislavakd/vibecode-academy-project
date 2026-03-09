'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import {
  getTool, getCategories, createCategory, getTags,
  createTool, updateTool, Category, Tag, Tool, ToolFormData,
} from '@/lib/tools'
import type { ApiError } from '@/lib/tools'
import { ALL_ROLES, roleColors } from '@/lib/constants'
import { updateArrayItem } from '@/lib/utils'

interface ToolFormProps {
  mode: 'create' | 'edit'
  toolId?: number
}

export default function ToolForm({ mode, toolId }: ToolFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags]             = useState<Tag[]>([])
  const [loading, setLoading]       = useState(false)
  const [loadingTool, setLoadingTool] = useState(isEdit)
  const [error, setError]           = useState('')

  const [name, setName]     = useState('')
  const [url, setUrl]       = useState('')
  const [desc, setDesc]     = useState('')
  const [howTo, setHowTo]   = useState('')
  const [docUrl, setDocUrl] = useState('')

  const [selCategories, setSelCategories] = useState<number[]>([])
  const [selRoles, setSelRoles]           = useState<string[]>([])
  const [selTags, setSelTags]             = useState<string[]>([])
  const [tagInput, setTagInput]           = useState('')

  const tagSuggestions = tagInput.trim().length > 0
    ? tags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selTags.includes(t.name)).slice(0, 8)
    : []

  const [screenshots, setScreenshots] = useState([{ url: '', caption: '' }])
  const [examples, setExamples]       = useState([{ title: '', description: '', url: '' }])

  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatName, setNewCatName]   = useState('')
  const [newCatDesc, setNewCatDesc]   = useState('')
  const [catLoading, setCatLoading]   = useState(false)
  const [catError, setCatError]       = useState('')

  useEffect(() => {
    getUser().catch(() => router.replace('/login'))
    getCategories().then(setCategories).catch(() =>
      setError('Неуспешно зареждане на категориите. Презаредете страницата.')
    )
    getTags().then(setTags).catch(() =>
      setError('Неуспешно зареждане на таговете. Презаредете страницата.')
    )
  }, [router])

  useEffect(() => {
    if (!isEdit || !toolId) return
    getTool(toolId)
      .then((tool: Tool) => {
        setName(tool.name)
        setUrl(tool.url)
        setDesc(tool.description)
        setHowTo(tool.how_to_use ?? '')
        setDocUrl(tool.documentation_url ?? '')
        setSelCategories(tool.categories.map(c => c.id))
        setSelRoles(tool.roles)
        setSelTags(tool.tags.map(t => t.name))
        setScreenshots(
          tool.screenshots.length
            ? tool.screenshots.map(s => ({ url: s.url, caption: s.caption ?? '' }))
            : [{ url: '', caption: '' }]
        )
        setExamples(
          tool.examples.length
            ? tool.examples.map(e => ({ title: e.title, description: e.description ?? '', url: e.url ?? '' }))
            : [{ title: '', description: '', url: '' }]
        )
      })
      .catch((e) => {
        const err = e as ApiError
        setError(err.message ?? 'Не можахме да заредим инструмента.')
      })
      .finally(() => setLoadingTool(false))
  }, [isEdit, toolId, router])

  function toggleRole(role: string) {
    setSelRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  function toggleCategory(id: number) {
    setSelCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !selTags.includes(t)) setSelTags(prev => [...prev, t])
    setTagInput('')
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    setCatLoading(true)
    setCatError('')
    try {
      const cat = await createCategory(newCatName.trim(), newCatDesc.trim() || undefined)
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setSelCategories(prev => [...prev, cat.id])
      setNewCatName('')
      setNewCatDesc('')
      setShowCatForm(false)
    } catch (e) {
      const err = e as ApiError
      setCatError(err.errors?.name?.[0] ?? err.message ?? 'Грешка при добавяне на категория')
    } finally {
      setCatLoading(false)
    }
  }

  function buildPayload(): Partial<ToolFormData> {
    const cleanScreenshots = screenshots.filter(s => s.url.trim())
    const cleanExamples    = examples.filter(ex => ex.title.trim())

    if (isEdit) {
      // Send all fields so the backend can clear previously set values (null).
      return {
        name:              name.trim(),
        url:               url.trim(),
        description:       desc.trim(),
        how_to_use:        howTo.trim() || null,
        documentation_url: docUrl.trim() || null,
        categories:        selCategories,
        roles:             selRoles,
        tags:              selTags,
        screenshots:       cleanScreenshots,
        examples:          cleanExamples,
      }
    }

    // Create: omit empty optional fields so the backend stores clean nulls.
    return {
      name:              name.trim(),
      url:               url.trim(),
      description:       desc.trim(),
      how_to_use:        howTo.trim() || undefined,
      documentation_url: docUrl.trim() || undefined,
      categories:        selCategories.length ? selCategories : undefined,
      roles:             selRoles.length ? selRoles : undefined,
      tags:              selTags.length ? selTags : undefined,
      screenshots:       cleanScreenshots.length ? cleanScreenshots : undefined,
      examples:          cleanExamples.length ? cleanExamples : undefined,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = buildPayload()
      const tool = isEdit
        ? await updateTool(toolId!, data)
        : await createTool(data as ToolFormData)
      router.push(`/dashboard/tools/${tool.id}`)
    } catch (e) {
      const err = e as ApiError
      const messages = err.errors
        ? Object.values(err.errors).flat().join(' ')
        : (err.message ?? 'Грешка при запазване')
      setError(messages)
    } finally {
      setLoading(false)
    }
  }

  const backHref   = isEdit ? `/dashboard/tools/${toolId}` : '/dashboard/tools'
  const pageTitle  = isEdit ? 'Редактирай инструмент' : 'Нов инструмент'
  const submitText = isEdit ? 'Запази промените' : 'Запази инструмента'

  if (loadingTool) return <div className="page"><p>Зареждане...</p></div>

  return (
    <div className="page">
      <div className="form-page-header">
        <Link
          href={backHref}
          className={isEdit ? 'btn btn-primary' : 'tool-breadcrumb-link'}
        >
          ← Обратно
        </Link>
        <h1>{pageTitle}</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="tool-form">

        {/* Section 1: Basic info */}
        <div className="form-section">
          <h2>Основна информация</h2>

          <div className="form-group">
            <label>Име *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. ChatGPT"
              required
            />
          </div>

          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label>Описание *</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Какво прави този инструмент?"
              required
            />
          </div>

          <div className="form-group">
            <label>Как се използва</label>
            <textarea
              value={howTo}
              onChange={e => setHowTo(e.target.value)}
              rows={3}
              placeholder="Стъпки за употреба, tips..."
            />
          </div>
        </div>

        {/* Section 2: Classification */}
        <div className="form-section">
          <h2>Класификация</h2>

          {/* Roles */}
          <div className="form-group">
            <label>Препоръчителни роли</label>
            <div className="checkbox-group">
              {ALL_ROLES.map(role => {
                const checked = selRoles.includes(role)
                const color   = roleColors[role]
                return (
                  <label
                    key={role}
                    className={`role-chip-checkbox${checked ? ' is-checked' : ''}`}
                    style={{
                      backgroundColor: color + (checked ? '33' : '15'),
                      color: color,
                      border: `1px solid ${color}${checked ? '66' : '30'}`,
                      opacity: checked ? 1 : 0.55,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="form-group">
            <label>Категории</label>
            <div className="checkbox-group">
              {categories.map(cat => {
                const checked = selCategories.includes(cat.id)
                return (
                  <label
                    key={cat.id}
                    className={`cat-chip-checkbox${checked ? ' is-checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    {cat.name}
                  </label>
                )
              })}
            </div>
            {!showCatForm ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowCatForm(true)}
              >
                + Нова категория
              </button>
            ) : (
              <div className="inline-form">
                {catError && <p className="alert-error">{catError}</p>}
                <input
                  type="text"
                  placeholder="Име на категория *"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Описание (по желание)"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                />
                <div className="inline-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={catLoading}
                    onClick={handleAddCategory}
                  >
                    {catLoading ? 'Добавяне...' : 'Добави'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => { setShowCatForm(false); setCatError('') }}
                  >
                    Отказ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Тагове</label>
            <div className="tag-autocomplete">
              <div className="tag-input-row">
                <input
                  type="text"
                  placeholder="Добави таг..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  autoComplete="off"
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>
                  +
                </button>
              </div>
              {tagSuggestions.length > 0 && (
                <div className="tag-suggestions">
                  {tagSuggestions.map(t => (
                    <div
                      key={t.id}
                      className="tag-suggestion-item"
                      onMouseDown={() => {
                        setSelTags(prev => [...prev, t.name])
                        setTagInput('')
                      }}
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selTags.length > 0 && (
              <div className="tag-chips">
                {selTags.map(t => (
                  <span key={t} className="tag-chip">
                    {t}
                    <button type="button" onClick={() => setSelTags(prev => prev.filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Resources */}
        <div className="form-section">
          <h2>Ресурси</h2>

          <div className="form-group">
            <label>Официална документация (URL)</label>
            <input
              type="url"
              value={docUrl}
              onChange={e => setDocUrl(e.target.value)}
              placeholder="https://docs.example.com"
            />
          </div>

          {/* Screenshots */}
          <div className="form-group">
            <label>Скрийншоти (URL)</label>
            {screenshots.map((s, i) => (
              <div key={i} className="repeatable-row">
                <input
                  type="url"
                  placeholder="https://i.imgur.com/example.png"
                  value={s.url}
                  onChange={e => setScreenshots(prev => updateArrayItem(prev, i, { url: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Надпис (по желание)"
                  value={s.caption}
                  onChange={e => setScreenshots(prev => updateArrayItem(prev, i, { caption: e.target.value }))}
                />
                {screenshots.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {screenshots.length < 5 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setScreenshots(prev => [...prev, { url: '', caption: '' }])}
              >
                + Добави скрийншот
              </button>
            )}
          </div>

          {/* Examples */}
          <div className="form-group">
            <label>Реални примери</label>
            {examples.map((ex, i) => (
              <div key={i} className="repeatable-block">
                <input
                  type="text"
                  placeholder="Заглавие на примера *"
                  value={ex.title}
                  onChange={e => setExamples(prev => updateArrayItem(prev, i, { title: e.target.value }))}
                />
                <textarea
                  placeholder="Описание..."
                  rows={2}
                  value={ex.description}
                  onChange={e => setExamples(prev => updateArrayItem(prev, i, { description: e.target.value }))}
                />
                <input
                  type="url"
                  placeholder="Линк (по желание)"
                  value={ex.url}
                  onChange={e => setExamples(prev => updateArrayItem(prev, i, { url: e.target.value }))}
                />
                {examples.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setExamples(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    × Премахни
                  </button>
                )}
              </div>
            ))}
            {examples.length < 5 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setExamples(prev => [...prev, { title: '', description: '', url: '' }])}
              >
                + Добави пример
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Link href={backHref} className="btn btn-outline">Отказ</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Запазване...' : submitText}
          </button>
        </div>

      </form>
    </div>
  )
}
