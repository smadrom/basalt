import { useAuthStore } from '@basalt/shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { restoreSession } from './lib/api.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LoginScreen } from './screens/LoginScreen.tsx';

export function App() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [restoring, setRestoring] = useState(Boolean(token && !user));

  useEffect(() => {
    if (!token || user) {
      setRestoring(false);
      return;
    }

    let active = true;
    setRestoring(true);

    void restoreSession().finally(() => {
      if (active) setRestoring(false);
    });

    return () => {
      active = false;
    };
  }, [token, user]);

  if (!token) return <LoginScreen />;

  if (restoring) {
    return (
      <output className="flex min-h-screen items-center justify-center text-muted">
        {t('app.loading')}
      </output>
    );
  }

  return <HomeScreen />;
}
