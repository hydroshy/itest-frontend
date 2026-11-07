import { ref, watch, onMounted } from 'vue';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'itest_theme_mode';

const themeMode = ref<ThemeMode>('dark');

export function useTheme() {
  const isDark = ref(themeMode.value === 'dark');

  const applyTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    isDark.value = mode === 'dark';

    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'itest-dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'itest-light');
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.warn('[useTheme] Failed to persist theme preference:', e);
    }
  };

  const toggleTheme = () => {
    applyTheme(themeMode.value === 'dark' ? 'light' : 'dark');
  };

  const initTheme = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
        return;
      }
    } catch {
      // Fallback
    }

    // Default to dark theme for industrial testing suite
    applyTheme('dark');
  };

  return {
    themeMode,
    isDark,
    applyTheme,
    toggleTheme,
    initTheme,
  };
}
