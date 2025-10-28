# 🚀 Deployment Guide - ISHEBOT Dashboard

## Deployment Overview

Your platform has 3 components:
1. **React Frontend (Dashboard)** - Needs deployment
2. **Google Apps Script (Backend)** - Already deployed in Google
3. **ISHEBOT Backend** (Optional) - If using OpenAI analysis

---

## 🎯 Deployment Options for React Frontend

### Option 1: Vercel (RECOMMENDED - Easiest & Free)

**Why Vercel:**
- ✅ **Free tier** - Perfect for production
- ✅ **Automatic deployments** - Push to GitHub = auto deploy
- ✅ **Built-in CI/CD** - No setup needed
- ✅ **Custom domains** - Free SSL certificates
- ✅ **Environment variables** - Secure storage
- ✅ **Wildcard subdomains** - For multi-tenant (einstein.yoursite.com)
- ✅ **Edge CDN** - Fast worldwide
- ✅ **Perfect for Vite/React** - Zero config

**Cost:** FREE for production use

---

### Option 2: Netlify (Also Great)

**Similar to Vercel:**
- Free tier
- Auto deployments from Git
- Custom domains + SSL
- Environment variables

**Cost:** FREE

---

### Option 3: Firebase Hosting

**Best if you plan to:**
- Use Firestore database later
- Need Firebase Functions
- Want everything in one ecosystem

**Cost:** FREE (generous limits)

---

### Option 4: Self-Hosted (VPS)

**Use if you need:**
- Full control
- Custom server setup
- Already have a server

**Cost:** $5-10/month (DigitalOcean, Linode)

---

## 📦 Step-by-Step: Deploy to Vercel (RECOMMENDED)

### Step 1: Prepare Your Repository

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. **Sign up with GitHub** (easiest)
4. Authorize Vercel to access your repositories

### Step 3: Deploy Your App

1. Click "Add New Project"
2. Import your repository (select `newdashboard`)
3. Vercel will auto-detect: **Vite** project
4. Configure build settings (usually auto-filled):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 4: Add Environment Variables

**CRITICAL:** Don't skip this step!

In Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add each variable from your `.env` file:

```
VITE_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/YOUR_ID/exec
VITE_SPREADSHEET_ID = your_spreadsheet_id_here
VITE_API_URL = https://script.google.com/macros/s/YOUR_ID/exec
VITE_USE_MOCK_DATA = false
VITE_ADMIN_PASSWORD = your_secure_password
VITE_OPENAI_API_KEY = sk-your-key-here
VITE_ENABLE_MOCK_DATA = false
VITE_ENABLE_AI_ANALYSIS = true
VITE_DEFAULT_LOCALE = he
```

**Important:**
- Select "Production", "Preview", and "Development" for each
- Click "Save"

### Step 5: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes
3. Your app is live! 🎉

You'll get a URL like: `https://your-project-name.vercel.app`

---

## 🌐 Custom Domain Setup (Optional but Professional)

### Step 1: Buy a Domain

**Recommended registrars:**
- Namecheap: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$8/year (cheapest)

**Domain ideas:**
- `ishebot.com`
- `ishebot.co.il` (for Israeli market)
- `yourschoolname-dashboard.com`

### Step 2: Add Domain to Vercel

1. In Vercel project → "Settings" → "Domains"
2. Add your domain: `ishebot.com`
3. Vercel will give you DNS instructions

### Step 3: Configure DNS

In your domain registrar (Namecheap/Cloudflare/etc):

**Add these DNS records:**

```
Type       Name/Host       Value/Target
--------------------------------------------
A          @               76.76.21.21
CNAME      www             cname.vercel-dns.com
```

**For multi-tenant (subdomains):**

```
Type       Name/Host       Value/Target
--------------------------------------------
A          @               76.76.21.21
CNAME      www             cname.vercel-dns.com
CNAME      *               cname.vercel-dns.com  ← Wildcard for all subdomains
```

This allows:
- `einstein.ishebot.com`
- `herzl.ishebot.com`
- `any-school.ishebot.com`

### Step 4: Wait for DNS Propagation

- Usually 5-30 minutes
- Can take up to 48 hours (rare)
- Check status: https://www.whatsmydns.net

---

## 🔒 Secure Environment Variables

### DO NOT commit `.env` to Git (already configured)

Your `.gitignore` already blocks it (line 14).

### Store Credentials Securely

**Option A: Vercel Dashboard** (Production only)
- Vercel → Settings → Environment Variables
- Only accessible by you
- Never exposed in frontend code

**Option B: Password Manager** (For development)
- 1Password, Bitwarden, LastPass
- Store your `.env` content
- Copy to each development machine

**Option C: Private GitHub Gist** (Backup)
- Create SECRET gist with `.env` content
- Don't make it public
- Use as reference

---

## 🚀 Continuous Deployment Workflow

Once set up, every Git push auto-deploys:

```bash
# Make changes
git add .
git commit -m "feat: Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Updates live site (1-2 minutes)
```

**Preview deployments:**
- Every pull request gets a preview URL
- Test before merging to main
- Automatic cleanup after merge

