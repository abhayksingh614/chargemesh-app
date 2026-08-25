import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useAuth } from '../context';
import { borderRadius, shadows } from '../theme';

interface PermissionSetupScreenProps {
  navigation: any;
}

type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const PermissionSetupScreen: React.FC<PermissionSetupScreenProps> = ({
  navigation,
}) => {
  const { theme, mode } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = mode === 'dark';

  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('prompt');
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<PermissionStatus>('prompt');

  // Check current permission statuses
  const checkAllPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setLocationStatus('granted');
      setCameraStatus('granted');
      setNotificationStatus('granted');
      return;
    }

    try {
      // 1. Check Location
      const hasFineLoc = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const hasCoarseLoc = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      setLocationStatus(hasFineLoc || hasCoarseLoc ? 'granted' : 'prompt');

      // 2. Check Camera
      const hasCam = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      setCameraStatus(hasCam ? 'granted' : 'prompt');

      // 3. Check Notifications (Android 13+ / API 33+)
      if (Platform.Version >= 33) {
        const hasNotif = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS' as any
        );
        setNotificationStatus(hasNotif ? 'granted' : 'prompt');
      } else {
        setNotificationStatus('granted');
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    checkAllPermissions();

    // Re-check permissions when returning from device Settings
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAllPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAllPermissions]);

  // Request Location Permission
  const handleRequestLocation = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const granted =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

      setLocationStatus(granted ? 'granted' : 'denied');
    } catch {
      setLocationStatus('denied');
    }
  };

  // Request Camera Permission
  const handleRequestCamera = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'ChargeMesh requires camera access to scan QR codes on EV charging dispensers.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        }
      );

      setCameraStatus(
        granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
      );
    } catch {
      setCameraStatus('denied');
    }
  };

  // Request Notification Permission
  const handleRequestNotification = async () => {
    if (Platform.OS !== 'android') return;
    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS' as any,
          {
            title: 'Notifications Permission',
            message:
              'ChargeMesh sends alerts for charging session status, OTP codes, and payment receipts.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );

        setNotificationStatus(
          granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
        );
      } else {
        setNotificationStatus('granted');
      }
    } catch {
      setNotificationStatus('denied');
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  const handleProceed = async () => {
    await AsyncStorage.setItem('@chargemesh:permissions_setup_completed', 'true').catch(() => {});
    if (isAuthenticated) {
      try {
        navigation.replace('MainTabs');
      } catch {
        navigation.navigate('MainTabs');
      }
    } else {
      try {
        navigation.replace('Login');
      } catch {
        navigation.navigate('Login');
      }
    }
  };

  // Sequential Allow All & Continue batch trigger
  const handleRequestAllAndProceed = async () => {
    if (Platform.OS !== 'android') {
      await handleProceed();
      return;
    }

    // 1. Request Location if not granted
    if (locationStatus !== 'granted') {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        const locOk =
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
        setLocationStatus(locOk ? 'granted' : 'denied');
      } catch {}
    }

    // 2. Request Camera if not granted
    if (cameraStatus !== 'granted') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message:
              'ChargeMesh requires camera access to scan QR codes on EV charging dispensers.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        setCameraStatus(
          granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
        );
      } catch {}
    }

    // 3. Request Notifications if not granted (API 33+)
    if (notificationStatus !== 'granted' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS' as any,
          {
            title: 'Notifications Permission',
            message:
              'ChargeMesh sends alerts for charging session status, OTP codes, and payment receipts.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        setNotificationStatus(
          granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
        );
      } catch {}
    }

    await handleProceed();
  };

  const allGranted =
    locationStatus === 'granted' &&
    cameraStatus === 'granted' &&
    notificationStatus === 'granted';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding */}
        <View style={styles.header}>
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
                borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#86EFAC',
              },
            ]}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Set Up ChargeMesh
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Allow the permissions below to get the best and most seamless EV charging experience.
          </Text>
        </View>

        {/* Permission Cards Container */}
        <View style={styles.cardsList}>
          {/* 1. Location Permission Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor:
                  locationStatus === 'granted'
                    ? isDark
                      ? 'rgba(0, 208, 132, 0.35)'
                      : '#86EFAC'
                    : theme.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      locationStatus === 'granted'
                        ? isDark
                          ? 'rgba(0, 208, 132, 0.2)'
                          : '#DCFCE7'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text style={styles.cardEmoji}>📍</Text>
              </View>
              <View style={styles.cardTexts}>
                <View style={styles.titleBadgeRow}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Location
                  </Text>
                  <View style={styles.requiredTag}>
                    <Text style={styles.requiredTagText}>Required for Discovery</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Find nearby charging stations and get accurate turn-by-turn navigation.
                </Text>
              </View>
            </View>

            <View style={styles.cardActionRow}>
              {locationStatus === 'granted' ? (
                <View style={styles.statusPillGranted}>
                  <Text style={styles.statusTextGranted}>🟢 Allowed</Text>
                </View>
              ) : locationStatus === 'denied' ? (
                <TouchableOpacity
                  style={[
                    styles.settingsBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : '#FEF2F2',
                      borderColor: isDark
                        ? 'rgba(239, 68, 68, 0.3)'
                        : '#FCA5A5',
                    },
                  ]}
                  onPress={handleOpenSettings}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.settingsBtnText, { color: '#EF4444' }]}>
                    ⚠️ Enable in Settings →
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.allowBtn, { backgroundColor: theme.primary }]}
                  onPress={handleRequestLocation}
                  activeOpacity={0.85}
                >
                  <Text style={styles.allowBtnText}>Allow</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 2. Camera Permission Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor:
                  cameraStatus === 'granted'
                    ? isDark
                      ? 'rgba(0, 208, 132, 0.35)'
                      : '#86EFAC'
                    : theme.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      cameraStatus === 'granted'
                        ? isDark
                          ? 'rgba(0, 208, 132, 0.2)'
                          : '#DCFCE7'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text style={styles.cardEmoji}>📷</Text>
              </View>
              <View style={styles.cardTexts}>
                <View style={styles.titleBadgeRow}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Camera
                  </Text>
                  <View
                    style={[
                      styles.recommendedTag,
                      {
                        backgroundColor: isDark
                          ? 'rgba(99, 102, 241, 0.15)'
                          : '#EEF2FF',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recommendedTagText,
                        { color: isDark ? '#818CF8' : '#4F46E5' },
                      ]}
                    >
                      Scan &amp; Charge
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Scan charging station QR codes to start sessions instantly.
                </Text>
              </View>
            </View>

            <View style={styles.cardActionRow}>
              {cameraStatus === 'granted' ? (
                <View style={styles.statusPillGranted}>
                  <Text style={styles.statusTextGranted}>🟢 Allowed</Text>
                </View>
              ) : cameraStatus === 'denied' ? (
                <TouchableOpacity
                  style={[
                    styles.settingsBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : '#FEF2F2',
                      borderColor: isDark
                        ? 'rgba(239, 68, 68, 0.3)'
                        : '#FCA5A5',
                    },
                  ]}
                  onPress={handleOpenSettings}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.settingsBtnText, { color: '#EF4444' }]}>
                    ⚠️ Enable in Settings →
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.allowBtn, { backgroundColor: theme.primary }]}
                  onPress={handleRequestCamera}
                  activeOpacity={0.85}
                >
                  <Text style={styles.allowBtnText}>Allow</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 3. Notifications Permission Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor:
                  notificationStatus === 'granted'
                    ? isDark
                      ? 'rgba(0, 208, 132, 0.35)'
                      : '#86EFAC'
                    : theme.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      notificationStatus === 'granted'
                        ? isDark
                          ? 'rgba(0, 208, 132, 0.2)'
                          : '#DCFCE7'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text style={styles.cardEmoji}>🔔</Text>
              </View>
              <View style={styles.cardTexts}>
                <View style={styles.titleBadgeRow}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Notifications
                  </Text>
                  <View
                    style={[
                      styles.recommendedTag,
                      {
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.15)'
                          : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recommendedTagText,
                        { color: isDark ? '#FBBF24' : '#D97706' },
                      ]}
                    >
                      Alerts &amp; OTP
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Get booking, charging, payment, and account status updates.
                </Text>
              </View>
            </View>

            <View style={styles.cardActionRow}>
              {notificationStatus === 'granted' ? (
                <View style={styles.statusPillGranted}>
                  <Text style={styles.statusTextGranted}>🟢 Allowed</Text>
                </View>
              ) : notificationStatus === 'denied' ? (
                <TouchableOpacity
                  style={[
                    styles.settingsBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : '#FEF2F2',
                      borderColor: isDark
                        ? 'rgba(239, 68, 68, 0.3)'
                        : '#FCA5A5',
                    },
                  ]}
                  onPress={handleOpenSettings}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.settingsBtnText, { color: '#EF4444' }]}>
                    ⚠️ Enable in Settings →
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.allowBtn, { backgroundColor: theme.primary }]}
                  onPress={handleRequestNotification}
                  activeOpacity={0.85}
                >
                  <Text style={styles.allowBtnText}>Allow</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View
          style={[
            styles.privacyNote,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.privacyNoteText, { color: theme.textMuted }]}>
            🔒 <Text style={{ fontWeight: '700' }}>Your Privacy Matters:</Text> ChargeMesh accesses foreground GPS and camera strictly while in use. You can manage or revoke permissions anytime in Profile → Permissions &amp; Privacy.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleRequestAllAndProceed}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>
              {allGranted ? 'Continue to ChargeMesh ➔' : 'Allow All & Continue ➔'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleProceed}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipBtnText, { color: theme.textSecondary }]}>
              Skip for Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  cardsList: {
    gap: 12,
    marginBottom: 18,
  },
  card: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    borderWidth: 1,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTexts: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  requiredTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  requiredTagText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  recommendedTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recommendedTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardActionRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  allowBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  allowBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  statusPillGranted: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusTextGranted: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  settingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  settingsBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  privacyNote: {
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionButtons: {
    gap: 10,
  },
  primaryBtn: {
    height: 50,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  skipBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
