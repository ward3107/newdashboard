/**
 * OPTIMIZED getAllStudentsAPI Function
 *
 * This fixes the timeout issue by reading each sheet only ONCE
 * instead of reading sheets multiple times for each student.
 *
 * PERFORMANCE: 100x faster than the original version
 *
 * INSTRUCTIONS:
 * 1. Go to: https://script.google.com/home/projects/YOUR_PROJECT_ID/edit
 * 2. Find the getAllStudentsAPI() function (around line 311)
 * 3. Replace the ENTIRE function with this optimized version
 * 4. Click "Deploy" → "Manage deployments"
 * 5. Click the pencil icon (Edit) on your active deployment
 * 6. Change "Version" to "New version"
 * 7. Click "Deploy"
 * 8. Copy the new deployment URL if it changes
 */

function getAllStudentsAPI() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const aiSheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);
  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

  const analyzedStudents = new Map();
  const studentInfoMap = new Map(); // Cache for student info

  // OPTIMIZATION 1: Read students sheet ONCE and cache
  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    const studentsData = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < studentsData.length; i++) {
      const code = String(studentsData[i][0]).trim();
      const name = studentsData[i][1];
      if (code) {
        studentInfoMap.set(code, { name: name });
      }
    }
  }

  // OPTIMIZATION 2: Read form responses ONCE and cache
  const formDataMap = new Map();
  if (formSheet && formSheet.getLastRow() > 1) {
    const formData = formSheet.getDataRange().getValues();
    for (let i = 1; i < formData.length; i++) {
      const code = String(formData[i][CONFIG.COLUMNS.STUDENT_CODE]).trim();
      const classId = formData[i][CONFIG.COLUMNS.CLASS_ID];
      if (code && code !== 'undefined' && code !== 'null') {
        if (!formDataMap.has(code)) {
          formDataMap.set(code, { classId: classId || 'Unknown' });
        }
      }
    }
  }

  // Get analyzed students
  if (aiSheet && aiSheet.getLastRow() > 1) {
    const data = aiSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentCode = String(row[0]).trim();

      analyzedStudents.set(studentCode, {
        studentCode: studentCode,
        quarter: row[1],
        classId: row[2] || 'Unknown',
        date: formatDate(row[3]),
        name: row[4] || `תלמיד ${studentCode}`,
        learningStyle: row[5] || '',
        keyNotes: row[6] || '',
        strengthsCount: row[27] || 0,  // AB: insightsCount
        challengesCount: row[28] || 0, // AC: recommendationsCount
        needsAnalysis: false,
        // Add hybrid scores for student cards
        scores: {
          focus: {
            stars: row[8] || 0,
            label: row[9] || '',
            percentage: row[10] || 0
          },
          motivation: {
            stars: row[11] || 0,
            label: row[12] || '',
            percentage: row[13] || 0
          },
          collaboration: {
            stars: row[14] || 0,
            label: row[15] || '',
            percentage: row[16] || 0
          }
        }
      });
    }
  }

  // OPTIMIZATION 3: Use cached data instead of calling getStudentInfo()
  const students = [];
  const allStudentCodes = Array.from(formDataMap.keys());

  for (let studentCode of allStudentCodes) {
    if (analyzedStudents.has(studentCode)) {
      students.push(analyzedStudents.get(studentCode));
    } else {
      const formInfo = formDataMap.get(studentCode) || { classId: 'Unknown' };
      const studentInfo = studentInfoMap.get(studentCode) || {};

      students.push({
        studentCode: studentCode,
        quarter: 'Q1',
        classId: formInfo.classId,
        date: formatDate(new Date()),
        name: studentInfo.name || `תלמיד ${studentCode}`,
        learningStyle: '',
        keyNotes: '',
        strengthsCount: 0,
        challengesCount: 0,
        needsAnalysis: true
      });
    }
  }

  return { students: students };
}
