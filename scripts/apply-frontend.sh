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
cp "$PATCHES/components/Header.tsx"  "$FRONTEND/components/Header.tsx"
cp "$PATCHES/components/Sidebar.tsx" "$FRONTEND/components/Sidebar.tsx"

# Lib
mkdir -p "$FRONTEND/lib"
cp "$PATCHES/lib/auth.ts"  "$FRONTEND/lib/auth.ts"
cp "$PATCHES/lib/tools.ts" "$FRONTEND/lib/tools.ts"

# Next.js config + proxy (route protection)
cp "$PATCHES/next.config.ts" "$FRONTEND/next.config.ts"
cp "$PATCHES/proxy.ts"       "$FRONTEND/proxy.ts"

echo "Frontend files applied."

# Clear Next.js build cache so changes are always picked up
if [ -d "$FRONTEND/.next" ]; then
  rm -rf "$FRONTEND/.next"
  echo ".next cache cleared."
fi
