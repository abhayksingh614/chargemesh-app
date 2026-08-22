import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  StatusBar,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context';
import { borderRadius } from '../theme';

// 2026 Modern ChargeMesh EV Design Palette
const CM_COLORS = {
  primaryGreen: '#00D084',
  neonTeal: '#00BFA5',
  deepNavy: '#04121C',
  darkBg: '#020617',
  glassCardBg: 'rgba(7, 24, 36, 0.85)',
  subtleBorder: 'rgba(255, 255, 255, 0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
};

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading } = useAuth();

  // Animation values for 2026 fluid micro-interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const glowRingPulse1 = useRef(new Animated.Value(0.8)).current;
  const glowRingPulse2 = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const statusFadeAnim = useRef(new Animated.Value(0)).current;
  const touchRippleAnim = useRef(new Animated.Value(0)).current;
  const touchRippleOpacity = useRef(new Animated.Value(0)).current;

  // Live interactive counter state
  const [chargingSpeedKw, setChargingSpeedKw] = useState(0);

  useEffect(() => {
    // 1. Staggered Entrance Animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(statusFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Smooth Progress Bar Loading Fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // 3. Live Simulated Telemetry Power Up (0 kW -> 180 kW)
    let currentKw = 0;
    const interval = setInterval(() => {
      currentKw += 12;
      if (currentKw <= 180) {
        setChargingSpeedKw(currentKw);
      } else {
        clearInterval(interval);
      }
    }, 100);

    // 4. Ambient Breathing Dual Neon Glow Rings
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoPulse, {
            toValue: 1.07,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowRingPulse1, {
            toValue: 1.25,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowRingPulse2, {
            toValue: 1.45,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowRingPulse1, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowRingPulse2, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
      clearInterval(interval);
    };
  }, []);

  // Handle interactive touch ripple feedback
  const handleScreenPress = () => {
    touchRippleAnim.setValue(0.5);
    touchRippleOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(touchRippleAnim, {
        toValue: 2.2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(touchRippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Direct Navigation: Directly navigate to Login or Home Screen (Bypassing Onboarding per request)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        try {
          if (!isAuthenticated) {
            navigation.replace('Login');
          } else {
            navigation.replace('MainTabs');
          }
        } catch {
          if (!isAuthenticated) {
            navigation.navigate('Login');
          } else {
            navigation.navigate('MainTabs');
          }
        }
      }, 2300);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, isAuthenticated, navigation]);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* 100% Full-Bleed Absolute Background (Zero bottom gaps across all Android navigation bars) */}
        <ImageBackground
          source={require('../assets/splash_bg.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Full-Screen Dark Gradient Mesh Overlay */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* Top Security & Network Header Pill */}
            <Animated.View style={[styles.topLiveTag, { opacity: statusFadeAnim }]}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.topLiveTagText}>INDIA'S INTEROPERABLE EV NETWORK</Text>
            </Animated.View>

            {/* Central Modern Glass Brand Hero */}
            <Animated.View
              style={[
                styles.brandCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: cardScaleAnim }],
                },
              ]}
            >
              {/* Outer Dual Ambient Glow Rings */}
              <Animated.View
                style={[
                  styles.outerGlowRing2,
                  {
                    transform: [{ scale: glowRingPulse2 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.outerGlowRing1,
                  {
                    transform: [{ scale: glowRingPulse1 }],
                  },
                ]}
              />

              {/* Logo Container with Neon Emerald Accent */}
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: logoPulse }],
                  },
                ]}
              >
                <Image
                  source={require('../assets/logo/cm_fevicon_logo_trans.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* ChargeMesh Brand Wordmark */}
              <Text style={styles.brandTitle}>ChargeMesh</Text>

              {/* 2026 USP Badge Pill */}
              <View style={styles.uspBadge}>
                <Text style={styles.uspBadgeIcon}>⚡</Text>
                <Text style={styles.uspBadgeText}>ALL-INDIA ROAMING & FASTPAY</Text>
              </View>

              {/* Live Simulated Telemetry Power Widget */}
              <View style={styles.telemetryPowerPill}>
                <Text style={styles.telemetryPowerLabel}>GRID TELEMETRY</Text>
                <Text style={styles.telemetryPowerValue}>{chargingSpeedKw} kW DC ULTRA-FAST</Text>
              </View>

              {/* Sub-Headline */}
              <Text style={styles.subTitle}>
                5,000+ Verified Fast Chargers in One App
              </Text>
            </Animated.View>

            {/* Bottom Telemetry & Progress Indicator */}
            <Animated.View
              style={[
                styles.bottomSection,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              {/* Status Chip */}
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>⚡ Connecting to Charge Point Network...</Text>
              </View>

              {/* Neon Progress Fill Bar */}
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressBarWidth,
                    },
                  ]}
                />
              </View>

              {/* Version & Security Tag */}
              <View style={styles.versionRow}>
                <Text style={styles.versionText}>ChargeMesh v1.0.0</Text>
                <Text style={styles.versionDivider}>•</Text>
                <Text style={styles.versionSecure}>OCPP 2.0.1 Encrypted</Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* Interactive Touch Pulse Halo */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.touchRipple,
            {
              opacity: touchRippleOpacity,
              transform: [{ scale: touchRippleAnim }],
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CM_COLORS.darkBg,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 14, 24, 0.48)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 18,
    paddingBottom: 28,
  },
  topLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 18, 28, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.35)',
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CM_COLORS.primaryGreen,
    marginRight: 8,
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  topLiveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
    letterSpacing: 0.8,
  },
  brandCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 26,
    backgroundColor: CM_COLORS.glassCardBg,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
  },
  outerGlowRing1: {
    position: 'absolute',
    top: 20,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0, 208, 132, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.35)',
  },
  outerGlowRing2: {
    position: 'absolute',
    top: 14,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.2)',
  },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 208, 132, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: CM_COLORS.primaryGreen,
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 6,
  },
  logoImage: {
    width: 46,
    height: 46,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: CM_COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  uspBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.45)',
  },
  uspBadgeIcon: {
    fontSize: 11,
    marginRight: 5,
  },
  uspBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
    letterSpacing: 0.6,
  },
  telemetryPowerPill: {
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.25)',
  },
  telemetryPowerLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: CM_COLORS.textMuted,
    letterSpacing: 0.8,
  },
  telemetryPowerValue: {
    fontSize: 12,
    fontWeight: '900',
    color: CM_COLORS.primaryGreen,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontSize: 12.5,
    color: CM_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 6,
  },
  statusChip: {
    backgroundColor: 'rgba(4, 18, 28, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: CM_COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  progressBarBg: {
    width: '85%',
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CM_COLORS.primaryGreen,
    borderRadius: 2.5,
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    color: CM_COLORS.textMuted,
    fontWeight: '600',
  },
  versionDivider: {
    fontSize: 11,
    color: CM_COLORS.textMuted,
    marginHorizontal: 8,
  },
  versionSecure: {
    fontSize: 11,
    color: CM_COLORS.primaryGreen,
    fontWeight: '700',
  },
  touchRipple: {
    position: 'absolute',
    top: '45%',
    left: '42%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 208, 132, 0.25)',
    borderWidth: 2,
    borderColor: CM_COLORS.primaryGreen,
  },
});
