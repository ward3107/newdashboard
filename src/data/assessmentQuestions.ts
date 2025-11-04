/**
 * Student Assessment Questionnaire - Multi-language Support
 * 28 questions in Hebrew, English, Arabic, and Russian
 * Based on Google Forms: Learning Styles Survey
 */

export type Language = 'he' | 'en' | 'ar' | 'ru';

export interface AssessmentQuestion {
  id: number;
  question: {
    he: string;
    en: string;
    ar: string;
    ru: string;
  };
  options: Array<{
    he: string;
    en: string;
    ar: string;
    ru: string;
  }>;
  domain: 'cognitive' | 'emotional' | 'social' | 'motivational' | 'environmental';
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Cognitive Domain (Questions 1-10)
  {
    id: 1,
    question: {
      he: 'מהו הנושא הלימודי המועדף עליך/עלייך?',
      en: 'What is your preferred academic subject?',
      ar: 'ما هو موضوعك الأكاديمي المفضل؟',
      ru: 'Какой твой любимый учебный предмет?',
    },
    options: [
      { he: 'מתמטיקה', en: 'Mathematics', ar: 'الرياضيات', ru: 'Математика' },
      { he: 'שפות', en: 'Languages', ar: 'اللغات', ru: 'Языки' },
      { he: 'מדעים', en: 'Science', ar: 'العلوم', ru: 'Наука' },
      { he: 'היסטוריה', en: 'History', ar: 'التاريخ', ru: 'История' },
    ],
    domain: 'cognitive',
  },
  {
    id: 2,
    question: {
      he: 'איזו שיטת למידה הכי יעילה עבורך?',
      en: 'Which learning method is most effective for you?',
      ar: 'ما هي طريقة التعلم الأكثر فعالية بالنسبة لك؟',
      ru: 'Какой метод обучения наиболее эффективен для тебя?',
    },
    options: [
      { he: 'למידה עצמאית', en: 'Independent learning', ar: 'التعلم المستقل', ru: 'Самостоятельное обучение' },
      { he: 'סרטונים', en: 'Videos', ar: 'الفيديوهات', ru: 'Видео' },
      { he: 'עבודה בקבוצה', en: 'Group work', ar: 'العمل الجماعي', ru: 'Групповая работа' },
      { he: 'תרגול מעשי', en: 'Practical practice', ar: 'الممارسة العملية', ru: 'Практическая тренировка' },
    ],
    domain: 'cognitive',
  },
  {
    id: 3,
    question: {
      he: 'באיזו רמת קושי אתה/את מרגיש/ה בלמידה?',
      en: 'What difficulty level do you feel in learning?',
      ar: 'ما مستوى الصعوبة الذي تشعر به في التعلم؟',
      ru: 'На каком уровне сложности ты чувствуешь себя в обучении?',
    },
    options: [
      { he: 'קל מאוד', en: 'Very easy', ar: 'سهل جداً', ru: 'Очень легко' },
      { he: 'קל עם מאמץ', en: 'Easy with effort', ar: 'سهل مع الجهد', ru: 'Легко с усилием' },
      { he: 'מאתגר', en: 'Challenging', ar: 'صعب', ru: 'Сложно' },
      { he: 'קשה מאוד', en: 'Very difficult', ar: 'صعب جداً', ru: 'Очень сложно' },
    ],
    domain: 'cognitive',
  },
  {
    id: 4,
    question: {
      he: 'מה עוזר לך להתרכז בשיעור?',
      en: 'What helps you concentrate in class?',
      ar: 'ما الذي يساعدك على التركيز في الصف؟',
      ru: 'Что помогает тебе концентрироваться на уроке?',
    },
    options: [
      { he: 'שקט מוחלט', en: 'Complete silence', ar: 'صمت تام', ru: 'Полная тишина' },
      { he: 'רעש רקע עדין', en: 'Gentle background noise', ar: 'ضوضاء خلفية خفيفة', ru: 'Легкий фоновый шум' },
      { he: 'תנועה', en: 'Movement', ar: 'الحركة', ru: 'Движение' },
      { he: 'עבודה בקבוצה', en: 'Group work', ar: 'العمل الجماعي', ru: 'Групповая работа' },
    ],
    domain: 'cognitive',
  },
  {
    id: 5,
    question: {
      he: 'איך אתה/את מרגיש/ה לקראת מבחנים?',
      en: 'How do you feel before exams?',
      ar: 'كيف تشعر قبل الامتحانات؟',
      ru: 'Как ты себя чувствуешь перед экзаменами?',
    },
    options: [
      { he: 'בביטחון', en: 'Confident', ar: 'واثق', ru: 'Уверенно' },
      { he: 'לחוץ', en: 'Stressed', ar: 'متوتر', ru: 'Напряжённо' },
      { he: 'מתבלבל', en: 'Confused', ar: 'مرتبك', ru: 'Растерянно' },
      { he: 'לחץ גדול', en: 'Very stressed', ar: 'متوتر جداً', ru: 'Очень напряжённо' },
    ],
    domain: 'emotional',
  },
  {
    id: 6,
    question: {
      he: 'איך אתה/את מעדיף/ה ללמוד נושא חדש?',
      en: 'How do you prefer to learn a new topic?',
      ar: 'كيف تفضل تعلم موضوع جديد؟',
      ru: 'Как ты предпочитаешь изучать новую тему?',
    },
    options: [
      { he: 'קריאה', en: 'Reading', ar: 'القراءة', ru: 'Чтение' },
      { he: 'ויזואלי (סרטונים/תמונות)', en: 'Visual (videos/images)', ar: 'بصري (فيديوهات/صور)', ru: 'Визуально (видео/картинки)' },
      { he: 'משחקים', en: 'Games', ar: 'الألعاب', ru: 'Игры' },
      { he: 'ניסויים', en: 'Experiments', ar: 'التجارب', ru: 'Эксперименты' },
    ],
    domain: 'cognitive',
  },
  {
    id: 7,
    question: {
      he: 'איך אתה/את ניגש/ת למשימה לימודית?',
      en: 'How do you approach a learning task?',
      ar: 'كيف تتعامل مع مهمة تعليمية؟',
      ru: 'Как ты подходишь к учебной задаче?',
    },
    options: [
      { he: 'מיד', en: 'Immediately', ar: 'فوراً', ru: 'Немедленно' },
      { he: 'תכנון', en: 'Planning', ar: 'التخطيط', ru: 'Планирование' },
      { he: 'דחיינות', en: 'Procrastination', ar: 'التأجيل', ru: 'Откладывание' },
      { he: 'קושי להתחיל', en: 'Difficulty starting', ar: 'صعوبة في البدء', ru: 'Сложно начать' },
    ],
    domain: 'motivational',
  },
  {
    id: 8,
    question: {
      he: 'איזה סוג שיעור אתה/את אוהב/ת?',
      en: 'What type of lesson do you like?',
      ar: 'ما نوع الدرس الذي تحبه؟',
      ru: 'Какой тип урока ты любишь?',
    },
    options: [
      { he: 'דיונים', en: 'Discussions', ar: 'المناقشات', ru: 'Дискуссии' },
      { he: 'ניסויים', en: 'Experiments', ar: 'التجارب', ru: 'Эксперименты' },
      { he: 'לימוד עצמאי', en: 'Independent learning', ar: 'التعلم المستقل', ru: 'Самостоятельное обучение' },
      { he: 'אתגרים', en: 'Challenges', ar: 'التحديات', ru: 'Задачи' },
    ],
    domain: 'cognitive',
  },
  {
    id: 9,
    question: {
      he: 'מה דעתך על עבודה בקבוצות?',
      en: 'What do you think about group work?',
      ar: 'ما رأيك في العمل الجماعي؟',
      ru: 'Что ты думаешь о групповой работе?',
    },
    options: [
      { he: 'אוהב', en: 'Like it', ar: 'أحبها', ru: 'Нравится' },
      { he: 'בסדר', en: 'It\'s okay', ar: 'مقبولة', ru: 'Нормально' },
      { he: 'לא אוהב', en: 'Don\'t like', ar: 'لا أحبها', ru: 'Не нравится' },
      { he: 'קשה לי', en: 'It\'s hard for me', ar: 'صعبة علي', ru: 'Мне сложно' },
    ],
    domain: 'social',
  },
  {
    id: 10,
    question: {
      he: 'מה מתסכל אותך בלמידה?',
      en: 'What frustrates you in learning?',
      ar: 'ما الذي يحبطك في التعلم؟',
      ru: 'Что тебя расстраивает в учёбе?',
    },
    options: [
      { he: 'חוסר הבנה', en: 'Lack of understanding', ar: 'عدم الفهم', ru: 'Непонимание' },
      { he: 'הפרעות', en: 'Distractions', ar: 'المشتتات', ru: 'Отвлечения' },
      { he: 'ישיבה ממושכת', en: 'Long sitting', ar: 'الجلوس لفترة طويلة', ru: 'Долгое сидение' },
      { he: 'עבודה לבד', en: 'Working alone', ar: 'العمل بمفردي', ru: 'Работа в одиночку' },
    ],
    domain: 'emotional',
  },

