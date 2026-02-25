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

# Migrations
mkdir -p "$BACKEND/database/migrations"
cp "$PATCHES/database/migrations/2024_01_01_000000_add_role_to_users_table.php" \
   "$BACKEND/database/migrations/2024_01_01_000000_add_role_to_users_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000001_create_categories_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000001_create_categories_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000002_create_tags_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000002_create_tags_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000003_create_tools_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000003_create_tools_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000004_create_tool_categories_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000004_create_tool_categories_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000005_create_tool_roles_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000005_create_tool_roles_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000006_create_tool_tags_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000006_create_tool_tags_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000007_create_tool_screenshots_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000007_create_tool_screenshots_table.php"
cp "$PATCHES/database/migrations/2024_01_02_000008_create_tool_examples_table.php" \
   "$BACKEND/database/migrations/2024_01_02_000008_create_tool_examples_table.php"

# Seeders
mkdir -p "$BACKEND/database/seeders"
cp "$PATCHES/database/seeders/DatabaseSeeder.php" "$BACKEND/database/seeders/DatabaseSeeder.php"
cp "$PATCHES/database/seeders/UserSeeder.php"     "$BACKEND/database/seeders/UserSeeder.php"
cp "$PATCHES/database/seeders/CategorySeeder.php" "$BACKEND/database/seeders/CategorySeeder.php"
cp "$PATCHES/database/seeders/TagSeeder.php"      "$BACKEND/database/seeders/TagSeeder.php"
cp "$PATCHES/database/seeders/ToolSeeder.php"     "$BACKEND/database/seeders/ToolSeeder.php"

# Models
mkdir -p "$BACKEND/app/Models"
cp "$PATCHES/app/Models/User.php"           "$BACKEND/app/Models/User.php"
cp "$PATCHES/app/Models/Tool.php"           "$BACKEND/app/Models/Tool.php"
cp "$PATCHES/app/Models/ToolRole.php"       "$BACKEND/app/Models/ToolRole.php"
cp "$PATCHES/app/Models/ToolScreenshot.php" "$BACKEND/app/Models/ToolScreenshot.php"
cp "$PATCHES/app/Models/ToolExample.php"    "$BACKEND/app/Models/ToolExample.php"
cp "$PATCHES/app/Models/Category.php"       "$BACKEND/app/Models/Category.php"
cp "$PATCHES/app/Models/Tag.php"            "$BACKEND/app/Models/Tag.php"

# Controllers
mkdir -p "$BACKEND/app/Http/Controllers"
cp "$PATCHES/app/Http/Controllers/ToolController.php"     "$BACKEND/app/Http/Controllers/ToolController.php"
cp "$PATCHES/app/Http/Controllers/CategoryController.php" "$BACKEND/app/Http/Controllers/CategoryController.php"
cp "$PATCHES/app/Http/Controllers/TagController.php"      "$BACKEND/app/Http/Controllers/TagController.php"

# Form Requests
mkdir -p "$BACKEND/app/Http/Requests"
cp "$PATCHES/app/Http/Requests/StoreToolRequest.php"    "$BACKEND/app/Http/Requests/StoreToolRequest.php"
cp "$PATCHES/app/Http/Requests/UpdateToolRequest.php"   "$BACKEND/app/Http/Requests/UpdateToolRequest.php"
cp "$PATCHES/app/Http/Requests/StoreCategoryRequest.php" "$BACKEND/app/Http/Requests/StoreCategoryRequest.php"

# Policies
mkdir -p "$BACKEND/app/Policies"
cp "$PATCHES/app/Policies/ToolPolicy.php" "$BACKEND/app/Policies/ToolPolicy.php"

# API Resources
mkdir -p "$BACKEND/app/Http/Resources"
cp "$PATCHES/app/Http/Resources/ToolResource.php"     "$BACKEND/app/Http/Resources/ToolResource.php"
cp "$PATCHES/app/Http/Resources/CategoryResource.php" "$BACKEND/app/Http/Resources/CategoryResource.php"
cp "$PATCHES/app/Http/Resources/TagResource.php"      "$BACKEND/app/Http/Resources/TagResource.php"

# bootstrap files
cp "$PATCHES/bootstrap/app.php"       "$BACKEND/bootstrap/app.php"
cp "$PATCHES/bootstrap/providers.php" "$BACKEND/bootstrap/providers.php"

echo "Backend files applied."
