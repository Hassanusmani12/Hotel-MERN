import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Dark theme only - permanently enforced
const THEME = 'dark';

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    localStorage.setItem('luxury_theme', THEME);
    document.documentElement.setAttribute('data-theme', THEME);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEME, isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
