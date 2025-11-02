# How to Add Environment Variables in Render

## Step-by-Step Visual Guide

### Step 1: Go to Your Service

1. Login to https://render.com/dashboard
2. You'll see your service(s) listed
3. Click on **`ishebot-optimization-api`** (your backend service)

---

### Step 2: Navigate to Environment Tab

On the left sidebar, you'll see:
```
Overview
Events
Logs
Metrics
Shell
Environment  ← Click this!
Settings
```

Click **"Environment"**

---

### Step 3: Add Environment Variables

You'll see a page with:
- A list of existing environment variables (if any)
- A button that says **"Add Environment Variable"**

Click **"Add Environment Variable"**

---

### Step 4: Enter Each Variable

A form will appear with two fields:
```
Key:   [_________________]
Value: [_________________]
        [Add]  [Cancel]
```

---

## Your Environment Variables

Copy and paste these exactly as shown:

### Variable 1: SECRET_KEY
```
Key:   SECRET_KEY
Value: a08fef8dc1891aebef668116328ed1d7550dd55137a3a7c10a3d4a27aa80603f
```
Click **[Add]**

### Variable 2: ALLOWED_ORIGINS
```
Key:   ALLOWED_ORIGINS
Value: https://ishebot-g87tvjpdx-wassems-projects-ab3ab6ba.vercel.app
```
Click **[Add]**

### Variable 3: DEBUG
```
Key:   DEBUG
Value: False
```
Click **[Add]**

### Variable 4: APP_NAME
```
Key:   APP_NAME
Value: ISHEBOT Optimization API
```
Click **[Add]**

### Variable 5: APP_VERSION
```
Key:   APP_VERSION
Value: 1.0.0
```
Click **[Add]**

### Variable 6: HOST
```
Key:   HOST
Value: 0.0.0.0
```
Click **[Add]**

### Variable 7: GA_POPULATION_SIZE
```
Key:   GA_POPULATION_SIZE
Value: 100
```
Click **[Add]**

### Variable 8: GA_GENERATIONS
```
Key:   GA_GENERATIONS
Value: 100
```
Click **[Add]**

### Variable 9: GA_MUTATION_RATE
```
Key:   GA_MUTATION_RATE
Value: 0.1
```
Click **[Add]**

### Variable 10: GA_CROSSOVER_RATE
```
Key:   GA_CROSSOVER_RATE
Value: 0.8
```
Click **[Add]**

### Variable 11: ALGORITHM
```
Key:   ALGORITHM
Value: HS256
```
Click **[Add]**

### Variable 12: LOG_LEVEL
```
Key:   LOG_LEVEL
Value: INFO
```
Click **[Add]**

---

## After Adding All Variables

Your environment variables list should look like this:

```
Environment Variables (12)
─────────────────────────────────────────────────────────────
SECRET_KEY              a08fef8dc1891aebef668116328ed1d757...  [Edit] [Delete]
ALLOWED_ORIGINS         https://ishebot-g87tvjpdx-wassems...   [Edit] [Delete]
DEBUG                   False                                   [Edit] [Delete]
APP_NAME                ISHEBOT Optimization API                [Edit] [Delete]
APP_VERSION             1.0.0                                   [Edit] [Delete]
HOST                    0.0.0.0                                 [Edit] [Delete]
GA_POPULATION_SIZE      100                                     [Edit] [Delete]
GA_GENERATIONS          100                                     [Edit] [Delete]
GA_MUTATION_RATE        0.1                                     [Edit] [Delete]
GA_CROSSOVER_RATE       0.8                                     [Edit] [Delete]
ALGORITHM               HS256                                   [Edit] [Delete]
LOG_LEVEL               INFO                                    [Edit] [Delete]
─────────────────────────────────────────────────────────────
```

---

## Important Notes

### Automatic Redeployment
- When you add/edit environment variables, Render will automatically redeploy your service
- This takes 2-5 minutes
- Watch the "Events" tab to see deployment progress

### Secret Variables
- `SECRET_KEY` is marked as "secret" (Render hides the value)
- Other variables are visible
- This is normal and correct

### If You Make a Mistake
- Click **[Edit]** next to the variable
- Update the value
- Click **[Save]**
- Service will redeploy automatically

---

## For Frontend (Vercel)

If you deploy frontend to Vercel, add environment variables there too:

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **"Settings"** tab
4. Click **"Environment Variables"** (left sidebar)
5. Add these variables:

```
Key:   VITE_FIREBASE_API_KEY
Value: <your-firebase-api-key>

Key:   VITE_FIREBASE_AUTH_DOMAIN
Value: <your-project>.firebaseapp.com

Key:   VITE_FIREBASE_PROJECT_ID
Value: <your-project-id>

Key:   VITE_FIREBASE_STORAGE_BUCKET
Value: <your-project>.appspot.com

Key:   VITE_FIREBASE_MESSAGING_SENDER_ID
Value: <your-sender-id>

Key:   VITE_FIREBASE_APP_ID
Value: <your-app-id>

Key:   VITE_OPTIMIZATION_API_URL
Value: https://ishebot-optimization-api.onrender.com
```

(Get Firebase values from your current `.env` file)

---

## Verification

After deployment completes, test the backend:

```bash
curl https://ishebot-optimization-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ISHEBOT Optimization API",
  "version": "1.0.0",
  "timestamp": "2025-11-02T..."
}
```

If you see this, your environment variables are set correctly! ✅

---

## Troubleshooting

### "Build Failed" after adding variables
- Check for typos in variable names (case-sensitive!)
- Ensure `DEBUG` is `False` not `false` (capital F)
- Check logs in "Logs" tab for specific error

### "CORS Error" in frontend
- Verify `ALLOWED_ORIGINS` matches your frontend URL exactly
- No trailing slash in URL
- Include `https://` prefix

### Backend won't start
- Check `SECRET_KEY` is set
- Ensure all required variables are present
- Review logs for missing variables error

---

## Quick Copy-Paste Checklist

Use this to verify all variables are set:

- [ ] SECRET_KEY
- [ ] ALLOWED_ORIGINS
- [ ] DEBUG
- [ ] APP_NAME
- [ ] APP_VERSION
- [ ] HOST
- [ ] GA_POPULATION_SIZE
- [ ] GA_GENERATIONS
- [ ] GA_MUTATION_RATE
- [ ] GA_CROSSOVER_RATE
- [ ] ALGORITHM
- [ ] LOG_LEVEL

---

**That's it!** Your backend is now fully configured.
