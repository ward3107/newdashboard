# 100% FREE DEPLOYMENT OPTIONS

Complete guide for deploying ISHEBOT Dashboard **without spending a single
dollar**.

---

## Option 1: Best Free Setup (Recommended) ⭐

**Stack:**

```
Frontend:  Vercel (FREE)
Backend:   Render Free Tier
Database:  Firebase (FREE)
Auth:      Firebase Auth (FREE)
```

**Cost: $0/month**

### Pros

- ✅ 100% FREE forever
- ✅ Minimal setup (10 minutes)
- ✅ Auto-deploy on git push
- ✅ HTTPS automatic
- ✅ No configuration changes needed

### Cons

- ⚠️ **Backend sleeps after 15 minutes of inactivity**
- ⚠️ First request after sleep takes ~30 seconds (cold start)
- ⚠️ Subsequent requests are instant

### Perfect For

- Development/testing
- Demos and presentations
- Low-traffic applications
- Portfolio projects
- Learning/experimenting

### Is This Usable?

**YES!** The only "issue" is:

- User visits after 15+ min → First optimization takes 30s to start
- After that first request → Everything is instant
- If you use it regularly → Never sleeps

**Most teachers won't even notice** if they use it regularly.

---

## Option 2: All-Free Render Setup

**Stack:**

```
Frontend:  Render Static (FREE)
Backend:   Render Free Tier
Database:  Firebase (FREE)
Auth:      Firebase Auth (FREE)
```

**Cost: $0/month**

### Same as Option 1, but everything on Render

- ✅ Single platform (easier management)
- ⚠️ Backend still sleeps after 15 min
- ✅ Can use `render-all-in-one.yaml` with plan: free

---

## Option 3: Serverless (Most Complex, Truly Free)

**Stack:**

```
Frontend:  Vercel (FREE)
Backend:   Vercel Serverless Functions (FREE)
Database:  Firebase (FREE)
Auth:      Firebase Auth (FREE)
```

**Cost: $0/month**

### Pros

- ✅ No cold starts (Vercel edge network)
- ✅ Scales automatically
- ✅ 100% FREE
- ✅ Very fast globally

### Cons

- ❌ Need to rewrite Python backend as JavaScript/TypeScript
- ❌ Lots of work to migrate
- ❌ Lose the genetic algorithm optimization quality

### Not Recommended

Too much work for what you get.

---

## Option 4: Keep Backend Awake (FREE but Hacky)

**Stack:**

```
Frontend:  Vercel (FREE)
Backend:   Render Free + UptimeRobot pinger
Database:  Firebase (FREE)
Auth:      Firebase Auth (FREE)
```

**Cost: $0/month**

### How It Works

1. Deploy backend on Render FREE tier
2. Use UptimeRobot (free service) to ping your backend every 5 minutes
3. Backend never sleeps!

### Setup

1. Deploy backend to Render (free tier)
2. Go to <https://uptimerobot.com> (free account)
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/health`
   - Interval: 5 minutes
4. Done! Backend stays awake 24/7

### Pros

- ✅ No cold starts
- ✅ Always instant
- ✅ 100% FREE

### Cons

- ⚠️ **Against Render's Terms of Service** (they discourage this)
- ⚠️ Risk of account suspension
- ⚠️ Considered unethical by some

### Verdict

**Not recommended** - Just pay the $7/month or accept cold starts.

---

## Recommended: Option 1 (Best Free Setup)

### Quick Deploy Guide

#### Step 1: Deploy Frontend to Vercel

1. Go to <https://vercel.com>
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select `ward3107/newdashboard`
5. Configure:

   ```
   Framework: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

6. Add environment variables:

   ```
   VITE_FIREBASE_API_KEY=<your-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
   VITE_FIREBASE_PROJECT_ID=<your-project>
   VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender>
   VITE_FIREBASE_APP_ID=<your-app-id>
   VITE_OPTIMIZATION_API_URL=https://your-backend.onrender.com
   ```

7. Click **"Deploy"**

#### Step 2: Deploy Backend to Render (FREE)

1. Go to <https://render.com/dashboard>
2. Click **"New"** → **"Web Service"**
3. Connect GitHub: `ward3107/newdashboard`
4. Configure:

   ```
   Name: ishebot-optimization-api
   Region: Frankfurt
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: FREE  ← IMPORTANT!
   ```

5. Add environment variables:

   ```bash
   # Generate this first!
   SECRET_KEY=<run: python -c "import secrets; print(secrets.token_hex(32))">

   # Your Vercel frontend URL
   ALLOWED_ORIGINS=https://your-app.vercel.app

   # Other settings
   DEBUG=False
   GA_POPULATION_SIZE=100
   GA_GENERATIONS=100
   LOG_LEVEL=INFO
   ```

6. Click **"Create Web Service"**

#### Step 3: Update Frontend with Backend URL

1. In Vercel dashboard, go to your project
2. Settings → Environment Variables
3. Edit `VITE_OPTIMIZATION_API_URL`:

   ```
   VITE_OPTIMIZATION_API_URL=https://ishebot-optimization-api.onrender.com
   ```

4. Redeploy

#### Step 4: Update CSP

In your code, update `src/security/csp.ts`:

```typescript
'connect-src': [
  "'self'",
  'https://script.google.com',
  'https://script.googleusercontent.com',
  // ... other origins
  // Production optimization backend (Render)
  'https://ishebot-optimization-api.onrender.com',
].filter(Boolean),
```

Then:

