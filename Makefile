.PHONY: install up down restart logs shell-php shell-node migrate seed fresh

## ─── First-time install ─────────────────────────────────────────────────────

install:
	@echo "=== First-time setup ==="
	@bash scripts/install.sh

## ─── Docker lifecycle ────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

## ─── Shell access ────────────────────────────────────────────────────────────

shell-php:
	docker compose exec php bash

shell-node:
	docker compose exec node sh

## ─── Laravel helpers ─────────────────────────────────────────────────────────

migrate:
	docker compose exec php php artisan migrate

seed:
	docker compose exec php php artisan db:seed

fresh:
	docker compose exec php php artisan migrate:fresh --seed

key:
	docker compose exec php php artisan key:generate

cache-clear:
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
