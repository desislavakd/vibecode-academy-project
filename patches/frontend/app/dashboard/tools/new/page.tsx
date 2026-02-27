'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import {
  getCategories, createCategory, getTags,
  createTool, Category, Tag, ToolFormData,
} from '@/lib/tools'

const ALL_ROLES = ['owner', 'backend', 'frontend', 'qa', 'designer', 'pm']

export default function NewToolPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags]             = useState<Tag[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Form fields
  const [name, setName]       = useState('')
  const [url, setUrl]         = useState('')
  const [desc, setDesc]       = useState('')
  const [howTo, setHowTo]     = useState('')
  const [docUrl, setDocUrl]   = useState('')

  const [selCategories, setSelCategories] = useState<number[]>([])
  const [selRoles, setSelRoles]           = useState<string[]>([])
  const [selTags, setSelTags]             = useState<string[]>([])
  const [tagInput, setTagInput]           = useState('')

  const tagSuggestions = tagInput.trim().length > 0
    ? tags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selTags.includes(t.name)).slice(0, 8)
    : []

  const [screenshots, setScreenshots] = useState([{ url: '', caption: '' }])
  const [examples, setExamples]       = useState([{ title: '', description: '', url: '' }])

  // New category inline form
  const [showCatForm, setShowCatForm]   = useState(false)
  const [newCatName, setNewCatName]     = useState('')
  const [newCatDesc, setNewCatDesc]     = useState('')
  const [catLoading, setCatLoading]     = useState(false)
  const [catError, setCatError]         = useState('')

  useEffect(() => {
    getUser().catch(() => router.replace('/login'))
    getCategories().then(setCategories).catch(console.error)
    getTags().then(setTags).catch(console.error)
  }, [router])

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
    if (t && !selTags.includes(t)) {
      setSelTags(prev => [...prev, t])
    }
    setTagInput('')
  }

  function addScreenshot() {
    setScreenshots(prev => [...prev, { url: '', caption: '' }])
  }

  function addExample() {
    setExamples(prev => [...prev, { title: '', description: '', url: '' }])
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
    } catch (e: any) {
      setCatError(e?.errors?.name?.[0] ?? 'Грешка при добавяне на категория')
    } finally {
      setCatLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const cleanScreenshots = screenshots.filter(s => s.url.trim())
    const cleanExamples    = examples.filter(ex => ex.title.trim())

    const data: ToolFormData = {
      name:        name.trim(),
      url:         url.trim(),
      description: desc.trim(),
      how_to_use:  howTo.trim() || undefined,
      documentation_url: docUrl.trim() || undefined,
      categories:  selCategories.length ? selCategories : undefined,
      roles:       selRoles.length ? selRoles : undefined,
      tags:        selTags.length ? selTags : undefined,
      screenshots: cleanScreenshots.length ? cleanScreenshots : undefined,
      examples:    cleanExamples.length ? cleanExamples : undefined,
    }

    setLoading(true)
    try {
      const tool = await createTool(data)
      router.push(`/dashboard/tools/${tool.id}`)
    } catch (e: any) {
      const messages = e?.errors
        ? Object.values(e.errors).flat().join(' ')
        : e?.message ?? 'Грешка при запазване'
      setError(String(messages))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="form-page-header">
        <Link href="/dashboard/tools" className="tool-breadcrumb-link">← Обратно</Link>
        <h1>Нов инструмент</h1>
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
              {ALL_ROLES.map(role => (
                <label key={role} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="form-group">
            <label>Категории</label>
            <div className="checkbox-group">
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
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
                  onChange={e => {
                    const updated = [...screenshots]
                    updated[i] = { ...updated[i], url: e.target.value }
                    setScreenshots(updated)
                  }}
                />
                <input
                  type="text"
                  placeholder="Надпис (по желание)"
                  value={s.caption}
                  onChange={e => {
                    const updated = [...screenshots]
                    updated[i] = { ...updated[i], caption: e.target.value }
                    setScreenshots(updated)
                  }}
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
              <button type="button" className="btn btn-outline btn-sm" onClick={addScreenshot}>
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
                  onChange={e => {
                    const updated = [...examples]
                    updated[i] = { ...updated[i], title: e.target.value }
                    setExamples(updated)
                  }}
                />
                <textarea
                  placeholder="Описание..."
                  rows={2}
                  value={ex.description}
                  onChange={e => {
                    const updated = [...examples]
                    updated[i] = { ...updated[i], description: e.target.value }
                    setExamples(updated)
                  }}
                />
                <input
                  type="url"
                  placeholder="Линк (по желание)"
                  value={ex.url}
                  onChange={e => {
                    const updated = [...examples]
                    updated[i] = { ...updated[i], url: e.target.value }
                    setExamples(updated)
                  }}
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
              <button type="button" className="btn btn-outline btn-sm" onClick={addExample}>
                + Добави пример
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Link href="/dashboard/tools" className="btn btn-outline">Отказ</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Запазване...' : 'Запази инструмента'}
          </button>
        </div>

      </form>
    </div>
  )
}
