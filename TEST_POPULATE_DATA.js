/**
 * RUN THIS IN GOOGLE APPS SCRIPT TO TEST
 * This will create sample data in AI_Insights so you can see the dashboard working
 */

function testPopulateSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet) {
    Logger.log('❌ AI_Insights sheet not found!');
    return;
  }

  // Clear existing data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  // Sample students
  const sampleStudents = [
    {
      studentCode: '70101',
      quarter: 'Q1',
      classId: 'ז1',
      name: 'תלמיד דוגמה 1',
      learningStyle: '• 👁️ ויזואלי\n• 📖 מילולי',
      keyNotes: 'תלמיד מצטיין עם יכולות גבוהות',
      strengths: '• חשיבה יצירתית\n• ריכוז גבוה\n• זיכרון חזותי\n• עבודה עצמאית',
      challenges: '• קושי בעבודת צוות\n• רגישות לרעש'
    },
    {
      studentCode: '70102',
      quarter: 'Q1',
      classId: 'ז1',
      name: 'תלמיד דוגמה 2',
      learningStyle: '• 👂 אודיטורי\n• 🤝 חברתי',
      keyNotes: 'לומד מעולה בסביבה חברתית',
      strengths: '• יכולות חברתיות\n• הקשבה פעילה\n• שיתוף פעולה\n• ביטוי עצמי',
      challenges: '• קושי בלמידה עצמאית\n• הסחות דעת בשיעור\n• ריכוז נמוך'
    },
    {
      studentCode: '70103',
      quarter: 'Q1',
      classId: 'ז2',
      name: 'תלמיד דוגמה 3',
      learningStyle: '• ✋ קינסטטי\n• 🔢 לוגי',
      keyNotes: 'זקוק לפעילות מעשית ותנועה',
      strengths: '• חשיבה מתמטית\n• למידה מעשית\n• פתרון בעיות\n• יצירתיות טכנית\n• התמדה',
      challenges: '• קושי בישיבה ממושכת\n• צורך בתנועה'
    },
    {
      studentCode: '70104',
      quarter: 'Q1',
      classId: 'ז2',
      name: 'תלמיד דוגמה 4',
      learningStyle: '• 🎨 יצירתי\n• 📝 מילולי',
      keyNotes: 'תלמיד יצירתי עם כישרון לכתיבה',
      strengths: '• כתיבה יצירתית\n• דמיון עשיר\n• ביטוי אמנותי',
      challenges: '• קושי במתמטיקה\n• ארגון זמן\n• התמקדות במשימות'
    },
    {
      studentCode: '70105',
      quarter: 'Q1',
      classId: 'ז3',
      name: 'תלמיד דוגמה 5',
      learningStyle: '• 🧠 אנליטי\n• 🔬 מדעי',
      keyNotes: 'מצטיין במדעים ובחשיבה מדעית',
      strengths: '• חשיבה ביקורתית\n• ניתוח נתונים\n• סקרנות מדעית\n• מחקר עצמאי\n• דיוק',
      challenges: '• קושי ביצירתיות\n• פרפקציוניזם'
    },
    {
      studentCode: '70106',
      quarter: 'Q1',
      classId: 'ז3',
      name: 'תלמיד דוגמה 6',
      learningStyle: '• 🎵 מוזיקלי\n• ⏱️ קצבי',
      keyNotes: 'לומד טוב עם מוזיקה ומקצב',
      strengths: '• זיכרון שמיעתי\n• קצב עבודה מהיר\n• למידה במוזיקה',
      challenges: '• קושי בשקט\n• צורך בגירויים\n• הסחות קלות\n• אימפולסיביות'
    }
  ];

  // Add each student to the sheet
  sampleStudents.forEach(student => {
    sheet.appendRow([
      student.studentCode,
      student.quarter,
      student.classId,
      new Date(),
      student.name,
      student.learningStyle,
      student.keyNotes,
      student.strengths,
      student.challenges
    ]);
  });

  Logger.log('✅ Added ' + sampleStudents.length + ' sample students to AI_Insights');
  Logger.log('🎉 Now refresh your dashboard to see the data!');

  return {
    success: true,
    added: sampleStudents.length,
    message: 'Sample data created successfully'
  };
}

/**
 * Remove sample data
 */
function clearSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet) {
    Logger.log('❌ AI_Insights sheet not found!');
    return;
  }

  // Clear all rows except header
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  Logger.log('✅ Sample data cleared');
}
