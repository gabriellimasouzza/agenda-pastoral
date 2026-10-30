import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, radius } from './colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const fonts = {
    title: 'PlayfairDisplay_600SemiBold',
    titleBold: 'PlayfairDisplay_700Bold',
    body: 'Manrope_400Regular',
    bodyMedium: 'Manrope_500Medium',
    bodyBold: 'Manrope_700Bold',
  };

  return (
    <ThemeContext.Provider value={{ colors, spacing, radius, fonts, scheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return ctx;
}
