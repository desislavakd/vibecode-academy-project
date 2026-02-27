# ToolHive

> An internal platform for discovering, sharing, and managing AI tools across your team.

ToolHive gives every team member a single place to add the AI tools they rely on, browse what colleagues have shared, and keep the catalogue organized by role, category, and tag. Owners keep quality high through an approval workflow and a full audit log.

---

## Key Features

- **Tool catalogue** — Browse approved AI tools filtered by role, category, or tag.
- **Submit & manage tools** — Any team member can submit a tool; owners review before it goes live.
- **Role-based access** — Six roles (owner, backend, frontend, qa, designer, pm) with fine-grained permissions.
- **Approval workflow** — Pending → Approved / Rejected; owners act from the Admin Panel.
- **Audit log** — Every create, update, approve, reject, and delete is recorded with actor, diff, IP, and browser info.
- **Two-factor authentication** — TOTP-based 2FA that each user controls from their Settings page.
- **Redis caching** — Tools, categories, and tags are cached for fast page loads; cache is invalidated automatically on writes.
- **Dark design system** — Consistent dark UI with Space Grotesk headings and DM Sans body text.

---

## Tech Stack

| Layer             | Technology                                  |
|-------------------|---------------------------------------------|
| Backend           | Laravel 11 (PHP 8.3) + Laravel Fortify      |
| Database          | MySQL 8                                     |
| Cache / Session   | Redis 7                                     |
| Frontend          | Next.js 16 (App Router, TypeScript)         |
| Web server        | nginx                                       |
| Runtime           | Docker / Docker Compose                     |
| Development Tools | Developed with Claude Code using an AI-augmented workflow |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd vibecode-academy-project

# 2. Build the Docker images
docker compose build

# 3. Install Laravel dependencies and scaffold the backend
docker compose run --rm composer create-project laravel/laravel . --prefer-dist
cp patches/laravel.env backend/.env
docker compose run --rm composer require laravel/fortify

# 4. Apply custom backend source files
bash scripts/apply-backend.sh

# 5. Generate the application key and start all services
docker compose run --rm php php artisan key:generate
docker compose up -d

# 6. Wait ~10 seconds for MySQL, then run migrations and seed demo data
docker compose exec php php artisan migrate
docker compose exec php php artisan db:seed

# 7. Scaffold the Next.js frontend
docker compose run --rm -w /app node sh -c \
  "npx create-next-app@latest . --typescript --app --no-git --tailwind --src-dir=false --import-alias='@/*' --yes"

# 8. Apply custom frontend source files and restart the node container
bash scripts/apply-frontend.sh
cp patches/frontend/.env.local frontend/.env.local
docker compose up -d --force-recreate node
```

### Accessing the App

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8000 |

### Demo Accounts

All demo accounts use the password **`password`**.

| Name            | Email                  | Role     |
|-----------------|------------------------|----------|
| Иван Иванов     | ivan@admin.local       | owner    |
| Елена Петрова   | elena@frontend.local   | frontend |
| Петър Георгиев  | petar@backend.local    | backend  |

### Day-to-day Commands

```bash
# Start / stop
docker compose up -d
docker compose down

# Apply source file changes
bash scripts/apply-backend.sh
bash scripts/apply-frontend.sh && docker compose up -d --force-recreate node

# Database
docker compose exec php php artisan migrate
docker compose exec php php artisan db:seed
docker compose exec php php artisan migrate:fresh --seed

# Cache
docker compose exec php php artisan config:clear && php artisan route:clear
docker compose exec redis redis-cli -n 1 FLUSHDB

# Logs
docker compose logs -f node
docker compose logs -f php
```

---

## Project Structure

```
vibecode-academy-project/
├── docker-compose.yml
├── Makefile
├── README.md
├── CLAUDE.md                          ← AI development constitution
│
├── docker/
│   ├── nginx/default.conf
│   └── php/Dockerfile + php.ini
│
├── scripts/
│   ├── apply-backend.sh               ← copies patches/backend/ → backend/
│   └── apply-frontend.sh              ← copies patches/frontend/ → frontend/ + restarts node
│
├── patches/                           ← SOURCE OF TRUTH — always edit here, never in backend/ or frontend/
│   ├── laravel.env                    ← backend .env template (never committed)
│   ├── backend/
│   │   ├── app/
│   │   │   ├── Enums/UserRole.php
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/       ← ToolController, AuditLogController, CategoryController, TagController
│   │   │   │   ├── Middleware/EnsureRole.php
│   │   │   │   ├── Requests/          ← StoreToolRequest, UpdateToolRequest, StoreCategoryRequest
│   │   │   │   └── Resources/         ← ToolResource, CategoryResource, TagResource
│   │   │   ├── Models/                ← User, Tool, AuditLog, Category, Tag, ToolRole, Screenshot, Example
│   │   │   ├── Policies/ToolPolicy.php
│   │   │   └── Providers/FortifyServiceProvider.php
│   │   ├── config/cors.php, fortify.php
│   │   ├── database/
│   │   │   ├── migrations/            ← 13 migrations (roles, tools, categories, tags, 2FA, audit log)
│   │   │   └── seeders/               ← User, Category, Tag, Tool seeders
│   │   └── routes/web.php
│   └── frontend/
│       ├── next.config.ts
│       ├── middleware.ts              ← Edge Runtime — protects /dashboard/admin/*
│       ├── app/
│       │   ├── layout.tsx             ← Space Grotesk + DM Sans fonts
│       │   ├── globals.css            ← single CSS file, full dark design system
│       │   ├── login/page.tsx
│       │   └── dashboard/
│       │       ├── page.tsx           ← tools listing (approved only)
│       │       ├── tools/new/page.tsx
│       │       ├── tools/[id]/page.tsx
│       │       ├── tools/edit/[id]/page.tsx
│       │       ├── admin/page.tsx     ← Admin Panel (approve / reject)
│       │       ├── admin/audit/page.tsx  ← Audit Log feed
│       │       └── settings/page.tsx  ← Two-Factor Auth
│       ├── components/Sidebar.tsx     ← navigation; admin links visible to owner only
│       └── lib/
│           ├── auth.ts                ← login, logout, getUser, 2FA helpers
│           └── tools.ts               ← getTools, approveTool, rejectTool, getAuditLogs, …
│
├── backend/                           ← generated by install — do not edit directly
└── frontend/                          ← generated by install — do not edit directly
```
