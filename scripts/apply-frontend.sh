#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT_DIR/frontend"
PATCHES="$ROOT_DIR/patches/frontend"

echo "Copying frontend patch files..."

# App layout
mkdir -p "$FRONTEND/app"
cp "$PATCHES/app/layout.tsx"  "$FRONTEND/app/layout.tsx"
cp "$PATCHES/app/page.tsx"    "$FRONTEND/app/page.tsx"
cp "$PATCHES/app/globals.css" "$FRONTEND/app/globals.css"
cp "$PATCHES/app/base.css"    "$FRONTEND/app/base.css"

# CSS sub-modules — components
mkdir -p "$FRONTEND/app/components"
cp "$PATCHES/app/components/card.css"    "$FRONTEND/app/components/card.css"
cp "$PATCHES/app/components/form.css"    "$FRONTEND/app/components/form.css"
cp "$PATCHES/app/components/buttons.css" "$FRONTEND/app/components/buttons.css"
cp "$PATCHES/app/components/alerts.css"  "$FRONTEND/app/components/alerts.css"
cp "$PATCHES/app/components/ratings.css" "$FRONTEND/app/components/ratings.css"

# CSS sub-modules — layout
mkdir -p "$FRONTEND/app/layout"
cp "$PATCHES/app/layout/sidebar.css" "$FRONTEND/app/layout/sidebar.css"
cp "$PATCHES/app/layout/header.css"  "$FRONTEND/app/layout/header.css"

# CSS sub-modules — pages
mkdir -p "$FRONTEND/app/pages"
cp "$PATCHES/app/pages/auth.css"        "$FRONTEND/app/pages/auth.css"
cp "$PATCHES/app/pages/tools.css"       "$FRONTEND/app/pages/tools.css"
cp "$PATCHES/app/pages/tool-detail.css" "$FRONTEND/app/pages/tool-detail.css"
cp "$PATCHES/app/pages/dashboard.css"   "$FRONTEND/app/pages/dashboard.css"
cp "$PATCHES/app/pages/admin.css"       "$FRONTEND/app/pages/admin.css"
cp "$PATCHES/app/pages/settings.css"    "$FRONTEND/app/pages/settings.css"

# Login page
mkdir -p "$FRONTEND/app/login"
cp "$PATCHES/app/login/page.tsx" "$FRONTEND/app/login/page.tsx"

# Dashboard page + layout
mkdir -p "$FRONTEND/app/dashboard"
cp "$PATCHES/app/dashboard/page.tsx"   "$FRONTEND/app/dashboard/page.tsx"
cp "$PATCHES/app/dashboard/layout.tsx" "$FRONTEND/app/dashboard/layout.tsx"

# Tools pages
mkdir -p "$FRONTEND/app/dashboard/tools"
cp "$PATCHES/app/dashboard/tools/page.tsx" "$FRONTEND/app/dashboard/tools/page.tsx"

mkdir -p "$FRONTEND/app/dashboard/tools/new"
cp "$PATCHES/app/dashboard/tools/new/page.tsx" "$FRONTEND/app/dashboard/tools/new/page.tsx"

mkdir -p "$FRONTEND/app/dashboard/tools/[id]"
cp "$PATCHES/app/dashboard/tools/[id]/page.tsx" "$FRONTEND/app/dashboard/tools/[id]/page.tsx"

mkdir -p "$FRONTEND/app/dashboard/tools/edit/[id]"
cp "$PATCHES/app/dashboard/tools/edit/[id]/page.tsx" "$FRONTEND/app/dashboard/tools/edit/[id]/page.tsx"

# Admin page
mkdir -p "$FRONTEND/app/dashboard/admin"
cp "$PATCHES/app/dashboard/admin/page.tsx" "$FRONTEND/app/dashboard/admin/page.tsx"

# Audit log page
mkdir -p "$FRONTEND/app/dashboard/admin/audit"
cp "$PATCHES/app/dashboard/admin/audit/page.tsx" "$FRONTEND/app/dashboard/admin/audit/page.tsx"

# Settings page
mkdir -p "$FRONTEND/app/dashboard/settings"
cp "$PATCHES/app/dashboard/settings/page.tsx" "$FRONTEND/app/dashboard/settings/page.tsx"

# Components
mkdir -p "$FRONTEND/components"
cp "$PATCHES/components/Header.tsx"      "$FRONTEND/components/Header.tsx"
cp "$PATCHES/components/Sidebar.tsx"     "$FRONTEND/components/Sidebar.tsx"
cp "$PATCHES/components/ToolForm.tsx"    "$FRONTEND/components/ToolForm.tsx"
cp "$PATCHES/components/Pagination.tsx"  "$FRONTEND/components/Pagination.tsx"

# Lib
mkdir -p "$FRONTEND/lib"
cp "$PATCHES/lib/auth.ts"       "$FRONTEND/lib/auth.ts"
cp "$PATCHES/lib/tools.ts"      "$FRONTEND/lib/tools.ts"
cp "$PATCHES/lib/constants.ts"  "$FRONTEND/lib/constants.ts"
cp "$PATCHES/lib/utils.ts"      "$FRONTEND/lib/utils.ts"

# Next.js config + proxy (route protection)
cp "$PATCHES/next.config.ts" "$FRONTEND/next.config.ts"
cp "$PATCHES/proxy.ts"       "$FRONTEND/proxy.ts"

echo "Frontend files applied."

# Clear Next.js build cache so changes are always picked up
if [ -d "$FRONTEND/.next" ]; then
  rm -rf "$FRONTEND/.next"
  echo ".next cache cleared."
fi
