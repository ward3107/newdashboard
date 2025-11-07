import { generateStudentHTML, generateCompactStudentHTML } from './studentHtmlFormatter';

// Example usage and test cases
const testStudent1 = {
  strengths: [
    'יכולת ריכוז גבוהה',
    'מנהיגות טבעית',
    'חשיבה יצירתית',
    'עבודת צוות מעולה',
    'יכולת ביטוי מצוינת',
    'מוטיבציה גבוהה'
  ],
  challenges: [
    'קושי בניהול זמן',
    'צורך בתרגול נוסף במתמטיקה'
  ],
  learning_style: 'למידה חזותית',
  summary: 'תלמיד מצטיין עם יכולות מנהיגות בולטות. מומלץ למקם בחזית הכיתה ולעודד השתתפות פעילה.'
};

const testStudent2 = {
  strengths: [],
  challenges: [],
  learning_style: '',
  summary: ''
};

const testStudent3 = {
  strengths: ['חשיבה ביקורתית', 'עצמאות בלמידה'],
  challenges: ['ביישנות', 'השתתפות מוגבלת בשיעור', 'קושי בעבודה קבוצתית', 'חרדת מבחנים', 'ריכוז לזמן קצר'],
  learning_style: 'למידה קינסתטית',
  summary: 'תלמיד שקט הזקוק לעידוד להשתתפות. מומלץ למיקום במרכז הכיתה.'
};

// Test function
export function testHTMLGeneration() {
  console.log('=== Test 1: Student with many strengths ===');
  console.log(generateStudentHTML(testStudent1));

  console.log('\n=== Test 2: Empty student ===');
  console.log(generateStudentHTML(testStudent2));

  console.log('\n=== Test 3: Student with many challenges ===');
  console.log(generateStudentHTML(testStudent3));

  console.log('\n=== Compact Version Test ===');
  console.log(generateCompactStudentHTML(testStudent1));
}

// Example of how to use in React component:
/*
import { generateStudentHTML } from './utils/studentHtmlFormatter';

function StudentDisplay({ student }) {
  const htmlContent = generateStudentHTML(student);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
*/