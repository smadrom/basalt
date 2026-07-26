import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ru from './ru.json';

export const resources = {
  en: { translation: en },
  ru: { translation: ru },
} as const;

export type AppLocale = keyof typeof resources;

const STORAGE_KEY = 'basalt-locale';

/** Stored choice wins; otherwise the browser language; 'en' as the last resort. */
export function detectLocale(): AppLocale {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ru') return stored;
  } catch {
    // localStorage can throw (privacy modes) — fall through to detection.
  }
  return globalThis.navigator?.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

/** Switch the active language and remember the choice (best-effort persist). */
export function setLocale(lng: AppLocale): void {
  void i18n.changeLanguage(lng);
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, lng);
  } catch {
    // Persistence is best-effort; the in-memory switch still applies.
  }
}

let initialized = false;

/** Idempotent i18next bootstrap. Call once from the web entrypoint. */
export function initI18n(lng: AppLocale = detectLocale()) {
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
