# 🚀 Deploy Google Apps Script - Step by Step

## ⏱️ Time Required: 10 minutes

---

## 📝 Prerequisites

- [x] Google Sheets with student data
- [x] Claude/OpenAI API key
- [x] Google Apps Script file ready (`COMPLETE_GOOGLE_APPS_SCRIPT_DOGET.js`)

---

## 🎯 Step 1: Open Google Apps Script Editor

1. Open your Google Sheet with student data
2. Click **Extensions** → **Apps Script**
3. Delete any existing code in the editor
4. You should see an empty `Code.gs` file

---

## 🎯 Step 2: Copy the Script

1. Open `google-apps-scripts/COMPLETE_GOOGLE_APPS_SCRIPT_DOGET.js` from your project
2. **Copy the ENTIRE file** (Ctrl+A, Ctrl+C)
3. **Paste** into the Google Apps Script editor (Ctrl+V)
4. **Save** the script (Ctrl+S or File → Save)
5. Name your project: "ISHEBOT Student Dashboard API"

---

## 🎯 Step 3: Add Your API Key

**IMPORTANT:** Add your Claude or OpenAI API key

Find this line in the script (around line 27):
```javascript
const CONFIG = {
  CLAUDE_API_KEY: 'YOUR_API_KEY_HERE',  // ← ADD YOUR KEY HERE
  // ...
}
```

Replace `'YOUR_API_KEY_HERE'` with your actual API key:
```javascript
const CONFIG = {
  CLAUDE_API_KEY: 'sk-ant-api03-xxxxxxxxxxxxx',  // ← Your Claude key
  // OR
  OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxxx',  // ← Your OpenAI key
  // ...
}
```

**Save again!** (Ctrl+S)

---

## 🎯 Step 4: Test the Connection (IMPORTANT!)

Before deploying, test that everything works:

1. In the Apps Script editor, find the function dropdown (top toolbar)
2. Select `debugResponsesStructure` from the dropdown
3. Click **Run** (▶️ button)
4. **First time only:** You'll see a permission dialog:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**

5. Check the **Execution log** (View → Logs or Ctrl+Enter)
   - You should see your column structure
   - Verify student data is being read correctly

6. Test another function:
   - Select `getStatsAPI` from dropdown
   - Click **Run**
   - Check logs - should show student statistics

**If you see errors, STOP HERE and fix them first!**

---

## 🎯 Step 5: Deploy as Web App

Now deploy your script to make it accessible from React:

1. Click **Deploy** → **New deployment** (top right)

2. Click the **gear icon** ⚙️ next to "Select type"

3. Select **Web app**

4. Configure deployment settings:
   ```
   Description: ISHEBOT Student Dashboard API v1
   Execute as: Me (your email)
   Who has access: Anyone
   ```

5. Click **Deploy**

6. **IMPORTANT:** Copy the **Web App URL** that appears
   - It will look like: `https://script.google.com/macros/s/AKfycbxxxxxxxxxxx/exec`
   - **Save this URL** - you'll need it for React!

7. Click **Done**

---

## 🎯 Step 6: Test the Web App

Open a new browser tab and test your API:

### Test 1: Basic Connection
```
https://script.google.com/macros/s/YOUR_ID_HERE/exec?action=getStats
```

**Expected Response:**
```json
{
  "totalStudents": 30,
  "byClass": {"ז1": 10, "ז2": 20},
  "byLearningStyle": {"חזותי": 15, "שמיעתי": 10},
  "averageStrengths": "5.2",
  "lastUpdated": "18/10/2025"
}
```

### Test 2: Get All Students
```
https://script.google.com/macros/s/YOUR_ID_HERE/exec?action=getAllStudents
```

**Expected Response:**
```json
{
  "students": [
    {
      "studentCode": "70101",
      "classId": "ז1",
      "name": "תלמיד 70101",
      "learningStyle": "חזותי",
      "strengthsCount": 5,
      "challengesCount": 3
    }
  ]
}
```

### Test 3: Get Specific Student
```
https://script.google.com/macros/s/YOUR_ID_HERE/exec?action=getStudent&studentId=70101
```

**If ALL tests work - YOU'RE READY FOR REACT! ✅**

---

## 🎯 Step 7: Save Your Deployment URL

**Create a file:** `.env.local` in your React project root:

```bash
# Google Apps Script Web App URL
VITE_API_URL=https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec
```

**IMPORTANT:** Replace `YOUR_ACTUAL_ID` with the real ID from Step 5!

---

## 🔧 Troubleshooting

### Problem: "Script function not found"
**Solution:** Make sure you pasted the ENTIRE script and saved it.

### Problem: "Permission denied"
**Solution:** In deployment settings, set "Who has access" to **Anyone**.

### Problem: "Sheet not found"
**Solution:** Run `debugResponsesStructure()` to check sheet names match your script.

### Problem: "No students found"
**Solution:**
1. Check that `AI_Insights` sheet exists
2. Run `initialSync` to import students first
3. Check that `responsesLong` has data

### Problem: "API key error"
**Solution:**
- Verify API key is correct (no extra spaces)
- Check you have API credits
- Make sure key has proper permissions

---

## ✅ Success Checklist

- [ ] Script pasted into Google Apps Script
- [ ] API key added
- [ ] Project saved
- [ ] `debugResponsesStructure()` runs without errors
- [ ] `getStatsAPI()` returns data
- [ ] Deployed as Web App
- [ ] Web App URL copied
- [ ] Test URL in browser shows JSON response
- [ ] `.env.local` file created with URL
- [ ] Ready to connect React! 🎉

---

## 📊 Available API Endpoints

Once deployed, your Web App supports these actions:

| Action | URL | Description |
|--------|-----|-------------|
| **getStats** | `?action=getStats` | Dashboard statistics |
| **getAllStudents** | `?action=getAllStudents` | List all students |
| **getStudent** | `?action=getStudent&studentId=70101` | Get one student's details |
| **syncStudents** | `?action=syncStudents` | Import new students from forms |
| **initialSync** | `?action=initialSync` | Import ALL students (first time) |
| **analyzeOneStudent** | `?action=analyzeOneStudent&studentId=70101` | Run AI analysis on one student |

---

## 🎉 Next Step

Once you have the Web App URL working, tell me and I'll integrate it into your React dashboard!

**Your URL is:** `https://script.google.com/macros/s/__________________/exec`

Fill in the blank and let's connect it to React!
