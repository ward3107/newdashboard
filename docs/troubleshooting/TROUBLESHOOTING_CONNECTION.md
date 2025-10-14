# 🔧 פתרון בעיות התחברות לגוגל Sheets

## ❌ שגיאה: "Network Error"

הסיבה: בעיית CORS או הגדרות לא נכונות ב-Google Apps Script.

---

## ✅ פתרון שלב אחר שלב

### שלב 1: בדוק את ה-Deployment של Google Apps Script

1. **פתח את Google Apps Script שלך**
2. **לחץ על "Deploy" > "Manage deployments"**
3. **ודא שההגדרות הן:**
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone

4. **אם לא - צור deployment חדש:**
   - לחץ על "Deploy" > "New deployment"
   - בחר "Web app"
   - הגדר:
     - **Description:** Student Dashboard API
     - **Execute as:** Me
     - **Who has access:** Anyone
   - לחץ "Deploy"
   - **העתק את ה-URL החדש** והדבק ב-`src/config.js`

### שלב 2: בדוק שהפונקציה `doGet` קיימת

ה-Google Apps Script **חייב** להכיל פונקציה בשם `doGet`:

```javascript
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch(action) {
      case 'getAllStudents':
        return ContentService.createTextOutput(
          JSON.stringify(getAllStudents())
        ).setMimeType(ContentService.MimeType.JSON);

      case 'getStats':
        return ContentService.createTextOutput(
          JSON.stringify(getStats())
        ).setMimeType(ContentService.MimeType.JSON);

      case 'syncStudents':
        return ContentService.createTextOutput(
          JSON.stringify(syncStudentsFromResponses())
        ).setMimeType(ContentService.MimeType.JSON);

      case 'initialSync':
        return ContentService.createTextOutput(
          JSON.stringify(initialSyncAllStudents())
        ).setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Invalid action' })
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### שלב 3: בדוק שהפונקציה `getAllStudents` קיימת

```javascript
function getAllStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentsSheet = ss.getSheetByName('students');

  if (!studentsSheet) {
    return { students: [], error: 'Students sheet not found' };
  }

  const data = studentsSheet.getDataRange().getValues();
  const headers = data[0];

  const students = [];
  for (let i = 1; i < data.length; i++) {
    const student = {};
    headers.forEach((header, index) => {
      student[header] = data[i][index];
    });
    students.push(student);
  }

  return { students: students };
}

function getStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentsSheet = ss.getSheetByName('students');

  if (!studentsSheet) {
    return { error: 'Students sheet not found' };
  }

  const data = studentsSheet.getDataRange().getValues();
  const totalStudents = data.length - 1; // Exclude header

  // Count by class
  const byClass = {};
  for (let i = 1; i < data.length; i++) {
    const classId = data[i][3] || 'Unknown'; // Adjust column index
    byClass[classId] = (byClass[classId] || 0) + 1;
  }

  return {
    totalStudents: totalStudents,
    byClass: byClass,
    averageStrengths: 5.2,
    lastUpdated: new Date().toLocaleDateString('he-IL')
  };
}
```

### שלב 4: בדוק את מבנה הגיליון

ודא שיש לך גיליון בשם **`students`** עם העמודות הבאות:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| studentCode | name | classId | quarter | date | learningStyle | keyNotes |
| 70132 | משה כהן | 10A | Q1 | 2025-01-15 | ויזואלי | תלמיד מוכשר |

**העמודות החשובות ביותר:**
- **Column A:** `studentCode` (קוד תלמיד)
- **Column B:** `name` (שם התלמיד) - **זה מה שחסר אם אתה רואה רק קודים!**
- **Column C:** `classId` (כיתה)

### שלב 5: בדיקת חיבור מהדפדפן

פתח חלון חדש בדפדפן והדבק את ה-URL שלך עם `?action=getAllStudents`:

```
https://script.google.com/macros/s/AKfycbxH8Il2bK3xcfCR5bUmem088MY5aHuTRBcHZUnbb_SBCV0TTaa_HUBmG6KYCU6-XTmV/exec?action=getAllStudents
```

**אם זה עובד, תראה:**
```json
{
  "students": [
    {
      "studentCode": "70132",
      "name": "משה כהן",
      "classId": "10A",
      ...
    }
  ]
}
```

**אם זה לא עובד, תראה:**
- שגיאת הרשאות
- "Authorization required"
- JSON ריק

---

## 🔄 פתרון זמני: חזרה לנתוני דמו

אם אתה רוצה להמשיך לעבוד בינתיים, החזר את `ENABLE_MOCK_DATA` ל-`true`:

```javascript
// src/config.js
export const FEATURES = {
  ENABLE_MOCK_DATA: true, // חזרה לנתוני דמו
  ...
}
```

---

## 📞 עזרה נוספת

אם הבעיה נמשכת, בדוק:

1. **Console בדפדפן (F12)** - מה השגיאה המדויקת?
2. **Execution log ב-Google Apps Script** - האם יש שגיאות שם?
3. **הרשאות** - האם אישרת את ההרשאות כשפרסמת את ה-Script?

---

## 🎯 צ'קליסט מהיר

- [ ] ה-URL ב-`src/config.js` נכון (מ-Deploy > Manage deployments)
- [ ] פונקציית `doGet` קיימת ב-Google Apps Script
- [ ] פונקציית `getAllStudents` קיימת
- [ ] פונקציית `getStats` קיימת
- [ ] Deployment הוא "Anyone"
- [ ] Execute as הוא "Me"
- [ ] יש גיליון בשם `students`
- [ ] בגיליון יש עמודה `name` (B) עם שמות
- [ ] בדיקת URL ישירה בדפדפן עובדת