---

## 📊 Production Checklist

Before going live, verify:

### Frontend (Vercel)
- [ ] All environment variables set in Vercel
- [ ] `VITE_USE_MOCK_DATA=false` (use real data)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test deployment: visit your Vercel URL

### Backend (Google Apps Script)
- [ ] Script deployed as Web App
- [ ] "Anyone" access enabled
- [ ] Web App URL copied to `VITE_API_URL`
- [ ] Test endpoint: `YOUR_URL?action=test`

### Security
- [ ] Admin password is strong
- [ ] API keys not exposed in frontend code
- [ ] `.env` not committed to Git
- [ ] Google Sheet has proper permissions

### Testing
- [ ] Dashboard loads without errors
- [ ] Can see student data
- [ ] Can view student details
- [ ] Admin panel accessible
- [ ] Export features work
- [ ] Responsive on mobile

---

## 🔄 Updating Production

### Quick Update (Code Changes)

```bash
# Make changes
git add .
git commit -m "fix: Update student detail view"
git push origin main
# Auto-deploys in 1-2 minutes
```

### Update Environment Variables

1. Vercel → Settings → Environment Variables
2. Edit the variable
3. Click "Save"
4. Redeploy: Deployments → ⋯ → "Redeploy"

### Update Google Apps Script

1. Edit script in Google Apps Script editor
2. Save (Ctrl+S)
3. Deploy → Manage deployments
4. Edit deployment → "New version"
5. Copy new URL if changed
6. Update Vercel env vars if needed

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Starting)

| Service | Cost | Limits |
|---------|------|--------|
| Vercel | FREE | Unlimited deployments, 100GB bandwidth/month |
| Google Apps Script | FREE | 20,000 executions/day |
| Google Sheets | FREE | Unlimited |
| Firebase (if used later) | FREE | 50K reads, 20K writes/day |

**Total: $0/month** ✅

### Paid (When Scaling)

| Service | Cost | When Needed |
|---------|------|-------------|
| Domain | $12/year | Professional branding |
| Vercel Pro | $20/month | Team collaboration, more bandwidth |
| Firebase Blaze | Pay-as-you-go | After 50K reads/day |
| OpenAI API | ~$10-50/month | If using AI analysis heavily |

**Starting Cost: ~$1-2/month** (just domain)

---

## 🏢 Multi-Tenant Deployment (Multiple Schools)

If deploying for multiple schools:

### Approach 1: Single Deployment + Subdomains (Recommended)

```
einstein.ishebot.com  → Same Vercel deployment, detects "einstein"
herzl.ishebot.com     → Same Vercel deployment, detects "herzl"
```

**Setup:**
1. Add wildcard DNS: `*.ishebot.com`
2. Detect subdomain in React code
3. Filter data by school in Google Sheet

### Approach 2: Separate Deployment per School

```
einstein-dashboard.vercel.app  → School 1
herzl-dashboard.vercel.app     → School 2
```

**Setup:**
1. Create separate Vercel project for each school
2. Each has its own env vars (different spreadsheet IDs)
3. Management overhead increases

**Recommendation:** Use Approach 1 (subdomains) for scalability.

---

## 🆘 Troubleshooting

### Issue: "Environment variables not working"

**Solution:**
- Make sure all env vars start with `VITE_`
- Redeploy after adding variables
- Check Vercel logs: Deployments → Click deployment → View logs

### Issue: "CORS errors in production"

**Solution:**
- Google Apps Script must be deployed with "Anyone" access
- Use `/exec` endpoint, not `/dev`
- Check Web App URL in env vars

### Issue: "Build fails on Vercel"

**Solution:**
- Check build logs in Vercel
- Make sure all dependencies in `package.json`
- Test locally: `npm run build`
- Fix TypeScript errors: `npm run typecheck`

### Issue: "Students not loading"

**Solution:**
- Check Vercel env vars are correct
- Test Google Apps Script endpoint directly
- Check browser console for errors
- Verify `VITE_USE_MOCK_DATA=false`

---

## 📱 Next Steps After Deployment

1. **Test thoroughly:**
   - All features work
   - Mobile responsive
   - No console errors

2. **Share with stakeholders:**
   - Send production URL
   - Provide admin credentials (securely)

3. **Monitor:**
   - Vercel analytics (free)
   - Check error logs regularly

4. **Iterate:**
   - Gather feedback
   - Push updates via Git
   - Auto-deploys to production

---

## 🎓 Summary: Deploy in 10 Minutes

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com, sign up with GitHub

# 3. Import repository, click Deploy

# 4. Add environment variables in Vercel settings

# 5. Visit your live URL!
```

**That's it! Your dashboard is live.** 🚀

For custom domain: Buy domain → Add to Vercel → Update DNS → Done!

---

**Need help?** Check:
- Vercel Docs: https://vercel.com/docs
- Your setup guide: `docs/setup/SETUP_SUMMARY.md`
- Multi-tenant guide: `docs/MULTI_TENANT_ARCHITECTURE.md`
