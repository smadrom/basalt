import { useAuthStore } from '@basalt/shared';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './components/ui/button.tsx';
import { restoreSession } from './lib/api.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LoginScreen } from './screens/LoginScreen.tsx';

export function App() {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [restoring, setRestoring] = useState(Boolean(token && !user));
  const [unavailable, setUnavailable] = useState(false);

  const restore = useCallback(async () => {
    setUnavailable(false);
    setRestoring(true);
    try {
      const result = await restoreSession();
      if (result === 'unavailable') setUnavailable(true);
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    if (!token || user) {
      setRestoring(false);
      return;
    }
    void restore();
  }, [token, user, restore]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (!token) return <LoginScreen />;

  if (restoring) {
    return (
      <output className="flex min-h-screen items-center justify-center text-muted">
        {t('app.loading')}
      </output>
    );
  }

  if (unavailable || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">{t('app.unavailableTitle')}</h1>
        <p className="text-muted">{t('app.unavailableBody')}</p>
        <Button onClick={() => void restore()}>{t('app.retry')}</Button>
      </div>
    );
  }

  return <HomeScreen />;
}
