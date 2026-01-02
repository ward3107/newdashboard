# 🚀 ISHEBOT Production Deployment Checklist

Complete this checklist before launching ISHEBOT to production.

---

## 📋 Pre-Deployment Checklist

### 1. Code & Security ✅

- [x] **Firestore Security Rules** - Updated with tenant isolation and role-based access
  - [ ] Deploy to Firebase Console: `firebase deploy --only firestore:rules`
  - [ ] Test with different user roles (teacher, admin, super_admin)

- [x] **Mock Auth Disabled** - Production build blocks mock authentication
  - [ ] Verified in `src/utils/mockAuth.ts`
  - [ ] Test: Try logging in with test account in production build

- [x] **CSP Headers** - Content Security Policy configured
  - [ ] Vercel headers configured in `vercel.json`
  - [ ] Test: Check browser console for CSP violations

- [x] **HSTS Header** - HTTP Strict Transport Security active
  - [ ] Configured in `vercel.json`
  - [ ] Test: Check response headers on deployed site

- [x] **Client-Side Encryption Removed** - Using HTTPS only
  - [ ] `crypto-js` package uninstalled
  - [ ] Native Web Crypto API in use

- [x] **Error Tracking** - Sentry configured (optional but recommended)
  - [ ] Create Sentry account
  - [ ] Create project and get DSN
  - [ ] Add `VITE_SENTRY_DSN` to production environment

---

### 2. Database & Indexes 📊

