# ISHEBOT Optimization API - Render Deployment Guide

Render is an excellent alternative to Railway with a generous free tier and excellent Python support.

## Why Render?

✅ **Advantages:**
- Free tier available (750 hours/month - enough for development)
- Automatic HTTPS
- European region (Frankfurt) - closer to Israel for better latency
- Easy GitHub integration
- Good Python support
- Simple configuration

❌ **Considerations:**
- Free tier services sleep after 15 minutes of inactivity (30s cold start)
- For production, $7/month starter plan recommended (no sleep)

## Quick Deployment (Automatic)

### Option 1: Using render.yaml (Recommended)

1. Go to https://render.com/dashboard
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `ward3107/newdashboard`
4. Render will automatically detect `render.yaml` in the backend folder
5. Set these environment variables manually:
   ```
   SECRET_KEY=<generate-using-command-below>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Click **"Apply"**

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Manual Deployment

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to https://render.com/dashboard
   - Click **"New"** → **"Web Service"**
   - Connect GitHub repository: `ward3107/newdashboard`

2. **Configure Service**
   ```
   Name: ishebot-optimization-api
   Region: Frankfurt (EU Central)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Select Plan**
   - **Free**: For testing (sleeps after 15min inactivity)
   - **Starter ($7/month)**: For production (always on)

4. **Set Environment Variables**

   Click **"Advanced"** → **"Add Environment Variable"**:

   ```bash
   # Required - Generate this!
   SECRET_KEY=<your-generated-secret-key>

   # Required - Your Vercel frontend URL
   ALLOWED_ORIGINS=https://ishebot-g87tvjpdx-wassems-projects-ab3ab6ba.vercel.app

   # Application Settings
   DEBUG=False
   APP_NAME=ISHEBOT Optimization API
   APP_VERSION=1.0.0
   HOST=0.0.0.0

   # Genetic Algorithm Settings
   GA_POPULATION_SIZE=100
   GA_GENERATIONS=100
   GA_MUTATION_RATE=0.1
   GA_CROSSOVER_RATE=0.8

   # Logging
   LOG_LEVEL=INFO
   ALGORITHM=HS256

   # Python Version (Render auto-detects, but can specify)
   PYTHON_VERSION=3.12.10
   ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy automatically
   - Deployment takes 2-5 minutes

## Post-Deployment

### 1. Get Your Render URL

After deployment, you'll get a URL like:
```
https://ishebot-optimization-api.onrender.com
```

### 2. Test Deployment

```bash
# Health check
curl https://ishebot-optimization-api.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "service": "ISHEBOT Optimization API",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### 3. Update Frontend Configuration

Update your `.env` file:
```bash
VITE_OPTIMIZATION_API_URL=https://ishebot-optimization-api.onrender.com
```

### 4. Update CSP for Production

In `src/security/csp.ts`, add your Render URL:

```typescript
'connect-src': [
  "'self'",
  'https://script.google.com',
  'https://script.googleusercontent.com',
  // ... other origins
  // Production optimization backend
  !isDevelopment ? 'https://ishebot-optimization-api.onrender.com' : '',
].filter(Boolean),
```

### 5. Update CORS in Render

Make sure `ALLOWED_ORIGINS` in Render includes ALL your frontend URLs:
```
https://ishebot.vercel.app,https://ishebot-g87tvjpdx-wassems-projects-ab3ab6ba.vercel.app
```

### 6. Redeploy Frontend

```bash
git add .env src/security/csp.ts
git commit -m "chore: Update optimization API URL for Render production"
git push
```

Vercel will automatically redeploy.

## Free Tier vs Starter Plan

### Free Tier ($0/month)
- ✅ 750 hours/month (enough for development)
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ❌ **Sleeps after 15min inactivity** (30s cold start)
- ❌ 512MB RAM

**Best for:** Development, testing, demos

### Starter Plan ($7/month)
- ✅ Always on (no sleep)
- ✅ 512MB RAM
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ✅ Custom domains

**Best for:** Production use

## Monitoring & Logs

### View Logs
1. Go to Render Dashboard
2. Click on your service
3. Click **"Logs"** tab
4. View real-time logs

### Metrics
Render provides:
- CPU usage
- Memory usage
- Request count
- Response times

Access via **"Metrics"** tab in dashboard.

## Auto-Deploy from GitHub

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "feat: Your changes"
git push
```

Render will detect the push and redeploy automatically.

## Custom Domain (Optional)

1. Go to service **"Settings"**
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `api.ishebot.com`)
4. Update DNS records as instructed
5. HTTPS is automatic via Let's Encrypt

## Troubleshooting

### CORS Errors
✅ **Fix:** Ensure `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Include both production and preview URLs
- No trailing slashes
- Comma-separated

### Service Sleeps (Free Tier)
✅ **Fix:**
- Upgrade to Starter plan ($7/month), or
- Use a ping service like UptimeRobot to keep it awake, or
- Accept 30s cold start on first request

### Build Fails
✅ **Fix:**
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure Python version is compatible

### High Memory Usage
✅ **Fix:**
- Reduce `GA_POPULATION_SIZE` (default: 100)
- Monitor in Metrics tab
- Consider upgrading plan if needed

## Cost Comparison

| Platform | Free Tier | Paid Plan |
|----------|-----------|-----------|
| **Render** | $0 (sleeps) | $7/month (always on) |
| **Railway** | $5 credit/month | $20/month |
| **Heroku** | Discontinued | $7/month |

**Recommendation:** Render offers the best value for this use case.

## Security Best Practices

✅ **Do:**
- Generate strong `SECRET_KEY` (32+ characters)
- Set `DEBUG=False` in production
- Restrict `ALLOWED_ORIGINS` to your domains only
- Use Render's secret management for sensitive data
- Review logs regularly

❌ **Don't:**
- Commit `.env` to GitHub
- Use development settings in production
- Allow `*` in CORS origins
- Use weak or default secret keys

## Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | ✅ 750hrs/month | ✅ $5 credit/month |
| Sleeps | Yes (free tier) | No |
| Cold Start | ~30s | N/A |
| Paid Plan | $7/month | $20/month |
| EU Region | ✅ Frankfurt | ✅ Multiple |
| Auto-Deploy | ✅ | ✅ |
| Custom Domains | ✅ | ✅ |

**For your use case:** Render is more cost-effective, especially for production ($7 vs $20).

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/ward3107/newdashboard/issues

---

## Quick Deployment Checklist

- [ ] Create Render account (https://render.com)
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Set root directory to `backend`
- [ ] Generate and set `SECRET_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with Vercel URLs
- [ ] Set all environment variables
- [ ] Choose plan (Free for testing, Starter for production)
- [ ] Deploy and verify health endpoint
- [ ] Update frontend `VITE_OPTIMIZATION_API_URL`
- [ ] Update CSP with Render URL
- [ ] Redeploy Vercel frontend
- [ ] Test end-to-end optimization flow

---

**Last Updated:** 2025-11-02
**Backend Version:** 1.0.0
**Python Version:** 3.12.10
