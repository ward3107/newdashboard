#!/bin/bash

# GitHub Secrets Setup Script
# This script helps you set up all required GitHub secrets for CI/CD

set -e

echo "🔐 GitHub Secrets Setup for CI/CD Pipeline"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "⚠️  You're not authenticated with GitHub CLI"
    echo "Running: gh auth login"
    gh auth login
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Check if .vercel/project.json exists
if [ -f ".vercel/project.json" ]; then
    echo "📁 Found .vercel/project.json"

    # Check if jq is installed
    if command -v jq &> /dev/null; then
        VERCEL_ORG_ID=$(cat .vercel/project.json | jq -r '.orgId')
        VERCEL_PROJECT_ID=$(cat .vercel/project.json | jq -r '.projectId')

        echo "Found Vercel Org ID: $VERCEL_ORG_ID"
        echo "Found Vercel Project ID: $VERCEL_PROJECT_ID"
        echo ""

        # Set Vercel IDs
        echo "Setting VERCEL_ORG_ID..."
        echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID

        echo "Setting VERCEL_PROJECT_ID..."
        echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID

        echo "✅ Vercel IDs set successfully"
        echo ""
    else
        echo "⚠️  jq is not installed. Skipping automatic Vercel ID setup."
        echo "Please set VERCEL_ORG_ID and VERCEL_PROJECT_ID manually."
        echo ""
    fi
else
    echo "⚠️  .vercel/project.json not found."
    echo "Please run 'vercel link' first to link your project."
    echo ""
    echo "To set up Vercel:"
    echo "  1. npm i -g vercel"
    echo "  2. vercel login"
    echo "  3. vercel link"
    echo ""

    read -p "Do you want to set VERCEL_ORG_ID and VERCEL_PROJECT_ID manually? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please enter your VERCEL_ORG_ID:"
        gh secret set VERCEL_ORG_ID

        echo "Please enter your VERCEL_PROJECT_ID:"
        gh secret set VERCEL_PROJECT_ID
    fi
fi

# VERCEL_TOKEN (Required)
echo "🔑 Setting up VERCEL_TOKEN (Required)"
echo "Get your token from: https://vercel.com/account/tokens"
echo "Please enter your VERCEL_TOKEN:"
gh secret set VERCEL_TOKEN
echo "✅ VERCEL_TOKEN set successfully"
echo ""

# SLACK_WEBHOOK (Optional)
read -p "Do you want to set up Slack notifications? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get your webhook from: https://api.slack.com/apps"
    echo "Please enter your SLACK_WEBHOOK URL:"
    gh secret set SLACK_WEBHOOK
    echo "✅ SLACK_WEBHOOK set successfully"
else
    echo "⏭️  Skipping Slack setup (notifications will be disabled)"
fi
echo ""

# SNYK_TOKEN (Optional)
read -p "Do you want to set up Snyk security scanning? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get your token from: https://snyk.io/account"
    echo "Please enter your SNYK_TOKEN:"
    gh secret set SNYK_TOKEN
    echo "✅ SNYK_TOKEN set successfully"
else
    echo "⏭️  Skipping Snyk setup (security scanning will be skipped)"
fi
echo ""

# CODECOV_TOKEN (Optional)
read -p "Do you want to set up Codecov? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get your token from: https://codecov.io/"
    echo "Please enter your CODECOV_TOKEN:"
    gh secret set CODECOV_TOKEN
    echo "✅ CODECOV_TOKEN set successfully"
else
    echo "⏭️  Skipping Codecov setup (coverage upload will be skipped)"
fi
echo ""

echo "=========================================="
echo "✅ GitHub Secrets setup complete!"
echo ""
echo "📋 Summary of configured secrets:"
gh secret list
echo ""
echo "🚀 Your CI/CD pipeline is now ready to use!"
echo ""
echo "Next steps:"
echo "  1. Push your code to trigger the workflow"
echo "  2. Check the Actions tab on GitHub to see the pipeline run"
echo "  3. Monitor deployments on your Vercel dashboard"
