#!/bin/bash

# Render Build Script for Python Backend
# This script ensures numpy and scipy are installed from binary wheels

set -e  # Exit on error

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📚 Installing dependencies (using Python 3.13-compatible versions)..."
pip install -r requirements.txt --only-binary :all:

echo "✅ Build complete!"
