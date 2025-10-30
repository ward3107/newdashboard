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

echo "✅ Caches cleared!"
echo ""
echo "🔧 Starting fresh development server..."
echo ""
echo "⚠️  CRITICAL: After server starts, you MUST:"
echo "   1. Open DevTools (F12)"
echo "   2. Right-click the refresh button"
echo "   3. Select 'Empty Cache and Hard Reload'"
echo ""
echo "   OR press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Start dev server
npm run dev
