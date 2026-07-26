import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectLocale, i18n, initI18n, setLocale } from './init.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectLocale', () => {
  it('prefers the stored choice over the browser language', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'ru', setItem: vi.fn() });
    vi.stubGlobal('navigator', { language: 'en-US' });

    expect(detectLocale()).toBe('ru');
  });

  it('falls back to the browser language', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
    vi.stubGlobal('navigator', { language: 'ru-RU' });

    expect(detectLocale()).toBe('ru');
  });

  it('ignores a stored value that is not a supported locale', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'de', setItem: vi.fn() });
    vi.stubGlobal('navigator', { language: 'en-US' });

    expect(detectLocale()).toBe('en');
  });

  it('defaults to English when nothing is available', () => {
    vi.stubGlobal('localStorage', undefined);
    vi.stubGlobal('navigator', undefined);

    expect(detectLocale()).toBe('en');
  });
});

describe('setLocale', () => {
  it('switches the active language and persists the choice', async () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: () => null, setItem });
    initI18n('en');

    setLocale('ru');

    await vi.waitFor(() => expect(i18n.language).toBe('ru'));
    expect(setItem).toHaveBeenCalledWith('basalt-locale', 'ru');
  });
});
