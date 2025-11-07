# CI/CD Quick Fix Guide

## Problem: Workflow Failed with Missing Credentials

### Error Messages:
```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
##[error]Specify secrets.SLACK_WEBHOOK_URL
```

---

## ✅ Solution Summary

The CI/CD workflow has been updated to:
1. Gracefully handle missing secrets
2. Skip optional steps when secrets aren't configured
3. Use proper Vercel deployment commands
4. Add better error messages

---

## 🚀 Quick Setup (5 Minutes)

### Required Secrets (Must Set):

#### 1. Get Vercel Token
```bash
# Visit: https://vercel.com/account/tokens
# Create a new token and copy it
```

#### 2. Get Vercel Project IDs
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# View your project config
cat .vercel/project.json
# Copy: orgId and projectId
```

#### 3. Add Secrets to GitHub

**Option A: Use Web UI**
1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret"
3. Add these three secrets:
   - Name: `VERCEL_TOKEN` → Paste your token
   - Name: `VERCEL_ORG_ID` → Paste orgId from project.json
   - Name: `VERCEL_PROJECT_ID` → Paste projectId from project.json

**Option B: Use CLI (Faster)**
```bash
# Make sure you're in project directory
cd newdashboard

# Run the setup script (Linux/Mac)
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh

# Or on Windows
scripts\setup-github-secrets.bat
```

---

## ⚙️ Changes Made to Workflow

### Before (Would Fail):
```yaml
- name: Deploy to Vercel Production
  run: |
    npx vercel deploy --prod \
      --token=${{ secrets.VERCEL_TOKEN }} \
      --scope=${{ secrets.VERCEL_SCOPE }}
```

### After (Handles Missing Secrets):
```yaml
- name: Deploy to Vercel Production
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    if [ -z "$VERCEL_TOKEN" ]; then
      echo "⚠️ VERCEL_TOKEN not set. Skipping deployment."
      exit 0
    fi

    npx vercel pull --yes --environment=production --token=$VERCEL_TOKEN
    npx vercel build --prod --token=$VERCEL_TOKEN
    npx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

### Key Improvements:
- ✅ Checks if secrets exist before deploying
- ✅ Uses proper Vercel CLI workflow (`pull → build → deploy`)
- ✅ Gracefully skips deployment if credentials missing
- ✅ Slack notifications are optional (won't fail if not set)
- ✅ Security scans continue even if tokens missing

---

## 🧪 Test the Fix

### 1. Commit and Push
```bash
git add .
git commit -m "fix: Update CI/CD workflow with better error handling"
git push
```

### 2. Check Workflow
1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click on the latest workflow run
3. Verify all jobs complete successfully

### 3. Expected Behavior

**With Secrets Set:**
- ✅ All tests run
- ✅ Build succeeds
- ✅ Deployment to Vercel succeeds
- ✅ Slack notification sent (if configured)

**Without Optional Secrets:**
- ✅ All tests run
- ✅ Build succeeds
- ⏭️ Deployment skipped (with warning message)
- ⏭️ Slack notification skipped
- ⏭️ Snyk/Codecov skipped

---

## 📋 Secrets Checklist

### Required for Deployment ⚠️
- [ ] `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- [ ] `VERCEL_ORG_ID` - Get from `.vercel/project.json`
- [ ] `VERCEL_PROJECT_ID` - Get from `.vercel/project.json`

### Optional (Recommended) ✨
- [ ] `SLACK_WEBHOOK` - For deployment notifications
- [ ] `SNYK_TOKEN` - For security scanning
- [ ] `CODECOV_TOKEN` - For code coverage reports

---

## 🔍 Troubleshooting

### "No existing credentials found"
**Cause:** `VERCEL_TOKEN` not set or invalid
**Fix:**
```bash
# Generate new token at: https://vercel.com/account/tokens
# Add it to GitHub secrets as VERCEL_TOKEN
```

### "Project not found"
**Cause:** `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` incorrect
**Fix:**
```bash
# Run locally to get correct IDs
vercel link
cat .vercel/project.json

# Update GitHub secrets with correct values
```

### "SLACK_WEBHOOK_URL not specified"
**Cause:** Old error - now fixed in workflow
**Fix:** No action needed - notification will be skipped automatically

### Deployment Skipped
**Cause:** Secrets not set, but this is now intentional
**Fix:** Set the required Vercel secrets to enable deployment

---

## 📞 Need More Help?

- **Full Setup Guide:** See `docs/GITHUB_SECRETS_SETUP.md`
- **Vercel Docs:** https://vercel.com/docs/cli
- **GitHub Actions:** https://docs.github.com/actions

---

## 🎯 One-Command Setup

If you have GitHub CLI and Vercel CLI installed:

```bash
# Link Vercel project first
vercel link

# Run automated setup
./scripts/setup-github-secrets.sh  # Linux/Mac
# OR
scripts\setup-github-secrets.bat   # Windows
```

That's it! Your pipeline should now work. 🎉
