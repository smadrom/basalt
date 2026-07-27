import { i18n, initI18n } from '@basalt/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';

beforeAll(() => {
  initI18n('en');
});

beforeEach(() => {
  localStorage.clear();
});

describe('LanguageSwitcher', () => {
  it('offers the other locale and persists the switch', async () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Russian' }));

    await waitFor(() => expect(i18n.language).toBe('ru'));
    expect(localStorage.getItem('basalt-locale')).toBe('ru');
    expect(await screen.findByRole('button', { name: 'Переключиться на английский' })).toBeTruthy();
  });
});
