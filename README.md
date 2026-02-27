# ToolHive

Internal AI tools sharing platform. Team members can add, browse and manage AI tools by role and category.

---

## Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Backend       | Laravel 11 (PHP 8.3) + Fortify          |
| Database      | MySQL 8                                 |
| Cache/Session | Redis 7                                 |
| Frontend      | Next.js 16 (App Router, TypeScript)     |
| Fonts         | Space Grotesk + DM Sans (next/font/google) |
| Web server    | nginx                                   |
| Runtime       | Docker / Docker Compose                 |

---

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Git
- `make` (optional but recommended)

---

## First-time Setup

```bash
# 1. Clone the repo
cd vibecode-academy-project

# 2. Build images
docker compose build

# 3. Run the install script (installs Laravel, Fortify, Next.js, seeds DB)
bash scripts/install.sh

# 4. Start everything
docker compose up -d
```

Then open:
- **Frontend:** http://localhost:3000
- **Backend (direct):** http://localhost:8000

---

## Manual step-by-step (alternative to install.sh)

```bash
# 1. Build images
docker compose build

# 2. Install Laravel
docker compose run --rm composer create-project laravel/laravel . --prefer-dist

# 3. Copy our .env
cp patches/laravel.env backend/.env

# 4. Install Fortify
docker compose run --rm composer require laravel/fortify

# 5. Apply custom backend files
bash scripts/apply-backend.sh

# 6. Generate key
docker compose run --rm php php artisan key:generate

# 7. Start services
docker compose up -d

# 8. Wait for MySQL (~10 seconds), then migrate + seed
docker compose exec php php artisan migrate
docker compose exec php php artisan db:seed

# 9. Install Next.js frontend
docker compose run --rm -w /app node sh -c \
  "npx create-next-app@latest . --typescript --app --no-git --tailwind --src-dir=false --import-alias='@/*' --yes"

# 10. Apply frontend files and start node
bash scripts/apply-frontend.sh
docker compose up -d --force-recreate node

# 11. Copy frontend env
cp patches/frontend/.env.local frontend/.env.local
```

---

## Seeded Users

| Name            | Email                  | Password | Role     |
|-----------------|------------------------|----------|----------|
| Иван Иванов     | ivan@admin.local       | password | owner    |
| Елена Петрова   | elena@frontend.local   | password | frontend |
| Петър Георгиев  | petar@backend.local    | password | backend  |

To add more users, edit [patches/backend/database/seeders/UserSeeder.php](patches/backend/database/seeders/UserSeeder.php) and run `make seed`.

---

## Available Roles

Defined in `App\Enums\UserRole`:

| Value      | Description                                             |
|------------|---------------------------------------------------------|
| `owner`    | Full access — approve/reject tools, view audit log      |
| `backend`  | Backend Developer                                       |
| `frontend` | Frontend Developer                                      |
| `qa`       | QA Engineer                                             |
| `designer` | Designer                                                |
| `pm`       | Product Manager                                         |

Default role for new users: `backend`

---

## Tool Status Workflow

```
[Non-owner creates] → pending
[Owner creates]     → approved  (automatic)

pending ──→ approved  (owner: POST /api/tools/{id}/approve)
        └─→ rejected  (owner: POST /api/tools/{id}/reject)
```

Public tools listing shows only `approved` tools.
Admin Panel (`?status=all`) shows all statuses to owner.

---

## API Endpoints

### Auth

| Method | Path                   | Auth | Description           |
|--------|------------------------|------|-----------------------|
| GET    | `/sanctum/csrf-cookie` | No   | Fetch CSRF token      |
| POST   | `/auth/login`          | No   | Log in (session)      |
| POST   | `/auth/logout`         | Yes  | Log out               |
| GET    | `/api/me`              | Yes  | Current user info     |

### Tools

