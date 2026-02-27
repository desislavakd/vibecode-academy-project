# ToolHive — Frontend

Next.js 16 (App Router, TypeScript) frontend for the ToolHive internal tools platform.

> **Do not edit files here directly.**
> Edit in `patches/frontend/` and run:
> ```bash
> bash scripts/apply-frontend.sh && docker compose up -d --force-recreate node
> ```

---

## Stack

- **Framework:** Next.js 16 (App Router, `"use client"` components)
- **Language:** TypeScript
- **Fonts:** Space Grotesk (headings, buttons, nav) + DM Sans (body) via `next/font/google`
- **Styling:** Single global CSS file — `app/globals.css` — dark design system, no Tailwind
- **Auth:** Session-based via Laravel Fortify, CSRF cookie pattern

---

## Design System

```css
--color-bg:      #0f172a   /* page background */
--color-surface: #1e293b   /* cards, sidebar */
--color-border:  #334155
--color-text:    #f1f5f9
--color-muted:   #94a3b8
--color-primary: #f97316   /* orange */

/* Brand gradient (logo, back buttons) */
background: linear-gradient(135deg, #f97316, #ef4444, #ec4899)
```

Responsive: sidebar collapses to bottom navigation bar on mobile (`max-width: 768px`).

---

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login form |
| `/dashboard` | Auth | Tools listing — approved only, filters: search / role / category |
| `/dashboard/tools/new` | Auth | Create new tool |
| `/dashboard/tools/[id]` | Auth | Tool detail |
| `/dashboard/tools/edit/[id]` | Auth | Edit tool (Turbopack workaround — see below) |
| `/dashboard/admin` | Owner | Admin Panel — approve / reject pending tools |
| `/dashboard/admin/audit` | Owner | Audit Log — activity timeline with filters and per-entry delete |
| `/dashboard/settings` | Auth | Two-Factor Authentication settings |

### Route protection

`middleware.ts` (Edge Runtime) checks `/dashboard/admin/*`:
- 401 from `/api/me` → redirect `/login`
- role ≠ `owner` → redirect `/dashboard`

### Turbopack workaround

Edit page lives at `edit/[id]/page.tsx` (not `[id]/edit`).
`next.config.ts` rewrite: `/dashboard/tools/:id/edit` → `/dashboard/tools/edit/:id`.

---

## Key source files (in `patches/frontend/`)

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout — loads both Google Fonts |
| `app/globals.css` | All styles — single file |
| `middleware.ts` | Edge Runtime route guard for `/dashboard/admin/*` |
| `lib/auth.ts` | `fetchCsrfCookie`, `login`, `getUser`, `logout` |
| `lib/tools.ts` | All API calls: tools, categories, tags, audit log |
| `components/Sidebar.tsx` | Navigation — shows Admin Panel + Audit Log links for owner |
| `app/dashboard/admin/page.tsx` | Admin Panel |
| `app/dashboard/admin/audit/page.tsx` | Audit Log |
| `app/dashboard/settings/page.tsx` | 2FA settings |

---

## Environment

`frontend/.env.local` (copied from `patches/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_INTERNAL_URL=http://nginx
```

---

## Development

The frontend runs inside Docker (port 3000). Do **not** run `npm run dev` locally.
After every change in `patches/frontend/`:

```bash
bash scripts/apply-frontend.sh && docker compose up -d --force-recreate node
```

Or with make:

```bash
make apply-frontend
```
