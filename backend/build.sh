#!/bin/bash

# Render Build Script for Python Backend
# This script ensures numpy and scipy are installed from binary wheels

set -e  # Exit on error

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "🔢 Installing numpy and scipy from binary wheels..."
pip install numpy==1.26.2 scipy==1.11.4 --only-binary :all:

echo "📚 Installing remaining dependencies..."
pip install -r requirements.txt

echo "✅ Build complete!"
