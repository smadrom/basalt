import { createProjectInput, useAuthStore } from '@basalt/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import { Button } from '../components/ui/button.tsx';
import { api, signOut } from '../lib/api.ts';

const PROJECTS_KEY = ['projects'];

export function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const projects = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const { data, error } = await api.api.projects.get();
      if (error) throw error;
      return data.data;
    },
  });

  const create = useMutation({
    mutationFn: async (projectName: string) => {
      const { error } = await api.api.projects.post({ name: projectName });
      if (error) throw error;
    },
    onSuccess: () => {
      setName('');
      void qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.api.projects({ id }).delete();
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const result = createProjectInput.safeParse({ name: name.trim() });
    if (result.success) create.mutate(result.data.name);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {t('home.greeting', { name: user?.name ?? user?.email ?? '' })}
        </h1>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button variant="ghost" onClick={() => void signOut()}>
            {t('auth.signOut')}
          </Button>
        </div>
      </header>

      <form onSubmit={onCreate} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-border bg-bg px-3 py-2"
          placeholder={t('home.namePlaceholder')}
          aria-label={t('home.namePlaceholder')}
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          {t('home.create')}
        </Button>
      </form>
      {create.isError && (
        <p role="alert" className="text-sm text-danger">
          {t('home.createError')}
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t('home.projects')}</h2>
        {projects.isPending && <output className="text-muted">{t('app.loading')}</output>}
        {projects.isError && (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-sm text-danger">
              {t('home.loadError')}
            </p>
            <Button variant="ghost" onClick={() => void projects.refetch()}>
              {t('app.retry')}
            </Button>
          </div>
        )}
        {remove.isError && (
          <p role="alert" className="text-sm text-danger">
            {t('home.deleteError')}
          </p>
        )}
        {projects.data?.length === 0 && <p className="text-muted">{t('home.empty')}</p>}
        {projects.data?.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <span>{project.name}</span>
            <Button
              variant="danger"
              disabled={remove.isPending && remove.variables === project.id}
              onClick={() => remove.mutate(project.id)}
            >
              {t('home.delete')}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
