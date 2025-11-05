# Fix Vercel Environment Variable

## The Problem

Your Vercel deployment is trying to connect to `http://localhost:8000` instead of the Render backend URL!

The 400 error is happening because the frontend thinks the backend is at localhost.

## The Fix

Add the Render backend URL to Vercel's environment variables.

---

## Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click on your project: **ishebot** (or whatever your project is named)

### Step 2: Navigate to Settings
1. Click the **"Settings"** tab at the top
2. Click **"Environment Variables"** in the left sidebar

### Step 3: Add New Environment Variable

Click **"Add New"** button

**Key:**
```
VITE_OPTIMIZATION_API_URL
```

**Value:**
```
https://ishebot-optimization-api.onrender.com
```

**Environments:** Check all three boxes:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

---

## Step 4: Redeploy

After adding the variable, you need to redeploy:

**Option A: Wait for automatic deployment**
- Just push any commit to GitHub
- Vercel will automatically redeploy with new environment variable

**Option B: Manual redeploy**
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Check **"Use existing Build Cache"** = NO (force rebuild)
6. Click **"Redeploy"**

---

## Verification

After redeployment completes (2-3 minutes):

1. **Open your Vercel site**
2. **Open browser console** (F12)
3. **Check the network tab**
4. **Try the seating optimization**
5. **You should see requests to:** `https://ishebot-optimization-api.onrender.com`

---

## Quick Test

Open your browser console on the Vercel site and run:

```javascript
console.log(import.meta.env.VITE_OPTIMIZATION_API_URL)
```

Should show:
```
https://ishebot-optimization-api.onrender.com
```

NOT:
```
http://localhost:8000
```

---

## Expected Result

After this fix:
- ✅ Frontend connects to Render backend
- ✅ CORS allows the connection (we already fixed this)
- ✅ Seating optimization works!

---

## If You See "localhost:8000" Errors After Adding Variable

This means the variable wasn't applied. Try:
1. Go to Vercel Deployments tab
2. Click "Redeploy" on latest deployment
3. **UNCHECK** "Use existing Build Cache"
4. This forces Vercel to rebuild with new environment variables

---

**That's it!** After adding this variable and redeploying, everything should work! 🎉
