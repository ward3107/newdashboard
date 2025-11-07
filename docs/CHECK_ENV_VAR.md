# URGENT: Check Vercel Environment Variable

## The Problem
Your frontend is NOT using the Python backend! It's falling back to JavaScript because the environment variable isn't working.

## Quick Check

Run this in your browser console on the Vercel site:

```javascript
// This will show what URL the app is using
fetch('/api/debug-env')
  .catch(() => {
    console.log('❌ VITE_OPTIMIZATION_API_URL is NOT set in Vercel!');
    console.log('The app is using: http://localhost:8000');
    console.log('That\'s why it\'s not working!');
  });
```

## How to Fix in Vercel

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Click your project

### 3. Go to Settings → Environment Variables

### 4. Check if this exists:
- **Key**: `VITE_OPTIMIZATION_API_URL`
- **Value**: `https://ishebot-optimization-api.onrender.com`

### If it doesn't exist:
1. Click "Add New"
2. Add the key and value above
3. Check ALL THREE boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 5. FORCE REDEPLOY (Important!)

After adding/updating the variable:

1. Go to **Deployments** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT**: UNCHECK "Use existing Build Cache"
5. Click **"Redeploy"**

This forces Vercel to rebuild with the new environment variable.

---

## Why This Matters

Without this environment variable:
- Frontend tries to call `http://localhost:8000`
- That doesn't exist on Vercel
- Code catches the error and falls back to JavaScript
- You never see the Python optimization!

---

## Verify After Redeploy

After redeployment (2-3 minutes), test again and you should see in Network tab:
```
POST https://ishebot-optimization-api.onrender.com/api/v1/optimize/classroom
```

NOT localhost!