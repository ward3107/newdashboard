/**
 * Form UI Translations
 * Hebrew, English, Arabic, Russian
 */

import type { Language } from '@/data/assessmentQuestions';

export const FORM_TRANSLATIONS = {
  // Page title
  title: {
    he: 'שאלון הערכת תלמיד',
    en: 'Student Assessment Questionnaire',
    ar: 'استبيان تقييم الطالب',
    ru: 'Опросник оценки ученика',
  },

  // Basic info section
  basicInfo: {
    title: {
      he: 'פרטי תלמיד',
      en: 'Student Information',
      ar: 'معلومات الطالب',
      ru: 'Информация об ученике',
    },
    studentCode: {
      he: 'קוד תלמיד',
      en: 'Student Code',
      ar: 'رمز الطالب',
      ru: 'Код ученика',
    },
    studentCodePlaceholder: {
      he: 'לדוגמה: 70101',
      en: 'Example: 70101',
      ar: 'مثال: 70101',
      ru: 'Пример: 70101',
    },
    studentName: {
      he: 'שם התלמיד',
      en: 'Student Name',
      ar: 'اسم الطالب',
      ru: 'Имя ученика',
    },
    studentNamePlaceholder: {
      he: 'שם מלא',
      en: 'Full name',
      ar: 'الاسم الكامل',
      ru: 'Полное имя',
    },
    classId: {
      he: 'כיתה',
      en: 'Class',
      ar: 'الصف',
      ru: 'Класс',
    },
    selectClass: {
      he: 'בחר כיתה',
      en: 'Select class',
      ar: 'اختر الصف',
      ru: 'Выберите класс',
    },
    required: {
      he: '*',
      en: '*',
      ar: '*',
      ru: '*',
    },
  },

  // Questions section
  questions: {
    questionOf: {
      he: 'שאלה {current} מתוך {total}',
      en: 'Question {current} of {total}',
      ar: 'السؤال {current} من {total}',
      ru: 'Вопрос {current} из {total}',
    },
    answerPlaceholder: {
      he: 'התשובה שלך...',
      en: 'Your answer...',
      ar: 'إجابتك...',
      ru: 'Ваш ответ...',
    },
  },

  // Buttons
  buttons: {
    start: {
      he: 'התחל שאלון',
      en: 'Start Questionnaire',
      ar: 'ابدأ الاستبيان',
      ru: 'Начать опрос',
    },
    back: {
      he: 'חזור',
      en: 'Back',
      ar: 'عودة',
      ru: 'Назад',
    },
    continue: {
      he: 'המשך',
      en: 'Continue',
      ar: 'متابعة',
      ru: 'Продолжить',
    },
    submit: {
      he: 'סיים ושלח',
      en: 'Finish & Submit',
      ar: 'إنهاء وإرسال',
      ru: 'Завершить и отправить',
    },
    sending: {
      he: 'שולח...',
      en: 'Sending...',
      ar: 'جارٍ الإرسال...',
      ru: 'Отправка...',
    },
  },

  // Messages
  messages: {
    fillAllFields: {
      he: 'נא למלא את כל השדות',
      en: 'Please fill all fields',
      ar: 'يرجى ملء جميع الحقول',
      ru: 'Пожалуйста, заполните все поля',
    },
    answerQuestion: {
      he: 'נא לענות על השאלה',
      en: 'Please answer the question',
      ar: 'يرجى الإجابة على السؤال',
      ru: 'Пожалуйста, ответьте на вопрос',
    },
    processing: {
      he: 'מעבד את השאלון...',
      en: 'Processing questionnaire...',
      ar: 'جارٍ معالجة الاستبيان...',
      ru: 'Обработка опроса...',
    },
    success: {
      he: 'השאלון עובד בהצלחה! 🎉',
      en: 'Questionnaire processed successfully! 🎉',
      ar: 'تمت معالجة الاستبيان بنجاح! 🎉',
      ru: 'Опрос успешно обработан! 🎉',
    },
    error: {
      he: 'שגיאה בעיבוד השאלון',
      en: 'Error processing questionnaire',
      ar: 'خطأ في معالجة الاستبيان',
      ru: 'Ошибка при обработке опроса',
    },
    tooManyRequests: {
      he: 'יותר מדי בקשות. נא לנסות שוב בעוד דקה.',
      en: 'Too many requests. Please try again in a minute.',
      ar: 'طلبات كثيرة جدًا. يرجى المحاولة مرة أخرى بعد دقيقة.',
      ru: 'Слишком много запросов. Попробуйте снова через минуту.',
    },
  },

  // Student info display
  studentInfo: {
    student: {
      he: 'תלמיד',
      en: 'Student',
      ar: 'الطالب',
      ru: 'Ученик',
    },
    class: {
      he: 'כיתה',
      en: 'Class',
      ar: 'الصف',
      ru: 'Класс',
    },
  },
};

