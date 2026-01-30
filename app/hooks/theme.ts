import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'theme';
const listeners = new Set<() => void>();

let currentTheme: Theme = 'light';
let currentPreference: ThemePreference = 'system';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function initTheme() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  currentPreference = stored || 'system';
  currentTheme = resolveTheme(currentPreference);
  applyTheme(currentTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentPreference === 'system') {
      currentTheme = getSystemTheme();
      applyTheme(currentTheme);
      notifyListeners();
    }
  });
}

initTheme();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((preference: ThemePreference) => {
    currentPreference = preference;
    currentTheme = resolveTheme(preference);
    localStorage.setItem(STORAGE_KEY, preference);
    applyTheme(currentTheme);
    notifyListeners();
  }, []);

  useEffect(() => {
    initTheme();
  }, []);

  return [theme, setTheme] as const;
}

export type { Theme, ThemePreference };
