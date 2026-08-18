import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  MapScreen,
  QRScannerScreen,
  ActivityScreen,
  ProfileScreen,
} from '../screens';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          ...typography.captionBold,
          fontSize: 11,
        },
        tabBarIcon: ({ focused }) => {
          let icon = '⚡';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Map') icon = '🗺️';
          else if (route.name === 'Charge') icon = '⚡';
          else if (route.name === 'Activity') icon = '📜';
          else if (route.name === 'Profile') icon = '👤';

          return (
            <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.7 }}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Discover' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Charge" component={QRScannerScreen} options={{ tabBarLabel: 'Charge' }} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{ tabBarLabel: 'Activity' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};