- [x] **Firestore Indexes** - All required indexes documented
  - [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
  - [ ] Verify in Firebase Console → Firestore → Indexes
  - [ ] Test queries that need composite indexes

- [ ] **Firestore Backups** - Enable automatic backups
  1. Go to Firebase Console → Firestore → Backups
  2. Click "Enable Scheduled Exports"
  3. Choose backup frequency (daily recommended)
  4. Choose export location (Google Cloud Storage bucket)
  5. Click "Enable"

- [ ] **Test Database Access**
  - [ ] Log in as teacher - verify only assigned classes visible
  - [ ] Log in as admin - verify full school access
  - [ ] Try accessing different school - verify blocked

---

### 3. Environment Variables 🔐

### Frontend (Vercel)

Go to Vercel Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | Production |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your project.firebaseapp.com | Production |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID | Production |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your project.appspot.com | Production |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production |
| `VITE_FIREBASE_APP_ID` | Your app ID | Production |
| `VITE_USE_FIRESTORE` | `true` | Production |
| `VITE_SCHOOL_ID` | Your school ID | Production |
| `VITE_SENTRY_DSN` | Your Sentry DSN (optional) | Production |
| `VITE_APP_VERSION` | `1.0.0` | Production |

**Checklist:**
- [ ] All Firebase variables set
- [ ] `VITE_USE_FIRESTORE=true` (NOT mock data)
- [ ] No localhost URLs in production
- [ ] Secrets NOT committed to git

### Backend (Railway/Render)

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Generate with `openssl rand -hex 32` | Required |
| `ALLOWED_ORIGINS` | Your Vercel URL(s) | Comma-separated |
| `DEBUG` | `False` | Production only |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `60` | Adjust as needed |
| `RATE_LIMIT_BURST` | `10` | Adjust as needed |
| `LOG_LEVEL` | `INFO` | Production only |

**Checklist:**
- [ ] Strong `SECRET_KEY` generated
- [ ] `ALLOWED_ORIGINS` matches Vercel domain
- [ ] `DEBUG=False` in production
- [ ] Rate limiting configured

---

### 4. Monitoring & Uptime 📡

- [x] **Health Check Endpoint** - Created at `/health`
  - [ ] Test: `https://your-domain.com/health?format=json`
  - [ ] Verify JSON response is valid

- [ ] **Uptime Monitoring** - Set up free monitoring service
  - [ ] Sign up for UptimeRobot (free)
  - [ ] Add monitor for `https://your-domain.com/health?format=json`
  - [ ] Configure email alerts
  - [ ] Configure Slack alerts (optional)

- [ ] **Sentry Error Tracking** (optional)
  - [ ] Sentry project created
  - [ ] `VITE_SENTRY_DSN` added to Vercel
  - [ ] Test: Trigger an error and verify it appears in Sentry

---

### 5. Legal & Privacy ⚖️

- [x] **Privacy Policy** - Comprehensive Hebrew policy exists
  - [ ] Review and update contact email
  - [ ] Verify all data collection is documented
  - [ ] Test: Open `/privacy-policy` page

- [x] **Terms of Service** - Hebrew terms exist
  - [ ] Review and update as needed
  - [ ] Test: Open `/terms` page

- [x] **Cookie Consent** - GDPR-compliant cookie banner
  - [ ] Test: Clear cookies and revisit site
  - [ ] Verify consent banner appears
  - [ ] Test all consent options

- [x] **Accessibility** - WCAG-compliant features
  - [ ] Test accessibility widget
  - [ ] Test keyboard navigation
  - [ ] Test screen reader (optional)

---

### 6. Testing Before Launch 🧪

### Functional Testing

- [ ] **Authentication**
  - [ ] Sign up new user
  - [ ] Email verification works
  - [ ] Login with email/password
  - [ ] Login with Google OAuth
  - [ ] Password reset
  - [ ] Logout

- [ ] **Dashboard**
  - [ ] Student list loads
  - [ ] Student detail page works
  - [ ] Filters work correctly
  - [ ] Search works

- [ ] **Classroom Optimization**
  - [ ] Select students
  - [ ] Run optimization
  - [ ] View results

- [ ] **Roles & Permissions**
  - [ ] Teacher sees only assigned classes
  - [ ] Admin sees all classes
  - [ ] Admin panel accessible to admin only

### Performance Testing

- [ ] **Load Time**
  - [ ] Homepage loads in < 3 seconds
  - [ ] Dashboard loads in < 3 seconds
  - [ ] Student detail loads in < 2 seconds

- [ ] **Lighthouse Score**
  - [ ] Run Lighthouse audit
  - [ ] Performance score > 80
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90

### Security Testing

- [ ] **Security Headers**
  - [ ] Check: `curl -I https://your-domain.com`
  - [ ] Verify `Strict-Transport-Security` present
  - [ ] Verify `X-Frame-Options` present
  - [ ] Verify `X-Content-Type-Options` present
  - [ ] Verify `Content-Security-Policy` present

- [ ] **Cross-Origin**
  - [ ] Test API from different domain (should fail)
  - [ ] Test API from allowed domain (should succeed)

- [ ] **Rate Limiting**
  - [ ] Send 100 rapid requests to backend
  - [ ] Verify 429 response after limit
  - [ ] Verify rate limit headers present

---

### 7. Deployment Steps 🚀

#### Frontend (Vercel)

1. **Connect Repository**
   - [ ] Log in to Vercel
   - [ ] Click "Add New Project"
   - [ ] Import Git repository
   - [ ] Select project folder

2. **Configure Build**
   - [ ] Framework Preset: Vite
   - [ ] Build Command: `npm run build:prod`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

3. **Environment Variables**
   - [ ] Add all variables from section 3
   - [ ] Select "Production" environment

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Visit deployed URL

5. **Custom Domain** (optional)
   - [ ] Go to Settings → Domains
   - [ ] Add custom domain
   - [ ] Update DNS records
   - [ ] Wait for SSL certificate

#### Backend (Railway)

1. **Connect Repository**
   - [ ] Log in to Railway
   - [ ] Click "New Project"
   - [ ] Deploy from GitHub repo
   - [ ] Select `backend` folder

2. **Configure**
   - [ ] Root directory: `backend`
   - [ ] Build Command: (empty - auto-detected)
   - [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   - [ ] Add all variables from section 3

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment
   - [ ] Copy backend URL

5. **Update Frontend**
   - [ ] Add backend URL to `VITE_OPTIMIZATION_API_URL` in Vercel
   - [ ] Redeploy frontend

---

### 8. Post-Deployment Verification ✅

### Critical Checks

- [ ] **Site is accessible**
  - [ ] Homepage loads
  - [ ] SSL certificate valid (no browser warnings)
  - [ ] All pages load without errors

- [ ] **Authentication works**
  - [ ] Can log in
  - [ ] Can log out
  - [ ] Session persists

- [ ] **Data loads correctly**
  - [ ] Student list appears
  - [ ] No "API URL not configured" warnings
  - [ ] Real data (not mock data)

- [ ] **API works**
  - [ ] Backend health check responds
  - [ ] Optimization API works
  - [ ] Rate limiting active

### Smoke Tests

- [ ] **Teacher Workflow**
  1. Log in as teacher
  2. View dashboard
  3. Click student
  4. View details
  5. Run optimization
  6. Logout

- [ ] **Admin Workflow**
  1. Log in as admin
  2. View all students
  3. Access admin panel
  4. Check security dashboard
  5. Logout

---

### 9. Launch Day 🎯

### Go-Live Checklist

- [ ] **Final Backup**
  - [ ] Export current database
  - [ ] Save backup locally

- [ ] **DNS Switch** (if using custom domain)
  - [ ] Update DNS to point to Vercel
  - [ ] Wait for propagation (5-60 minutes)
  - [ ] Verify site accessible via custom domain

- [ ] **Announcement**
  - [ ] Prepare user announcement
  - [ ] Send notification to users
  - [ ] Provide login instructions

- [ ] **Monitoring**
  - [ ] Open uptime monitoring dashboard
  - [ ] Open Sentry error dashboard
  - [ ] Watch for first 30 minutes

---

### 10. Rollback Plan 🔄

If something goes wrong:

1. **Frontend Issues**
   ```bash
   # Rollback to previous deployment
   # Vercel: Deployments → Click previous → Redeploy
   ```

2. **Backend Issues**
   ```bash
   # Railway: Deployments → Click previous → Redeploy
   ```

3. **Database Issues**
   - Restore from most recent backup
   - Firebase Console → Firestore → Import/Export

4. **Emergency Disable**
   - Vercel: Pause deployment
   - Return "maintenance mode" page

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Developer | Your Name | your@email.com |
| Firebase Support | - | https://firebase.google.com/support |
| Vercel Support | - | https://vercel.com/support |
| Railway Support | - | https://railway.app/support |

---

## 📚 Documentation Links

| Document | Location |
|----------|----------|
| Firestore Indexes | `docs/FIRESTORE_INDEXES.md` |
| Uptime Monitoring | `docs/UPTIME_MONITORING.md` |
| Firebase Setup | `docs/FIREBASE_SETUP_GUIDE.md` |
| Security Rules | `firestore.rules` |
| Environment Variables | `.env.example` |

---

## ✅ Final Sign-Off

Before launching, verify:

- [ ] All items in this checklist are complete
- [ ] Team has tested the application
- [ ] Backup plan is documented
- [ ] Monitoring is active
- [ ] Legal pages are reviewed
- [ ] You have confidence in the deployment

**Launch Date:** _______________

**Launched By:** _______________

**Approved By:** _______________

---

🎉 **Congratulations on launching ISHEBOT!**

Remember to monitor the first 24-48 hours closely and address any issues promptly.
