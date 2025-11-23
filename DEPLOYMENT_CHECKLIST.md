# 🚀 Pre-Delivery Deployment Checklist

## ✅ CRITICAL (Must be done before client handover)

### Security

- [ ] **Enable Authentication** - Wrap all protected routes with `<ProtectedRoute>`
  - File: `src/App.tsx:165-174`
  - See: `SECURITY_FIXES.md` for exact code

- [ ] **Update Backend Secret Key**
  - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
  - Add to Railway/Render environment variables
  - File: `backend/app/core/config.py:77`

- [ ] **Fix npm Vulnerability**
  ```bash
  npm audit fix
  ```

- [ ] **Update Backend CORS**
  - Replace `allow_methods=["*"]` with specific methods
  - Add production frontend URL to ALLOWED_ORIGINS
  - File: `backend/app/main.py:63-70`

### Firebase Configuration

- [ ] **Set All Firebase Environment Variables in Vercel**
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Add all `VITE_FIREBASE_*` variables from `.env.example`
  - Get values from Firebase Console → Project Settings → Your apps

- [ ] **Deploy Firestore Rules**
  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] **Verify Authentication Works**
  - Test login flow end-to-end
  - Ensure Firestore queries succeed

### Backend Deployment

- [ ] **Deploy Python Backend to Railway/Render**
  - Set `SECRET_KEY` environment variable
  - Set `ALLOWED_ORIGINS` with production frontend URL
  - Update `VITE_OPTIMIZATION_API_URL` in frontend .env

- [ ] **Test Backend Endpoints**
  - Health check: `https://your-backend.railway.app/health`
  - Optimization: Test classroom seating API

## ✅ IMPORTANT (Should be done)

### Testing

- [ ] **Test in Production Mode Locally**
  ```bash
  npm run build
  npm run preview
  ```

- [ ] **Test All User Flows**
  - [ ] Teacher login
  - [ ] View dashboard
  - [ ] Student assessment submission
  - [ ] Classroom optimization
  - [ ] Data export

- [ ] **Cross-Browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (if Mac available)
  - [ ] Mobile Chrome/Safari

- [ ] **Mobile Responsiveness**
  - [ ] Assessment form on mobile
  - [ ] Dashboard on tablet
  - [ ] RTL layout on mobile

### Performance

- [ ] **Run Lighthouse Audit**
  - Target: >90 Performance, >90 Accessibility, >90 Best Practices

- [ ] **Check Bundle Size**
  ```bash
  npm run build:analyze
  ```
  - Target: Main bundle <500KB gzipped

- [ ] **Remove Console Logs**
  - Search project for `console.log` and replace with conditional logger

### Content

- [ ] **Remove Test Data**
  - Clear mock student data from production database
  - Verify no test/dummy data visible

- [ ] **Update Legal Pages**
  - Privacy policy with correct company/school name
  - Terms of service with contact information

## ✅ NICE TO HAVE

- [ ] **Set up Error Tracking** (Sentry, LogRocket, etc.)
- [ ] **Configure Analytics** (Google Analytics, Plausible)
- [ ] **Set up Automated Backups** (Firestore exports)
- [ ] **Create User Documentation** (How to use the dashboard)
- [ ] **Set up CI/CD** (Automated testing on PR)

## 📋 Environment Variables Checklist

### Frontend (Vercel)

```env
# Required
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Required if using optimization
VITE_OPTIMIZATION_API_URL=https://your-backend.railway.app

# Optional
VITE_USE_MOCK_DATA=false
VITE_ENABLE_AI_ANALYSIS=true
```

### Backend (Railway/Render)

```env
# Required
SECRET_KEY=<generated-secret-key>
ALLOWED_ORIGINS=https://yourdomain.vercel.app

# Optional
DEBUG=false
LOG_LEVEL=INFO
```

## 🎯 Final Verification

Before handover, verify:

1. [ ] You can log in as a teacher
2. [ ] Dashboard loads student data
3. [ ] Students can submit assessments
4. [ ] No console errors in browser
5. [ ] Firebase costs are within budget limits
6. [ ] All environment variables are documented

## 🆘 Rollback Plan

If something breaks after deployment:

1. **Vercel**: Go to Deployments → Click previous deployment → "Promote to Production"
2. **Railway/Render**: Go to Deployments → Redeploy previous version
3. **Firestore Rules**: Revert via Firebase Console → Firestore → Rules → Previous version

## 📞 Support Contacts

- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/help
- Railway Support: https://railway.app/help
