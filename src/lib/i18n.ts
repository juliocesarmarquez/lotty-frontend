import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const STORAGE_KEY = 'lotty-locale';

function getInitialLanguage(): string {
  if (globalThis.window === undefined) return 'es';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en') return stored;
  return 'es';
}

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React escapes by default
  },
});

export function setStoredLanguage(lng: string) {
  if (globalThis.window !== undefined) {
    localStorage.setItem(STORAGE_KEY, lng);
  }
}

export default i18n;
export { STORAGE_KEY };