| Method | Path                          | Auth  | Description                                         |
|--------|-------------------------------|-------|-----------------------------------------------------|
| GET    | `/api/tools`                  | Yes   | List tools (`?search=` `?role=` `?category=` `?tag=` `?status=` `?page=`) |
| POST   | `/api/tools`                  | Yes   | Create tool                                         |
| GET    | `/api/tools/{id}`             | Yes   | Tool detail                                         |
| PUT    | `/api/tools/{id}`             | Yes   | Update tool (any authenticated user)                |
| DELETE | `/api/tools/{id}`             | Yes   | Delete tool (author or owner)                       |
| POST   | `/api/tools/{id}/approve`     | Owner | Approve pending tool                                |
| POST   | `/api/tools/{id}/reject`      | Owner | Reject pending tool                                 |

### Categories & Tags

| Method | Path              | Auth | Description                 |
|--------|-------------------|------|-----------------------------|
| GET    | `/api/categories` | Yes  | List categories (cached)    |
| POST   | `/api/categories` | Yes  | Create category             |
| GET    | `/api/tags`       | Yes  | List tags (cached)          |
| POST   | `/api/tags`       | Yes  | Create tag (find or create) |

### Audit Log

| Method | Path                        | Owner only | Description                              |
|--------|-----------------------------|------------|------------------------------------------|
| GET    | `/api/audit-logs`           | Yes        | Paginated log (`?action=` `?search=` `?from=` `?to=` `?user_id=` `?page=`) |
| DELETE | `/api/audit-logs/{id}`      | Yes        | Delete a single audit log entry          |

---

## Frontend Pages

| Route                           | Access | Description                                            |
|---------------------------------|--------|--------------------------------------------------------|
| `/login`                        | Public | Login page                                             |
| `/dashboard`                    | Auth   | Tool listing (approved only, filters: search/role/category) |
| `/dashboard/tools/new`          | Auth   | Create new tool                                        |
| `/dashboard/tools/[id]`         | Auth   | Tool detail + edit/delete actions                      |
| `/dashboard/tools/edit/[id]`    | Auth   | Edit tool form                                         |
| `/dashboard/admin`              | Owner  | Admin Panel — approve/reject pending tools             |
| `/dashboard/admin/audit`        | Owner  | Audit Log — activity feed with filters and per-entry delete |
| `/dashboard/settings`           | Auth   | User settings — Two-Factor Authentication              |

> **Turbopack workaround:** The edit route lives at `edit/[id]` (not `[id]/edit`). A rewrite in `next.config.ts` maps `/dashboard/tools/:id/edit` → `/dashboard/tools/edit/:id`.

---

## Redis Cache

| Key                     | TTL    | Invalidated on                     |
|-------------------------|--------|------------------------------------|
| `categories:all`        | 3600s  | New category created               |
| `tags:all`              | 3600s  | New tag or tool create/update      |
| `tools:approved:page1`  | 300s   | Any tool mutation                  |

```bash
# Inspect cache (DB 1)
docker compose exec redis redis-cli -n 1 KEYS "*"
# Flush cache
docker compose exec redis redis-cli -n 1 FLUSHDB
```

---

## Role Middleware

```php
// routes/web.php
Route::post('/api/tools/{tool}/approve', ...)->middleware('role:owner');
Route::get('/api/audit-logs', ...)->middleware('role:owner');
```

Frontend `middleware.ts` (Edge Runtime) protects `/dashboard/admin/*`:
redirects to `/login` if unauthenticated, to `/dashboard` if role ≠ owner.

---

## Common Commands

```bash
make up              # Start all containers
make down            # Stop all containers
make logs            # Follow logs
make shell-php       # Open PHP container shell
make migrate         # Run migrations
make seed            # Run seeders
make fresh           # Fresh migrate + seed
make cache-clear     # Clear Laravel caches
make apply-backend   # Copy patches/backend/ → backend/
make apply-frontend  # Copy patches/frontend/ → frontend/ + clear .next + restart node
```

> **Always use `make apply-frontend`** (or `bash scripts/apply-frontend.sh && docker compose up -d --force-recreate node`) after editing files in `patches/frontend/`.

---

## Project Structure

