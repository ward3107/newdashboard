import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Plus,
  Minus,
  Contrast,
  Eye,
  Moon,
  Sun,
  Type,
  Keyboard,
  X,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number; // 100 = normal, 120 = large, 140 = extra large
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  keyboardNav: boolean;
}

const ACCESSIBILITY_KEY = 'ishebot-accessibility-settings';

const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
    keyboardNav: true,
  });
  const [announcement, setAnnouncement] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Refs for focus trap
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem(ACCESSIBILITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setAnnouncement('תפריט נגישות נסגר.');
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first element when panel opens
    setTimeout(() => firstFocusableRef.current?.focus(), 100);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply font size
    root.style.fontSize = `${newSettings.fontSize}%`;

    // Apply high contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply keyboard navigation
    if (newSettings.keyboardNav) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
    message?: string
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(newSettings));
    if (message) {
      setAnnouncement(message);
    }
  };

  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 10, 150);
    updateSetting('fontSize', newSize, `גודל גופן הוגדל ל-${newSize} אחוז`);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 10, 80);
    updateSetting('fontSize', newSize, `גודל גופן הוקטן ל-${newSize} אחוז`);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      darkMode: false,
      reducedMotion: false,
      keyboardNav: true,
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(defaultSettings));
    setAnnouncement('הגדרות נגישות אופסו לברירת מחדל.');
  };

  const tooltips = {
    fontSize: 'שנה את גודל הטקסט באתר. טווח: 80% - 150%',
    highContrast: 'הגבר את הניגודיות לשיפור הקריאות. מומלץ לאנשים עם קשיי ראייה.',
    darkMode: 'החלף בין מצב בהיר לכהה. מצב כהה מפחית עייפות עיניים.',
    reducedMotion: 'הפחת או בטל אנימציות. מומלץ לאנשים עם רגישות לתנועה.',
    keyboardNav: 'הדגש אלמנטים בעת שימוש במקלדת. מאפשר ניווט ב-Tab.',
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

      {/* Floating Button with Tooltip */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          onClick={() => {
            setIsOpen(!isOpen);
            setAnnouncement(isOpen ? 'תפריט נגישות נסגר.' : 'תפריט נגישות נפתח.');
          }}
          onMouseEnter={() => setShowTooltip('main')}
          onMouseLeave={() => setShowTooltip(null)}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center group relative"
          aria-label="פתח תפריט נגישות"
          aria-expanded={isOpen}
          title="נגישות"
        >
          <Accessibility className="w-6 h-6 group-hover:scale-110 transition-transform" />

          {/* Tooltip */}
          {showTooltip === 'main' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap"
            >
              הגדרות נגישות
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full w-2 h-2 bg-slate-900 rotate-45" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setAnnouncement('תפריט נגישות נסגר.');
              }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-6 bottom-24 z-50 w-80 max-w-[calc(100vw-3rem)]"
              role="dialog"
              aria-labelledby="accessibility-title"
              aria-describedby="accessibility-description"
            >
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Accessibility className="w-6 h-6 text-white" aria-hidden="true" />
                      <h3 id="accessibility-title" className="text-lg font-bold text-white">הגדרות נגישות</h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setAnnouncement('תפריט נגישות נסגר.');
                      }}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="סגור תפריט נגישות"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p id="accessibility-description" className="sr-only">
                  התאם אישית את הגדרות הנגישות של האתר, כולל גודל גופן, ניגודיות, ואנימציות.
                </p>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

                  {/* Font Size Control */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="w-5 h-5 text-blue-400" aria-hidden="true" />
                      <h4 className="font-semibold text-white">גודל טקסט</h4>
                      <button
                        onMouseEnter={() => setShowTooltip('fontSize')}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="ml-auto text-slate-400 hover:text-white transition-colors"
                        aria-label="מידע על גודל טקסט"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {showTooltip === 'fontSize' && (
                      <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-slate-900 text-sm text-slate-300 rounded-lg shadow-xl z-10">
                        {tooltips.fontSize}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        ref={firstFocusableRef}
                        onClick={decreaseFontSize}
                        disabled={settings.fontSize <= 80}
                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                        aria-label="הקטן טקסט"
                        title="הקטן טקסט"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-white">{settings.fontSize}%</div>
                        <div className="text-xs text-slate-400">
                          {settings.fontSize === 100 ? 'רגיל' : settings.fontSize > 100 ? 'גדול' : 'קטן'}
                        </div>
                      </div>
                      <button
                        onClick={increaseFontSize}
                        disabled={settings.fontSize >= 150}
                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                        aria-label="הגדל טקסט"
                        title="הגדל טקסט"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* High Contrast Toggle */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Contrast className="w-5 h-5 text-purple-400" aria-hidden="true" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">ניגודיות גבוהה</h4>
                            <button
                              onMouseEnter={() => setShowTooltip('highContrast')}
                              onMouseLeave={() => setShowTooltip(null)}
                              className="text-slate-400 hover:text-white transition-colors"
                              aria-label="מידע על ניגודיות גבוהה"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">שיפור קריאות</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('highContrast', !settings.highContrast,
                          `ניגודיות גבוהה ${!settings.highContrast ? 'הופעלה' : 'כובתה'}`)}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${
                          settings.highContrast
                            ? 'bg-purple-500 justify-end'
                            : 'bg-slate-600 justify-start'
                        } px-1`}
                        role="switch"
                        aria-checked={settings.highContrast}
                        aria-label={`ניגודיות גבוהה: ${settings.highContrast ? 'מופעל' : 'מכובה'}`}
                        title={settings.highContrast ? 'כבה ניגודיות' : 'הפעל ניגודיות'}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    {showTooltip === 'highContrast' && (
                      <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-slate-900 text-sm text-slate-300 rounded-lg shadow-xl z-10">
                        {tooltips.highContrast}
                      </div>
                    )}
                  </div>

                  {/* Dark Mode Toggle */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {settings.darkMode ? (
                          <Moon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">מצב כהה</h4>
                            <button
                              onMouseEnter={() => setShowTooltip('darkMode')}
                              onMouseLeave={() => setShowTooltip(null)}
                              className="text-slate-400 hover:text-white transition-colors"
                              aria-label="מידע על מצב כהה"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">הפחתת עייפות עיניים</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('darkMode', !settings.darkMode,
                          `מצב כהה ${!settings.darkMode ? 'הופעל' : 'כובה'}`)}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${
                          settings.darkMode
                            ? 'bg-indigo-500 justify-end'
                            : 'bg-slate-600 justify-start'
                        } px-1`}
                        role="switch"
                        aria-checked={settings.darkMode}
                        aria-label={`מצב כהה: ${settings.darkMode ? 'מופעל' : 'מכובה'}`}
                        title={settings.darkMode ? 'כבה מצב כהה' : 'הפעל מצב כהה'}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    {showTooltip === 'darkMode' && (
                      <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-slate-900 text-sm text-slate-300 rounded-lg shadow-xl z-10">
                        {tooltips.darkMode}
                      </div>
                    )}
                  </div>

                  {/* Reduced Motion Toggle */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Eye className="w-5 h-5 text-green-400" aria-hidden="true" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">הפחתת תנועה</h4>
                            <button
                              onMouseEnter={() => setShowTooltip('reducedMotion')}
                              onMouseLeave={() => setShowTooltip(null)}
                              className="text-slate-400 hover:text-white transition-colors"
                              aria-label="מידע על הפחתת תנועה"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">עבור רגישות לתנועות</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('reducedMotion', !settings.reducedMotion,
                          `הפחתת תנועה ${!settings.reducedMotion ? 'הופעלה' : 'כובתה'}`)}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${
                          settings.reducedMotion
                            ? 'bg-green-500 justify-end'
                            : 'bg-slate-600 justify-start'
                        } px-1`}
                        role="switch"
                        aria-checked={settings.reducedMotion}
                        aria-label={`הפחתת תנועה: ${settings.reducedMotion ? 'מופעל' : 'מכובה'}`}
                        title={settings.reducedMotion ? 'כבה הפחתת תנועה' : 'הפעל הפחתת תנועה'}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    {showTooltip === 'reducedMotion' && (
                      <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-slate-900 text-sm text-slate-300 rounded-lg shadow-xl z-10">
                        {tooltips.reducedMotion}
                      </div>
                    )}
                  </div>

                  {/* Keyboard Navigation Toggle */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Keyboard className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">ניווט מקלדת</h4>
                            <button
                              onMouseEnter={() => setShowTooltip('keyboardNav')}
                              onMouseLeave={() => setShowTooltip(null)}
                              className="text-slate-400 hover:text-white transition-colors"
                              aria-label="מידע על ניווט מקלדת"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">הדגשת אלמנטים ב-Tab</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('keyboardNav', !settings.keyboardNav,
                          `ניווט מקלדת ${!settings.keyboardNav ? 'הופעל' : 'כובה'}`)}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${
                          settings.keyboardNav
                            ? 'bg-cyan-500 justify-end'
                            : 'bg-slate-600 justify-start'
                        } px-1`}
                        role="switch"
                        aria-checked={settings.keyboardNav}
                        aria-label={`ניווט מקלדת: ${settings.keyboardNav ? 'מופעל' : 'מכובה'}`}
                        title={settings.keyboardNav ? 'כבה ניווט מקלדת' : 'הפעל ניווט מקלדת'}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                    {showTooltip === 'keyboardNav' && (
                      <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-slate-900 text-sm text-slate-300 rounded-lg shadow-xl z-10">
                        {tooltips.keyboardNav}
                      </div>
                    )}
                  </div>

                  {/* Reset Button */}
                  <button
                    ref={lastFocusableRef}
                    onClick={resetSettings}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    aria-label="אפס את כל הגדרות הנגישות לברירת מחדל"
                    title="איפוס הגדרות"
                  >
                    <RefreshCw className="w-5 h-5" />
                    איפוס להגדרות ברירת מחדל
                  </button>

                  {/* Info */}
                  <div className="text-center text-xs text-slate-400 pt-2">
                    <p>ההגדרות נשמרות אוטומטית ויחולו בכל ביקור</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Styles for Accessibility */}
      <style>{`
        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* High Contrast Mode */
        .high-contrast {
          filter: contrast(1.2);
        }
        .high-contrast * {
          border-color: currentColor !important;
        }

        /* Reduced Motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Keyboard Navigation */
        .keyboard-nav *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }

        .keyboard-nav button:focus,
        .keyboard-nav a:focus,
        .keyboard-nav input:focus,
        .keyboard-nav textarea:focus,
        .keyboard-nav select:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        }
      `}</style>
    </>
  );
};

export default AccessibilityWidget;
