/**
 * Student Assessment Form - Multi-language Support
 * Supports Hebrew, English, Arabic, Russian with RTL/LTR
 */

import React, { useState, useEffect, useRef } from 'react';
import logger from '../../utils/logger';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { secureFirebaseService } from '../../services/secureFirebaseService';
import { securityManager, SecurityUtils } from '../../security/securityEnhancements';
import { ASSESSMENT_QUESTIONS, DOMAIN_LABELS, type Language } from '../../data/assessmentQuestions';
import { FORM_TRANSLATIONS, LANGUAGE_NAMES, t, getClassName } from '../../i18n/formTranslations';
import toast from 'react-hot-toast';
import { Globe, Wifi, WifiOff, CheckCircle, Shield, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FormData {
  studentCode: string;
  name: string;
  classId: string;
  answers: Array<{ q: number; a: string }>;
  language: Language;
}

interface StudentAssessmentFormProps {
  academicMode?: boolean;
  onLanguageChange?: (language: Language) => void;
}

export function StudentAssessmentForm({ academicMode = false, onLanguageChange }: StudentAssessmentFormProps) {
  const [language, setLanguage] = useState<Language>('he');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [showPrivacyToast, setShowPrivacyToast] = useState(true);

  // Error recovery states
  const [submissionError, setSubmissionError] = useState<{
    type: 'network' | 'server' | 'data' | 'unknown';
    message: string;
    retryCount: number;
  } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [maxRetries] = useState(3);
  const [retryDelay] = useState(2000); // 2 seconds

  const [formData, setFormData] = useState<FormData>({
    studentCode: '',
    name: '',
    classId: '',
    answers: [],
    language: 'he',
  });

  const totalSteps = ASSESSMENT_QUESTIONS.length + 1; // +1 for basic info
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Generate class options for all grades
  const getClassOptions = () => {
    const grades = ['ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב']; // Grades 3-12 in Hebrew
    const options = [];

    grades.forEach(grade => {
      for (let i = 1; i <= 10; i++) {
        const classId = `${grade}${i}`;
        options.push({
          value: classId,
          label: getClassName(classId, language)
        });
      }
    });

    return options;
  };

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

  // Keyboard navigation state
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Enhanced auto-save and recovery states
  const [hasRecoveredData, setHasRecoveredData] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs for accessibility
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Handle specific keys for form navigation
        switch (event.key) {
          case 'Enter':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              // Ctrl+Enter to submit form
              const submitButton = document.querySelector('[data-testid="submit-button"], [data-testid="start-button"]') as HTMLButtonElement;
              if (submitButton && !submitButton.disabled) {
                submitButton.click();
              }
            }
            break;
          case 'Escape':
            // Escape to close privacy modal
            if (showPrivacyToast) {
              setShowPrivacyToast(false);
              event.preventDefault();
            }
            break;
        }
        return;
      }

      // Global keyboard shortcuts when not typing
      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Number keys to select answers when on question pages
          if (currentStep > 0 && currentStep <= ASSESSMENT_QUESTIONS.length) {
            const questionNumber = parseInt(event.key);
            if (questionNumber <= 5) { // Assuming max 5 answers per question
              const answerButton = document.querySelector(`[data-testid="answer-${currentStep}-${questionNumber - 1}"]`) as HTMLButtonElement;
              if (answerButton && !answerButton.disabled) {
                answerButton.click();
                event.preventDefault();
              }
            }
          }
          break;

        case 'ArrowRight':
        case 'ArrowLeft':
          // Arrow keys for navigation between questions
          if (event.ctrlKey || event.metaKey) {
            if (event.key === 'ArrowRight' && currentStep < totalSteps - 1) {
              // Navigate to next step
              event.preventDefault();
              const nextButton = document.querySelector('[data-testid="next-button"], [data-testid="start-button"]') as HTMLButtonElement;
              if (nextButton && !nextButton.disabled) {
                nextButton.click();
              }
            } else if (event.key === 'ArrowLeft' && currentStep > 0) {
              // Navigate to previous step
              event.preventDefault();
              const prevButton = document.querySelector('[data-testid="previous-button"]') as HTMLButtonElement;
              if (prevButton && !prevButton.disabled) {
                prevButton.click();
              }
            }
          }
          break;

        case 'h':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Focus on help/instructions
            const instructions = document.querySelector('[data-testid="form-instructions"]') as HTMLElement;
            if (instructions) {
              instructions.focus();
              instructions.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          break;

        case 'l':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Focus on language selector
            const langSelector = document.querySelector('[data-testid="language-selector"]') as HTMLElement;
            if (langSelector) {
              langSelector.focus();
            }
          }
          break;

        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Skip to submit button
            const submitButton = document.querySelector('[data-testid="submit-button"], [data-testid="start-button"]') as HTMLButtonElement;
            if (submitButton && !submitButton.disabled) {
              submitButton.focus();
              submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          break;

        case '?':
          if (!event.shiftKey) {
            event.preventDefault();
            // Show keyboard shortcuts help
            showKeyboardHelp();
          }
          break;

        case 'Tab':
          // Enhanced tab navigation with trap for modal
          if (showPrivacyToast) {
            const modal = document.querySelector('[data-testid="privacy-modal"]') as HTMLElement;
            if (modal) {
              const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusableElements.length > 0) {
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey) {
                  if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                  }
                } else {
                  if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                  }
                }
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, language, showPrivacyToast, totalSteps]);

  // Keyboard shortcuts help function
  const showKeyboardHelp = () => {
    const shortcuts = [
      { key: '1-5', description: language === 'he' ? 'בחר תשובה' : language === 'en' ? 'Select answer' : language === 'ar' ? 'اختر إجابة' : language === 'ru' ? 'Выбрать ответ' : 'Select answer' },
      { key: 'Ctrl/Cmd + Enter', description: language === 'he' ? 'שלח טופס' : language === 'en' ? 'Submit form' : language === 'ar' ? 'إرسال النموذج' : language === 'ru' ? 'Отправить форму' : 'Submit form' },
      { key: 'Ctrl/Cmd + →', description: language === 'he' ? 'שלב הבא' : language === 'en' ? 'Next step' : language === 'ar' ? 'الخطوة التالية' : language === 'ru' ? 'Следующий шаг' : 'Next step' },
      { key: 'Ctrl/Cmd + ←', description: language === 'he' ? 'שלב אחור' : language === 'en' ? 'Previous step' : language === 'ar' ? 'الخطوة السابقة' : language === 'ru' ? 'Предыдущий шаг' : 'Previous step' },
      { key: 'Ctrl/Cmd + S', description: language === 'he' ? 'עבור לכפתור שליחה' : language === 'en' ? 'Go to submit' : language === 'ar' ? 'الذهاب إلى الإرسال' : language === 'ru' ? 'Перейти к отправке' : 'Go to submit' },
      { key: 'Ctrl/Cmd + L', description: language === 'he' ? 'עבור לבחירת שפה' : language === 'en' ? 'Go to language' : language === 'ar' ? 'الذهاب إلى اللغة' : language === 'ru' ? 'Перейти к языку' : 'Go to language' },
      { key: 'Ctrl/Cmd + H', description: language === 'he' ? 'עזרה' : language === 'en' ? 'Help' : language === 'ar' ? 'مساعدة' : language === 'ru' ? 'Помощь' : 'Help' },
      { key: 'Esc', description: language === 'he' ? 'סגור חלון פרטיות' : language === 'en' ? 'Close privacy' : language === 'ar' ? 'إغلاق الخصوصية' : language === 'ru' ? 'Закрыть приватность' : 'Close privacy' },
      { key: '?', description: language === 'he' ? 'הצג קיצורים מקלדת' : language === 'en' ? 'Show shortcuts' : language === 'ar' ? 'عرض الاختصارات' : language === 'ru' ? 'Показать сочетания' : 'Show shortcuts' },
      { key: 'Tab', description: language === 'he' ? 'ניווט בין אלמנטים' : language === 'en' ? 'Navigate elements' : language === 'ar' ? 'التنقل بين العناصر' : language === 'ru' ? 'Навигация по элементам' : 'Navigate elements' },
    ];

    const helpMessage = shortcuts.map(s => `${s.key}: ${s.description}`).join('\n');

    toast(helpMessage, {
      duration: 8000,
      icon: '⌨️',
      style: {
        whiteSpace: 'pre-line',
        textAlign: 'left',
        fontFamily: 'monospace',
        fontSize: '12px'
      }
    });
  };

  // Focus management for form sections
  const focusFirstInput = () => {
    const firstInput = document.querySelector('input, select, textarea, button') as HTMLElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  // Auto-focus first input when component mounts
  useEffect(() => {
    setTimeout(focusFirstInput, 100);
  }, []);

  // Focus trap for privacy modal
  useEffect(() => {
    if (showPrivacyToast) {
      const modal = document.querySelector('[data-testid="privacy-modal"]') as HTMLElement;
      if (modal) {
        const firstFocusable = modal.querySelector('button') as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }
  }, [showPrivacyToast]);

  // Prevent scrolling within the form container
  useEffect(() => {
    // Hide scrollbars and prevent scrolling within the form
    const style = document.createElement('style');
    style.textContent = `
      *[data-testid="assessment-form"]::-webkit-scrollbar { display: none !important; }
      *[data-testid="assessment-form"] { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      *[data-testid="assessment-form"] * { overflow: hidden !important; }
    `;
    document.head.appendChild(style);

    // Auto-hide privacy toast after 5 seconds
    if (showPrivacyToast) {
      const timer = setTimeout(() => {
        setShowPrivacyToast(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      // Cleanup style element when component unmounts
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [showPrivacyToast]);

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

  // Offline detection and localStorage management
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingSubmissions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error(t('messages.offlineMode', language), { duration: 3000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load saved form data on mount
    loadSavedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save form data to localStorage
  useEffect(() => {
    if (!submitted) {
      saveFormData();
    }
  }, [formData, currentStep, language]);

  // Enhanced load saved data with intelligent recovery detection
  const loadSavedData = () => {
    try {
      // Check for any saved data
      const savedData = localStorage.getItem('assessmentFormData');
      const savedStep = localStorage.getItem('assessmentCurrentStep');
      const savedLanguage = localStorage.getItem('assessmentLanguage');
      const savedPending = localStorage.getItem('pendingSubmissions');
      const lastSave = localStorage.getItem('assessmentLastSave');

      // Try sessionStorage backup if localStorage is empty
      const sessionBackup = sessionStorage.getItem('assessmentBackup');

      if (!savedData && !sessionBackup) {
        return; // No saved data found
      }

      let dataToLoad = null;
      let dataSource = 'localStorage';

      // Parse the saved data
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);

          // Check if it's the new format with metadata or old format
          if (parsed.formData) {
            // New format with metadata
            dataToLoad = parsed;

            // Check if the data is recent and valid
            const saveAge = Date.now() - (parsed.timestamp || 0);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            if (saveAge > maxAge) {
              logger.log('Saved data is too old, ignoring');
              localStorage.removeItem('assessmentFormData');
              localStorage.removeItem('assessmentLastSave');
              return;
            }
          } else {
            // Old format - wrap it
            dataToLoad = {
              formData: parsed,
              currentStep: savedStep ? parseInt(savedStep) : 0,
              language: savedLanguage || 'he',
              timestamp: lastSave ? parseInt(lastSave) : Date.now()
            };
          }
        } catch (parseError) {
          logger.error('Error parsing saved data:', parseError);
          dataToLoad = null;
        }
      }

      // Fallback to sessionStorage backup
      if (!dataToLoad && sessionBackup) {
        try {
          dataToLoad = {
            formData: JSON.parse(sessionBackup),
            currentStep: 0,
            language: 'he',
            timestamp: Date.now()
          };
          dataSource = 'sessionStorage';
        } catch (sessionParseError) {
          logger.error('Error parsing session backup:', sessionParseError);
        }
      }

      if (!dataToLoad) {
        logger.log('No valid saved data found');
        return;
      }

      // Validate and load the data
      if (dataToLoad.formData && dataToLoad.formData.studentCode) {
        setFormData(dataToLoad.formData);

        if (dataToLoad.currentStep !== undefined) {
          setCurrentStep(dataToLoad.currentStep);
        }

        if (dataToLoad.language) {
          setLanguage(dataToLoad.language as Language);
          if (onLanguageChange) {
            onLanguageChange(dataToLoad.language as Language);
          }
        }

        if (savedPending) {
          const pending = JSON.parse(savedPending);
          setPendingSubmissions(pending);
        }

        // Set recovery flag and show prompt if we have meaningful progress
        const hasProgress = dataToLoad.formData.studentCode ||
                           dataToLoad.formData.name ||
                           dataToLoad.currentStep > 0;

        if (hasProgress) {
          setHasRecoveredData(true);

          // Only show recovery prompt if there's significant progress
          const shouldShowPrompt = dataToLoad.currentStep > 0 ||
                                  (dataToLoad.formData.studentCode && dataToLoad.formData.name);

          if (shouldShowPrompt) {
            setTimeout(() => {
              setShowRecoveryPrompt(true);
            }, 1000);
          }

          // Show recovery notification
          const timeAgo = formatTimeAgo(dataToLoad.timestamp || Date.now());
          toast.success(t('messages.recoverySuccess', language).replace('{{time}}', timeAgo), {
            duration: 5000,
            icon: '🔄'
          });
        }

        logger.log(`Recovered data from ${dataSource}`);
      }
    } catch (error) {
      logger.error('Error loading saved data:', error);
      // Don't show error to user on initial load, just log it
    }
  };

  // Format time ago for recovery messages
  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'he' ? 'כעת' : 'just now';
    if (minutes < 60) return `${minutes} ${language === 'he' ? 'דקות' : language === 'ar' ? 'دقائق' : language === 'ru' ? 'минут' : 'minutes'}`;
    if (hours < 24) return `${hours} ${language === 'he' ? 'שעות' : language === 'ar' ? 'ساعات' : language === 'ru' ? 'часов' : 'hours'}`;
    return `${days} ${language === 'he' ? 'ימים' : language === 'ar' ? 'أيام' : language === 'ru' ? 'дней' : 'days'}`;
  };

  // Enhanced save form data to localStorage with crash recovery
  const saveFormData = async () => {
    if (submitted) return;

    try {
      setAutoSaveStatus('saving');
      setSaveError(null);

      // Create comprehensive save data
      const saveData = {
        formData,
        currentStep,
        language,
        pendingSubmissions,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        sessionId: generateSessionId()
      };

      // Save to localStorage with metadata
      localStorage.setItem('assessmentFormData', JSON.stringify(saveData));
      localStorage.setItem('assessmentLastSave', Date.now().toString());
      localStorage.setItem('assessmentCurrentStep', currentStep.toString());
      localStorage.setItem('assessmentLanguage', language);
      localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));

      setLastSaveTime(Date.now());
      setAutoSaveStatus('saved');

      // Clear saved status after 2 seconds
      setTimeout(() => {
        if (autoSaveStatus === 'saved') {
          setAutoSaveStatus('idle');
        }
      }, 2000);

    } catch (error) {
      logger.error('Error saving form data:', error);
      setAutoSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Unknown save error');

      // Try to save to sessionStorage as backup
      try {
        sessionStorage.setItem('assessmentBackup', JSON.stringify({
          formData,
          currentStep,
          language,
          timestamp: Date.now()
        }));
      } catch (sessionError) {
        logger.error('SessionStorage backup also failed:', sessionError);
      }
    }
  };

  // Generate unique session ID for tracking
  const generateSessionId = (): string => {
    const existing = sessionStorage.getItem('assessmentSessionId');
    if (existing) return existing;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('assessmentSessionId', sessionId);
    return sessionId;
  };

  // Handle recovery prompt actions
  const handleRecoveryAction = (action: 'continue' | 'discard') => {
    setShowRecoveryPrompt(false);

    if (action === 'discard') {
      // Clear all saved data
      clearSavedData();

      // Reset form
      setFormData({
        studentCode: '',
        name: '',
        classId: '',
        answers: [],
        language: 'he',
      });
      setCurrentStep(0);
      setLanguage('he');
      setHasRecoveredData(false);

      toast.success(t('messages.recoveryDiscarded', language), {
        duration: 3000,
        icon: '🗑️'
      });
    }
    // If 'continue', just close the prompt - data is already loaded
  };

  // Clear all saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem('assessmentFormData');
      localStorage.removeItem('assessmentLastSave');
      localStorage.removeItem('assessmentCurrentStep');
      localStorage.removeItem('assessmentLanguage');
      localStorage.removeItem('pendingSubmissions');
      sessionStorage.removeItem('assessmentBackup');
      sessionStorage.removeItem('assessmentSessionId');
    } catch (error) {
      logger.error('Error clearing saved data:', error);
    }
  };

  // Browser crash detection using beforeunload and pagehide
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if there's unsaved progress
      if (!submitted && (currentStep > 0 || formData.studentCode || formData.name)) {
        event.preventDefault();
        event.returnValue = t('messages.unsavedChangesWarning', language);
        return event.returnValue;
      }
    };

    const handlePageHide = () => {
      // Save data before page unloads (crashes, navigation, etc.)
      if (!submitted) {
        saveFormData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [currentStep, formData, submitted, language]);

  // Sync pending submissions when back online
  const syncPendingSubmissions = async () => {
    if (pendingSubmissions.length === 0) return;

    setSyncStatus('syncing');
    toast.success(t('messages.syncingData', language), { duration: 3000 });

    try {
      if (!functions) {
        throw new Error('Firebase functions not available');
      }

      const processStudent = httpsCallable(functions, 'processStudentAssessment');
      const failedSubmissions = [];

      for (const submission of pendingSubmissions) {
        try {
          await processStudent(submission);
        } catch (error) {
          failedSubmissions.push(submission);
        }
      }

      if (failedSubmissions.length === 0) {
        // All submissions successful
        setPendingSubmissions([]);
        localStorage.setItem('pendingSubmissions', '[]');
        setSyncStatus('synced');
        toast.success(t('messages.dataSynced', language), { duration: 3000 });
      } else {
        // Some submissions failed
        setPendingSubmissions(failedSubmissions);
        localStorage.setItem('pendingSubmissions', JSON.stringify(failedSubmissions));
        setSyncStatus('error');
        toast.error(t('messages.someSyncFailed', language), { duration: 5000 });
      }
    } catch (error) {
      logger.error('Sync error:', error);
      setSyncStatus('error');
      toast.error(t('messages.syncFailed', language), { duration: 5000 });
    }

    // Reset sync status after a delay
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  
  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setFormData({ ...formData, language: newLang });
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
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
  const submitWithRetry = async (submissionData: any, attempt: number = 1): Promise<void> => {
    try {
      // Check if functions is available
      if (!functions) {
        throw new Error('Firebase functions not available');
      }

      // Call Cloud Function
      const processStudent = httpsCallable(functions, 'processStudentAssessment');
      await processStudent(submissionData);

      // Clear any existing error state
      setSubmissionError(null);
      setIsRetrying(false);

      // Success - show success toast
      toast.success(t('messages.submissionSuccess', language), { duration: 3000 });

    } catch (error: any) {
      logger.error(`Submission attempt ${attempt} failed:`, error);

      // Determine error type
      let errorType: 'network' | 'server' | 'data' | 'unknown' = 'unknown';
      let errorMessage = t('errorRecovery.serverError', language);

      if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'unavailable') {
        errorType = 'network';
        errorMessage = t('errorRecovery.networkError', language);
      } else if (error.code === 'internal' || error.code === 'resource-exhausted') {
        errorType = 'server';
        errorMessage = t('errorRecovery.serverError', language);
      } else if (error.code === 'invalid-argument' || error.code === 'data-loss') {
        errorType = 'data';
        errorMessage = t('errorRecovery.dataCorrupted', language);
      }

      // If we haven't reached max retries, try again
      if (attempt < maxRetries && errorType !== 'data') {
        setSubmissionError({
          type: errorType,
          message: errorMessage,
          retryCount: attempt
        });

        // Show retry message
        toast(t('errorRecovery.automaticRetry', language), {
          duration: 2000,
          icon: '🔄'
        });

        // Exponential backoff: wait longer between retries
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        return submitWithRetry(submissionData, attempt + 1);
      }

      // Max retries reached or data error - save for later and show error
      setSubmissionError({
        type: errorType,
        message: errorMessage,
        retryCount: attempt
      });

      // Save submission for later sync
      const newPending = [...pendingSubmissions, { ...submissionData, error: error.message }];
      setPendingSubmissions(newPending);
      localStorage.setItem('pendingSubmissions', JSON.stringify(newPending));

      // Show error message with recovery options
      toast.error(`${t('errorRecovery.submissionFailed', language)}: ${errorMessage}`, {
        duration: 6000,
        icon: '⚠️'
      });

      // Let user know data is saved
      toast.success(t('errorRecovery.dataSaved', language), {
        duration: 4000,
        icon: '💾'
      });

      throw error;
    }
  };

  const handleSubmit = async () => {
    // Don't submit if already retrying
    if (isRetrying) return;

    try {
      setLoading(true);
      setSubmissionError(null);

      // Security validation before submission
      if (!SecurityUtils.validateInput(formData.studentCode) ||
          !SecurityUtils.validateInput(formData.name) ||
          !SecurityUtils.validateInput(formData.classId)) {
        toast.error(t('messages.validationError', language), { duration: 4000 });
        return;
      }

      // Show thank you page immediately for better UX
      setSubmitted(true);

      // Clear saved data since form is complete
      clearSavedData();

      // Prepare secure submission data
      const submissionData = {
        studentCode: SecurityUtils.sanitizeInput(formData.studentCode),
        name: SecurityUtils.sanitizeInput(formData.name),
        classId: SecurityUtils.sanitizeInput(formData.classId),
        answers: formData.answers,
        schoolId: 'ishebott',
        language: language,
        timestamp: new Date().toISOString(),
        browserFingerprint: securityManager.generateFingerprint(),
        sessionId: securityManager.generateCSRFToken()
      };

      // Handle online submission with secure Firebase service
      if (isOnline) {
        setIsRetrying(true);

        // Submit securely with validation
        const result = await secureFirebaseService.submitAssessment(submissionData);

        if (result.success) {
          // Success - celebrate!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          toast.success(t('messages.submissionSuccess', language), {
            duration: 4000,
            icon: '🎉'
          });
        } else {
          // Handle submission failure
          setSubmissionError({
            message: result.error || t('messages.submissionFailed', language),
            type: 'submission',
            retryCount: 0,
            timestamp: new Date()
          });

          toast.error(result.error || t('messages.submissionFailed', language), {
            duration: 6000,
            icon: '⚠️'
          });
        }
      } else {
        // Offline - save for later sync (existing logic)
        const newPending = [...pendingSubmissions, submissionData];
        setPendingSubmissions(newPending);
        localStorage.setItem('pendingSubmissions', JSON.stringify(newPending));

        toast.success(t('messages.savedOffline', language), { duration: 3000 });
      }

    } catch (error) {
      logger.error('Secure submission failed:', error);

      // Handle unexpected errors
      setSubmissionError({
        message: t('messages.unexpectedError', language),
        type: 'unexpected',
        retryCount: 0,
        timestamp: new Date()
      });

      toast.error(t('messages.unexpectedError', language), {
        duration: 5000,
        icon: '🚨'
      });
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Manual retry function
  const handleRetry = async () => {
    if (!submissionError || isRetrying) return;

    try {
      setIsRetrying(true);
      setSubmissionError(null);

      // Get the last failed submission from pending
      const lastSubmission = pendingSubmissions[pendingSubmissions.length - 1];
      if (lastSubmission) {
        // Remove error property before retrying
        const cleanData = { ...lastSubmission };
        delete cleanData.error;

        await submitWithRetry(cleanData, submissionError.retryCount + 1);
      }

    } catch (error) {
      logger.error('Manual retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setSubmissionError(null);
    setIsRetrying(false);
  };

  // Language Selector Component
  const LanguageSelector = () => (
    <div className="flex items-center gap-2 mb-4" data-testid="language-selector" role="group" aria-label={language === 'he' ? 'בחירת שפה' : language === 'en' ? 'Select language' : language === 'ar' ? 'اختيار اللغة' : language === 'ru' ? 'Выбрать язык' : 'Select language'}>
      <Globe className="w-5 h-5 text-gray-600" aria-hidden="true" />
      <div className="flex gap-2" role="radiogroup" aria-label={language === 'he' ? 'שפות זמינה' : language === 'en' ? 'Available languages' : language === 'ar' ? 'اللغات المتاحة' : language === 'ru' ? 'Доступные языки' : 'Available languages'}>
        {(['he', 'en', 'ar', 'ru'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              language === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            data-testid={`language-${lang}`}
            role="radio"
            aria-checked={language === lang}
            aria-label={`${LANGUAGE_NAMES[lang][lang]} ${language === lang ? (language === 'he' ? '(נבחר)' : language === 'en' ? '(selected)' : language === 'ar' ? '(محدد)' : language === 'ru' ? '(выбрано)' : '(selected)') : ''}`}
            tabIndex={0}
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
        <form onSubmit={handleBasicInfo} className="space-y-6" dir={dirClass} data-testid="form-instructions">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" id="form-title">
            {t('basicInfo.title', language)}
          </h2>
          <p className="text-sm text-gray-600" id="form-description">
            {language === 'he' && '✏️ מלא את הפרטים שלך מטה כדי להתחיל'}
            {language === 'en' && '✏️ Fill in your information below to get started'}
            {language === 'ar' && '✏️ املأ معلوماتك أدناه للبدء'}
            {language === 'ru' && '✏️ Заполните свою информацию ниже, чтобы начать'}
          </p>

          <div>
            <label htmlFor="studentCode" className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.studentCode', language)} {t('basicInfo.required', language)}
            </label>
            <input
              id="studentCode"
              name="studentCode"
              type="text"
              data-testid="student-code"
              value={formData.studentCode}
              onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              placeholder={
              language === 'he' ? 'הכנס את הקוד שלך' :
              language === 'en' ? 'Enter your student code' :
              language === 'ar' ? 'أدخل كود الطالب الخاص بك' :
              'Введите ваш код студента'
            }
              required
              maxLength={10}
              dir="ltr"
              autoComplete="off"
              aria-required="true"
              aria-invalid={!formData.studentCode}
              aria-describedby="studentCode-help"
              tabIndex={0}
            />
            <span id="studentCode-help" className="text-xs text-gray-500 mt-1 hidden" aria-live="polite">
              {language === 'he' ? 'קוד תלמיד ספרתי' : language === 'en' ? 'Enter 5-10 digit code' : language === 'ar' ? 'أدخل رمز من 5-10 أرقام' : language === 'ru' ? 'Введите 5-10 значный код' : 'Enter 5-10 digit code'}
            </span>
          </div>

          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.studentName', language)} {t('basicInfo.required', language)}
            </label>
            <input
              id="studentName"
              name="name"
              type="text"
              data-testid="student-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              placeholder={
              language === 'he' ? 'כתוב את השם המלא שלך כאן' :
              language === 'en' ? 'Write your full name here' :
              language === 'ar' ? 'اكتب اسمك الكامل هنا' :
              'Напишите свое полное имя здесь'
            }
              required
              maxLength={100}
              autoComplete="name"
              aria-required="true"
              aria-invalid={!formData.name}
              aria-describedby="studentName-help"
              tabIndex={0}
            />
            <span id="studentName-help" className="text-xs text-gray-500 mt-1 hidden" aria-live="polite">
              {language === 'he' ? 'הזן את שמך המלא' : language === 'en' ? 'Enter your full name as it appears in school records' : language === 'ar' ? 'أدخل اسمك الكامل كما يظهر في السجلات المدرسية' : language === 'ru' ? 'Введите свое полное имя, как оно указано в школьных записях' : 'Enter your full name as it appears in school records'}
            </span>
          </div>

          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
              {t('basicInfo.classId', language)} {t('basicInfo.required', language)}
            </label>
            <select
              id="classId"
              name="classId"
              data-testid="class-id"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              required
              autoComplete="off"
              aria-required="true"
              aria-invalid={!formData.classId}
              aria-label={t('basicInfo.classId', language)}
              tabIndex={0}
            >
              <option value="">{t('basicInfo.selectClass', language)}</option>
              {getClassOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="start-button-super"
            data-testid="start-button"
          >
            <span>{t('buttons.start', language)}</span>
            <span className="arrow">{isRTL ? '←' : '→'}</span>
          </button>
        </form>
      );
    }

    // Questions
    const question = ASSESSMENT_QUESTIONS[currentStep - 1];
    const answer = getAnswer(question.id);

    return (
      <div className="space-y-6" dir={dirClass} data-testid={`question-${question.id}`}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500" data-testid="current-step">
              {t('questions.questionOf', language, {
                current: (currentStep + 1).toString(),
                total: ASSESSMENT_QUESTIONS.length.toString(),
              })}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {DOMAIN_LABELS[question.domain][language]}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {question.question[language]}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'he' && '📝 קרא את השאלה ובחר את התשובה הטובה ביותר מתחת'}
            {language === 'en' && '📝 Read the question and choose the best answer below'}
            {language === 'ar' && '📝 اقرأ السؤال واختر أفضل إجابة أدناه'}
            {language === 'ru' && '📝 Прочитайте вопрос и выберите лучший ответ ниже'}
          </p>
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
                data-testid={`answer-${question.id}-${index}`}
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

        {/* Submit button for final question */}
        {currentStep === ASSESSMENT_QUESTIONS.length && (
          <div className="mt-6">
            <button
              ref={submitButtonRef}
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              aria-label={t('buttons.submit', language)}
              aria-describedby={loading ? 'submit-status' : undefined}
              aria-busy={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center min-h-[52px] leading-relaxed"
              data-testid="submit-button"
            >
              {language === 'he' && 'שלח תשובות'}
              {language === 'en' && 'Submit Answers'}
              {language === 'ar' && 'إرسال الإجابات'}
              {language === 'ru' && 'Отправить ответы'}
            </button>
          </div>
        )}

        {/* Back button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={goBack}
            aria-label={t('buttons.back', language)}
            className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center gap-2 min-h-[52px] leading-relaxed"
          >
            <span className="flex-shrink-0">{isRTL ? '→' : '←'}</span>
            <span>{t('buttons.back', language)}</span>
          </button>
        </div>
      </div>
    );
  };

  // Thank You Page
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6" data-testid="thank-you-page">
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
    <div
      className="w-full h-full overflow-hidden flex flex-col"
      data-testid="assessment-form"
      style={{
        overflow: 'hidden',
        touchAction: 'none',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {/* Language Selector */}
      <LanguageSelector />

      {/* Privacy Popup Modal */}
      {!submitted && showPrivacyToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

          {/* Popup content */}
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-blue-200">
            {/* Close button */}
            <button
              onClick={() => setShowPrivacyToast(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close privacy statement"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {language === 'he' && 'פרטיות וסודיות'}
                  {language === 'en' && 'Privacy & Confidentiality'}
                  {language === 'ar' && 'الخصوصية والسرية'}
                  {language === 'ru' && 'Конфиденциальность и приватность'}
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed mb-4">
                  {language === 'he' && 'התשובות שלך נשמרות באופן מאובטח וסודי. רק המורה שלך יכולה לראות את הניתוח האישי שלך, והמידע משמש אך ורק לצורכי למידה ושיפור אישי.'}
                  {language === 'en' && 'Your answers are securely stored and completely confidential. Only your teacher can view your personal analysis, and the information is used solely for learning and personal improvement purposes.'}
                  {language === 'ar' && 'يتم حفظ إجاباتك بشكل آمن وسري. فقط معلمك يمكنه رؤية تحليلك الشخصي، والمعلومات تستخدم فقط لأغراض التعلم والتحسين الشخصي.'}
                  {language === 'ru' && 'Ваши ответы надежно хранятся и полностью конфиденциальны. Только ваш учитель может просматривать ваш личный анализ, и информация используется исключительно в целях обучения и личного совершенствования.'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      {language === 'he' && 'הצפנה'}
                      {language === 'en' && 'Encrypted'}
                      {language === 'ar' && 'مشفرة'}
                      {language === 'ru' && 'Зашифровано'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      {language === 'he' && 'פרטי'}
                      {language === 'en' && 'Private'}
                      {language === 'ar' && 'خاص'}
                      {language === 'ru' && 'Приватно'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-xs text-gray-500 text-center">
                    {language === 'he' && 'חלון זה ייסגר אוטומטית אחר 5 שניות'}
                    {language === 'en' && 'This window will close automatically in 5 seconds'}
                    {language === 'ar' && 'سيتم إغلاق هذه النافذة تلقائيًا بعد 5 ثوانٍ'}
                    {language === 'ru' && 'Это окно закроется автоматически через 5 секунд'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 overflow-hidden">
        {/* Main Form Content */}
        <div className="flex-1 w-full flex flex-col overflow-hidden min-h-0">
          {/* Enhanced Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {language === 'he' && 'התקדמות'}
                {language === 'en' && 'Progress'}
                {language === 'ar' && 'التقدم'}
                {language === 'ru' && 'Прогресс'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-600">
                {Math.floor(progress)}%
              </span>
            </div>
            <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

  
          {/* Recovery Prompt Modal */}
          {showRecoveryPrompt && !submitted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="recovery-title">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={() => setShowRecoveryPrompt(false)}
                aria-label="Close recovery prompt"
              ></div>

              {/* Modal Content */}
              <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h3 id="recovery-title" className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'he' ? 'נתונים שוחזרו' : language === 'en' ? 'Data Recovered' : language === 'ar' ? 'تم استعادة البيانات' : language === 'ru' ? 'Данные восстановлены' : 'Data Recovered'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'he'
                      ? 'מצאנו את התקדמות שלך מהפעם האחרון. האם תרצה להמשיך מאיפה שעצרת?'
                      : language === 'en'
                      ? 'We found your progress from the last session. Would you like to continue where you left off?'
                      : language === 'ar'
                      ? 'وجدنا تقدمك من الجلسة السابقة. هل تريد المتابعة من حيث توقفت؟'
                      : language === 'ru'
                      ? 'Мы нашли ваш прогресс с прошлого сеанса. Хотите продолжить с того места, где остановились?'
                      : 'We found your progress from the last session. Would you like to continue where you left off?'
                    }
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRecoveryAction('continue')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap text-ellipsis overflow-hidden min-h-10"
                  >
                    {language === 'he' ? 'המשך' : language === 'en' ? 'Continue' : language === 'ar' ? 'متابعة' : language === 'ru' ? 'Продолжить' : 'Continue'}
                  </button>
                  <button
                    onClick={() => handleRecoveryAction('discard')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 whitespace-nowrap text-ellipsis overflow-hidden min-h-10"
                  >
                    {language === 'he' ? 'התחל מחדש' : language === 'en' ? 'Start Over' : language === 'ar' ? 'ابدأ من جديد' : language === 'ru' ? 'Начать заново' : 'Start Over'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Encouragement Message Overlay */}
          {showEncouragement && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce px-2 sm:px-4">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-full shadow-2xl text-sm sm:text-xl font-bold">
                {encouragementMessage}
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 flex-1 overflow-hidden">
            {renderStep()}
          </div>

          {/* Save Status Indicator */}
          {hasRecoveredData && !submitted && (
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium" role="status" aria-live="polite">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>{language === 'he' ? 'נתונים שוחזרו' : language === 'en' ? 'Data recovered' : language === 'ar' ? 'تم استعادة البيانات' : language === 'ru' ? 'Данные восстановлены' : 'Data recovered'}</span>
              </div>
            </div>
          )}

          {/* Auto-save Status */}
          {!submitted && (
            <div className="flex items-center justify-center mb-2 opacity-60">
              <span className="text-xs text-gray-500">
                {language === 'he' && `נשמר לאחרון: ${formatTimeAgo(lastSaveTime)}`}
                {language === 'en' && `Last saved: ${formatTimeAgo(lastSaveTime)}`}
                {language === 'ar' && `آخر حفظ: ${formatTimeAgo(lastSaveTime)}`}
                {language === 'ru' && `Последнее сохранение: ${formatTimeAgo(lastSaveTime)}`}
              </span>
            </div>
          )}

          
          {/* Error Recovery UI */}
          {submissionError && (
            <div
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
              aria-live="polite"
              aria-labelledby="error-title"
              aria-describedby="error-description"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center" aria-hidden="true">
                    <span className="text-red-600 text-sm">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4
                    id="error-title"
                    className="text-sm font-medium text-red-800 mb-1"
                  >
                    {t('errorRecovery.submissionFailed', language)}
                  </h4>
                  <p
                    id="error-description"
                    className="text-xs text-red-700 mb-3"
                  >
                    {submissionError.message}
                  </p>
                  {submissionError.retryCount < maxRetries && (
                    <p className="text-xs text-red-600 mb-3" aria-live="polite">
                      {t('errorRecovery.retryCount', language)
                        .replace('{{count}}', submissionError.retryCount.toString())
                        .replace('{{max}}', maxRetries.toString())}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2" role="group" aria-label="Error recovery actions">
                    {!isRetrying && submissionError.type !== 'data' && (
                      <button
                        onClick={handleRetry}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                        disabled={isRetrying}
                        aria-label={t('errorRecovery.tryAgain', language)}
                        aria-busy={isRetrying}
                      >
                        {isRetrying ? (
                          <>
                            <div className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            {t('errorRecovery.automaticRetry', language)}
                          </>
                        ) : (
                          t('errorRecovery.tryAgain', language)
                        )}
                      </button>
                    )}
                    <button
                      onClick={clearError}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                      aria-label={t('errorRecovery.retryLater', language)}
                    >
                      {t('errorRecovery.retryLater', language)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Info Display (when in questions) */}
          {currentStep > 0 && (
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500" dir={dirClass}>
              <span className="block sm:hidden">
                {formData.name} ({formData.studentCode})
              </span>
              <span className="hidden sm:block">
                {t('studentInfo.student', language)}: {formData.name} ({formData.studentCode}) | {t('studentInfo.class', language)}: {formData.classId}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StudentAssessmentForm;
