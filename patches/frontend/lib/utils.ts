import type { MouseEvent } from 'react'

/**
 * Returns a Google favicon URL for the given tool URL.
 * Falls back to '' on invalid URLs (caller should hide the <img> element).
 */
export function getFaviconUrl(url: string, size = 64): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
  } catch {
    return ''
  }
}

/** 3-D tilt on mouse move — attach to onMouseMove of a card wrapper. */
export function handleTilt(e: MouseEvent<HTMLDivElement>): void {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const rotateY =  ((e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2)) * 8
  const rotateX = -((e.clientY - rect.top   - rect.height / 2) / (rect.height / 2)) * 8
  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`
}

/** Resets the tilt transform — attach to onMouseLeave of a card wrapper. */
export function handleTiltReset(e: MouseEvent<HTMLDivElement>): void {
  e.currentTarget.style.transform = ''
}

/**
 * Returns a new array with item at `index` shallow-merged with `patch`.
 * Use for immutable updates inside array-backed form fields.
 */
export function updateArrayItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

/**
 * Converts a filter object into a URL query string.
 * Falsy values (undefined, '', 0, null) are omitted.
 */
export function buildQueryString(filters: object): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value))
  }
  return params.toString()
}
