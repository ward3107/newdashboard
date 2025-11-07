# GitHub Secrets Setup Guide

This guide explains how to set up the required GitHub secrets for the CI/CD pipeline.

## Required Secrets

### 1. Vercel Deployment Secrets

#### `VERCEL_TOKEN` (Required)
Your Vercel authentication token for deployments.

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions")
4. Copy the token (you won't be able to see it again!)

#### `VERCEL_ORG_ID` (Required)
Your Vercel organization/team ID.

**How to get it:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login` and authenticate
3. Navigate to your project directory
4. Run `vercel link` to link your project
5. Open `.vercel/project.json`
6. Copy the `orgId` value

#### `VERCEL_PROJECT_ID` (Required)
Your Vercel project ID.

**How to get it:**
1. Follow steps 1-4 from `VERCEL_ORG_ID` above
2. Open `.vercel/project.json`
3. Copy the `projectId` value

**Alternative method (Web UI):**
1. Go to your project settings on Vercel dashboard
2. The Project ID is shown in the "General" tab
3. For Org ID, go to your team/account settings

---

### 2. Slack Notification Secret (Optional)

#### `SLACK_WEBHOOK`
Webhook URL for Slack notifications on deployment success/failure.

**How to get it:**
1. Go to https://api.slack.com/apps
2. Create a new app or select an existing one
3. Go to "Incoming Webhooks" in the sidebar
4. Activate Incoming Webhooks
5. Click "Add New Webhook to Workspace"
6. Select the channel where notifications should be posted
7. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

**Note:** If you don't set this secret, deployment notifications will be skipped (the workflow won't fail).

---

### 3. Code Quality Secrets (Optional but Recommended)

#### `SNYK_TOKEN` (Optional)
Token for Snyk security scanning.

**How to get it:**
1. Sign up at https://snyk.io/
2. Go to Account Settings → General
3. Copy your Auth Token
4. Or use: `snyk auth` CLI command

**Note:** If not set, security scanning will be skipped with `continue-on-error: true`.

#### `CODECOV_TOKEN` (Optional)
Token for uploading code coverage reports to Codecov.

**How to get it:**
1. Sign up at https://codecov.io/
2. Add your GitHub repository
3. Copy the upload token from repository settings

**Note:** If not set, coverage upload will be skipped with `fail_ci_if_error: false`.

---

## How to Add Secrets to GitHub

### Method 1: GitHub Web UI
1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name (e.g., `VERCEL_TOKEN`)
5. Paste the secret value
6. Click **Add secret**
7. Repeat for each secret

### Method 2: GitHub CLI
```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Add secrets (replace with your values)
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set SLACK_WEBHOOK
gh secret set SNYK_TOKEN
gh secret set CODECOV_TOKEN
```

When prompted, paste the secret value and press Enter.

---

## Verifying Secrets are Set

### Check in GitHub UI
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all your secrets listed (values are hidden)

### Test the Workflow
1. Make a commit to the `main` or `develop` branch
2. Go to the **Actions** tab
3. Check if the workflow runs successfully
4. Look for deployment steps to confirm they're working

---

## Quick Setup Script

Create a local `.vercel/project.json` file first by running:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link
```

Then run this script to set up all secrets:

```bash
#!/bin/bash

# Read Vercel project config
VERCEL_ORG_ID=$(cat .vercel/project.json | jq -r '.orgId')
VERCEL_PROJECT_ID=$(cat .vercel/project.json | jq -r '.projectId')

echo "Found Vercel Org ID: $VERCEL_ORG_ID"
echo "Found Vercel Project ID: $VERCEL_PROJECT_ID"

# Set GitHub secrets
gh secret set VERCEL_ORG_ID -b "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID -b "$VERCEL_PROJECT_ID"

echo "Please enter your VERCEL_TOKEN:"
gh secret set VERCEL_TOKEN

echo "Do you want to set up Slack notifications? (y/n)"
read -r setup_slack
if [ "$setup_slack" = "y" ]; then
  echo "Please enter your SLACK_WEBHOOK:"
  gh secret set SLACK_WEBHOOK
fi

echo "Do you want to set up Snyk security scanning? (y/n)"
read -r setup_snyk
if [ "$setup_snyk" = "y" ]; then
  echo "Please enter your SNYK_TOKEN:"
  gh secret set SNYK_TOKEN
fi

echo "Do you want to set up Codecov? (y/n)"
read -r setup_codecov
if [ "$setup_codecov" = "y" ]; then
  echo "Please enter your CODECOV_TOKEN:"
  gh secret set CODECOV_TOKEN
fi

echo "✅ Secrets setup complete!"
```

Save this as `scripts/setup-github-secrets.sh` and run:
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

---

## Troubleshooting

### "No existing credentials found" Error
- Ensure `VERCEL_TOKEN` is set correctly
- Check that the token hasn't expired
- Verify the token has the correct permissions

### "Specify secrets.SLACK_WEBHOOK_URL" Error
- The workflow now gracefully skips Slack notifications if the secret isn't set
- If you want notifications, set the `SLACK_WEBHOOK` secret

### Deployment Fails with "Project not found"
- Ensure `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
- Try running `vercel link` locally and check `.vercel/project.json`

### Security Scan Fails
- Optional secrets (`SNYK_TOKEN`, `CODECOV_TOKEN`) can be left unset
- The workflow will continue even if these steps fail

---

## Security Best Practices

1. **Never commit secrets to git** - Always use GitHub Secrets
2. **Rotate tokens regularly** - Update tokens every 90 days
3. **Use minimal permissions** - Tokens should only have necessary permissions
4. **Monitor secret usage** - Check GitHub Actions logs for suspicious activity
5. **Delete unused secrets** - Remove old/unused secrets from repository settings

---

## Summary Checklist

- [ ] `VERCEL_TOKEN` - **Required for deployments**
- [ ] `VERCEL_ORG_ID` - **Required for deployments**
- [ ] `VERCEL_PROJECT_ID` - **Required for deployments**
- [ ] `SLACK_WEBHOOK` - Optional (deployment notifications)
- [ ] `SNYK_TOKEN` - Optional (security scanning)
- [ ] `CODECOV_TOKEN` - Optional (code coverage)

**Minimum required for deployment:** The three Vercel secrets above.

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Snyk Documentation](https://docs.snyk.io/)
- [Codecov Documentation](https://docs.codecov.com/)
