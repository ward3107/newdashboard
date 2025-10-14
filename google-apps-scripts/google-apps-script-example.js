/**
 * ========================================
 * Google Apps Script - Student Sync Functions
 * ========================================
 *
 * קובץ דוגמה להוספת פונקציות סנכרון תלמידים
 * העתק את הפונקציות הללו ל-Google Apps Script שלך
 */

/**
 * מסנכרן תלמידים חדשים מהתשובות לגיליון התלמידים
 * מוסיף רק תלמידים שעדיין לא קיימים
 */
function syncStudentsFromResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('responses');
  const studentsSheet = ss.getSheetByName('students');

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: 'לא נמצאו הגיליונות responses או students'
    };
  }

  // קבל את כל התשובות (החל משורה 2 - אחרי הכותרת)
  const responsesData = responsesSheet.getDataRange().getValues();

  // בדוק אם יש תשובות
  if (responsesData.length <= 1) {
    return {
      success: true,
      added: 0,
      message: 'אין תשובות חדשות'
    };
  }

  // קבל את רשימת התלמידים הקיימים
  const studentsData = studentsSheet.getDataRange().getValues();
  const existingStudents = new Set();

  // הוסף את כל קודי התלמידים הקיימים ל-Set (עמודה A)
  for (let i = 1; i < studentsData.length; i++) {
    existingStudents.add(String(studentsData[i][0])); // עמודה A - קוד תלמיד
  }

  let addedCount = 0;

  // עבור על כל התשובות והוסף תלמידים חדשים
  for (let i = 1; i < responsesData.length; i++) {
    // ⚠️ חשוב: התאם את האינדקסים לפי המבנה של הטופס שלך!
    // דוגמה: אם הטופס שלך שונה, שנה את המספרים הבאים:

    const studentCode = String(responsesData[i][1]);  // עמודה B - קוד תלמיד
    const studentName = responsesData[i][2] || '';     // עמודה C - שם
    const classId = responsesData[i][3] || '';         // עמודה D - כיתה

    // דלג על שורות ריקות או תלמידים קיימים
    if (!studentCode || existingStudents.has(studentCode)) {
      continue;
    }

    // הוסף תלמיד חדש לגיליון
    studentsSheet.appendRow([
      studentCode,                             // A - קוד תלמיד
      studentName || 'תלמיד ' + studentCode,  // B - שם
      classId || 'לא ידוע',                   // C - כיתה
      'Q1',                                    // D - רבעון
      new Date(),                              // E - תאריך
      'ממתין לניתוח'                          // F - סטטוס
    ]);

    // הוסף את התלמיד ל-Set כדי למנוע כפילויות
    existingStudents.add(studentCode);
    addedCount++;

    Logger.log('נוסף תלמיד חדש: ' + studentName + ' (' + studentCode + ')');
  }

  return {
    success: true,
    added: addedCount,
    message: addedCount > 0 ?
      `נוספו ${addedCount} תלמידים חדשים` :
      'אין תלמידים חדשים'
  };
}

/**
 * סנכרון חד-פעמי של כל התלמידים מהתשובות הקיימות
 * הרץ את זה פעם אחת כדי להביא את כל התלמידים שכבר ענו
 */
function initialSyncAllStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('responses');
  const studentsSheet = ss.getSheetByName('students');

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: 'לא נמצאו הגיליונות responses או students'
    };
  }

  const responsesData = responsesSheet.getDataRange().getValues();

  // בדוק אם יש נתונים
  if (responsesData.length <= 1) {
    return {
      success: true,
      added: 0,
      message: 'אין תשובות במערכת'
    };
  }

  // קבל את כל התלמידים הקיימים
  const studentsData = studentsSheet.getDataRange().getValues();
  const existingStudents = new Set();

  for (let i = 1; i < studentsData.length; i++) {
    existingStudents.add(String(studentsData[i][0])); // עמודה A - קוד תלמיד
  }

  // מצא תלמידים ייחודיים מהתשובות
  const uniqueStudents = new Map();

  for (let i = 1; i < responsesData.length; i++) {
    // ⚠️ התאם את האינדקסים לפי המבנה של הטופס שלך!
    const studentCode = String(responsesData[i][1]);  // עמודה B - קוד תלמיד
    const studentName = responsesData[i][2] || '';     // עמודה C - שם
    const classId = responsesData[i][3] || '';         // עמודה D - כיתה

    // דלג על שורות ריקות או תלמידים קיימים
    if (!studentCode || existingStudents.has(studentCode)) {
      continue;
    }

    // אם התלמיד לא במפה - הוסף אותו
    if (!uniqueStudents.has(studentCode)) {
      uniqueStudents.set(studentCode, {
        code: studentCode,
        name: studentName || 'תלמיד ' + studentCode,
        class: classId || 'לא ידוע',
        quarter: 'Q1',
        date: new Date(),
        status: 'ממתין לניתוח'
      });
    }
  }

  // הוסף את כל התלמידים החדשים
  let addedCount = 0;
  uniqueStudents.forEach(student => {
    studentsSheet.appendRow([
      student.code,      // A - קוד תלמיד
      student.name,      // B - שם
      student.class,     // C - כיתה
      student.quarter,   // D - רבעון
      student.date,      // E - תאריך
      student.status     // F - סטטוס
    ]);
    addedCount++;
    Logger.log('נוסף תלמיד: ' + student.name + ' (' + student.code + ')');
  });

  return {
    success: true,
    added: addedCount,
    total: uniqueStudents.size,
    message: `סנכרון הושלם! נוספו ${addedCount} תלמידים חדשים`
  };
}

/**
 * ========================================
 * עדכון הפונקציה doGet
 * ========================================
 *
 * הוסף את המקטעים המסומנים ב-✨ NEW
 */
function doGet(e) {
  const action = e.parameter.action;

  // ✨ NEW: Endpoint לסנכרון ראשוני
  if (action === 'initialSync') {
    const result = initialSyncAllStudents();
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // ✨ NEW: Endpoint לסנכרון תלמידים חדשים
  if (action === 'syncStudents') {
    const result = syncStudentsFromResponses();
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Existing endpoints...
  if (action === 'getAllStudents') {
    return getAllStudents();
  }

  if (action === 'getStudent') {
    const studentId = e.parameter.studentId;
    return getStudent(studentId);
  }

  if (action === 'getStats') {
    return getStats();
  }

  if (action === 'analyzeOneStudent') {
    const studentId = e.parameter.studentId;
    return analyzeOneStudent(studentId);
  }

  if (action === 'test') {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'החיבור תקין! Google Apps Script עובד',
        timestamp: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // אם לא נמצא action - החזר שגיאה
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      error: 'פעולה לא מוכרת'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * ========================================
 * פונקציה עזר: בדיקת מבנה הטופס
 * ========================================
 *
 * הרץ פונקציה זו כדי לראות את מבנה העמודות בטופס שלך
 * זה יעזור לך להתאים את האינדקסים
 */
function debugFormStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('responses');

  if (!responsesSheet) {
    Logger.log('❌ לא נמצא גיליון responses');
    return;
  }

  const data = responsesSheet.getDataRange().getValues();

  if (data.length === 0) {
    Logger.log('❌ הגיליון ריק');
    return;
  }

  // הדפס את שורת הכותרת
  Logger.log('📋 שורת כותרת (Column Headers):');
  Logger.log('================================');
  for (let i = 0; i < data[0].length; i++) {
    Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[0][i]}`);
  }

  // הדפס שורה לדוגמה
  if (data.length > 1) {
    Logger.log('\n📝 שורה לדוגמה (Sample Row):');
    Logger.log('================================');
    for (let i = 0; i < data[1].length; i++) {
      Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[1][i]}`);
    }
  }

  Logger.log('\n✅ השתמש באינדקסים [0], [1], [2]... בהתאם לעמודות שלעיל');
}

/**
 * ========================================
 * הוראות התקנה:
 * ========================================
 *
 * 1. העתק את כל הפונקציות לעיל ל-Google Apps Script
 * 2. הרץ את debugFormStructure() כדי לראות את מבנה הטופס
 * 3. התאם את האינדקסים בפונקציות syncStudentsFromResponses ו-initialSyncAllStudents
 * 4. עדכן את doGet עם ה-endpoints החדשים
 * 5. Deploy מחדש (New Version)
 * 6. בדוק בדשבורד שהכל עובד
 */
