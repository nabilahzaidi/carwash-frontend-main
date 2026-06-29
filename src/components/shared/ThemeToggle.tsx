import { useEffect } from 'react';

const STORAGE_KEY = 'carwash-theme';

const ThemeToggle = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return null;
};

export default ThemeToggle;
