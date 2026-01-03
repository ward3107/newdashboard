# ISHEBOT Final Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Configuration

#### Frontend (Vercel/Vite Environment Variables)
- [ ] `VITE_FIREBASE_API_KEY` - Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (e.g., `project.firebaseapp.com`)
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID
- [ ] `VITE_USE_FIRESTORE=true` - Enable Firestore mode
- [ ] `VITE_SCHOOL_ID=ishebott` - Your school identifier
- [ ] `VITE_SENTRY_DSN` (optional) - Sentry error tracking DSN
- [ ] `VITE_OPTIMIZATION_API_URL` (optional) - Backend API URL for genetic algorithm

#### Backend (Railway/Render Environment Variables)
- [ ] `SECRET_KEY` - **CRITICAL**: 43+ character random string
- [ ] `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs
- [ ] `DEBUG=false` - Set to false in production
- [ ] `LOG_LEVEL=INFO` - Logging level
- [ ] `RATE_LIMIT_REQUESTS_PER_MINUTE=60` - Rate limit settings
- [ ] `RATE_LIMIT_BURST=10` - Rate limit burst size

**Generate SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(43))"
```

---

### 2. Firebase Configuration

#### Firebase Project Setup
- [ ] Project created in Firebase Console
- [ ] Authentication enabled:
  - [ ] Email/Password provider enabled
  - [ ] Google OAuth enabled (optional)
- [ ] Firestore Database created
- [ ] Firestore security rules deployed (see `firestore.rules`)
- [ ] Storage configured (if using file storage)

#### Firestore Security Rules
- [ ] Rules deployed from `firestore.rules`
- [ ] Tested rules in Firebase Console → Firestore → Rules
- [ ] Verified tenant isolation (schools separated)
- [ ] Verified role-based access control
- [ ] Verified student access restrictions

**Deploy Firestore Rules**:
```bash
firebase projects:add ishebot-production --project=your-project-id
firebase deploy --only firestore:rules
```

#### Firestore Indexes
- [ ] Reviewed `docs/FIRESTORE_INDEXES.md`
- [ ] Confirmed no indexes needed for current queries
- [ ] Monitored query performance after deployment

---

### 3. Backend Deployment (FastAPI)

#### Railway Deployment
1. [ ] Create new Railway project
2. [ ] Connect GitHub repository
3. [ ] Select `backend/` as root directory
4. [ ] Set environment variables (see Backend section above)
5. [ ] Set build command: `pip install -r requirements.txt`
6. [ ] Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. [ ] Deploy and verify health endpoint

**Or Render Deployment**:
1. [ ] Create new Web Service on Render
2. [ ] Connect GitHub repository
3. [ ] Set environment variables
4. [ ] Set build command and start command
5. [ ] Deploy

#### Verify Backend
- [ ] Health check returns 200: `curl https://your-backend.railway.app/health`
- [ ] SECRET_KEY validation working (check logs on startup)
- [ ] CORS headers configured correctly
- [ ] Rate limiting active

---

### 4. Frontend Deployment (Vercel)

