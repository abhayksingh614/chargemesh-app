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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
          duration: 600,
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
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Smooth Progress Bar Loading Fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();

    // 3. Live Simulated Telemetry Power Up (0 kW -> 180 kW)
    let currentKw = 0;
    const interval = setInterval(() => {
      currentKw += 15;
      if (currentKw <= 180) {
        setChargingSpeedKw(currentKw);
      } else {
        clearInterval(interval);
      }
    }, 90);

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
  }, [fadeAnim, cardScaleAnim, statusFadeAnim, progressAnim, logoPulse, glowRingPulse1, glowRingPulse2]);

  // Handle interactive touch ripple feedback
  const handleScreenPress = () => {
    touchRippleAnim.setValue(0.5);
    touchRippleOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(touchRippleAnim, {
        toValue: 2.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(touchRippleOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Streamlined Navigation Flow:
  // Splash -> (If permissions not completed: PermissionSetup) -> (If completed: Login or MainTabs)
  // ZERO permissions requested on Splash Screen
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(async () => {
        try {
          const permCompleted = await AsyncStorage.getItem(
            '@chargemesh:permissions_setup_completed'
          );
          if (permCompleted !== 'true') {
            navigation.replace('PermissionSetup');
          } else if (isAuthenticated) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Login');
          }
        } catch {
          if (isAuthenticated) {
            navigation.navigate('MainTabs');
          } else {
            navigation.navigate('Login');
          }
        }
      }, 1800);

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

        {/* 100% Full-Bleed Absolute Background */}
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

              {/* ChargeMesh Core Typography */}
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                  Charge<Text style={styles.titleHighlight}>Mesh</Text>
                </Text>
                <View style={styles.badgeProRow}>
                  <View style={styles.subPill}>
                    <Text style={styles.subPillText}>ULTRA DC NETWORK</Text>
                  </View>
                  <View style={styles.statusOnlineBadge}>
                    <Text style={styles.statusOnlineText}>OCPP 2.0.1</Text>
                  </View>
                </View>
              </View>

              {/* Live Charging Telemetry Speed Badge */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryLeft}>
                  <Text style={styles.telemetryLabel}>LIVE PROTOCOL</Text>
                  <Text style={styles.telemetryValue}>AUTOPUSH v2.4</Text>
                </View>
                <View style={styles.telemetryDivider} />
                <View style={styles.telemetryRight}>
                  <Text style={styles.telemetryLabel}>PEAK POWER</Text>
                  <Text style={styles.telemetryValueGreen}>{chargingSpeedKw} kW</Text>
                </View>
              </View>

              {/* Smooth Animated Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[styles.progressFill, { width: progressBarWidth }]}
                  />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabelLeft}>Initializing Network Node...</Text>
                  <Text style={styles.progressLabelRight}>TLS 1.3 SECURE</Text>
                </View>
              </View>
            </Animated.View>

            {/* Bottom Certification & Interoperability Footer */}
            <Animated.View style={[styles.bottomCard, { opacity: statusFadeAnim }]}>
              <View style={styles.cpoRow}>
                <Text style={styles.cpoLabel}>SUPPORTING CPOs:</Text>
                <Text style={styles.cpoNames}>Tata Power · Jio-bp · Statiq · Kazam</Text>
              </View>
              <Text style={styles.versionText}>
                ChargeMesh Core Engine v2.4.0 (Build 308) · ISO 15118 Ready
              </Text>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* Touch Ripple Feedback Canvas */}
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
    backgroundColor: 'rgba(7, 24, 36, 0.88)',
    borderColor: 'rgba(0, 208, 132, 0.4)',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 10,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CM_COLORS.primaryGreen,
    marginRight: 8,
  },
  topLiveTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: CM_COLORS.glassCardBg,
    borderColor: CM_COLORS.subtleBorder,
    borderWidth: 1.5,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  outerGlowRing1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    top: 14,
  },
  outerGlowRing2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
    top: -1,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 33, 47, 0.95)',
    borderColor: CM_COLORS.primaryGreen,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  logoImage: {
    width: 62,
    height: 62,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: CM_COLORS.primaryGreen,
  },
  badgeProRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  subPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  subPillText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusOnlineBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.18)',
    borderColor: CM_COLORS.primaryGreen,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusOnlineText: {
    color: CM_COLORS.primaryGreen,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  telemetryCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(11, 28, 41, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  telemetryLeft: {
    alignItems: 'flex-start',
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  telemetryRight: {
    alignItems: 'flex-end',
  },
  telemetryLabel: {
    color: CM_COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  telemetryValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  telemetryValueGreen: {
    color: CM_COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: '900',
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: CM_COLORS.primaryGreen,
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressLabelLeft: {
    color: CM_COLORS.textSecondary,
    fontSize: 10.5,
    fontWeight: '600',
  },
  progressLabelRight: {
    color: CM_COLORS.primaryGreen,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 24, 36, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 360,
  },
  cpoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cpoLabel: {
    color: CM_COLORS.primaryGreen,
    fontSize: 10,
    fontWeight: '800',
  },
  cpoNames: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  versionText: {
    color: CM_COLORS.textMuted,
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  touchRipple: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: CM_COLORS.primaryGreen,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
});
