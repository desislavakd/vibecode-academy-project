#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT_DIR/backend"
PATCHES="$ROOT_DIR/patches/backend"

echo "Copying backend patch files..."

# Enums
mkdir -p "$BACKEND/app/Enums"
cp "$PATCHES/app/Enums/UserRole.php" "$BACKEND/app/Enums/UserRole.php"

# Middleware
mkdir -p "$BACKEND/app/Http/Middleware"
cp "$PATCHES/app/Http/Middleware/EnsureRole.php" "$BACKEND/app/Http/Middleware/EnsureRole.php"

# FortifyServiceProvider
mkdir -p "$BACKEND/app/Providers"
cp "$PATCHES/app/Providers/FortifyServiceProvider.php" "$BACKEND/app/Providers/FortifyServiceProvider.php"

# Routes
cp "$PATCHES/routes/api.php" "$BACKEND/routes/api.php"
cp "$PATCHES/routes/web.php" "$BACKEND/routes/web.php"

# CORS config
cp "$PATCHES/config/cors.php" "$BACKEND/config/cors.php"

# Fortify config
cp "$PATCHES/config/fortify.php" "$BACKEND/config/fortify.php"

# Migration
mkdir -p "$BACKEND/database/migrations"
cp "$PATCHES/database/migrations/2024_01_01_000000_add_role_to_users_table.php" \
   "$BACKEND/database/migrations/2024_01_01_000000_add_role_to_users_table.php"

# Seeders
mkdir -p "$BACKEND/database/seeders"
cp "$PATCHES/database/seeders/DatabaseSeeder.php" "$BACKEND/database/seeders/DatabaseSeeder.php"
cp "$PATCHES/database/seeders/UserSeeder.php" "$BACKEND/database/seeders/UserSeeder.php"

# User model
cp "$PATCHES/app/Models/User.php" "$BACKEND/app/Models/User.php"

# bootstrap files
cp "$PATCHES/bootstrap/app.php" "$BACKEND/bootstrap/app.php"
cp "$PATCHES/bootstrap/providers.php" "$BACKEND/bootstrap/providers.php"

echo "Backend files applied."