#### Vercel Setup
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel --prod`
4. [ ] Configure environment variables in Vercel Dashboard
5. [ ] Set custom domain (optional)

#### Environment Variables in Vercel
Go to: Project Settings → Environment Variables
- Add all Frontend variables from section 1
- **IMPORTANT**: All must start with `VITE_` prefix
- Select all environments (Production, Preview, Development)

#### Verify Frontend
- [ ] Build succeeds in Vercel
- [ ] Application loads at deployed URL
- [ ] Firebase auth working
- [ ] Firestore data loading
- [ ] No console errors
- [ ] Sentry initialized (check for "Sentry initialized" in network tab)

---

### 5. Security Verification

#### Frontend Security
- [ ] CSP headers active (check browser DevTools → Network → Response headers)
- [ ] No localStorage usage for sensitive data
- [ ] All API calls use HTTPS
- [ ] Mock auth disabled in production
- [ ] Error messages sanitized (no stack traces)
- [ ] XSS protection active (DOMPurify)

#### Backend Security
- [ ] SECRET_KEY validated on startup (check logs)
- [ ] CORS configured to your domain only
- [ ] Rate limiting active
- [ ] No stack traces in error responses
- [ ] Health check endpoint accessible

#### Firebase Security
- [ ] Firestore rules deployed
- [ ] Rules tested with Firebase Emulator
- [ ] Tenant isolation verified (schools can't access each other's data)
- [ ] Role-based access working
- [ ] Student data read-only for teachers

---

### 6. Testing & Quality Assurance

#### Smoke Tests
- [ ] Homepage loads
- [ ] Login works (test account)
- [ ] Dashboard loads with data
- [ ] Student detail page loads
- [ ] Classroom optimization works
- [ ] Admin panel accessible (for admins)

#### Functional Tests
- [ ] Student list loads
- [ ] Search/filter works
- [ ] Export to Excel works
- [ ] Export to PDF works
- [ ] Optimization API connected (if using)
- [ ] Multi-language switching works

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Android Chrome)

#### Performance Tests
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] No memory leaks (check DevTools → Memory)
- [ ] Bundle size acceptable (< 3MB total)

---

### 7. Monitoring & Logging

#### Sentry Setup (Optional but Recommended)
- [ ] Sentry project created
- [ ] `VITE_SENTRY_DSN` configured
- [ ] Test error appears in Sentry dashboard
- [ ] Performance monitoring enabled
- [ ] Release version tracking enabled

#### Firebase Monitoring
- [ ] Firebase Crashlytics enabled (for mobile app)
- [ ] Analytics enabled
- [ ] Performance monitoring enabled
- [ ] Crash reports configured

#### Backend Monitoring
- [ ] Railway logs monitored
- [ ] Error tracking active
- [ ] Response time monitored
- [ ] Uptime monitoring configured (e.g., Pingdom, UptimeRobot)

---

### 8. Documentation & Handoff

#### Documentation Updated
- [ ] README.md updated with production URLs
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Troubleshooting guide created
- [ ] API documentation available (Swagger UI at `/docs`)

#### Access Credentials
- [ ] Firebase project credentials saved securely
- [ ] Vercel team access configured
- [ ] Railway/Render team access configured
- [ ] Sentry access shared with team
- [ ] Domain DNS configured (if using custom domain)

---

### 9. Post-Deployment Steps

#### Immediate Checks (After Deployment)
1. [ ] Test login with real user account
2. [ ] Create test data in production Firestore
3. [ ] Verify all CRUD operations work
4. [ ] Check Sentry for any errors
5. [ ] Monitor backend logs for issues
6. [ ] Test rate limiting (try rapid requests)
7. [ ] Verify CORS with cross-origin requests

#### Day 1 Monitoring
- [ ] Check Sentry for errors every 2 hours
- [ ] Monitor Railway CPU/memory usage
- [ ] Monitor Firestore read/write counts
- [ ] Check for unusual traffic patterns
- [ ] Verify user authentication working
- [ ] Test data export features

#### Week 1 Monitoring
- [ ] Daily error review
- [ ] Performance metrics check
- [ ] User feedback collection
- [ ] Cost monitoring (Firebase billing)
- [ ] Uptime verification

---

### 10. Rollback Plan

#### If Something Goes Wrong

**Frontend Issues**:
```bash
# Rollback to previous deployment
vercel rollback
```

**Backend Issues**:
```bash
# Redeploy previous commit via Railway/Render
# Or use git revert + push
```

**Firestore Rules Issues**:
```bash
# Deploy previous rules version
firebase deploy --only firestore:rules --rules firestore.rules.old
```

**Database Issues**:
- [ ] Have recent backup ready
- [ ] Know how to restore from backup
- [ ] Document recovery process

---

### 11. Cost Monitoring

#### Firebase Pricing
- [ ] Monitor daily read operations
- [ ] Monitor daily write operations
- [ ] Monitor storage usage
- [ ] Check download bandwidth
- [ ] Set up billing alerts

**Estimated Costs** (for reference):
- Firestore: ~$0.18/GB stored + $0.06/100K reads + $0.18/100K writes
- Hosting: Included in Spark plan (up to limits)
- Authentication: Free tier covers most use cases

#### Vercel Pricing
- [ ] Monitor build minutes
- [ ] Monitor bandwidth usage
- [ ] Check serverless function execution time
- [ ] Set up billing alerts

**Estimated Costs**:
- Hobby plan: FREE (good for testing)
- Pro plan: $20/month (recommended for production)

#### Railway/Render Pricing
- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Check monthly active hours
- [ ] Set up spending limits

**Estimated Costs**:
- Railway: ~$5-10/month (depending on usage)
- Render: FREE tier available, $7/month starting

---

### 12. Final Sign-Off

#### Before Going Live
- [ ] All tests passing
- [ ] Security review complete
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Rollback plan ready

#### Go-Live Checklist
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificates active
- [ ] Database seeded with initial data
- [ ] Test accounts created
- [ ] Support contact configured
- [ ] User notification sent (if applicable)

---

## 🔗 Quick Links

- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Sentry Dashboard**: https://sentry.io
- **Firestore Rules**: `firestore.rules` (in project root)
- **Backend Health**: https://your-backend.railway.app/health
- **API Docs**: https://your-backend.railway.app/docs

---

## 📞 Support Contacts

- **Technical Lead**: [Name] - [Email] - [Phone]
- **DevOps**: [Name] - [Email]
- **Firebase Support**: https://firebase.google.com/support/
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/support

---

## 📝 Notes

### Deployment History
| Date | Version | Deployer | Notes |
|------|---------|----------|-------|
| [Fill in] | 1.0.0 | [Name] | Initial production deployment |

### Known Issues
- [List any known issues or limitations]

### Future Improvements
- [List planned features or improvements]

---

**Last Updated**: 2025-01-02
**Version**: 1.0.0
**Status**: ✅ Ready for Production