// Language names for selector
export const LANGUAGE_NAMES = {
  he: {
    he: 'עברית',
    en: 'Hebrew',
    ar: 'العبرية',
    ru: 'Иврит',
  },
  en: {
    he: 'English',
    en: 'English',
    ar: 'إنجليزي',
    ru: 'Английский',
  },
  ar: {
    he: 'عربي',
    en: 'Arabic',
    ar: 'عربي',
    ru: 'Арабский',
  },
  ru: {
    he: 'Русский',
    en: 'Russian',
    ar: 'روسي',
    ru: 'Русский',
  },
};

// Helper function to get translation
export function t(key: string, lang: Language, replacements?: Record<string, string>) {
  const keys = key.split('.');
  let value: any = FORM_TRANSLATIONS;

  for (const k of keys) {
    value = value?.[k];
  }

  let result = value?.[lang] || value?.['en'] || key;

  // Replace placeholders
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      result = result.replace(`{${placeholder}}`, replacement);
    });
  }

  return result;
}

// Helper function to format class names based on language
export function getClassName(classId: string, lang: Language): string {
  // classId format: Hebrew letter (grade) + number (class number)
  // e.g., "ג1" = Grade 3, Class 1

  const gradeMap: Record<string, { he: string; en: string; ar: string; ru: string }> = {
    'ג': { he: 'כיתה ג׳', en: 'Grade 3', ar: 'الصف 3', ru: 'Класс 3' },
    'ד': { he: 'כיתה ד׳', en: 'Grade 4', ar: 'الصف 4', ru: 'Класс 4' },
    'ה': { he: 'כיתה ה׳', en: 'Grade 5', ar: 'الصف 5', ru: 'Класс 5' },
    'ו': { he: 'כיתה ו׳', en: 'Grade 6', ar: 'الصف 6', ru: 'Класс 6' },
    'ז': { he: 'כיתה ז׳', en: 'Grade 7', ar: 'الصف 7', ru: 'Класс 7' },
    'ח': { he: 'כיתה ח׳', en: 'Grade 8', ar: 'الصف 8', ru: 'Класс 8' },
    'ט': { he: 'כיתה ט׳', en: 'Grade 9', ar: 'الصف 9', ru: 'Класс 9' },
    'י': { he: 'כיתה י׳', en: 'Grade 10', ar: 'الصف 10', ru: 'Класс 10' },
    'יא': { he: 'כיתה יא׳', en: 'Grade 11', ar: 'الصف 11', ru: 'Класс 11' },
    'יב': { he: 'כיתה יב׳', en: 'Grade 12', ar: 'الصف 12', ru: 'Класс 12' },
  };

  // Extract grade letter and class number
  const gradeLetter = classId.match(/^(י[אב]|[גדהוזחט])/)?.[0] || '';
  const classNumber = classId.replace(gradeLetter, '');

  const gradeInfo = gradeMap[gradeLetter];
  if (!gradeInfo) {
    return classId; // Return as-is if not found
  }

  // Format based on language
  return `${gradeInfo[lang]}${classNumber}`;
}

export default FORM_TRANSLATIONS;
