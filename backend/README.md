# ToolHive — Backend

Laravel 11 (PHP 8.3) API backend for the ToolHive internal tools platform.

> **Do not edit files here directly.**
> Edit in `patches/backend/` and run `bash scripts/apply-backend.sh` to apply.

---

## Stack

- **Framework:** Laravel 11
- **Auth:** Laravel Fortify (session-based, prefix `auth`)
- **Database:** MySQL 8
- **Cache / Session:** Redis 7 (DB 1 for cache)
- **Routing:** All routes in `routes/web.php` (web middleware group — session always active)

---

## Key files (managed via patches/)

| File | Purpose |
|------|---------|
| `routes/web.php` | All API routes under `middleware('auth')` |
| `app/Enums/UserRole.php` | `owner \| backend \| frontend \| qa \| designer \| pm` |
| `app/Http/Middleware/EnsureRole.php` | Role guard, alias `role` in bootstrap/app.php |
| `app/Models/User.php` | `isOwner()`, role cast, two-factor fields |
| `app/Models/AuditLog.php` | `record(User, action, Tool, metadata[])` static helper |
| `app/Models/Tool.php` | Relationships: categories, tags, roles, screenshots, examples |
| `app/Policies/ToolPolicy.php` | `update` (any auth), `delete` (author or owner), `moderate` (owner) |
| `app/Http/Controllers/ToolController.php` | CRUD + approve/reject + Redis cache + audit logging |
| `app/Http/Controllers/AuditLogController.php` | `index` (filtered list) + `destroy` (single entry) |
| `app/Http/Controllers/CategoryController.php` | Cached index + store with cache invalidation |
| `app/Http/Controllers/TagController.php` | Cached index + store with cache invalidation |

---

## Migrations (in order)

| Migration | Description |
|-----------|-------------|
| `2024_01_01_…_add_role_to_users_table` | Adds `role` enum column |
| `2024_01_02_…_create_categories_table` | Categories |
| `2024_01_02_…_create_tags_table` | Tags |
| `2024_01_02_…_create_tools_table` | Tools (name, url, description, status enum, created_by) |
| `2024_01_02_…_create_tool_categories_table` | Pivot |
| `2024_01_02_…_create_tool_roles_table` | Tool ↔ role assignments |
| `2024_01_02_…_create_tool_tags_table` | Pivot |
| `2024_01_02_…_create_tool_screenshots_table` | Screenshots (url, caption) |
| `2024_01_02_…_create_tool_examples_table` | Examples (title, description, url) |
| `2024_01_03_…_add_two_factor_to_users_table` | 2FA columns for Fortify |
| `2024_01_04_…_update_tools_status_enum` | Ensures pending/approved/rejected enum |
| `2024_01_05_…_create_audit_logs_table` | Audit log table |
| `2024_01_06_…_add_request_info_to_audit_logs_table` | Adds ip_address, user_agent |

---

## Redis Cache

| Key | TTL | Invalidated on |
|-----|-----|----------------|
| `categories:all` | 3600s | Category created |
| `tags:all` | 3600s | Tag created or tool create/update |
| `tools:approved:page1` | 300s | Any tool mutation |

---

## Useful commands

```bash
docker compose exec php php artisan migrate
docker compose exec php php artisan db:seed
docker compose exec php php artisan migrate:fresh --seed
docker compose exec php php artisan config:clear && php artisan route:clear
docker compose exec redis redis-cli -n 1 FLUSHDB   # clear cache
```