  // Cognitive/Memory (Questions 11-15)
  {
    id: 11,
    question: {
      he: 'איך אתה/את זוכר/ת מידע הכי טוב?',
      en: 'How do you remember information best?',
      ar: 'كيف تتذكر المعلومات بشكل أفضل؟',
      ru: 'Как ты лучше всего запоминаешь информацию?',
    },
    options: [
      { he: 'כתיבה', en: 'Writing', ar: 'الكتابة', ru: 'Письмо' },
      { he: 'תמונות', en: 'Images', ar: 'الصور', ru: 'Изображения' },
      { he: 'שיחות', en: 'Conversations', ar: 'المحادثات', ru: 'Разговоры' },
      { he: 'חוויות/משחקים', en: 'Experiences/games', ar: 'التجارب/الألعاب', ru: 'Опыт/игры' },
    ],
    domain: 'cognitive',
  },
  {
    id: 12,
    question: {
      he: 'איך אתה/את מגיב/ה למשימה קשה?',
      en: 'How do you react to a difficult task?',
      ar: 'كيف تتفاعل مع مهمة صعبة؟',
      ru: 'Как ты реагируешь на сложную задачу?',
    },
    options: [
      { he: 'מנסה לפתור לבד', en: 'Try to solve alone', ar: 'أحاول الحل بمفردي', ru: 'Пытаюсь решить сам' },
      { he: 'מבקש עזרה', en: 'Ask for help', ar: 'أطلب المساعدة', ru: 'Прошу помощи' },
      { he: 'דוחה למשך זמן', en: 'Postpone for a while', ar: 'أؤجل لفترة', ru: 'Откладываю на время' },
      { he: 'מתייאש', en: 'Get discouraged', ar: 'أشعر بالإحباط', ru: 'Унываю' },
    ],
    domain: 'emotional',
  },
  {
    id: 13,
    question: {
      he: 'מה נותן לך מוטיבציה?',
      en: 'What gives you motivation?',
      ar: 'ما الذي يعطيك الدافع؟',
      ru: 'Что даёт тебе мотивацию?',
    },
    options: [
      { he: 'ציונים', en: 'Grades', ar: 'الدرجات', ru: 'Оценки' },
      { he: 'מחמאות', en: 'Compliments', ar: 'المديح', ru: 'Похвала' },
      { he: 'שיפור עצמי', en: 'Self-improvement', ar: 'التحسين الذاتي', ru: 'Самосовершенствование' },
      { he: 'עבודה משותפת', en: 'Collaborative work', ar: 'العمل التعاوني', ru: 'Совместная работа' },
    ],
    domain: 'motivational',
  },
  {
    id: 14,
    question: {
      he: 'איך אתה/את עושה שיעורי בית?',
      en: 'How do you do homework?',
      ar: 'كيف تقوم بالواجبات المنزلية؟',
      ru: 'Как ты делаешь домашние задания?',
    },
    options: [
      { he: 'לבד בשקט', en: 'Alone quietly', ar: 'بمفردي بهدوء', ru: 'Один в тишине' },
      { he: 'עם מוזיקה', en: 'With music', ar: 'مع الموسيقى', ru: 'С музыкой' },
      { he: 'עם חברים', en: 'With friends', ar: 'مع الأصدقاء', ru: 'С друзьями' },
      { he: 'לא אוהב לעשות', en: 'Don\'t like doing', ar: 'لا أحب القيام بها', ru: 'Не люблю делать' },
    ],
    domain: 'environmental',
  },
  {
    id: 15,
    question: {
      he: 'איך אתה/את מתמודד/ת עם הרבה משימות?',
      en: 'How do you deal with many tasks?',
      ar: 'كيف تتعامل مع العديد من المهام؟',
      ru: 'Как ты справляешься со множеством задач?',
    },
    options: [
      { he: 'תכנון זמן', en: 'Time planning', ar: 'تخطيط الوقت', ru: 'Планирование времени' },
      { he: 'עוזב קלות', en: 'Give up easily', ar: 'أستسلم بسهولة', ru: 'Легко сдаюсь' },
      { he: 'בלבול', en: 'Confusion', ar: 'ارتباك', ru: 'Путаница' },
      { he: 'קשה לי להתמודד', en: 'Hard for me to cope', ar: 'صعب علي التعامل', ru: 'Мне сложно справиться' },
    ],
    domain: 'motivational',
  },

