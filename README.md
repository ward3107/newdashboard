# 📚 AI Student Analysis Dashboard

A modern React-based dashboard for analyzing and tracking student performance using AI-powered insights, integrated with Google Sheets backend.

## ✨ תכונות עיקריות

### 🏠 דשבורד ראשי
- **כרטיסי סטטיסטיקות דינמיים** עם אנימציות מתקדמות
- **גרפים ויזואליים** (עוגה, עמודות, קווים) באמצעות Recharts
- **חיפוש וסינון מתקדם** בזמן אמת
- **מיון גמיש** לפי קריטריונים שונים
- **ייצוא דוחות** ל-PDF ו-Excel

### 👤 עמוד תלמיד מפורט
- **ניתוח AI מלא** עם תובנות פדגוגיות
- **פעולות מיידיות** עם מעקב התקדמות
- **סידור ישיבה** והמלצות כיתתיות
- **ייצוא דוח אישי** ל-PDF
- **הדפסה** עם עיצוב מותאם

### 🎨 עיצוב ו-UX
- **RTL מלא** לעברית
- **Responsive Design** לכל הגדלי מסך
- **אנימציות חלקות** עם Framer Motion
- **עיצוב מודרני** בהשראת Google Material Design
- **נגישות מלאה** (ARIA, keyboard navigation)

## 🛠️ טכנולוגיות

### Frontend
- **React 18** - ספריית UI מתקדמת
- **Vite** - כלי פיתוח מהיר
- **Framer Motion** - אנימציות ומעברים
- **React Router 6** - ניתוב
- **Recharts** - גרפים ויזואליזציות
- **React Query** - ניהול state ו-cache
- **Lucide React** - אייקונים מודרניים
- **React Hot Toast** - התראות יפות

### ייצוא וחיצוניות
- **jsPDF** - יצירת קבצי PDF
- **xlsx** - ייצוא ל-Excel
- **Axios** - קריאות API

### Backend Integration
- **Google Apps Script** - חיבור ל-Google Sheets
- **Claude API** - ניתוח AI באמצעות Anthropic
- **Google Forms** - איסוף תשובות תלמידים

## 📋 דרישות מערכת

### Node.js & npm
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### דפדפנים נתמכים
- Chrome/Edge >= 88
- Firefox >= 85
- Safari >= 14

## 🚀 התקנה והפעלה

### 1. הורדה והתקנה
```bash
# הורד את הפרויקט
git clone https://github.com/YOUR_USERNAME/student-dashboard-fixed.git
cd student-dashboard-fixed

# התקן תלויות
npm install
```

### 2. הגדרת משתני סביבה
```bash
# העתק את קובץ הדוגמה
cp .env.example .env

# ערוך את .env עם הערכים שלך:
# VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
# VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
# VITE_ENABLE_MOCK_DATA=true  # false בפרודקשן
```

**חשוב**: אל תעשה commit לקובץ `.env` - הוא כבר ב-`.gitignore`

### 3. הגדרת Google Apps Script (Backend)

