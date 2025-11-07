# Fix CORS Error - Quick Guide

## The Problem

Your backend is deployed and healthy, but the frontend can't connect because of CORS (Cross-Origin Resource Sharing) blocking.

**Error you're seeing:**
```
Access to fetch at 'https://ishebot-optimization-api.onrender.com/api/v1/optimize/classroom'
from origin 'https://ishebot-csr27kvzj-wassems-projects-ab3ab6ba.vercel.app'
has been blocked by CORS policy
```

## The Solution

Update the `ALLOWED_ORIGINS` environment variable in Render to include your Vercel URL.

---

## Step-by-Step Fix

### Step 1: Go to Render Dashboard
1. Open https://render.com/dashboard
2. Click on **ishebot-optimization-api** service

### Step 2: Navigate to Environment Tab
1. Click **"Environment"** in the left sidebar

### Step 3: Find ALLOWED_ORIGINS Variable
1. Look for the variable named `ALLOWED_ORIGINS`
2. Click the **[Edit]** button next to it

### Step 4: Update the Value

**Current value** (from RENDER_ENV_VARS_GUIDE.md):
```
https://ishebot-g87tvjpdx-wassems-projects-ab3ab6ba.vercel.app
```

**New value** (add your current Vercel preview URL):
```
https://ishebot-g87tvjpdx-wassems-projects-ab3ab6ba.vercel.app,https://ishebot-csr27kvzj-wassems-projects-ab3ab6ba.vercel.app
```

**OR use wildcard for all Vercel deployments** (recommended for development):
```
https://*.vercel.app
```

### Step 5: Save and Wait
1. Click **[Save]**
2. Render will automatically redeploy (takes 2-5 minutes)
3. Watch the "Events" tab for deployment status

---

## Verify It's Fixed

After the deployment completes:

1. **Open your Vercel deployment**: https://ishebot-csr27kvzj-wassems-projects-ab3ab6ba.vercel.app
2. **Navigate to the seating arrangement page**
3. **Try to optimize a classroom**
4. **No more CORS errors!** ✅

---

## Quick Test (Optional)

Test CORS from command line:
```bash
curl -X OPTIONS https://ishebot-optimization-api.onrender.com/api/v1/optimize/classroom \
  -H "Origin: https://ishebot-csr27kvzj-wassems-projects-ab3ab6ba.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Look for these headers in the response:
```
Access-Control-Allow-Origin: https://ishebot-csr27kvzj-wassems-projects-ab3ab6ba.vercel.app
Access-Control-Allow-Methods: POST, OPTIONS
```

---

## Understanding CORS

**What is CORS?**
- Security feature that prevents malicious websites from making requests to your API
- Only allows requests from approved origins (domains)

**Why did this happen?**
- Your Vercel deployment created a NEW preview URL
- The backend's ALLOWED_ORIGINS still had the OLD Vercel URL
- Backend rejected requests from the new URL

**The fix:**
- Add the new Vercel URL to ALLOWED_ORIGINS
- OR use wildcard `*.vercel.app` to allow all Vercel deployments

---

## Production Deployment

When you deploy to production (main branch), you'll want to:

1. **Get your production Vercel URL** (e.g., `https://ishebot.vercel.app`)

2. **Update ALLOWED_ORIGINS again**:
   ```
   https://ishebot.vercel.app
   ```

3. **Remove wildcards** for better security:
   ```
   https://ishebot.vercel.app,https://dashboard.ishebot.com
   ```

---

## Troubleshooting

### Still seeing CORS errors after updating?
1. Check deployment completed (Render Events tab)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh page (Ctrl+F5)
4. Verify URL is EXACTLY correct (no typos, no trailing slash)

### Want to allow multiple domains?
Separate with commas (NO SPACES):
```
https://domain1.com,https://domain2.com,https://domain3.com
```

### Want to test with wildcard?
Use this temporarily for development:
```
*
```
**WARNING**: Never use `*` in production! Security risk!

---

**That's it!** After updating ALLOWED_ORIGINS and redeploying, your seating optimization will work. 🎉
