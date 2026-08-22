import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  StationDetailScreen,
  PreChargeScreen,
  LiveChargingScreen,
  SessionCompleteScreen,
  VehicleScreen,
  QRScannerScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

export const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          animation: 'fade',
          animationDuration: 350,
        }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          animation: 'fade',
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          animation: 'fade',
          animationDuration: 260,
        }}
      />
      <Stack.Screen
        name="StationDetail"
        component={StationDetailScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
      <Stack.Screen
        name="PreCharge"
        component={PreChargeScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="LiveCharging"
        component={LiveChargingScreen}
        options={{
          animation: 'fade_from_bottom',
          animationDuration: 320,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionComplete"
        component={SessionCompleteScreen}
        options={{
          animation: 'fade',
          animationDuration: 350,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Vehicle"
        component={VehicleScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      />
    </Stack.Navigator>
  );
};