#### 3.1 יצירת Google Apps Script
1. פתח [Google Apps Script](https://script.google.com/)
2. צור פרויקט חדש
3. העתק את התוכן מ-`COMPLETE_INTEGRATED_SCRIPT.js`
4. שמור והגדר כ-Web App

#### 3.2 הגדרת API Key של Claude
1. לך ל-Project Settings ⚙️ > Script Properties
2. הוסף Property חדש:
   - Name: `CLAUDE_API_KEY`
   - Value: המפתח שלך מ-[Anthropic Console](https://console.anthropic.com/)
3. **לעולם אל תשים את המפתח בקוד!**

#### 3.3 פרסום Web App
1. לחץ Deploy > New deployment
2. בחר סוג: Web app
3. הגדרות:
   - Execute as: Me
   - Who has access: Anyone
4. העתק את ה-URL שמתקבל ל-`.env`

### 4. הפעלת הפיתוח
```bash
npm run dev
```
הדשבורד יהיה זמין בכתובת: http://localhost:3000

### 5. הרצת טסטים
```bash
# הרץ טסטים במצב watch
npm test

# הרץ טסטים פעם אחת
npm test -- --run

# הרץ עם coverage
npm run test:coverage

# פתח UI של הטסטים
npm run test:ui
```

### 6. בנייה לפרודקשן
```bash
# בנה את האפליקציה עם PWA
npm run build

# תצוגה מקדימה של הבניה
npm run preview

# בדוק שה-service worker עובד
# פתח DevTools > Application > Service Workers
```

## 📦 Deployment

### Vercel
```bash
# התקן Vercel CLI
npm i -g vercel

# פרסם
vercel

# הוסף משתני סביבה ב-Vercel Dashboard:
# Settings > Environment Variables
```

### Netlify
```bash
# התקן Netlify CLI
npm i -g netlify-cli

# פרסם
netlify deploy --prod

# הוסף משתני סביבה ב-Netlify Dashboard:
# Site settings > Environment variables
```

### GitHub Pages
```bash
# הוסף ל-package.json:
# "homepage": "https://YOUR_USERNAME.github.io/student-dashboard-fixed"

# בנה ופרסם
npm run build
npx gh-pages -d dist
```

## 📊 מבנה הנתונים

### תלמיד בדשבורד
```json
{
  "studentCode": "70132",
  "quarter": "Q1",
  "classId": "10A",
  "date": "2025-01-15",
  "name": "משה כהן",
  "learningStyle": "• 👁️ ויזואלי\n• 📖 מילולי",
  "keyNotes": "תלמיד מוכשר עם יכולות גבוהות...",
  "strengthsCount": 5,
  "challengesCount": 3
}
```

### ניתוח מפורט של תלמיד
```json
{
  "studentCode": "70132",
  "name": "משה כהן",
  "student_summary": {
    "learning_style": "• 👁️ ויזואלי...",
    "strengths": ["💪 יכולת ריכוז גבוהה", ...],
    "challenges": ["⏰ קושי בניהול זמן", ...],
    "key_notes": "תלמיד מוכשר..."
  },
  "insights": [
    {
      "category": "🏫 ארגון מקום הלמידה",
      "finding": "התלמיד מגיב טוב לסביבה מסודרת...",
      "recommendations": [...]
    }
  ],
  "immediate_actions": [
    {
      "what": "💡 הושב ליד החלון עם תאורה טובה",
      "how": "בחר מקום בשורה הראשונה...",
      "when": "מיד בשיעור הבא",
      "time": "5 דקות"
    }
  ],
  "seating_arrangement": {
    "location": "🪑 שורה ראשונה, צד ימין...",
    "partner_type": "🤝 תלמיד שקט וממוקד...",
    "avoid": "🚫 הימנע מישיבה ליד מקורות רעש..."
  }
}
```

## 📚 Documentation

**All documentation has been organized in the `/docs` folder for easy navigation!**

### Quick Links:
- **[📖 Documentation Index](./docs/INDEX.md)** - Complete guide to all documentation
- **[📊 Analytics Dashboard Guide](./docs/analytics/ANALYTICS_DASHBOARD_HOW_IT_WORKS.md)** - How analytics serve teachers
- **[🚀 Setup Guide](./docs/setup/SETUP_SUMMARY.md)** - Initial setup instructions
- **[🔧 Troubleshooting](./docs/troubleshooting/TROUBLESHOOTING_CONNECTION.md)** - Common issues and solutions

### Documentation Categories:
- **`/docs/setup/`** - Setup and configuration guides
- **`/docs/guides/`** - User guides and how-to documents
- **`/docs/analytics/`** - Analytics dashboard documentation
- **`/docs/troubleshooting/`** - Debugging and problem-solving
- **`/docs/comparisons/`** - AI model comparisons
- **`/docs/archive/`** - Older documentation (for reference)

---

## 🎯 מדריך שימוש

### 1. דשבורד ראשי
- **סטטיסטיקות כלליות** בחלק העליון
- **גרפים** להתפלגות כיתות וסגנונות למידה
- **חיפוש** לפי שם, קוד תלמיד או מילות מפתח
- **מסננים** לפי כיתה, רבעון, סגנון למידה
- **מיון** לפי שם, תאריך, מספר חוזקות/אתגרים

### 2. כרטיס תלמיד
- **מידע בסיסי** - שם, קוד, כיתה
- **סגנונות למידה** עם תוויות צבעוניות
- **חוזקות ואתגרים** עם ספירה
- **כפתור צפייה** לניתוח מפורט

### 3. עמוד תלמיד מפורט
- **סיכום** עם סגנון למידה, חוזקות ואתגרים
- **תובנות פדגוגיות** מקובצות לקטגוריות
- **פעולות מיידיות** עם מעקב השלמה
- **סידור ישיבה** והמלצות

### 4. ייצוא דוחות
- **Excel** - רשימת כל התלמידים
- **PDF** - דוח מפורט לתלמיד או סיכום כללי
- **הדפסה** - עיצוב מותאם לדפי A4

## 🔧 התאמות ועיצוב

### צבעים ונושא
ערוך את `src/styles/variables.css`:
```css
:root {
  --primary: #4285f4;        /* כחול ראשי */
  --success: #34a853;        /* ירוק הצלחה */
  --warning: #fbbc04;        /* צהוב אזהרה */
  --danger: #ea4335;         /* אדום סכנה */
}
```

### אנימציות
התאם מהירות אנימציות ב-`src/styles/animations.css`:
```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

### גרידה וריצוף
שנה את מספר העמודות בדשבורד:
```jsx
// ב-Dashboard.jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

## 📱 נגישות ותמיכה

### נגישות
- **מקלדת** - ניתן לנווט בכל האתר עם מקלדת
- **קוראי מסך** - תמיכה ב-ARIA labels
- **ניגודיות** - תמיכה במצב ניגודיות גבוהה
- **תנועה מופחתת** - תמיכה ב-`prefers-reduced-motion`

### RTL וגלובליזציה
- **כיוון עברי** מלא
- **גופנים** מותאמים לעברית (Assistant, Inter)
- **תאריכים** בפורמט עברי
- **מספרים** בפורמט ישראלי

### ביצועים
- **Lazy Loading** של רכיבים גדולים
- **Caching** של נתוני API
- **Debounce** על חיפושים
- **Virtualization** לרשימות ארוכות (במידת הצורך)

## 🐛 פתרון בעיות

### שגיאות נפוצות

**1. שגיאת טעינת נתונים**
```javascript
// בדוק את הגדרת ה-API ב-config.js
export const API_CONFIG = {
  BASE_URL: 'YOUR_CORRECT_URL_HERE'
};
```

**2. אנימציות לא עובדות**
```css
/* וודא שה-CSS מועמס נכון */
@import './variables.css';
@import './animations.css';
```

**3. בעיות RTL**
```html
<!-- וודא ש-HTML כולל dir="rtl" -->
<html dir="rtl" lang="he">
```

### לוגים ודיבוג
```javascript
// הפעל מצב פיתוח לראות לוגים מפורטים
export const IS_DEVELOPMENT = true;
```

## 🔮 תכונות עתידיות

### תכונות מתוכננות
- [ ] **Dashboard למנהלים** - תצוגה ארגונית
- [ ] **דוחות השוואתיים** - השוואה בין תלמידים
- [ ] **התראות אוטומטיות** - עדכונים בזמן אמת
- [ ] **מצב כהה** - Dark mode
- [ ] **PWA** - אפליקציה מתקדמת
- [ ] **ייצוא מתקדם** - PowerPoint, Word
- [ ] **אינטגרציה** עם מערכות לימוד נוספות

### שיפורי ביצועים
- [ ] **Server-Side Rendering (SSR)**
- [ ] **קומפרסיה מתקדמת** של נתונים
- [ ] **CDN** להגשת תוכן
- [ ] **Service Workers** לעבודה אופליין

## 🤝 תרומה לפרויקט

### הנחיות פיתוח
1. **Fork** את הפרויקט
2. **צור branch** חדש לתכונה שלך
3. **כתוב קוד** נקי ומתועד
4. **הוסף טסטים** למשפטים החדשים
5. **פתח Pull Request**

### קוד Style Guide
```javascript
// השתמש ב-functional components
const MyComponent = ({ props }) => {
  // ...
};

// השתמש ב-hooks
const [state, setState] = useState(initialValue);

// הוסף PropTypes או TypeScript
MyComponent.propTypes = {
  props: PropTypes.string.isRequired
};
```

## 📞 תמיכה וקשר

### דוקומנטציה
- [React Documentation](https://react.dev)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

### קהילה
- GitHub Issues למינוי באגים
- GitHub Discussions לשאלות כלליות
- תיעוד מפורט בוויקי

---

## 📄 רישיון

MIT License - ראה קובץ LICENSE למידע מפורט.

---

**בנוי עם ❤️ בישראל | נוצר עם Claude AI**