import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@basalt/shared';
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
    if (name.trim()) create.mutate(name.trim());
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {t('home.greeting', { name: user?.name ?? user?.email ?? '' })}
        </h1>
        <Button variant="ghost" onClick={signOut}>
          {t('auth.signOut')}
        </Button>
      </header>

      <form onSubmit={onCreate} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-border bg-bg px-3 py-2"
          placeholder={t('home.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={create.isPending}>
          {t('home.create')}
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t('home.projects')}</h2>
        {projects.data?.length === 0 && <p className="text-muted">{t('home.empty')}</p>}
        {projects.data?.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <span>{project.name}</span>
            <Button variant="danger" onClick={() => remove.mutate(project.id)}>
              {t('home.delete')}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
