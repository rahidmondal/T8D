import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    // console.log('ThemeProvider: Initial localStorage theme:', storedTheme); // Kept for initial check
    const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
    // console.log('ThemeProvider: Initial theme state set to:', initialTheme); // Kept for initial check
    return initialTheme;
  });

  useEffect(() => {
    console.log(`%cThemeContext useEffect: Triggered. Target theme state: ${theme}`, 'color: blue; font-weight: bold;');
    const root = window.document.documentElement;
    console.log(`ThemeContext useEffect: HTML classList BEFORE change for theme "${theme}": "${root.classList.toString()}"`);

    if (theme === 'dark') {
      root.classList.add('dark');
      console.log(`ThemeContext useEffect: Applied "dark" class. HTML classList AFTER change: "${root.classList.toString()}"`);
    } else { // theme is 'light'
      root.classList.remove('dark');
      console.log(`ThemeContext useEffect: Attempted to REMOVE "dark" class. HTML classList AFTER change: "${root.classList.toString()}"`);
    }

    localStorage.setItem('theme', theme);
    // console.log(`ThemeContext useEffect: localStorage theme set to: "${localStorage.getItem('theme')}"`); // Kept for verification
  }, [theme]);

  const toggleTheme = () => {
    // console.log('ThemeContext: toggleTheme called. Current theme before toggle:', theme); // Kept
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // console.log('ThemeContext: setTheme will update to:', newTheme); // Kept
      return newTheme;
    });
  };

  // console.log('ThemeProvider rendering. Current theme state:', theme); // Kept

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
