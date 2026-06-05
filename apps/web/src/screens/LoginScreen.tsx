import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button.tsx';
import { signIn, signUp } from '../lib/api.ts';

export function LoginScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'in') await signIn(email, password);
      else await signUp(email, password, name || email);
    } catch {
      setError(t('auth.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('app.name')}</h1>
        <p className="text-muted">{t('app.tagline')}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === 'up' && (
          <input
            className="rounded-md border border-border bg-bg px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="rounded-md border border-border bg-bg px-3 py-2"
          type="email"
          placeholder={t('auth.email')}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-md border border-border bg-bg px-3 py-2"
          type="password"
          placeholder={t('auth.password')}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={busy}>
          {mode === 'in' ? t('auth.signIn') : t('auth.signUp')}
        </Button>
      </form>

      <Button variant="ghost" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
        {mode === 'in' ? t('auth.needAccount') : t('auth.haveAccount')}
      </Button>
    </div>
  );
}
