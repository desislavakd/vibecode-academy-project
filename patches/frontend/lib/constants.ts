// Canonical source of truth for role colours and category palette.
// Import from here — never redeclare locally.

export const ALL_ROLES = ['owner', 'backend', 'frontend', 'qa', 'designer', 'pm'] as const

export const roleColors: Record<string, string> = {
  owner:    '#6366f1',
  backend:  '#22c55e',
  frontend: '#3b82f6',
  qa:       '#f97316',
  designer: '#ec4899',
  pm:       '#eab308',
}

export const catPalette = [
  { bg: 'rgba(99,102,241,0.15)',  border: '#6366f1', text: '#818cf8' },
  { bg: 'rgba(20,184,166,0.15)', border: '#14b8a6', text: '#2dd4bf' },
  { bg: 'rgba(249,115,22,0.15)', border: '#f97316', text: '#fb923c' },
  { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', text: '#f472b6' },
  { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', text: '#fbbf24' },
]