```bash
git add src/security/csp.ts
git commit -m "chore: Add Render backend to CSP"
git push
```

Vercel auto-deploys!

---

## Free Tier Limits

### Vercel FREE

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Unlimited sites
- ✅ Custom domains
- ✅ HTTPS automatic
- **More than enough for your needs**

### Render FREE

- ✅ 750 hours/month (31 days × 24 hours = 744 hours)
- ✅ Unlimited services
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512MB RAM
- **Perfect for development**

### Firebase FREE (Spark Plan)

- ✅ 1GB storage
- ✅ 10GB/month data transfer
- ✅ 50k reads/day
- ✅ 20k writes/day
- ✅ 20k deletes/day
- ✅ Unlimited users (auth)
- **More than enough for small-medium apps**

---

## When to Upgrade?

### Upgrade Backend to $7/month if

- ❌ Users complain about 30s delay
- ❌ You're getting a lot of traffic
- ❌ You want professional reliability
- ❌ You're charging users

### Stay FREE if

- ✅ Personal use
- ✅ Development/testing
- ✅ Low traffic
- ✅ Demos/presentations
- ✅ Learning project

---

## Cold Start Reality Check

**What happens:**

1. User visits after 15+ min of inactivity
2. Clicks "Optimize Seating"
3. Backend wakes up (takes ~30 seconds)
4. Optimization runs
5. Results appear

**Subsequent requests:**

- Instant (backend is awake)
- Stays awake for 15 minutes
- If used regularly, users never see cold start

**Is 30s acceptable?**

- For optimization that takes several seconds anyway? **YES**
- For a free service? **Absolutely YES**
- For production with paying customers? **Consider $7/month**

---

## Cost Comparison

| Setup                 | Monthly Cost | Cold Starts | Reliability |
| --------------------- | ------------ | ----------- | ----------- |
| **FREE (Render)**     | **$0**       | Yes (30s)   | Good        |
| Paid (Render Starter) | $7           | None        | Excellent   |

**Savings: $84/year by using FREE tier**

---

## My Recommendation 🎯

### For You Right Now

**Start with 100% FREE:**

```
Frontend:  Vercel (FREE) ✅
Backend:   Render FREE tier ✅
Database:  Firebase (FREE) ✅
Auth:      Firebase Auth (FREE) ✅
```

**Cost: $0/month**

### Why

1. ✅ Test everything for free
2. ✅ See if cold starts bother you
3. ✅ Get user feedback
4. ✅ If it works well, stay free!
5. ✅ If cold starts are annoying, upgrade to $7/month

**You can always upgrade later with ONE CLICK in Render dashboard.**

---

## Upgrade Path (When Ready)

If you decide cold starts are unacceptable:

1. Go to Render dashboard
2. Click your backend service
3. Settings → Plan
4. Change: **Free → Starter ($7/month)**
5. Save

**That's it!** No redeployment needed. Instant upgrade.

---

## Alternative: Hybrid Approach

**Most Cost-Effective:**

```
Frontend:  Vercel (FREE) - Always fast ✅
Backend:   Render FREE - Accept 30s cold start ⚠️
Database:  Firebase (FREE) ✅
Auth:      Firebase (FREE) ✅
```

**Cost: $0/month**

**When optimization is needed:**

- First request: 30s delay (cold start + optimization)
- Subsequent: Instant
- After 15 min idle: 30s delay again

**For a classroom seating optimization:**

- Teachers typically optimize once per week/month
- A 30-second wait is completely acceptable
- Most won't even notice

---

## Free Deployment Checklist

- [ ] Generate SECRET_KEY:
      `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Deploy frontend to Vercel (FREE plan)
- [ ] Deploy backend to Render (FREE plan)
- [ ] Set environment variables in both platforms
- [ ] Update VITE_OPTIMIZATION_API_URL in Vercel
- [ ] Update ALLOWED_ORIGINS in Render
- [ ] Update CSP in code to include Render backend URL
- [ ] Test: Visit frontend, try seating optimization
- [ ] Test: Wait 20 minutes, try again (test cold start)
- [ ] Decide: Is 30s cold start acceptable?
- [ ] If YES: Stay free! 🎉
- [ ] If NO: Upgrade Render to Starter ($7/month)

---

## Support

**Free Tier Documentation:**

- Vercel Free: <https://vercel.com/docs/concepts/limits/overview>
- Render Free: <https://render.com/docs/free>
- Firebase Spark: <https://firebase.google.com/pricing>

---

## Summary

### Best 100% Free Setup

```
Platform      Service          Cost      Notes
─────────────────────────────────────────────────
Vercel        Frontend         $0        Fast, unlimited
Render        Backend          $0        Sleeps after 15min
Firebase      Database         $0        Generous limits
Firebase      Auth             $0        Unlimited users
─────────────────────────────────────────────────
TOTAL                          $0/month  ⭐
```

### Upgrade When Ready

```
Platform      Service          Cost      Notes
─────────────────────────────────────────────────
Vercel        Frontend         $0        Fast, unlimited
Render        Backend          $7        No sleep, always on
Firebase      Database         $0        Generous limits
Firebase      Auth             $0        Unlimited users
─────────────────────────────────────────────────
TOTAL                          $7/month  ⭐⭐
```

---

**Start FREE, upgrade if needed. You can't lose!** 🚀

**Cost: $0/month** **Time to Deploy: 15 minutes** **Difficulty: Easy**

---

**Ready to deploy for free?** Follow the Quick Deploy Guide above!