```
vibecode-academy-project/
├── docker-compose.yml
├── Makefile
├── README.md
│
├── docker/
│   ├── nginx/default.conf
│   └── php/Dockerfile + php.ini
│
├── scripts/
│   ├── install.sh             ← one-command setup
│   ├── apply-backend.sh       ← copies patch files into backend/
│   └── apply-frontend.sh      ← copies patch files into frontend/ + clears cache
│
├── patches/                   ← SOURCE OF TRUTH — edit only here
│   ├── laravel.env
│   ├── backend/
│   │   ├── app/
│   │   │   ├── Enums/UserRole.php
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/ToolController.php
│   │   │   │   ├── Controllers/AuditLogController.php
│   │   │   │   ├── Controllers/CategoryController.php
│   │   │   │   ├── Controllers/TagController.php
│   │   │   │   ├── Middleware/EnsureRole.php
│   │   │   │   ├── Requests/StoreToolRequest.php
│   │   │   │   ├── Requests/UpdateToolRequest.php
│   │   │   │   ├── Requests/StoreCategoryRequest.php
│   │   │   │   └── Resources/ToolResource.php, CategoryResource.php, TagResource.php
│   │   │   ├── Models/
│   │   │   │   ├── User.php
│   │   │   │   ├── Tool.php
│   │   │   │   ├── AuditLog.php           ← record() static helper
│   │   │   │   ├── Category.php, Tag.php
│   │   │   │   └── ToolRole.php, ToolScreenshot.php, ToolExample.php
│   │   │   ├── Policies/ToolPolicy.php
│   │   │   └── Providers/FortifyServiceProvider.php
│   │   ├── bootstrap/app.php, providers.php
│   │   ├── config/cors.php, fortify.php
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── 2024_01_01_…_add_role_to_users_table.php
│   │   │   │   ├── 2024_01_02_…_create_categories_table.php
│   │   │   │   ├── 2024_01_02_…_create_tags_table.php
│   │   │   │   ├── 2024_01_02_…_create_tools_table.php
│   │   │   │   ├── 2024_01_02_…_create_tool_categories_table.php
│   │   │   │   ├── 2024_01_02_…_create_tool_roles_table.php
│   │   │   │   ├── 2024_01_02_…_create_tool_tags_table.php
│   │   │   │   ├── 2024_01_02_…_create_tool_screenshots_table.php
│   │   │   │   ├── 2024_01_02_…_create_tool_examples_table.php
│   │   │   │   ├── 2024_01_03_…_add_two_factor_to_users_table.php
│   │   │   │   ├── 2024_01_04_…_update_tools_status_enum.php
│   │   │   │   ├── 2024_01_05_…_create_audit_logs_table.php
│   │   │   │   └── 2024_01_06_…_add_request_info_to_audit_logs_table.php
│   │   │   └── seeders/
│   │   │       ├── DatabaseSeeder.php, UserSeeder.php
│   │   │       ├── CategorySeeder.php, TagSeeder.php, ToolSeeder.php
│   │   └── routes/web.php
│   └── frontend/
│       ├── .env.local
│       ├── next.config.ts
│       ├── middleware.ts              ← Edge Runtime — protects /dashboard/admin/*
│       ├── app/
│       │   ├── layout.tsx             ← Space Grotesk + DM Sans fonts
│       │   ├── globals.css            ← single CSS file, dark design system
│       │   ├── login/page.tsx
│       │   └── dashboard/
│       │       ├── page.tsx           ← tools listing
│       │       ├── tools/
│       │       │   ├── new/page.tsx
│       │       │   ├── [id]/page.tsx
│       │       │   └── edit/[id]/page.tsx
│       │       ├── admin/
│       │       │   ├── page.tsx       ← Admin Panel (approve/reject)
│       │       │   └── audit/page.tsx ← Audit Log
│       │       └── settings/page.tsx  ← Two-Factor Auth settings
│       ├── components/
│       │   └── Sidebar.tsx            ← navigation + admin/audit links for owner
│       └── lib/
│           ├── auth.ts
│           └── tools.ts               ← all API functions incl. audit log
│
├── backend/   ← created by install.sh (do not edit directly)
└── frontend/  ← created by install.sh (do not edit directly)
```
