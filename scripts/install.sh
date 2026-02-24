#!/bin/bash
set -e

echo "=== AI Platform Installation Script ==="

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Step 1: Install Laravel via composer container
echo ""
echo "[1/7] Installing Laravel in /backend..."
if [ ! -f "$ROOT_DIR/backend/artisan" ]; then
  docker compose run --rm composer create-project laravel/laravel . --prefer-dist --no-interaction
  echo "Laravel installed."
else
  echo "Laravel already installed, skipping."
fi

# Step 2: Copy .env (preserve APP_KEY if already set)
echo ""
echo "[2/7] Configuring .env..."
EXISTING_KEY=""
if [ -f "$ROOT_DIR/backend/.env" ]; then
  EXISTING_KEY=$(grep -E '^APP_KEY=base64:' "$ROOT_DIR/backend/.env" | cut -d= -f2- || true)
fi
cp "$ROOT_DIR/patches/laravel.env" "$ROOT_DIR/backend/.env"
if [ -n "$EXISTING_KEY" ]; then
  sed -i "s|^APP_KEY=.*|APP_KEY=$EXISTING_KEY|" "$ROOT_DIR/backend/.env"
  echo ".env configured (existing APP_KEY preserved)."
else
  echo ".env configured."
fi

# Step 3: Install Fortify
echo ""
echo "[3/7] Installing Laravel Fortify..."
docker compose run --rm composer require laravel/fortify --no-interaction
echo "Fortify installed."

# Step 4: Apply custom backend files
echo ""
echo "[4/7] Applying custom backend files..."
bash "$ROOT_DIR/scripts/apply-backend.sh"
echo "Custom files applied."

# Step 5: Generate app key
echo ""
echo "[5/7] Generating application key..."
docker compose run --rm php php artisan key:generate
echo "Key generated."

# Step 6: Run migrations and seeders
echo ""
echo "[6/7] Running migrations and seeders..."
docker compose run --rm php php artisan migrate --force
docker compose run --rm php php artisan db:seed --force
echo "Database ready."

# Step 7: Install Next.js frontend
echo ""
echo "[7/7] Setting up Next.js frontend..."
if [ ! -f "$ROOT_DIR/frontend/package.json" ]; then
  docker compose run --rm -w /app node sh -c "npx create-next-app@latest . --typescript --app --no-git --no-eslint --tailwind --src-dir=false --import-alias='@/*' --yes"
  bash "$ROOT_DIR/scripts/apply-frontend.sh"
  echo "Frontend installed."
else
  echo "Frontend already installed, skipping."
fi

echo ""
echo "=== Installation complete! ==="
echo ""
echo "Start the platform with:"
echo "  docker compose up -d"
echo ""
echo "Then visit:"
echo "  Backend: http://localhost:8000"
echo "  Frontend: http://localhost:3000"
