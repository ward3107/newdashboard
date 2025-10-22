import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationHE from './locales/he.json';
import translationEN from './locales/en.json';
import translationAR from './locales/ar.json';
import translationRU from './locales/ru.json';

// the translations
const resources = {
  he: {
    translation: translationHE
  },
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  },
  ru: {
    translation: translationRU
  }
};

const LANGUAGE_KEY = 'ishebot-language';

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'he', // Default language
    lng: localStorage.getItem(LANGUAGE_KEY) || 'he', // Load saved language or default to Hebrew
    debug: false,

    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },

    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],

      // keys or params to lookup language from
      lookupLocalStorage: LANGUAGE_KEY,

      // cache user language on
      caches: ['localStorage'],
    },

    react: {
      useSuspense: true,
    }
  });

// Update HTML attributes when language changes
i18n.on('languageChanged', (lng) => {
  const root = document.documentElement;

  // Set language attribute
  root.setAttribute('lang', lng);

  // Set direction based on language
  const rtlLanguages = ['he', 'ar'];
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  root.setAttribute('dir', dir);

  // Store in localStorage
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
