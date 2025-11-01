import React, { useState, useEffect, useRef } from 'react';
import { Languages, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Language = 'he' | 'en' | 'ar' | 'ru';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  flag: string;
}

const LANGUAGE_KEY = 'ishebot-language';

const languages: LanguageOption[] = [
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl', flag: '🇮🇱' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
];

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.language as Language);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Sync with i18n language
    setCurrentLanguage(i18n.language as Language);
  }, [i18n.language]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
        setAnnouncement(t('language.announcements.closed'));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const applyLanguage = async (lang: Language) => {
    const langOption = languages.find(l => l.code === lang);
    if (!langOption) return;

    // Change language using i18next - this will automatically:
    // - Update the HTML lang attribute
    // - Update the HTML dir attribute (via our i18n.ts listener)
    // - Save to localStorage (via our i18n.ts listener)
    await i18n.changeLanguage(lang);

    console.log(`Language changed to: ${langOption.nativeName}`);
  };

  const handleLanguageChange = async (lang: Language) => {
    await applyLanguage(lang);
    setIsOpen(false);

    const langOption = languages.find(l => l.code === lang);
    setAnnouncement(t('language.announcements.changed', { language: langOption?.nativeName }));

    // Focus back to button
    setTimeout(() => buttonRef.current?.focus(), 100);
  };

  const getCurrentLang = () => languages.find(l => l.code === currentLanguage);

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

      {/* Language Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => {
            setIsOpen(!isOpen);
            setAnnouncement(isOpen ? t('language.announcements.closed') : t('language.announcements.opened'));
          }}
          className="p-2 rounded-xl backdrop-blur-md bg-white/30 hover:bg-white/50 hover:scale-110 transition-all duration-300 flex items-center justify-center"
          aria-label={`${t('language.current')}: ${getCurrentLang()?.nativeName}. ${isOpen ? t('common.close') : t('language.change')}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          title={t('language.change')}
        >
          <span className="text-3xl">{getCurrentLang()?.flag}</span>
        </button>

        {/* Language Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 z-[10000] w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
              role="menu"
              aria-label={t('language.title')}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-white" aria-hidden="true" />
                  <h3 className="font-semibold text-white">{t('language.title')}</h3>
                </div>
              </div>

              {/* Language Options */}
              <div className="p-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-200 hover:bg-slate-700'
                    }`}
                    role="menuitemradio"
                    aria-checked={currentLanguage === lang.code}
                    aria-label={`${lang.nativeName} - ${lang.name}`}
                  >
                    <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                    <div className="flex-1 text-right">
                      <div className="font-semibold">{lang.nativeName}</div>
                      <div className="text-xs opacity-75">{lang.name}</div>
                    </div>
                    {currentLanguage === lang.code && (
                      <Check className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>

              {/* Info Footer */}
              <div className="p-3 bg-slate-900/50 border-t border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  {t('language.footer')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LanguageSwitcher;
