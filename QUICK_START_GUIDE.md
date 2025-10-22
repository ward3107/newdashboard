# ⚡ QUICK START GUIDE - ISHEBOT Admin Control

## 🎯 3-STEP SETUP

### 1️⃣ Google Apps Script (5 minutes)

```
1. Open Google Sheet → Extensions → Apps Script
2. Replace ALL code with: google-apps-scripts/ULTIMATE_COMPLETE_SCRIPT.js
3. Project Settings → Script Properties → Add:
   - OPENAI_API_KEY: sk-your-key
   - ADMIN_TOKEN: your-secure-token
4. Deploy → New deployment → Web app → Deploy
5. COPY THE WEB APP URL
```

### 2️⃣ React App (.env.local)

```env
VITE_GOOGLE_SCRIPT_URL=YOUR_WEB_APP_URL_FROM_STEP_1
VITE_ADMIN_TOKEN=your-secure-token
VITE_USE_MOCK_DATA=false
```

### 3️⃣ Add to Dashboard

```javascript
// In your App.tsx or routes file
import AdminControlPanel from './components/AdminControlPanel';

// Add route:
<Route path="/admin" element={<AdminControlPanel />} />
```

✅ **DONE!** Access at `/admin`

---

## 🎮 DASHBOARD FEATURES AT A GLANCE

### סקירה (Overview)
- 📊 Real-time stats
- ✅ System health check
- ⚡ Quick actions

### ניתוח (Analysis)
- 🚀 Analyze all unanalyzed students
- 📦 Batch processing
- 🔄 Re-analyze existing

### מחיקה (Delete)
- 🗑️ Delete old analyses (>X days)
- 📚 Delete by class
- ⚠️ Delete all (with backup)

### גיבוי (Backup)
- 💾 Create backups
- 📋 List all backups
- ↩️ Restore from backup

### יצוא (Export)
- 📄 Export JSON
- 📊 Export CSV
- 🔍 Search analyses

### יומנים (Logs)
- 📜 Audit log
- 👁️ Activity monitoring

---

## 🔥 MOST USED FUNCTIONS

### Analyze All Unanalyzed Students
```
Dashboard → ניתוח → נתח אוטומטי → התחל ניתוח כולל
```

### Create Backup Before Major Operation
```
Dashboard → גיבוי → צור גיבוי חדש
```

### Delete Old Analyses (Cleanup)
```
Dashboard → מחיקה → מחק ניתוחים ישנים → [set days] → מחק ישנים
```

### Export All Data
```
Dashboard → יצוא → יצא JSON (or CSV)
```

### Sync New Students
```
Dashboard → סקירה → סנכרן תלמידים
```

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Missing studentId" | Redeploy Google Apps Script with NEW VERSION |
| Empty insights | Click "נתח הכל" to analyze students |
| "Unauthorized" | Check admin token in .env.local |
| Rate limit error | Wait 1 hour, or increase CONFIG limits |
| No students showing | Run "סנכרן תלמידים" |

---

## 📞 NEED HELP?

1. Check console (F12) for errors
2. Check Google Apps Script → View → Execution log
3. Read COMPLETE_ADMIN_SETUP_GUIDE.md for details

---

## 🎉 YOU'RE READY!

Your ISHEBOT system now has:
- ✅ 30+ API functions
- ✅ Beautiful admin dashboard
- ✅ Complete automation
- ✅ Full control from UI

**Go to `/admin` and start exploring!** 🚀
