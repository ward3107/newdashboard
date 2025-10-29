# Vercel Deployment Setup Guide - Real Data

## Step-by-Step Setup Process

### Phase 1: Deploy Google Apps Script (Do This First!)

#### 1. Open Your Google Spreadsheet
- Go to your Google Sheets with student data
- Note your **Spreadsheet ID** from the URL:
  ```
  https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
  ```

#### 2. Deploy the Google Apps Script

**Option A: Use the Complete Script (Recommended)**
1. Open your Google Spreadsheet
2. Click **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy the entire contents of: `google-apps-scripts/COMPLETE_INTEGRATED_SCRIPT_OPENAI.js`
5. Paste it into the Apps Script editor

**Configure Script Properties:**
1. In Apps Script editor, click **Project Settings** ⚙️
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add these properties:

   | Property Name | Value | Description |
   |--------------|-------|-------------|
   | `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
   | `ADMIN_TOKEN` | `your-secure-token-123` | Any secure random string |

**Deploy as Web App:**
1. Click **Deploy** → **New deployment**
2. Click **⚙️ Select type** → **Web app**
3. Settings:
   - Description: "ISHEBOT Student Dashboard API"
   - Execute as: **Me** (your email)
   - Who has access: **Anyone** (required for CORS)
4. Click **Deploy**
5. **COPY THE WEB APP URL** - You'll need this!
   - Format: `https://script.google.com/macros/s/XXXXX/exec`
   - Save it somewhere safe!

---

### Phase 2: Configure Vercel Environment Variables

Once you have your Google Apps Script deployed, add these to Vercel:

#### Required Environment Variables:

```bash
# Google Apps Script Configuration
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_USE_MOCK_DATA=false

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_EXPORT=true

# i18n Configuration
VITE_DEFAULT_LOCALE=he
VITE_SUPPORTED_LOCALES=he,en,ar,ru
```

#### Optional (for Admin Panel):

```bash
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

#### Optional (for Advanced Features):

```bash
# OpenAI Configuration (if using client-side AI features)
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# ISHEBOT Backend (if using separate backend)
VITE_ISHEBOT_BACKEND_URL=http://localhost:3000
VITE_ISHEBOT_API_KEY=your_ishebot_api_key
```

---

### Phase 3: Deploy to Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Repository:**
   - Click **"Add New Project"**
   - Click **"Import Git Repository"**
   - Select: `ward3107/newdashboard`
   - Choose branch: `claude/save-the-n-011CUbrAzkSYRew8GDMGcMAW` (or `main`)

3. **Configure Project:**
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables:**
   - Click **Environment Variables**
   - Add all the variables from Phase 2 above
   - Make sure to replace:
     - `YOUR_SCRIPT_ID` with your actual Google Apps Script ID
     - `YOUR_SPREADSHEET_ID` with your actual Spreadsheet ID

5. **Deploy:**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Get your live URL! 🎉

#### Method 2: Vercel CLI (Alternative)

If you prefer command line:
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts and set environment variables when asked
```

---

## Important Sheet Structure Requirements

Your Google Spreadsheet must have these sheets:

1. **StudentResponses** - Form responses from students
2. **AI_Insights** - Where analyzed data is stored
3. **students** - Student master data (optional)

The script expects these columns in StudentResponses:
- Column A: Timestamp (חותמת זמן)
- Column B: School Code (קוד בית הספר)
- Column C: Student Code (סיסמת תלמיד) - **This is the student ID!**
- Column D: Class ID (כיתה)
- Column E: Gender (מין)
- Columns F-AG: Student questionnaire responses

---

## Testing Your Deployment

### 1. Test Google Apps Script First
Before deploying to Vercel, test your script:

```bash
# Test in browser (replace with your Web App URL):
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getStats
```

You should see JSON data returned.

### 2. Test Vercel Deployment
Once deployed:
1. Visit your Vercel URL
2. The dashboard should load
3. Check browser console for any errors
4. Try loading student data

---

## Troubleshooting

### Issue: "CORS Error" or "No data loading"
**Solution:**
- Make sure Google Apps Script is deployed with "Who has access: Anyone"
- Redeploy the script if you changed this setting

### Issue: "API key not configured"
**Solution:**
- Check Script Properties in Google Apps Script
- Make sure `OPENAI_API_KEY` is set correctly

### Issue: "No students found"
**Solution:**
- Check your sheet names match CONFIG in the script
- Verify StudentResponses sheet has data
- Check column indexes match your form structure

### Issue: Build fails in Vercel
**Solution:**
- Check all environment variables are set
- Make sure no syntax errors in .env variables
- Check build logs in Vercel dashboard

---

## Quick Checklist ✅

Before deploying to Vercel, make sure you have:

- [ ] Google Spreadsheet ID
- [ ] Google Apps Script deployed as Web App
- [ ] Web App URL (the long script.google.com URL)
- [ ] OpenAI API key (in Script Properties)
- [ ] ADMIN_TOKEN set (in Script Properties)
- [ ] Tested the Web App URL in browser
- [ ] All environment variables ready for Vercel

---

## Next Steps After Deployment

1. **Test thoroughly** - Try all features
2. **Set up custom domain** (optional) - In Vercel dashboard
3. **Enable automatic deployments** - Vercel auto-deploys on git push
4. **Monitor usage** - Check Vercel analytics
5. **Set up monitoring** - Add error tracking if needed

---

## Cost Estimate

- **Vercel:** Free tier (perfect for pilot)
- **Google Apps Script:** Free (with quota limits)
- **OpenAI API:** ~$0.0015 per student analysis (gpt-4o-mini)
  - 100 students ≈ $0.15
  - 1000 students ≈ $1.50

---

## Need Help?

If you get stuck:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Test Google Apps Script URL directly
4. Verify all environment variables are correct

Good luck with your deployment! 🚀
