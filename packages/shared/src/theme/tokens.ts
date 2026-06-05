/**
 * Design tokens — the single source for color/spacing primitives shared by
 * Tailwind config and any runtime styling. Kept framework-agnostic on purpose.
 */
export const tokens = {
  color: {
    bg: 'hsl(0 0% 100%)',
    fg: 'hsl(222 47% 11%)',
    muted: 'hsl(215 16% 47%)',
    primary: 'hsl(243 75% 59%)',
    primaryFg: 'hsl(0 0% 100%)',
    border: 'hsl(214 32% 91%)',
    danger: 'hsl(0 72% 51%)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type Tokens = typeof tokens;
