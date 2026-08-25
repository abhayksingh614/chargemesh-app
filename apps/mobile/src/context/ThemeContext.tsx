import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  neonTeal: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  borderDark: string;
  statusAvailableBg: string;
  statusBusyBg: string;
  statusUnavailableBg: string;
  ecoLight: string;
  isDark: boolean;
}

const darkTheme: ThemeColors = {
  primary: '#00D084',
  primaryDark: '#022C22',
  primaryLight: 'rgba(0, 208, 132, 0.16)',
  neonTeal: '#00BFA5',
  background: '#06131D',
  surface: '#071826',
  surfaceSecondary: '#0B2236',
  surfaceElevated: '#0F273D',
  cardBg: 'rgba(7, 24, 38, 0.92)',
  cardBorder: 'rgba(255, 255, 255, 0.14)',
  inputBg: 'rgba(2, 6, 23, 0.75)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  border: 'rgba(255, 255, 255, 0.12)',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderDark: 'rgba(255, 255, 255, 0.22)',
  statusAvailableBg: 'rgba(0, 208, 132, 0.15)',
  statusBusyBg: 'rgba(245, 158, 11, 0.15)',
  statusUnavailableBg: 'rgba(239, 68, 68, 0.15)',
  ecoLight: 'rgba(0, 208, 132, 0.12)',
  isDark: true,
};

const lightTheme: ThemeColors = {
  primary: '#10B981',
  primaryDark: '#064E3B',
  primaryLight: '#ECFDF5',
  neonTeal: '#0D9488',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  statusAvailableBg: '#DCFCE7',
  statusBusyBg: '#FEF3C7',
  statusUnavailableBg: '#FEE2E2',
  ecoLight: '#ECFDF5',
  isDark: false,
};

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = '@chargemesh:theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light'); // Default to Light Theme per user requirement

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: currentTheme,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
