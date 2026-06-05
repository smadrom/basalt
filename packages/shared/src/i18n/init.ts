import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ru from './ru.json';

export const resources = {
  en: { translation: en },
  ru: { translation: ru },
} as const;

export type AppLocale = keyof typeof resources;

let initialized = false;

/** Idempotent i18next bootstrap. Call once from the web entrypoint. */
export function initI18n(lng: AppLocale = 'en') {
  if (initialized) return i18n;
  initialized = true;
  void i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
  return i18n;
}

export { i18n };
