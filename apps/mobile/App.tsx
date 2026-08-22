import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackNavigator } from './src/navigation';
import { AuthProvider, ChargingProvider, FilterProvider, ThemeProvider } from './src/context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChargingProvider>
            <FilterProvider>
              <NavigationContainer>
                <RootStackNavigator />
              </NavigationContainer>
            </FilterProvider>
          </ChargingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
