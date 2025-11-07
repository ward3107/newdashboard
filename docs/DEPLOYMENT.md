# ISHEBOT Optimization API - Railway Deployment Guide

This guide will help you deploy the Python FastAPI optimization backend to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository connected
- Vercel frontend URL (for CORS configuration)

## Deployment Steps

### 1. Create New Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `ward3107/newdashboard`
5. Railway will detect the Python app automatically

### 2. Configure Root Directory

Since the backend is in a subdirectory, you need to configure the root directory:

1. In Railway project settings, go to **"Settings"**
2. Find **"Root Directory"** setting
3. Set it to: `backend`
4. Click **"Save"**

### 3. Set Environment Variables

In Railway dashboard, go to **"Variables"** tab and add:

```bash
# Required Production Variables
DEBUG=False
APP_NAME=ISHEBOT Optimization API
APP_VERSION=1.0.0

# CORS - IMPORTANT: Replace with your actual Vercel URLs
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://ishebot-dashboard.vercel.app

# Genetic Algorithm Settings
GA_POPULATION_SIZE=100
GA_GENERATIONS=100
GA_MUTATION_RATE=0.1
GA_CROSSOVER_RATE=0.8

# Security - IMPORTANT: Generate a new secret key!
SECRET_KEY=<generate-using-command-below>
ALGORITHM=HS256

# Logging
LOG_LEVEL=INFO

# Server (Railway automatically sets PORT)
HOST=0.0.0.0
```

**Generate a secure SECRET_KEY:**

Run this command locally and copy the output:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Or on Windows:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Deploy

1. Railway will automatically deploy after setting variables
2. Wait for build and deployment (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.railway.app`

### 5. Test Deployment

Test your deployed backend:

```bash
# Health check
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "ISHEBOT Optimization API",
  "version": "1.0.0",
  "timestamp": "2025-11-02T..."
}
```

### 6. Update Frontend Configuration

Update your frontend `.env` file with the Railway URL:

```bash
# In newdashboard/.env
VITE_OPTIMIZATION_API_URL=https://your-app.railway.app
```

Then redeploy your Vercel frontend:
```bash
git add .env
git commit -m "chore: Update optimization API URL for production"
git push
```

Vercel will automatically redeploy with the new environment variable.

### 7. Update CSP for Production

Update `src/security/csp.ts` to allow production backend:

```typescript
'connect-src': [
  "'self'",
  'https://script.google.com',
  'https://script.googleusercontent.com',
  'https://apis.google.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  // Development
  isDevelopment ? 'ws://localhost:*' : '',
  isDevelopment ? 'http://localhost:*' : '',
  isDevelopment ? 'ws://127.0.0.1:*' : '',
  isDevelopment ? 'http://127.0.0.1:*' : '',
  isDevelopment ? 'http://localhost:8000' : '',
  isDevelopment ? 'http://127.0.0.1:8000' : '',
  // Production optimization backend
  !isDevelopment ? 'https://your-app.railway.app' : '',
].filter(Boolean),
```

## Monitoring & Logs

### View Logs
In Railway dashboard:
1. Click on your project
2. Go to **"Deployments"**
3. Click on latest deployment
4. View **"Logs"** tab for real-time logs

### Monitor Performance
Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

## Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your Vercel URL
- Check for trailing slashes (use `https://example.com` not `https://example.com/`)
- Include both production and preview URLs

### Build Fails
- Check `requirements.txt` is up to date
- Verify Python version in `runtime.txt`
- Review build logs in Railway dashboard

### Connection Refused
- Ensure `HOST=0.0.0.0` (not localhost)
- Railway automatically sets `PORT` - don't hardcode it
- Check firewall settings in Railway

### High Memory Usage
- Reduce `GA_POPULATION_SIZE` if needed
- Monitor with Railway metrics
- Consider upgrading plan if necessary

## Cost Optimization

Railway offers:
- **Free tier**: $5/month credit (suitable for testing)
- **Pro plan**: $20/month for production use

### Tips to Reduce Costs:
1. Use smaller `GA_POPULATION_SIZE` for less memory usage
2. Set up auto-sleep for inactive periods
3. Monitor usage in Railway dashboard

## Security Best Practices

✅ **Do:**
- Use strong `SECRET_KEY` (32+ characters)
- Set `DEBUG=False` in production
- Restrict `ALLOWED_ORIGINS` to only your domains
- Enable HTTPS (Railway does this automatically)
- Review logs regularly

❌ **Don't:**
- Commit `.env` file to GitHub
- Use development settings in production
- Allow `*` in CORS origins
- Use weak or default secret keys

## Updating the Deployment

To update after code changes:

```bash
# Local development
git add .
git commit -m "feat: Your changes"
git push

# Railway will automatically redeploy from GitHub
```

## Rollback

If deployment fails:

1. Go to Railway **"Deployments"**
2. Find previous successful deployment
3. Click **"Redeploy"**

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/ward3107/newdashboard/issues

---

## Quick Deployment Checklist

- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Generate and set `SECRET_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with Vercel URLs
- [ ] Set all environment variables
- [ ] Deploy and verify health endpoint
- [ ] Update frontend `VITE_OPTIMIZATION_API_URL`
- [ ] Update CSP with production URL
- [ ] Redeploy Vercel frontend
- [ ] Test end-to-end optimization flow

---

**Last Updated:** 2025-11-02
**Backend Version:** 1.0.0
**Python Version:** 3.12.10
