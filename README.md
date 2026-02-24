# AI Platform — Foundation

Internal AI tools sharing platform. This repository contains the Docker infrastructure, Laravel API backend foundation, and Next.js frontend skeleton.

---

## Stack

| Layer      | Technology                |
|------------|---------------------------|
| Backend    | Laravel (PHP 8.3)         |
| Database   | MySQL 8                   |
| Cache/Session | Redis 7                |
| Frontend   | Next.js (App Router, TS)  |
| Web server | nginx                     |
| Runtime    | Docker / Docker Compose   |

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
- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:3000

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

| Name         | Email            | Password  | Role    |
|--------------|------------------|-----------|---------|
| Иван Иванов  | ivan@admin.local | password  | owner   |

To add more users, edit [patches/backend/database/seeders/UserSeeder.php](patches/backend/database/seeders/UserSeeder.php) and run `make seed`.

---

## Available Roles

Defined in `App\Enums\UserRole`:

| Value      | Label               |
|------------|---------------------|
| `owner`    | Owner               |
| `backend`  | Backend Developer   |
| `frontend` | Frontend Developer  |
| `qa`       | QA Engineer         |
| `designer` | Designer            |
| `pm`       | Product Manager     |

Default role for new users: `backend`

---

## API Endpoints

| Method | Path                    | Auth Required | Description              |
|--------|-------------------------|---------------|--------------------------|
| GET    | `/sanctum/csrf-cookie`  | No            | Fetch CSRF token         |
| POST   | `/login`                | No            | Log in (session/cookie)  |
| POST   | `/logout`               | Yes           | Log out                  |
| GET    | `/api/me`               | Yes           | Get current user info    |

---

## Role Middleware Usage

```php
// In routes/api.php:
Route::get('/admin', fn() => 'ok')->middleware(['auth:sanctum', 'role:owner']);
Route::get('/dev', fn() => 'ok')->middleware(['auth:sanctum', 'role:backend,frontend']);
```

---

## Common Commands

```bash
make up          # Start all containers
make down        # Stop all containers
make logs        # Follow logs
make shell-php   # Open PHP container shell
make migrate     # Run migrations
make seed        # Run seeders
make fresh       # Fresh migrate + seed
make cache-clear # Clear Laravel caches
```

---

## Project Structure

```
vibecode-academy-project/
├── docker-compose.yml
├── Makefile
├── README.md
│
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── php/
│       ├── Dockerfile
│       └── php.ini
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
│   │   │   ├── Http/Middleware/EnsureRole.php
│   │   │   ├── Models/User.php
│   │   │   └── Providers/FortifyServiceProvider.php
│   │   ├── bootstrap/app.php
│   │   ├── config/cors.php
│   │   ├── config/fortify.php
│   │   ├── database/
│   │   │   ├── migrations/2024_01_01_000000_add_role_to_users_table.php
│   │   │   └── seeders/
│   │   │       ├── DatabaseSeeder.php
│   │   │       └── UserSeeder.php
│   │   └── routes/api.php
│   └── frontend/
│       ├── .env.local
│       ├── next.config.ts
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   ├── login/page.tsx
│       │   └── dashboard/page.tsx
│       ├── components/
│       │   └── Header.tsx
│       └── lib/
│           └── auth.ts
│
├── backend/                ← Created by install.sh (Laravel)
└── frontend/               ← Created by install.sh (Next.js)
```
