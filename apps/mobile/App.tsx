import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackNavigator } from './src/navigation';
import { FingerprintLockOverlay } from './src/components';
import {
  getFingerprintLockEnabled,
  recordAppLastActive,
  shouldRequireUnlockOnResume,
} from './src/services/fingerprintAuth';
import {
  AuthProvider,
  ChargingProvider,
  FilterProvider,
  ThemeProvider,
  LanguageProvider,
  FavoritesProvider,
  useAuth,
} from './src/context';

const AppContent: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const [isAppLocked, setIsAppLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initial check on cold start
    if (isAuthenticated && !isGuest) {
      getFingerprintLockEnabled().then((enabled) => {
        if (enabled) {
          setIsAppLocked(true);
        }
      });
    }
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        if (isAuthenticated && !isGuest) {
          const requireLock = await shouldRequireUnlockOnResume();
          if (requireLock) {
            setIsAppLocked(true);
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        await recordAppLastActive();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isGuest]);

  return (
    <FavoritesProvider>
      <ChargingProvider>
        <FilterProvider>
          <NavigationContainer>
            <RootStackNavigator />
          </NavigationContainer>
          <FingerprintLockOverlay
            visible={isAppLocked}
            onUnlocked={() => setIsAppLocked(false)}
          />
        </FilterProvider>
      </ChargingProvider>
    </FavoritesProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
