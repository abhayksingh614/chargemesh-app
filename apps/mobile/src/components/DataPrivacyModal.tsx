import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  AppState,
} from 'react-native';
import { borderRadius, shadows } from '../theme';
import { useTheme } from '../context';

interface DataPrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestDataExport?: () => void;
  onRequestDataDeletion?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({
  visible,
  onClose,
  onRequestDataExport,
  onRequestDataDeletion,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const [locationAllowed, setLocationAllowed] = useState(true);
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [notifAllowed, setNotifAllowed] = useState(true);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [promotionalNotifications, setPromotionalNotifications] = useState(false);

  const checkLivePermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      const hasFineLoc = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const hasCoarseLoc = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      setLocationAllowed(hasFineLoc || hasCoarseLoc);

      const hasCam = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      setCameraAllowed(hasCam);

      if (Platform.Version >= 33) {
        const hasNotif = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS' as any
        );
        setNotifAllowed(hasNotif);
      } else {
        setNotifAllowed(true);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (visible) {
      checkLivePermissions();
    }
  }, [visible, checkLivePermissions]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && visible) {
        checkLivePermissions();
      }
    });
    return () => sub.remove();
  }, [visible, checkLivePermissions]);

  const handleOpenSystemSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerArea}>
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(0, 208, 132, 0.15)'
                        : '#DCFCE7',
                    },
                  ]}
                >
                  <Text style={styles.headerIcon}>🔒</Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    Permissions &amp; Privacy
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                    Review &amp; control your device permissions &amp; data
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#F1F5F9',
                    borderColor: theme.border,
                  },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.closeBtnText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Device Permissions */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Device Permissions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Configured on this device for EV discovery and charging control
            </Text>

            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Location */}
              <View style={styles.permRow}>
                <View style={styles.permIconBox}>
                  <Text style={styles.permIcon}>📍</Text>
                </View>
                <View style={styles.permTexts}>
                  <Text style={[styles.permTitle, { color: theme.textPrimary }]}>
                    Location Services
                  </Text>
                  <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
                    Nearby station discovery and accurate navigation
                  </Text>
                </View>
                {locationAllowed ? (
                  <View style={styles.badgeAllowed}>
                    <Text style={styles.badgeAllowedText}>Allowed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.badgeDenied}
                    onPress={handleOpenSystemSettings}
                  >
                    <Text style={styles.badgeDeniedText}>Not Allowed ›</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Camera */}
              <View style={styles.permRow}>
                <View style={styles.permIconBox}>
                  <Text style={styles.permIcon}>📷</Text>
                </View>
                <View style={styles.permTexts}>
                  <Text style={[styles.permTitle, { color: theme.textPrimary }]}>
                    Camera Access
                  </Text>
                  <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
                    Used strictly to scan QR codes on charger guns
                  </Text>
                </View>
                {cameraAllowed ? (
                  <View style={styles.badgeAllowed}>
                    <Text style={styles.badgeAllowedText}>Allowed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.badgeDenied}
                    onPress={handleOpenSystemSettings}
                  >
                    <Text style={styles.badgeDeniedText}>Not Allowed ›</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Notifications */}
              <View style={styles.permRow}>
                <View style={styles.permIconBox}>
                  <Text style={styles.permIcon}>🔔</Text>
                </View>
                <View style={styles.permTexts}>
                  <Text style={[styles.permTitle, { color: theme.textPrimary }]}>
                    Push Notifications
                  </Text>
                  <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
                    OTP codes, charging complete &amp; invoice alerts
                  </Text>
                </View>
                {notifAllowed ? (
                  <View style={styles.badgeAllowed}>
                    <Text style={styles.badgeAllowedText}>Allowed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.badgeDenied}
                    onPress={handleOpenSystemSettings}
                  >
                    <Text style={styles.badgeDeniedText}>Not Allowed ›</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.systemSettingsBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}
              onPress={handleOpenSystemSettings}
              activeOpacity={0.8}
            >
              <Text style={[styles.systemSettingsText, { color: theme.textPrimary }]}>
                ⚙️ Manage Permissions in Device Settings ›
              </Text>
            </TouchableOpacity>

            {/* Section 2: Privacy Controls & Toggles */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 22 }]}>
              Telemetry &amp; Privacy Controls
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Manage how your diagnostic telemetry is shared
            </Text>

            <View
              style={[
                styles.cardGroup,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.toggleRow}>
                <View style={styles.toggleTexts}>
                  <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                    EV Session Telemetry
                  </Text>
                  <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                    Share SoC and charging curves to optimize battery health recommendations
                  </Text>
                </View>
                <Switch
                  value={telemetryEnabled}
                  onValueChange={setTelemetryEnabled}
                  trackColor={{ false: '#CBD5E1', true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTexts}>
                  <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                    Anonymous Diagnostic Analytics
                  </Text>
                  <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                    Help us detect charger gun faults and app crashes anonymously
                  </Text>
                </View>
                <Switch
                  value={analyticsEnabled}
                  onValueChange={setAnalyticsEnabled}
                  trackColor={{ false: '#CBD5E1', true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTexts}>
                  <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                    Promotional &amp; Partner Offers
                  </Text>
                  <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                    Receive discounts on charging tariffs from partner CPOs
                  </Text>
                </View>
                <Switch
                  value={promotionalNotifications}
                  onValueChange={setPromotionalNotifications}
                  trackColor={{ false: '#CBD5E1', true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 3: Data Subject Rights (DPDP Act) */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 22 }]}>
              Your Rights (DPDP Act 2023)
            </Text>

            <View style={styles.rightsActionsRow}>
              <TouchableOpacity
                style={[
                  styles.rightsBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0, 208, 132, 0.1)'
                      : '#DCFCE7',
                    borderColor: isDark
                      ? 'rgba(0, 208, 132, 0.25)'
                      : '#86EFAC',
                  },
                ]}
                onPress={onRequestDataExport}
                activeOpacity={0.8}
              >
                <Text style={[styles.rightsBtnText, { color: isDark ? '#00D084' : '#166534' }]}>
                  📥 Request Data Export
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rightsBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : '#FEF2F2',
                    borderColor: isDark
                      ? 'rgba(239, 68, 68, 0.25)'
                      : '#FECDD3',
                  },
                ]}
                onPress={onRequestDataDeletion}
                activeOpacity={0.8}
              >
                <Text style={[styles.rightsBtnText, { color: '#EF4444' }]}>
                  🗑️ Delete Account Data
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footerArea,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
              onPress={onClose}
              activeOpacity={0.88}
            >
              <Text style={styles.doneButtonText}>Save &amp; Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    ...shadows.card,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 10,
  },
  cardGroup: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  permIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  permIcon: {
    fontSize: 16,
  },
  permTexts: {
    flex: 1,
    marginRight: 8,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  permDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeAllowed: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: '#DCFCE7',
  },
  badgeAllowedText: {
    color: '#16A34A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  badgeDenied: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  badgeDeniedText: {
    color: '#EF4444',
    fontSize: 10.5,
    fontWeight: '800',
  },
  divider: {
    height: 1,
  },
  systemSettingsBtn: {
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  systemSettingsText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleTexts: {
    flex: 1,
    marginRight: 14,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  rightsActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  rightsBtn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightsBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  footerArea: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  doneButton: {
    height: 46,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
