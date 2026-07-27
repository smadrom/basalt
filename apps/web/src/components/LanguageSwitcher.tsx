import { type AppLocale, setLocale } from '@basalt/shared';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button.tsx';

/** Toggle between the supported locales; the choice persists via setLocale. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const next: AppLocale = i18n.language === 'ru' ? 'en' : 'ru';
  return (
    <Button
      variant="ghost"
      aria-label={t(next === 'en' ? 'language.switchToEnglish' : 'language.switchToRussian')}
      onClick={() => setLocale(next)}
    >
      {next.toUpperCase()}
    </Button>
  );
}
