#!/bin/bash

echo "🧹 Cleaning all caches and builds..."

# Kill any running dev servers
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*dev" 2>/dev/null || true

# Remove all cache directories
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf .vite
rm -rf dist

# Clear npm cache (just for this project)
npm cache clean --force

echo "✅ Caches cleared!"
echo ""
echo "🔧 Starting fresh development server..."
echo "⚠️  IMPORTANT: When the server starts, press Ctrl+Shift+R in your browser to hard refresh!"
echo ""

# Start dev server
npm run dev
