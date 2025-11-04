/**
 * Student Assessment Form - Multi-language Support
 * Supports Hebrew, English, Arabic, Russian with RTL/LTR
 */

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { ASSESSMENT_QUESTIONS, DOMAIN_LABELS, type Language } from '../../data/assessmentQuestions';
import { FORM_TRANSLATIONS, LANGUAGE_NAMES, t } from '../../i18n/formTranslations';
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FormData {
  studentCode: string;
  name: string;
  classId: string;
  answers: Array<{ q: number; a: string }>;
  language: Language;
}

export function StudentAssessmentForm() {
  const [language, setLanguage] = useState<Language>('he');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    studentCode: '',
    name: '',
    classId: '',
    answers: [],
    language: 'he',
  });

  const totalSteps = ASSESSMENT_QUESTIONS.length + 1; // +1 for basic info
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Encouraging messages for different milestones
  const encouragingMessages = {
    25: {
      he: '🌟 כל הכבוד! רבע מהדרך הושלם!',
      en: '🌟 Great job! Quarter of the way done!',
      ar: '🌟 عمل رائع! تم إكمال ربع الطريق!',
      ru: '🌟 Отличная работа! Четверть пути пройдена!'
    },
    50: {
      he: '🎯 מעולה! עברת את חצי הדרך!',
      en: '🎯 Excellent! You\'re halfway there!',
      ar: '🎯 ممتاز! أنت في منتصف الطريق!',
      ru: '🎯 Отлично! Ты на полпути!'
    },
    75: {
      he: '🚀 כמעט סיימת! עוד קצת!',
      en: '🚀 Almost done! Just a bit more!',
      ar: '🚀 أوشكت على الانتهاء! القليل فقط!',
      ru: '🚀 Почти готово! Еще немного!'
    },
    100: {
      he: '🎉 מדהים! סיימת את כל השאלות!',
      en: '🎉 Amazing! You finished all questions!',
      ar: '🎉 رائع! لقد أنهيت جميع الأسئلة!',
      ru: '🎉 Потрясающе! Вы ответили на все вопросы!'
    }
  };

  // RTL languages
  const isRTL = language === 'he' || language === 'ar';
  const dirClass = isRTL ? 'rtl' : 'ltr';

  // Show encouraging messages at milestones
  useEffect(() => {
    const progressRounded = Math.floor(progress);

    // Check if we hit a milestone
    if ([25, 50, 75, 100].includes(progressRounded)) {
      const message = encouragingMessages[progressRounded as keyof typeof encouragingMessages][language];
      setEncouragementMessage(message);
      setShowEncouragement(true);

      // Hide after 2 seconds
      setTimeout(() => {
        setShowEncouragement(false);
      }, 2000);
    }
  }, [progress, language]);

  // Trigger confetti when form is submitted
  useEffect(() => {
    if (submitted) {
      // Celebrate with confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Extra burst after a delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    }
  }, [submitted]);

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setFormData({ ...formData, language: newLang });
  };

  // Handle basic info (step 0)
  const handleBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentCode || !formData.name || !formData.classId) {
      toast.error(t('messages.fillAllFields', language));
      return;
    }
    setCurrentStep(1);
  };

  // Handle answer with auto-advance
  const handleAnswer = (questionId: number, answer: string) => {
    const updatedAnswers = [...formData.answers];
    const existingIndex = updatedAnswers.findIndex(a => a.q === questionId);

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = { q: questionId, a: answer };
    } else {
      updatedAnswers.push({ q: questionId, a: answer });
    }

    setFormData({ ...formData, answers: updatedAnswers });

    // Auto-advance to next question after short delay for visual feedback
    setTimeout(() => {
      if (currentStep < ASSESSMENT_QUESTIONS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }, 300);
  };

  // Get answer for a question
  const getAnswer = (questionId: number): string => {
    return formData.answers.find(a => a.q === questionId)?.a || '';
  };

  // Navigate
  const goNext = () => {
    const currentQuestion = ASSESSMENT_QUESTIONS[currentStep - 1];
    const answer = getAnswer(currentQuestion.id);

    if (!answer.trim()) {
      toast.error(t('messages.answerQuestion', language));
      return;
    }

    if (currentStep < ASSESSMENT_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    // Show thank you page immediately - no loading state for students
    setSubmitted(true);

    // Process in background without waiting
    try {
      // Call Cloud Function in background
      const processStudent = httpsCallable(functions, 'processStudentAssessment');

      processStudent({
        studentCode: formData.studentCode,
        name: formData.name,
        classId: formData.classId,
        answers: formData.answers,
        schoolId: 'ishebott',
        language: language, // Send language to Cloud Function
      }).catch((error: any) => {
        console.error('Background submission error:', error);
        // Silent failure - student already sees thank you page
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      // Silent failure - student already sees thank you page
    }
  };

  // Language Selector Component
  const LanguageSelector = () => (
    <div className="flex items-center gap-2 mb-4">
      <Globe className="w-5 h-5 text-gray-600" />
      <div className="flex gap-2">
        {(['he', 'en', 'ar', 'ru'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              language === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {LANGUAGE_NAMES[lang][lang]}
          </button>
        ))}
      </div>
    </div>
  );

  // Render based on current step
  const renderStep = () => {
    // Step 0: Basic Info
    if (currentStep === 0) {
      return (
        <form onSubmit={handleBasicInfo} className="space-y-6" dir={dirClass}>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('basicInfo.title', language)}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.studentCode', language)} {t('basicInfo.required', language)}
            </label>
            <input
              type="text"
              value={formData.studentCode}
              onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('basicInfo.studentCodePlaceholder', language)}
              required
              maxLength={10}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.studentName', language)} {t('basicInfo.required', language)}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('basicInfo.studentNamePlaceholder', language)}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.classId', language)} {t('basicInfo.required', language)}
            </label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{t('basicInfo.selectClass', language)}</option>
              <option value="ז1">ז1</option>
              <option value="ז2">ז2</option>
              <option value="ז3">ז3</option>
              <option value="ח1">ח1</option>
              <option value="ח2">ח2</option>
              <option value="ח3">ח3</option>
              <option value="ט1">ט1</option>
              <option value="ט2">ט2</option>
              <option value="ט3">ט3</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('buttons.start', language)} {isRTL ? '←' : '→'}
          </button>
        </form>
      );
    }

    // Questions
    const question = ASSESSMENT_QUESTIONS[currentStep - 1];
    const answer = getAnswer(question.id);

    return (
      <div className="space-y-6" dir={dirClass}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              {t('questions.questionOf', language, {
                current: currentStep.toString(),
                total: ASSESSMENT_QUESTIONS.length.toString(),
              })}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {DOMAIN_LABELS[question.domain][language]}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {question.question[language]}
          </h2>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answer === option[language];
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswer(question.id, option[language])}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio-style indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  {/* Option text */}
                  <span className="text-lg font-medium">{option[language]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={goBack}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {isRTL ? '→' : '←'} {t('buttons.back', language)}
          </button>
        </div>
      </div>
    );
  };

  // Thank You Page
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <LanguageSelector />

        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'he' && 'תודה רבה!'}
            {language === 'en' && 'Thank You!'}
            {language === 'ar' && 'شكراً جزيلاً!'}
            {language === 'ru' && 'Спасибо!'}
          </h2>

          <p className="text-lg text-gray-600 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'he' && 'התשובות שלך נשלחו בהצלחה. המורה שלך יקבל ניתוח מפורט.'}
            {language === 'en' && 'Your answers have been submitted successfully. Your teacher will receive a detailed analysis.'}
            {language === 'ar' && 'تم إرسال إجاباتك بنجاح. سيتلقى معلمك تحليلاً مفصلاً.'}
            {language === 'ru' && 'Твои ответы успешно отправлены. Твой учитель получит подробный анализ.'}
          </p>

          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="text-sm text-gray-600 mb-2">
              {language === 'he' && 'פרטי התלמיד'}
              {language === 'en' && 'Student Details'}
              {language === 'ar' && 'تفاصيل الطالب'}
              {language === 'ru' && 'Детали студента'}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formData.name}
            </div>
            <div className="text-sm text-gray-600">
              {language === 'he' && `קוד: ${formData.studentCode} | כיתה: ${formData.classId}`}
              {language === 'en' && `Code: ${formData.studentCode} | Class: ${formData.classId}`}
              {language === 'ar' && `الرمز: ${formData.studentCode} | الصف: ${formData.classId}`}
              {language === 'ru' && `Код: ${formData.studentCode} | Класс: ${formData.classId}`}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                studentCode: '',
                name: '',
                classId: '',
                answers: [],
                language: language,
              });
              setCurrentStep(0);
            }}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {language === 'he' && 'סגור'}
            {language === 'en' && 'Close'}
            {language === 'ar' && 'إغلاق'}
            {language === 'ru' && 'Закрыть'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 relative">
      {/* Language Selector */}
      <LanguageSelector />

      {/* Enhanced Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {language === 'he' && 'התקדמות'}
            {language === 'en' && 'Progress'}
            {language === 'ar' && 'التقدم'}
            {language === 'ru' && 'Прогресс'}
          </span>
          <span className="text-sm font-bold text-blue-600">
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Encouragement Message Overlay */}
      {showEncouragement && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl text-xl font-bold">
            {encouragementMessage}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderStep()}
      </div>

      {/* Student Info Display (when in questions) */}
      {currentStep > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500" dir={dirClass}>
          {t('studentInfo.student', language)}: {formData.name} ({formData.studentCode}) | {t('studentInfo.class', language)}: {formData.classId}
        </div>
      )}
    </div>
  );
}

export default StudentAssessmentForm;
