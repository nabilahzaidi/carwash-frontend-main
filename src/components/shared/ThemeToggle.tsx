import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'carwash-theme';

type ThemeMode = 'silver' | 'dark-silver' | 'black';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeMode>('silver');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: ThemeMode = savedTheme
      ? savedTheme
      : prefersDark
      ? 'dark-silver'
      : 'silver';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme !== 'silver');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // keep older Tailwind dark utilities working by toggling .dark for non-light themes
    document.documentElement.classList.toggle('dark', theme !== 'silver');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycle = (current: ThemeMode) => {
    if (current === 'silver') return 'dark-silver';
    if (current === 'dark-silver') return 'black';
    return 'silver';
  };

  const toggleTheme = () => setTheme((current) => cycle(current));

  const icon = theme === 'silver' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 dark:bg-slate-800/70 dark:text-white dark:hover:bg-slate-700/70"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;
