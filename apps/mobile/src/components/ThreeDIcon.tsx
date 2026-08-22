import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context';

export type ThreeDIconName =
  | 'scan'
  | 'vehicle'
  | 'history'
  | 'bookings'
  | 'wallet'
  | 'bolt'
  | 'plug'
  | 'available'
  | 'location'
  | 'gift'
  | 'home'
  | 'map'
  | 'profile';

interface ThreeDIconProps {
  name: ThreeDIconName;
  size?: number;
  focused?: boolean;
}

export const ThreeDIcon: React.FC<ThreeDIconProps> = ({
  name,
  size = 48,
  focused = false,
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const iconConfig = getIconConfig(name, isDark);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: iconConfig.baseBg,
          borderColor: iconConfig.borderColor,
          shadowColor: iconConfig.glowColor,
        },
        focused && styles.focusedContainer,
      ]}
    >
      {/* 3D Specular Top Bevel Light */}
      <View
        style={[
          styles.specularBevel,
          {
            height: size * 0.38,
            borderTopLeftRadius: size * 0.3,
            borderTopRightRadius: size * 0.3,
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.85)',
          },
        ]}
      />

      {/* 3D Bright Crisp Single Glyph */}
      <Text
        style={[
          styles.singleGlyph,
          {
            fontSize: size * 0.58,
            lineHeight: size * 0.68,
            textShadowColor: isDark
              ? 'rgba(0, 0, 0, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        {iconConfig.emoji}
      </Text>

      {/* 3D Subtle Bottom Depth Rim */}
      <View
        style={[
          styles.bottomDepthRim,
          {
            borderBottomLeftRadius: size * 0.3,
            borderBottomRightRadius: size * 0.3,
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.35)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      />
    </View>
  );
};

function getIconConfig(name: ThreeDIconName, isDark: boolean) {
  switch (name) {
    case 'scan':
      return {
        emoji: '⚡',
        baseBg: isDark ? '#052E16' : '#F0FDF4',
        borderColor: isDark ? '#22C55E' : '#22C55E',
        glowColor: '#22C55E',
      };
    case 'vehicle':
      return {
        emoji: '🚗',
        baseBg: isDark ? '#082F49' : '#F0F9FF',
        borderColor: isDark ? '#38BDF8' : '#0EA5E9',
        glowColor: '#38BDF8',
      };
    case 'history':
      return {
        emoji: '📜',
        baseBg: isDark ? '#2E1065' : '#FAF5FF',
        borderColor: isDark ? '#C084FC' : '#A855F7',
        glowColor: '#C084FC',
      };
    case 'bookings':
      return {
        emoji: '📅',
        baseBg: isDark ? '#451A03' : '#FFFBEB',
        borderColor: isDark ? '#FBBF24' : '#F59E0B',
        glowColor: '#FBBF24',
      };
    case 'wallet':
      return {
        emoji: '💳',
        baseBg: isDark ? '#064E3B' : '#ECFDF5',
        borderColor: isDark ? '#34D399' : '#10B981',
        glowColor: '#34D399',
      };
    case 'bolt':
      return {
        emoji: '⚡',
        baseBg: isDark ? '#451A03' : '#FFFBEB',
        borderColor: isDark ? '#F59E0B' : '#F59E0B',
        glowColor: '#F59E0B',
      };
    case 'plug':
      return {
        emoji: '🔌',
        baseBg: isDark ? '#2E1065' : '#FAF5FF',
        borderColor: isDark ? '#A855F7' : '#8B5CF6',
        glowColor: '#A855F7',
      };
    case 'available':
      return {
        emoji: '🟢',
        baseBg: isDark ? '#022C22' : '#F0FDF4',
        borderColor: isDark ? '#00D084' : '#22C55E',
        glowColor: '#00D084',
      };
    case 'location':
      return {
        emoji: '📍',
        baseBg: isDark ? '#4C0519' : '#FFF1F2',
        borderColor: isDark ? '#FB7185' : '#F43F5E',
        glowColor: '#FB7185',
      };
    case 'gift':
      return {
        emoji: '🎁',
        baseBg: isDark ? '#064E3B' : '#ECFDF5',
        borderColor: isDark ? '#00D084' : '#10B981',
        glowColor: '#00D084',
      };
    case 'home':
      return {
        emoji: '🏠',
        baseBg: isDark ? '#071826' : '#F8FAFC',
        borderColor: isDark ? '#00D084' : '#22C55E',
        glowColor: '#00D084',
      };
    case 'map':
      return {
        emoji: '🗺️',
        baseBg: isDark ? '#071826' : '#F0F9FF',
        borderColor: isDark ? '#38BDF8' : '#0EA5E9',
        glowColor: '#38BDF8',
      };
    case 'profile':
      return {
        emoji: '👤',
        baseBg: isDark ? '#071826' : '#FAF5FF',
        borderColor: isDark ? '#C084FC' : '#A855F7',
        glowColor: '#C084FC',
      };
    default:
      return {
        emoji: '⚡',
        baseBg: isDark ? '#052E16' : '#F0FDF4',
        borderColor: isDark ? '#22C55E' : '#22C55E',
        glowColor: '#22C55E',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  focusedContainer: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2,
  },
  specularBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  singleGlyph: {
    textAlign: 'center',
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomDepthRim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