  // Learning Preferences (Questions 16-20)
  {
    id: 16,
    question: {
      he: 'איזו פעילות תוסיף ללמידה?',
      en: 'What activity would you add to learning?',
      ar: 'ما النشاط الذي ستضيفه للتعلم؟',
      ru: 'Какое занятие ты добавил бы к учёбе?',
    },
    options: [
      { he: 'סיורים', en: 'Field trips', ar: 'الرحلات الميدانية', ru: 'Экскурсии' },
      { he: 'ניסויים', en: 'Experiments', ar: 'التجارب', ru: 'Эксперименты' },
      { he: 'משחקים', en: 'Games', ar: 'الألعاب', ru: 'Игры' },
      { he: 'יצירה', en: 'Creativity', ar: 'الإبداع', ru: 'Творчество' },
    ],
    domain: 'cognitive',
  },
  {
    id: 17,
    question: {
      he: 'מה דעתך על טכנולוגיה בלמידה?',
      en: 'What do you think about technology in learning?',
      ar: 'ما رأيك في التكنولوجيا في التعلم؟',
      ru: 'Что ты думаешь о технологиях в обучении?',
    },
    options: [
      { he: 'אוהב', en: 'Love it', ar: 'أحبها', ru: 'Люблю' },
      { he: 'מעדיף אחרת', en: 'Prefer otherwise', ar: 'أفضل غير ذلك', ru: 'Предпочитаю иначе' },
      { he: 'קשה לי להשתמש', en: 'Hard to use', ar: 'صعب الاستخدام', ru: 'Сложно использовать' },
      { he: 'לא אוהב', en: 'Don\'t like', ar: 'لا أحبها', ru: 'Не люблю' },
    ],
    domain: 'environmental',
  },
  {
    id: 18,
    question: {
      he: 'איזו מיומנות תרצה/י לשפר?',
      en: 'Which skill would you like to improve?',
      ar: 'ما المهارة التي تريد تحسينها؟',
      ru: 'Какой навык ты хотел бы улучшить?',
    },
    options: [
      { he: 'ריכוז', en: 'Concentration', ar: 'التركيز', ru: 'Концентрация' },
      { he: 'ניהול זמן', en: 'Time management', ar: 'إدارة الوقت', ru: 'Управление временем' },
      { he: 'הבנת טקסט', en: 'Text comprehension', ar: 'فهم النص', ru: 'Понимание текста' },
      { he: 'עבודת צוות', en: 'Teamwork', ar: 'العمل الجماعي', ru: 'Командная работа' },
    ],
    domain: 'motivational',
  },
  {
    id: 19,
    question: {
      he: 'איך אתה/את מרגיש/ה עם קריאת טקסטים?',
      en: 'How do you feel about reading texts?',
      ar: 'كيف تشعر تجاه قراءة النصوص؟',
      ru: 'Как ты относишься к чтению текстов?',
    },
    options: [
      { he: 'נהנה', en: 'Enjoy it', ar: 'أستمتع بها', ru: 'Нравится' },
      { he: 'עייפות', en: 'Tiredness', ar: 'إرهاق', ru: 'Утомительно' },
      { he: 'קושי', en: 'Difficulty', ar: 'صعوبة', ru: 'Сложность' },
      { he: 'לא אוהב', en: 'Don\'t like', ar: 'لا أحب', ru: 'Не люблю' },
    ],
    domain: 'cognitive',
  },
  {
    id: 20,
    question: {
      he: 'איך אתה/את מרגיש/ה עם הצגת נושא בכיתה?',
      en: 'How do you feel about presenting a topic in class?',
      ar: 'كيف تشعر تجاه تقديم موضوع في الصف؟',
      ru: 'Как ты относишься к презентациям в классе?',
    },
    options: [
      { he: 'בנוח', en: 'Comfortable', ar: 'مرتاح', ru: 'Комфортно' },
      { he: 'מלחיץ', en: 'Stressful', ar: 'مرهق', ru: 'Напряжённо' },
      { he: 'מעדיף לא', en: 'Prefer not to', ar: 'أفضل عدم', ru: 'Лучше не надо' },
      { he: 'קשה לי מאוד', en: 'Very hard for me', ar: 'صعب جداً علي', ru: 'Очень сложно' },
    ],
    domain: 'emotional',
  },

