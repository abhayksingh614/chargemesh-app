import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import {
  StationDetailScreen,
  PreChargeScreen,
  LiveChargingScreen,
  SessionCompleteScreen,
  VehicleScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

export const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="StationDetail" component={StationDetailScreen} />
      <Stack.Screen name="PreCharge" component={PreChargeScreen} />
      <Stack.Screen
        name="LiveCharging"
        component={LiveChargingScreen}
        options={{ gestureEnabled: false }} // Prevent swipe back during live charging
      />
      <Stack.Screen
        name="SessionComplete"
        component={SessionCompleteScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Vehicle" component={VehicleScreen} />
    </Stack.Navigator>
  );
};
