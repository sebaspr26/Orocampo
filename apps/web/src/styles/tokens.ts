/**
 * Design tokens for ORO CAMPO.
 * CSS variables are the source of truth (globals.css @theme).
 * Use these constants when you need colors in JS (charts, inline styles, conditional logic).
 */

export const color = {
  primary: '#735c00',
  primaryContainer: '#d4af37',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#554300',
  surface: '#fcf9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae7e7',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#4d4635',
  outline: '#7f7663',
  outlineVariant: '#d0c5af',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
  tertiary: '#695d46',
  tertiaryContainer: '#c1b196',
  success: '#065f46',
  successContainer: '#d1fae5',
} as const;

export const font = {
  headline: 'var(--font-manrope), sans-serif',
  body: 'var(--font-inter), sans-serif',
} as const;

export type Color = keyof typeof color;
