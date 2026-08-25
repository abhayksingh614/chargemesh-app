import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  MapScreen,
  QRScannerScreen,
  ActivityScreen,
  ProfileScreen,
} from '../screens';
import { ThreeDIcon } from '../components';
import { useTheme, useLanguage } from '../context';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isHindi } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Charge') {
            return (
              <View style={styles.floatingCenterWrapper}>
                <ThreeDIcon name="scan" size={46} focused={focused} />
              </View>
            );
          }

          let iconName: 'home' | 'map' | 'bookings' | 'profile' = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Activity') iconName = 'bookings';
          else if (route.name === 'Profile') iconName = 'profile';

          return (
            <ThreeDIcon
              name={iconName}
              size={28}
              focused={focused}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: isHindi ? 'होम' : 'Home' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: isHindi ? 'मैप' : 'Map' }}
      />
      <Tab.Screen
        name="Charge"
        component={QRScannerScreen}
        options={{
          tabBarLabel: isHindi ? 'स्कैन व चार्ज' : 'Scan & Charge',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            color: theme.primary,
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ tabBarLabel: isHindi ? 'बुकिंग्स' : 'Bookings' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: isHindi ? 'प्रोफ़ाइल' : 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingCenterWrapper: {
    marginTop: -14,
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
});
