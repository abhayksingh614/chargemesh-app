import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing } from '../theme';

interface ChargingGaugeProps {
  socPercent: number;
  powerKw: number;
  isCharging: boolean;
  size?: number;
}

export const ChargingGauge: React.FC<ChargingGaugeProps> = ({
  socPercent,
  powerKw,
  isCharging,
  size = 220,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCharging) {
      // Glow pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle slow rotation for charging aura
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCharging]);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Pulse Glow Ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
            transform: [{ scale: pulseAnim }],
            borderColor: isCharging ? colors.primaryLight : colors.border,
          },
        ]}
      />

      {/* Rotating Aura Ring */}
      {isCharging && (
        <Animated.View
          style={[
            styles.auraRing,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        />
      )}

      {/* Main Gauge Dial */}
      <View
        style={[
          styles.innerDial,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: (size * 0.82) / 2,
          },
        ]}
      >
        <Text style={styles.boltIcon}>⚡</Text>
        <View style={styles.socContainer}>
          <Text style={styles.socText}>{Math.round(socPercent)}</Text>
          <Text style={styles.percentSymbol}>%</Text>
        </View>
        <Text style={styles.statusLabel}>
          {isCharging ? `${powerKw.toFixed(1)} kW FAST CHARGING` : 'BATTERY LEVEL'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: spacing.md,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'rgba(0, 192, 115, 0.06)',
  },
  auraRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.primary,
    borderRightColor: 'rgba(0, 192, 115, 0.4)',
  },
  innerDial: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  boltIcon: {
    fontSize: 22,
    marginBottom: -4,
  },
  socContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  socText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  percentSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 2,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primaryDark,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
