'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import {
  getTool, getCategories, createCategory, getTags,
  updateTool, Category, Tag, Tool, ToolFormData,
} from '@/lib/tools'

const ALL_ROLES = ['owner', 'backend', 'frontend', 'qa', 'designer', 'pm']

export default function EditToolPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags]             = useState<Tag[]>([])
  const [loading, setLoading]       = useState(false)
  const [loadingTool, setLoadingTool] = useState(true)
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

  const [screenshots, setScreenshots] = useState([{ url: '', caption: '' }])
  const [examples, setExamples]       = useState([{ title: '', description: '', url: '' }])

  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatName, setNewCatName]   = useState('')
  const [newCatDesc, setNewCatDesc]   = useState('')
  const [catLoading, setCatLoading]   = useState(false)
  const [catError, setCatError]       = useState('')

  useEffect(() => {
    getUser().catch(() => router.replace('/login'))
    getCategories().then(setCategories).catch(console.error)
    getTags().then(setTags).catch(console.error)
  }, [router])

  useEffect(() => {
    if (!id) return
    getTool(Number(id))
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
      .catch(() => router.replace('/dashboard/tools'))
      .finally(() => setLoadingTool(false))
  }, [id, router])

  function toggleRole(role: string) {
    setSelRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  function toggleCategory(catId: number) {
    setSelCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
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

    const data: Partial<ToolFormData> = {
      name:        name.trim(),
      url:         url.trim(),
      description: desc.trim(),
      how_to_use:  howTo.trim() || undefined,
      documentation_url: docUrl.trim() || undefined,
      categories:  selCategories,
      roles:       selRoles,
      tags:        selTags,
      screenshots: cleanScreenshots,
      examples:    cleanExamples,
    }

    setLoading(true)
    try {
      const tool = await updateTool(Number(id), data)
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

  if (loadingTool) return <div className="page"><p>Зареждане...</p></div>

  return (
    <div className="page">
      <div className="form-page-header">
        <Link href={`/dashboard/tools/${id}`} className="btn btn-outline">← Обратно</Link>
        <h1>Редактирай инструмент</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="tool-form">

        <div className="form-section">
          <h2>Основна информация</h2>

          <div className="form-group">
            <label>Име *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>URL *</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Описание *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} required />
          </div>

          <div className="form-group">
            <label>Как се използва</label>
            <textarea value={howTo} onChange={e => setHowTo(e.target.value)} rows={3} />
          </div>
        </div>

        <div className="form-section">
          <h2>Класификация</h2>

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
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCatForm(true)}>
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
                  <button type="button" className="btn btn-primary btn-sm" disabled={catLoading} onClick={handleAddCategory}>
                    {catLoading ? 'Добавяне...' : 'Добави'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowCatForm(false); setCatError('') }}>
                    Отказ
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Тагове</label>
            <div className="tag-input-row">
              <input
                type="text"
                placeholder="Добави таг..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                list="tags-datalist"
              />
              <datalist id="tags-datalist">
                {tags.map(t => <option key={t.id} value={t.name} />)}
              </datalist>
              <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>+</button>
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

        <div className="form-section">
          <h2>Ресурси</h2>

          <div className="form-group">
            <label>Официална документация (URL)</label>
            <input type="url" value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Скрийншоти (URL)</label>
            {screenshots.map((s, i) => (
              <div key={i} className="repeatable-row">
                <input
                  type="url"
                  placeholder="https://..."
                  value={s.url}
                  onChange={e => {
                    const updated = [...screenshots]
                    updated[i] = { ...updated[i], url: e.target.value }
                    setScreenshots(updated)
                  }}
                />
                <input
                  type="text"
                  placeholder="Надпис"
                  value={s.caption}
                  onChange={e => {
                    const updated = [...screenshots]
                    updated[i] = { ...updated[i], caption: e.target.value }
                    setScreenshots(updated)
                  }}
                />
                {screenshots.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                )}
              </div>
            ))}
            {screenshots.length < 5 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setScreenshots(prev => [...prev, { url: '', caption: '' }])}>
                + Добави скрийншот
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Реални примери</label>
            {examples.map((ex, i) => (
              <div key={i} className="repeatable-block">
                <input
                  type="text"
                  placeholder="Заглавие *"
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
                  placeholder="Линк"
                  value={ex.url}
                  onChange={e => {
                    const updated = [...examples]
                    updated[i] = { ...updated[i], url: e.target.value }
                    setExamples(updated)
                  }}
                />
                {examples.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => setExamples(prev => prev.filter((_, idx) => idx !== i))}>× Премахни</button>
                )}
              </div>
            ))}
            {examples.length < 5 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setExamples(prev => [...prev, { title: '', description: '', url: '' }])}>
                + Добави пример
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Link href={`/dashboard/tools/${id}`} className="btn btn-outline">Отказ</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Запазване...' : 'Запази промените'}
          </button>
        </div>

      </form>
    </div>
  )
}
