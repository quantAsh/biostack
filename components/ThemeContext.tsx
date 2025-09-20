import React, { createContext, useState, useMemo, useContext, useCallback } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeInternal] = useState<Theme>('classic');

  // Guarded setter: no-op when requested theme equals current theme to avoid redundant updates
  const setTheme = useCallback((t: Theme) => {
    setThemeInternal(prev => {
      if (prev === t) return prev;
      return t;
    });
  }, [setThemeInternal]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};