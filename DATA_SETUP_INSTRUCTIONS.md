# Data Setup Instructions for ISHEBOT Dashboard

## Current Issue: No Data Showing

The dashboard is currently showing no data because no data source is configured. You have three options:

---

## Option 1: Use Mock Data (Demo/Development) ✅ ENABLED

**Status:** Currently enabled in `.env` file

Mock data shows sample students and statistics to demonstrate the platform's features.

**To enable:**
```bash
# In .env file
VITE_USE_MOCK_DATA=true
```

**To disable:**
```bash
VITE_USE_MOCK_DATA=false
```

After changing, rebuild the app:
```bash
npm run build
```

---

## Option 2: Use Firebase Firestore (RECOMMENDED for Production) 🔥

Firebase provides a scalable, real-time database perfect for production use.

### Setup Steps:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Get Firebase Configuration**
   - In Firebase Console, go to Project Settings
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the configuration values

3. **Update `.env` file**
   ```bash
   VITE_USE_FIRESTORE=true
   VITE_USE_MOCK_DATA=false

   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firestore Database**
   - In Firebase Console, go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode" or "Test mode"
   - Select your region

5. **Deploy Cloud Functions** (for student assessment processing)
   - See `docs/FIREBASE_SETUP_GUIDE.md` for detailed instructions

6. **Update Vercel Environment Variables**
   - Go to your Vercel project settings
   - Add the same environment variables from `.env`

---

## Option 3: Use Google Sheets with Apps Script 📊

Use Google Sheets as your database with Google Apps Script as the backend API.

### Setup Steps:

1. **Create Google Sheet**
   - Create a new Google Sheet
   - Set up columns: studentCode, quarter, classId, date, name, learningStyle, keyNotes, etc.

2. **Deploy Apps Script**
   - In your Google Sheet, go to Extensions → Apps Script
   - Copy the script from `backend/google-apps-script/` folder
   - Deploy as Web App
   - Copy the deployment URL

3. **Update `.env` file**
   ```bash
   VITE_USE_MOCK_DATA=false
   VITE_USE_FIRESTORE=false

   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
   VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

4. **Update Vercel Environment Variables**
   - Add the same variables to Vercel project settings

---

## After Configuration

### For Local Development:
```bash
# Restart your dev server
npm run dev
```

### For Production (Vercel):
```bash
# Rebuild and push
git add .
git commit -m "Configure data source"
git push

# Or trigger a redeploy in Vercel dashboard
```

---

## Troubleshooting

### Still seeing no data?

1. **Check browser console** for error messages
2. **Verify environment variables** are loaded:
   ```javascript
   console.log(import.meta.env.VITE_USE_MOCK_DATA)
   console.log(import.meta.env.VITE_USE_FIRESTORE)
   ```
3. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
4. **Check Vercel logs** for build/runtime errors

### Mock data not showing?

- Make sure you rebuilt the app after changing `.env`
- Check that `VITE_USE_MOCK_DATA=true` (no quotes, lowercase true)
- Verify no other data source is enabled

### Firebase not working?

- Verify all Firebase credentials are correct
- Check Firebase Console for security rules
- Ensure Firestore database is created
- Check Cloud Functions are deployed

### Google Sheets not working?

- Verify Apps Script is deployed as Web App
- Check script has proper permissions
- Ensure sheet sharing settings allow access
- Test the API URL directly in browser

---

## Need Help?

- See `/docs/FIREBASE_SETUP_GUIDE.md` for Firebase setup
- See `/docs/GOOGLE_SHEETS_SETUP.md` for Google Sheets setup
- Check the project README.md for more information
