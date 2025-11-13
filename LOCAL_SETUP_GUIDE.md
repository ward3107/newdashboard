# 🚀 Local Development Setup Guide

## Quick Start - 3 Steps to Test Locally

### ✅ Step 1: Get Your Firebase Credentials from Vercel

You already have these secrets in Vercel. Let's copy them to your local environment:

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/ward3107/newdashboard/settings/environment-variables
   ```

2. **Find these 6 Firebase variables**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Copy each value** (click the eye icon to reveal)

---

### ✅ Step 2: Fill in `.env.local`

Open the file `.env.local` (I just created it) and paste your Firebase values:

```bash
# Replace these empty values with your actual Firebase credentials from Vercel:
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: All other settings are already configured! You only need to fill in these 6 Firebase values.

---

### ✅ Step 3: Test Locally

Run the development server:

```bash
npm run dev
```

Expected output:
```
VITE v7.1.10  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Open `http://localhost:3000/` in your browser and verify:

- ✅ Dashboard loads without errors
- ✅ No "Firebase not configured" warnings in console
- ✅ Can navigate to different pages
- ✅ Data loads from Firestore (if you have data)

---

## 🔧 Troubleshooting

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Double-check your `VITE_FIREBASE_API_KEY` value in `.env.local`

### Issue: "Firebase: Error (auth/project-not-found)"
**Solution**: Verify `VITE_FIREBASE_PROJECT_ID` matches your Firebase project

### Issue: Page shows "No data available"
**Solution**: This is normal if your Firestore database is empty. You can:
1. Import sample data, or
2. Use the admin panel to add data, or
3. Temporarily set `VITE_USE_MOCK_DATA=true` to see mock data

### Issue: Console shows CORS errors
**Solution**: Make sure you're accessing via `http://localhost:3000` (not `127.0.0.1`)

---

## 📝 What's Already Configured

These settings are already in your `.env.local` and match production:

✅ **Data Source**: Using Firestore (same as production)
✅ **Feature Flags**: AI Analysis, Analytics, PWA, Export all enabled
✅ **Localization**: Hebrew default, supports EN/AR/RU
✅ **API Settings**: 30s timeout, 3 retry attempts
✅ **Development Mode**: Enabled with info-level logging

---

## 🎯 Next Steps After Local Testing

Once you verify everything works locally:

1. **Test the full flow**:
   - Navigate through all pages
   - Test student assessment form
   - Verify dashboard displays correctly
   - Check RTL support (Hebrew/Arabic)

2. **Optional AI Features** (Task #4):
   - Add `VITE_CLAUDE_API_KEY` to `.env.local`
   - Get from: https://console.anthropic.com/settings/keys
   - Test AI analysis features

3. **Deploy to Production** (if needed):
   - Your production environment is already configured in Vercel ✅
   - Any changes you make will auto-deploy when you push to main branch

---

## 🔒 Security Note

`.env.local` is already in `.gitignore` - your secrets are safe and won't be committed to git.

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for specific error messages
2. Verify all 6 Firebase variables are filled in `.env.local`
3. Make sure you copied the full values without extra spaces
4. Restart the dev server after changing `.env.local`

---

**Ready to start?** → Go to Step 1 and grab your Firebase credentials from Vercel! 🚀
