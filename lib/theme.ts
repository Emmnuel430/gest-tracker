export type Theme = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gest_tracker_theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'system';
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // Ignore
  }
}

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return theme;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
