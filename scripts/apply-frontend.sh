#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT_DIR/frontend"
PATCHES="$ROOT_DIR/patches/frontend"

echo "Copying frontend patch files..."

# App layout
mkdir -p "$FRONTEND/app"
cp "$PATCHES/app/layout.tsx" "$FRONTEND/app/layout.tsx"
cp "$PATCHES/app/page.tsx" "$FRONTEND/app/page.tsx"
cp "$PATCHES/app/globals.css" "$FRONTEND/app/globals.css"

# Login page
mkdir -p "$FRONTEND/app/login"
cp "$PATCHES/app/login/page.tsx" "$FRONTEND/app/login/page.tsx"

# Dashboard page
mkdir -p "$FRONTEND/app/dashboard"
cp "$PATCHES/app/dashboard/page.tsx" "$FRONTEND/app/dashboard/page.tsx"

# Components
mkdir -p "$FRONTEND/components"
cp "$PATCHES/components/Header.tsx" "$FRONTEND/components/Header.tsx"

# Lib
mkdir -p "$FRONTEND/lib"
cp "$PATCHES/lib/auth.ts" "$FRONTEND/lib/auth.ts"

# Next.js config
cp "$PATCHES/next.config.ts" "$FRONTEND/next.config.ts"

echo "Frontend files applied."