  // Advanced Learning (Questions 21-28)
  {
    id: 21,
    question: {
      he: 'איזה מקצוע הכי מאתגר עבורך?',
      en: 'Which subject is most challenging for you?',
      ar: 'ما هو الموضوع الأكثر تحديًا بالنسبة لك؟',
      ru: 'Какой предмет самый сложный для тебя?',
    },
    options: [
      { he: 'מתמטיקה', en: 'Mathematics', ar: 'الرياضيات', ru: 'Математика' },
      { he: 'שפות', en: 'Languages', ar: 'اللغات', ru: 'Языки' },
      { he: 'מדעים', en: 'Science', ar: 'العلوم', ru: 'Наука' },
      { he: 'היסטוריה', en: 'History', ar: 'التاريخ', ru: 'История' },
    ],
    domain: 'cognitive',
  },
  {
    id: 22,
    question: {
      he: 'איך אתה/את מתמודד/ת עם ביקורת?',
      en: 'How do you handle criticism?',
      ar: 'كيف تتعامل مع النقد؟',
      ru: 'Как ты справляешься с критикой?',
    },
    options: [
      { he: 'לומד ומשתפר', en: 'Learn and improve', ar: 'أتعلم وأتحسن', ru: 'Учусь и улучшаюсь' },
      { he: 'מנסה להשתפר', en: 'Try to improve', ar: 'أحاول التحسن', ru: 'Стараюсь улучшиться' },
      { he: 'נעלב', en: 'Get offended', ar: 'أشعر بالإهانة', ru: 'Обижаюсь' },
      { he: 'נמנע', en: 'Avoid it', ar: 'أتجنبه', ru: 'Избегаю' },
    ],
    domain: 'emotional',
  },
  {
    id: 23,
    question: {
      he: 'איך אתה/את מרגיש/ה לגבי פרויקטים ארוכים?',
      en: 'How do you feel about long-term projects?',
      ar: 'كيف تشعر تجاه المشاريع طويلة الأمد؟',
      ru: 'Как ты относишься к долгосрочным проектам?',
    },
    options: [
      { he: 'מתכנן מראש', en: 'Plan ahead', ar: 'أخطط مسبقاً', ru: 'Планирую заранее' },
      { he: 'קשה לי להתמיד', en: 'Hard to persist', ar: 'صعب علي المثابرة', ru: 'Сложно упорствовать' },
      { he: 'דוחה אותם', en: 'Postpone them', ar: 'أؤجلها', ru: 'Откладываю их' },
      { he: 'מתעצבן', en: 'Get frustrated', ar: 'أشعر بالإحباط', ru: 'Раздражаюсь' },
    ],
    domain: 'motivational',
  },
  {
    id: 24,
    question: {
      he: 'איזו סביבה עוזרת לך להתרכז?',
      en: 'What environment helps you concentrate?',
      ar: 'ما البيئة التي تساعدك على التركيز؟',
      ru: 'Какая обстановка помогает тебе концентрироваться?',
    },
    options: [
      { he: 'שקט מוחלט', en: 'Complete silence', ar: 'صمت تام', ru: 'Полная тишина' },
      { he: 'בכיתה מסודרת', en: 'In organized class', ar: 'في صف منظم', ru: 'В организованном классе' },
      { he: 'עם מוזיקה', en: 'With music', ar: 'مع الموسيقى', ru: 'С музыкой' },
      { he: 'אפשרות לתנועה', en: 'Ability to move', ar: 'إمكانية الحركة', ru: 'Возможность двигаться' },
    ],
    domain: 'environmental',
  },
  {
    id: 25,
    question: {
      he: 'מה גורם לך גאווה בלימודים?',
      en: 'What makes you proud in studies?',
      ar: 'ما الذي يجعلك فخوراً في الدراسة؟',
      ru: 'Что делает тебя гордым в учёбе?',
    },
    options: [
      { he: 'ציון גבוה', en: 'High grade', ar: 'درجة عالية', ru: 'Высокая оценка' },
      { he: 'הבנה עמוקה', en: 'Deep understanding', ar: 'فهم عميق', ru: 'Глубокое понимание' },
      { he: 'עזרה לחבר', en: 'Helping a friend', ar: 'مساعدة صديق', ru: 'Помощь другу' },
      { he: 'התגברות על קושי', en: 'Overcoming difficulty', ar: 'التغلب على صعوبة', ru: 'Преодоление трудностей' },
    ],
    domain: 'motivational',
  },
  {
    id: 26,
    question: {
      he: 'איך אתה/את מתארגן/ת ללמידה למבחן?',
      en: 'How do you organize for exam studying?',
      ar: 'كيف تنظم للدراسة للامتحان؟',
      ru: 'Как ты организуешься для подготовки к экзамену?',
    },
    options: [
      { he: 'לוח זמנים מפורט', en: 'Detailed schedule', ar: 'جدول زمني مفصل', ru: 'Подробное расписание' },
      { he: 'חוזר על החומר', en: 'Review material', ar: 'أراجع المادة', ru: 'Повторяю материал' },
      { he: 'מקשיב להקלטות', en: 'Listen to recordings', ar: 'أستمع للتسجيلات', ru: 'Слушаю записи' },
      { he: 'לא מתארגן מראש', en: 'Don\'t organize ahead', ar: 'لا أنظم مسبقاً', ru: 'Не организуюсь заранее' },
    ],
    domain: 'cognitive',
  },
  {
    id: 27,
    question: {
      he: 'כמה זמן אתה/את לומד/ת ברציפות לפני שאתה/את מרגיש/ה עייפות?',
      en: 'How long do you study continuously before feeling tired?',
      ar: 'كم من الوقت تدرس باستمرار قبل أن تشعر بالتعب؟',
      ru: 'Сколько ты учишься непрерывно, прежде чем устаёшь?',
    },
    options: [
      { he: 'עד 30 דקות', en: 'Up to 30 minutes', ar: 'حتى 30 دقيقة', ru: 'До 30 минут' },
      { he: '30–60 דקות', en: '30–60 minutes', ar: '30–60 دقيقة', ru: '30–60 минут' },
      { he: 'שעה–שעתיים', en: 'One to two hours', ar: 'ساعة-ساعتين', ru: 'Один-два часа' },
      { he: 'יותר משעתיים', en: 'More than two hours', ar: 'أكثر من ساعتين', ru: 'Больше двух часов' },
    ],
    domain: 'environmental',
  },
  {
    id: 28,
    question: {
      he: 'איך אתה/את מעדיף/ה לסדר את שולחן הלימוד שלך?',
      en: 'How do you prefer to organize your study desk?',
      ar: 'كيف تفضل تنظيم مكتب الدراسة الخاص بك؟',
      ru: 'Как ты предпочитаешь организовать свой рабочий стол?',
    },
    options: [
      { he: 'מסודר ונטול הסחות', en: 'Organized and distraction-free', ar: 'منظم وخالٍ من الإلهاءات', ru: 'Организованно и без отвлечений' },
      { he: 'יצירתי/צבעוני', en: 'Creative/colorful', ar: 'إبداعي/ملون', ru: 'Творчески/красочно' },
      { he: 'לא משנה לי', en: 'Doesn\'t matter to me', ar: 'لا يهمني', ru: 'Мне всё равно' },
      { he: 'עם מקום לתנועה', en: 'With space to move', ar: 'مع مساحة للحركة', ru: 'С местом для движения' },
    ],
    domain: 'environmental',
  },
];

// Domain labels in all languages
export const DOMAIN_LABELS = {
  cognitive: {
    he: 'קוגניטיבי',
    en: 'Cognitive',
    ar: 'معرفي',
    ru: 'Когнитивный',
  },
  emotional: {
    he: 'רגשי',
    en: 'Emotional',
    ar: 'عاطفي',
    ru: 'Эмоциональный',
  },
  social: {
    he: 'חברתי',
    en: 'Social',
    ar: 'اجتماعي',
    ru: 'Социальный',
  },
  motivational: {
    he: 'מוטיבציה',
    en: 'Motivation',
    ar: 'تحفيزي',
    ru: 'Мотивационный',
  },
  environmental: {
    he: 'סביבתי',
    en: 'Environmental',
    ar: 'بيئي',
    ru: 'Окружающий',
  },
};

export default ASSESSMENT_QUESTIONS;
