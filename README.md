# ToolHive

Internal AI tools sharing platform. Team members can add, browse and manage AI tools by role and category.

---

## Stack

| Layer         | Technology               |
|---------------|--------------------------|
| Backend       | Laravel (PHP 8.3)        |
| Database      | MySQL 8                  |
| Cache/Session | Redis 7                  |
| Frontend      | Next.js 16 (App Router, TypeScript) |
| Font          | Geist (via next/font/google) |
| Web server    | nginx                    |
| Runtime       | Docker / Docker Compose  |

---

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Git
- `make` (optional but recommended)

---

## First-time Setup

```bash
# 1. Clone the repo (or unzip the project)
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

# 10. Apply frontend files
bash scripts/apply-frontend.sh

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

| Value      | Description         |
|------------|---------------------|
| `owner`    | Full access — can delete any tool (all roles can edit) |
| `backend`  | Backend Developer   |
| `frontend` | Frontend Developer  |
| `qa`       | QA Engineer         |
| `designer` | Designer            |
| `pm`       | Product Manager     |

Default role for new users: `backend`

---

## API Endpoints

### Auth

| Method | Path                   | Auth | Description           |
|--------|------------------------|------|-----------------------|
| GET    | `/sanctum/csrf-cookie` | No   | Fetch CSRF token      |
| POST   | `/auth/login`          | No   | Log in (session)      |
| POST   | `/auth/logout`         | Yes  | Log out               |
| GET    | `/api/me`              | Yes  | Get current user info |

### Tools

| Method | Path                | Auth | Description                            |
|--------|---------------------|------|----------------------------------------|
| GET    | `/api/tools`        | Yes  | List tools (`?search=` `?role=` `?category=` `?tag=` `?page=`) |
| POST   | `/api/tools`        | Yes  | Create tool                            |
| GET    | `/api/tools/{id}`   | Yes  | Tool detail                            |
| PUT    | `/api/tools/{id}`   | Yes  | Update tool (any authenticated user)   |
| DELETE | `/api/tools/{id}`   | Yes  | Delete tool (author or owner)          |

### Categories & Tags

| Method | Path              | Auth | Description                   |
|--------|-------------------|------|-------------------------------|
| GET    | `/api/categories` | Yes  | List categories               |
| POST   | `/api/categories` | Yes  | Create category (any user)    |
| GET    | `/api/tags`       | Yes  | List tags                     |
| POST   | `/api/tags`       | Yes  | Create tag (find or create)   |

---

## Frontend Pages

| Route                           | Description                                      |
|---------------------------------|--------------------------------------------------|
| `/login`                        | Standalone login — logo above form, no header    |
| `/dashboard`                    | Profile card (avatar, name, email, role, time)   |
| `/dashboard/tools`              | Tool listing with search/role/category filters   |
| `/dashboard/tools/new`          | Add new tool (roles, categories, tags, examples) |
| `/dashboard/tools/[id]`         | Tool detail — edit for any user, delete for author or owner |
| `/dashboard/tools/edit/[id]`    | Edit tool form                                   |

> **Note:** The edit route uses `edit/[id]` instead of `[id]/edit` as a workaround for a Next.js 16 Turbopack bug where static segments nested inside dynamic segments return 404 in development. A rewrite in `next.config.ts` maps `/dashboard/tools/:id/edit` → `/dashboard/tools/edit/:id` for direct URL access.

### Navigation (logged in)
Header shows: **⬢⬢ ToolHive** logo → **AI Инструменти** → **Logout**
Tools listing shows: **← Dashboard** → **+ Добави инструмент**

---

## Role Middleware Usage

```php
// In routes/web.php:
Route::get('/admin', fn() => 'ok')->middleware(['auth', 'role:owner']);
Route::get('/dev',   fn() => 'ok')->middleware(['auth', 'role:backend,frontend']);
```

---

## Common Commands

```bash
make up             # Start all containers
make down           # Stop all containers
make logs           # Follow logs
make shell-php      # Open PHP container shell
make migrate        # Run migrations
make seed           # Run seeders
make fresh          # Fresh migrate + seed
make cache-clear    # Clear Laravel caches
make apply-backend  # Copy patches/backend/ → backend/
make apply-frontend # Copy patches/frontend/ → frontend/ + clear cache + restart node
```

> **Always use `make apply-frontend`** after editing files in `patches/frontend/`.
> It copies files, clears the Turbopack cache (`.next/`), and force-recreates the node container.
> Alternatively: `bash scripts/apply-frontend.sh && docker compose up -d --force-recreate node`

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
│   ├── install.sh          ← one-command setup
│   ├── apply-backend.sh    ← copies patch files into backend/
│   └── apply-frontend.sh   ← copies patch files into frontend/
│
├── patches/
│   ├── laravel.env
│   ├── backend/
│   │   ├── app/
│   │   │   ├── Enums/UserRole.php
│   │   │   ├── Http/Controllers/ToolController.php
│   │   │   ├── Http/Controllers/CategoryController.php
│   │   │   ├── Http/Controllers/TagController.php
│   │   │   ├── Http/Middleware/EnsureRole.php
│   │   │   ├── Http/Requests/StoreToolRequest.php
│   │   │   ├── Http/Requests/UpdateToolRequest.php
│   │   │   ├── Http/Requests/StoreCategoryRequest.php
│   │   │   ├── Http/Resources/ToolResource.php
│   │   │   ├── Http/Resources/CategoryResource.php
│   │   │   ├── Http/Resources/TagResource.php
│   │   │   ├── Models/User.php
│   │   │   ├── Models/Tool.php
│   │   │   ├── Models/Category.php
│   │   │   ├── Models/Tag.php
│   │   │   ├── Models/ToolRole.php
│   │   │   ├── Models/ToolScreenshot.php
│   │   │   ├── Models/ToolExample.php
│   │   │   ├── Policies/ToolPolicy.php
│   │   │   └── Providers/FortifyServiceProvider.php
│   │   ├── bootstrap/app.php
│   │   ├── bootstrap/providers.php
│   │   ├── config/cors.php
│   │   ├── config/fortify.php
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   └── routes/web.php
│   └── frontend/
│       ├── .env.local
│       ├── next.config.ts
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   ├── login/page.tsx
│       │   ├── dashboard/page.tsx
│       │   └── dashboard/tools/
│       │       ├── page.tsx
│       │       ├── new/page.tsx
│       │       ├── [id]/page.tsx
│       │       └── edit/[id]/page.tsx  ← Turbopack workaround
│       ├── components/Header.tsx
│       └── lib/
│           ├── auth.ts
│           └── tools.ts
│
├── backend/                ← Created by install.sh (Laravel)
└── frontend/               ← Created by install.sh (Next.js)
```
