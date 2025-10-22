import React, { useState, useEffect, useRef } from 'react';
import { Cookie, X, Settings, Check, Shield, TrendingUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const COOKIE_CONSENT_KEY = 'ishebot-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'ishebot-cookie-preferences';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  advertising: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    functional: true,
    analytics: false,
    marketing: false,
    advertising: false,
  });

  // Focus trap refs
  const bannerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Screen reader announcement
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      setTimeout(() => {
        setShowBanner(true);
        setAnnouncement('תפריט הסכמה לעוגיות נפתח. אנא בחר את העדפות העוגיות שלך.');
      }, 1000);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  // Focus trap effect
  useEffect(() => {
    if (!showBanner && !showSettings) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const activeElement = document.activeElement;
      const containerRef = showSettings ? settingsRef : bannerRef;
      const container = containerRef.current;

      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (backwards)
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (forwards)
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first element when modal opens
    if (showBanner || showSettings) {
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBanner, showSettings]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      advertising: true,
    };
    saveConsent(allAccepted);
    setShowBanner(false);
    setAnnouncement('כל העוגיות אושרו. העדפותיך נשמרו.');
    onAccept?.();
  };

  const handleDeclineAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      advertising: false,
    };
    saveConsent(onlyNecessary);
    setShowBanner(false);
    setAnnouncement('רק עוגיות הכרחיות אושרו. העדפותיך נשמרו.');
    onDecline?.();
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
    setShowBanner(false);
    setAnnouncement('העדפות העוגיות שלך נשמרו בהצלחה.');
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));

    // Apply preferences
    if (!prefs.analytics) {
      console.log('Analytics disabled by user');
    }
    if (!prefs.marketing) {
      console.log('Marketing cookies disabled by user');
    }
    if (!prefs.advertising) {
      console.log('Advertising cookies disabled by user');
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    const newValue = !preferences[key];
    setPreferences(prev => ({
      ...prev,
      [key]: newValue,
    }));
    setAnnouncement(`עוגיות ${getCategoryName(key)} ${newValue ? 'הופעלו' : 'כובו'}`);
  };

  const getCategoryName = (key: keyof CookiePreferences): string => {
    const names = {
      necessary: 'הכרחיות',
      functional: 'פונקציונליות',
      analytics: 'ניתוח',
      marketing: 'שיווק',
      advertising: 'פרסום',
    };
    return names[key];
  };

  const handleClose = () => {
    setShowBanner(false);
    setShowSettings(false);
    setAnnouncement('תפריט עוגיות נסגר.');
  };

  return (
    <>
      {/* Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <AnimatePresence>
        {showBanner && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Cookie Banner */}
            {!showSettings && (
              <motion.div
                ref={bannerRef}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed bottom-0 left-0 right-0 z-[10001] p-4 md:p-6"
                role="dialog"
                aria-labelledby="cookie-banner-title"
                aria-describedby="cookie-banner-description"
              >
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 id="cookie-banner-title" className="text-xl font-bold text-white mb-2">
                          אנחנו משתמשים בעוגיות (Cookies)
                        </h3>
                        <p id="cookie-banner-description" className="text-slate-300 text-sm leading-relaxed">
                          אנחנו משתמשים בעוגיות כדי לשפר את חוויית המשתמש שלך, לשמור על העדפות, לנתח שימוש במערכת ולספק תוכן רלוונטי.
                          העוגיות עוזרות לנו לספק לך שירות טוב יותר ומותאם אישית.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                        aria-label="סגור תפריט עוגיות"
                        title="סגור"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Cookie Types Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-300">הכרחיות</span>
                        </div>
                        <p className="text-xs text-slate-400">תפקוד בסיסי</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-semibold text-blue-300">פונקציונליות</span>
                        </div>
                        <p className="text-xs text-slate-400">שמירת העדפות</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Cookie className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-semibold text-purple-300">ניתוח</span>
                        </div>
                        <p className="text-xs text-slate-400">שיפור מערכת</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-semibold text-orange-300">שיווק</span>
                        </div>
                        <p className="text-xs text-slate-400">תוכן רלוונטי</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-pink-400" />
                          <span className="text-sm font-semibold text-pink-300">פרסום</span>
                        </div>
                        <p className="text-xs text-slate-400">מודעות מותאמות</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        ref={firstFocusableRef}
                        onClick={handleAcceptAll}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
                        aria-label="אשר את כל העוגיות"
                      >
                        <Check className="w-5 h-5" />
                        אישור לכל העוגיות
                      </button>
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setAnnouncement('הגדרות עוגיות מפורטות נפתחו.');
                        }}
                        className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        aria-label="פתח הגדרות עוגיות מפורטות"
                      >
                        <Settings className="w-5 h-5" />
                        התאמה אישית
                      </button>
                      <button
                        ref={lastFocusableRef}
                        onClick={handleDeclineAll}
                        className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                        aria-label="דחה עוגיות אופציונליות"
                      >
                        דחיה
                      </button>
                    </div>

                    {/* Privacy Policy Link */}
                    <div className="mt-4 text-center">
                      <a
                        href="/privacy-policy"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                        aria-label="עבור למדיניות הפרטיות המלאה"
                      >
                        למידע נוסף, קרא את מדיניות הפרטיות שלנו
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                ref={settingsRef}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed inset-4 md:inset-auto md:bottom-4 md:left-4 md:right-4 md:max-w-4xl md:mx-auto z-[10001]"
                role="dialog"
                aria-labelledby="cookie-settings-title"
                aria-describedby="cookie-settings-description"
              >
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden h-full md:h-auto max-h-[90vh] overflow-y-auto">
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 id="cookie-settings-title" className="text-2xl font-bold text-white">הגדרות עוגיות מפורטות</h3>
                      <button
                        onClick={() => {
                          setShowSettings(false);
                          setAnnouncement('הגדרות עוגיות נסגרו. חזרה לתפריט הראשי.');
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="סגור הגדרות ועבור חזרה"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <p id="cookie-settings-description" className="sr-only">
                      התאם אישית את העדפות העוגיות שלך. עוגיות הכרחיות תמיד מופעלות.
                    </p>

                    {/* Cookie Categories */}
                    <div className="space-y-4 mb-6">
                      {/* Necessary Cookies */}
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Shield className="w-5 h-5 text-green-400" aria-hidden="true" />
                              <h4 className="text-lg font-semibold text-white">עוגיות הכרחיות</h4>
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full" aria-label="סטטוס: חובה">
                                חובה
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              עוגיות אלו נדרשות לתפקוד בסיסי של המערכת ואינן ניתנות לכיבוי. הן כוללות:
                              שמירת מצב התחברות, העדפות שפה, והגדרות אבטחה.
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1" role="img" aria-label="מופעל תמיד">
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Functional Cookies */}
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Settings className="w-5 h-5 text-blue-400" aria-hidden="true" />
                              <h4 className="text-lg font-semibold text-white">עוגיות פונקציונליות</h4>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              עוגיות אלו שומרות את ההעדפות שלך (כגון מצב כהה/בהיר, גודל גופן, פילטרים).
                              ללא עוגיות אלו, תצטרך להגדיר את ההעדפות שלך בכל פעם מחדש.
                            </p>
                          </div>
                          <button
                            onClick={() => togglePreference('functional')}
                            className="flex-shrink-0"
                            aria-label={`עוגיות פונקציונליות: ${preferences.functional ? 'מופעל' : 'מכובה'}. לחץ כדי ${preferences.functional ? 'לכבות' : 'להפעיל'}`}
                            role="switch"
                            aria-checked={preferences.functional}
                          >
                            <div
                              className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                                preferences.functional
                                  ? 'bg-blue-500 justify-end'
                                  : 'bg-slate-600 justify-start'
                              } px-1`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Cookie className="w-5 h-5 text-purple-400" aria-hidden="true" />
                              <h4 className="text-lg font-semibold text-white">עוגיות ניתוח</h4>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              עוגיות אלו עוזרות לנו להבין כיצד אתה משתמש במערכת, אילו תכונות שימושיות,
                              ואיפה אפשר לשפר. המידע הוא אנונימי ומשמש רק לשיפור השירות.
                            </p>
                          </div>
                          <button
                            onClick={() => togglePreference('analytics')}
                            className="flex-shrink-0"
                            aria-label={`עוגיות ניתוח: ${preferences.analytics ? 'מופעל' : 'מכובה'}. לחץ כדי ${preferences.analytics ? 'לכבות' : 'להפעיל'}`}
                            role="switch"
                            aria-checked={preferences.analytics}
                          >
                            <div
                              className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                                preferences.analytics
                                  ? 'bg-purple-500 justify-end'
                                  : 'bg-slate-600 justify-start'
                              } px-1`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <TrendingUp className="w-5 h-5 text-orange-400" aria-hidden="true" />
                              <h4 className="text-lg font-semibold text-white">עוגיות שיווק</h4>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              עוגיות אלו עוזרות לנו להציג תוכן רלוונטי ומותאם לצרכי בית הספר שלך.
                              הן מאפשרות לנו להציע תכונות והדרכות שימושיות במיוחד עבורכם.
                            </p>
                          </div>
                          <button
                            onClick={() => togglePreference('marketing')}
                            className="flex-shrink-0"
                            aria-label={`עוגיות שיווק: ${preferences.marketing ? 'מופעל' : 'מכובה'}. לחץ כדי ${preferences.marketing ? 'לכבות' : 'להפעיל'}`}
                            role="switch"
                            aria-checked={preferences.marketing}
                          >
                            <div
                              className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                                preferences.marketing
                                  ? 'bg-orange-500 justify-end'
                                  : 'bg-slate-600 justify-start'
                              } px-1`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Advertising Cookies */}
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Target className="w-5 h-5 text-pink-400" aria-hidden="true" />
                              <h4 className="text-lg font-semibold text-white">עוגיות פרסום</h4>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              עוגיות אלו מאפשרות להציג מודעות רלוונטיות על מוצרים ושירותים חינוכיים
                              שעשויים לעניין אותך. המודעות מותאמות אישית לפי תחומי העניין שלך.
                            </p>
                          </div>
                          <button
                            onClick={() => togglePreference('advertising')}
                            className="flex-shrink-0"
                            aria-label={`עוגיות פרסום: ${preferences.advertising ? 'מופעל' : 'מכובה'}. לחץ כדי ${preferences.advertising ? 'לכבות' : 'להפעיל'}`}
                            role="switch"
                            aria-checked={preferences.advertising}
                          >
                            <div
                              className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                                preferences.advertising
                                  ? 'bg-pink-500 justify-end'
                                  : 'bg-slate-600 justify-start'
                              } px-1`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        ref={firstFocusableRef}
                        onClick={handleSavePreferences}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
                        aria-label="שמור את העדפות העוגיות שבחרת"
                      >
                        שמירת העדפות
                      </button>
                      <button
                        ref={lastFocusableRef}
                        onClick={() => {
                          setShowSettings(false);
                          setAnnouncement('ביטול שינויים. חזרה לתפריט הראשי.');
                        }}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                        aria-label="בטל ועבור חזרה ללא שמירה"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;
