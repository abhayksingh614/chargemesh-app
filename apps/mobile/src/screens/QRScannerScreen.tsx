import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  PermissionsAndroid,
  ScrollView,
  Linking,
  Vibration,
  requireNativeComponent,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { mockStations } from '../services/mockData';
import { Header, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useLanguage, useTheme } from '../context';

interface QRScannerScreenProps {
  navigation: any;
}

interface NativeCameraViewProps {
  style?: any;
  torchEnabled?: boolean;
  isActive?: boolean;
  onQrCodeScanned?: (event: any) => void;
}

// Native CameraView exposed by CameraViewManager
const NativeCameraView =
  Platform.OS === 'android'
    ? requireNativeComponent<NativeCameraViewProps>('CameraView')
    : null;

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const { isGuest } = useAuth();
  const { t } = useLanguage();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const isFocused = useIsFocused();

  const [manualCode, setManualCode] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanningSimulation, setIsScanningSimulation] = useState(false);
  const [simulatedStationName, setSimulatedStationName] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', message: '' });

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanSuccessScale = useRef(new Animated.Value(0)).current;
  const isProcessingScan = useRef(false);

  // Check & Request Camera Permission (only for authenticated users)
  const checkAndRequestCameraPermission = async () => {
    if (isGuest) return;
    if (Platform.OS === 'android') {
      try {
        const hasPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPerm) {
          setHasCameraPermission(true);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'ChargeMesh Camera Permission',
            message:
              'ChargeMesh requires camera access to scan charger QR codes and start sessions instantly.',
            buttonPositive: 'Grant Permission',
            buttonNegative: 'Not Now',
          }
        );

        setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(true);
    }
  };

  useEffect(() => {
    if (isGuest) return;
    if (isFocused && hasCameraPermission !== true) {
      checkAndRequestCameraPermission();
    }

    // Laser sweep animation loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 200,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [isFocused, isGuest]);

  // Handle Real Camera QR Code Scan Event
  const handleNativeQrScanned = (event: any) => {
    const rawCode = event?.nativeEvent?.code;
    if (!rawCode || isProcessingScan.current) return;

    isProcessingScan.current = true;
    try {
      Vibration.vibrate(100);
    } catch {
      // Ignore vibration errors
    }

    // Match station by ID, code, or URL param
    const codeClean = String(rawCode).trim();
    const matched = mockStations.find(
      (s) =>
        s.id.toLowerCase() === codeClean.toLowerCase() ||
        codeClean.toLowerCase().includes(s.id.toLowerCase()) ||
        s.name.toLowerCase().includes(codeClean.toLowerCase())
    );

    const station = matched || mockStations[0];
    const availableConnector =
      station.connectors.find((c) => c.status === 'AVAILABLE') || station.connectors[0];

    setIsScanningSimulation(true);
    setSimulatedStationName(station.name);

    Animated.spring(scanSuccessScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsScanningSimulation(false);
      scanSuccessScale.setValue(0);
      isProcessingScan.current = false;

      navigation.navigate('PreCharge', {
        stationId: station.id,
        connectorId: availableConnector.id,
      });
    }, 600);
  };

  // Simulated 1-Tap QR Scan
  const handleSimulateScan = async (stationIndex = 0) => {
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    try {
      Vibration.vibrate(80);
    } catch {
      // Ignore vibration errors
    }

    const station = mockStations[stationIndex] || mockStations[0];
    const availableConnector =
      station.connectors.find((c) => c.status === 'AVAILABLE') || station.connectors[0];

    setIsScanningSimulation(true);
    setSimulatedStationName(station.name);

    Animated.spring(scanSuccessScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    await new Promise((res) => setTimeout(res, 600));

    setIsScanningSimulation(false);
    scanSuccessScale.setValue(0);
    isProcessingScan.current = false;

    navigation.navigate('PreCharge', {
      stationId: station.id,
      connectorId: availableConnector.id,
    });
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setStatusMessage({
        title: 'Missing Charger Code',
        message:
          'Please enter the 6 to 8-digit numeric code printed below the QR code on the charger.',
      });
      setShowStatusModal(true);
      return;
    }

    const matched = mockStations.find(
      (s) =>
        s.id.toLowerCase().includes(manualCode.toLowerCase()) ||
        s.name.toLowerCase().includes(manualCode.toLowerCase())
    );

    const station = matched || mockStations[0];
    const connector =
      station.connectors.find((c) => c.status === 'AVAILABLE') || station.connectors[0];

    navigation.navigate('PreCharge', {
      stationId: station.id,
      connectorId: connector.id,
    });
  };

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title={`${t('qr.title')} ⚡`}
          subtitle={t('qr.subtitle')}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.guestContainer}>
          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.guestLockCircle}>
              <Text style={{ fontSize: 36 }}>⚡</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Sign In to Start Charging ⚡
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Please log in or create an account to start an EV charging session.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  borderColor: theme.primary,
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
                },
              ]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.88}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={[styles.ghostBtnText, { color: theme.textSecondary }]}>
                Continue Exploring
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={`${t('qr.title')} ⚡`}
        subtitle={t('qr.subtitle')}
        onBack={() => navigation.goBack()}
        rightAction={
          hasCameraPermission ? (
            <TouchableOpacity
              style={[
                styles.torchHeaderBtn,
                {
                  backgroundColor: isTorchOn ? theme.primary : isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isTorchOn ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setIsTorchOn(!isTorchOn)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.torchHeaderBtnText,
                  { color: isTorchOn ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {isTorchOn ? '🔦 Flash ON' : '💡 Flash'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Viewfinder Reticle Area */}
        <View
          style={[
            styles.cameraBox,
            { backgroundColor: '#000000', borderColor: isDark ? '#334155' : '#E2E8F0' },
          ]}
        >
          {/* Live Native Camera Feed */}
          {hasCameraPermission && NativeCameraView ? (
            <View style={StyleSheet.absoluteFill}>
              <NativeCameraView
                style={StyleSheet.absoluteFill}
                torchEnabled={isTorchOn}
                isActive={isFocused && hasCameraPermission === true}
                onQrCodeScanned={handleNativeQrScanned}
              />
            </View>
          ) : null}

          {/* Scanner Reticle Overlay */}
          <View style={styles.reticle}>
            {/* Corner Bracket Guides */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated Laser Scan Line */}
            {hasCameraPermission && (
              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    transform: [{ translateY: scanLineAnim }],
                  },
                ]}
              />
            )}

            {/* Center Crosshair */}
            <View style={styles.crosshair}>
              <Text style={styles.crosshairText}>⚡</Text>
            </View>

            {/* Scan Success Overlay */}
            {isScanningSimulation && (
              <Animated.View
                style={[
                  styles.scanSuccessOverlay,
                  {
                    transform: [{ scale: scanSuccessScale }],
                  },
                ]}
              >
                <Text style={styles.scanSuccessIcon}>✓</Text>
                <Text style={styles.scanSuccessText}>QR Code Decoded!</Text>
                <Text style={styles.scanSuccessStation}>{simulatedStationName}</Text>
              </Animated.View>
            )}
          </View>

          {/* Loading / Checking State */}
          {hasCameraPermission === null && (
            <View style={styles.permissionFallbackOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.fallbackCheckingText}>Checking Camera Sensor...</Text>
            </View>
          )}

          {/* Permission Denied UI */}
          {hasCameraPermission === false && (
            <View style={styles.permissionFallbackOverlay}>
              <Text style={styles.permissionDeniedIcon}>📷</Text>
              <Text style={styles.permissionDeniedTitle}>Camera Access Required</Text>
              <Text style={styles.permissionDeniedSub}>
                Allow camera permission to point and scan charging station QR codes in realtime.
              </Text>
              <View style={styles.permissionActionsRow}>
                <TouchableOpacity
                  style={[styles.grantBtn, { backgroundColor: theme.primary }]}
                  activeOpacity={0.85}
                  onPress={checkAndRequestCameraPermission}
                >
                  <Text style={styles.grantBtnText}>Grant Permission</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingsBtn, { borderColor: 'rgba(255,255,255,0.3)' }]}
                  activeOpacity={0.85}
                  onPress={() => Linking.openSettings()}
                >
                  <Text style={styles.settingsBtnText}>Open Settings ⚙</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Alignment Instruction Banner */}
          <View style={styles.instructionBannerBox}>
            <Text style={styles.instructionBannerText}>🎯 Align the QR code inside the frame</Text>
          </View>

          {/* Scanner Status Pill */}
          <View style={styles.scannerStatusPill}>
            <View
              style={[
                styles.statusDot,
                hasCameraPermission ? styles.statusDotActive : styles.statusDotPending,
              ]}
            />
            <Text style={styles.scannerStatusText}>
              {hasCameraPermission
                ? 'Camera Sensor Active • Scanning...'
                : 'Camera Disabled • Use Manual Code or Sim Below'}
            </Text>
          </View>
        </View>

        {/* ⚡ 1-Tap Simulated Scans for Testing */}
        <View
          style={[
            styles.simulationContainer,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.simulationHeader}>
            <Text style={[styles.simulationTag, { color: theme.primary }]}>
              ⚡ 1-TAP INSTANT QR SIMULATION
            </Text>
            <Text style={[styles.simulationSub, { color: theme.textSecondary }]}>
              Test live charging without a physical QR code
            </Text>
          </View>
          <View style={styles.simulationPillsRow}>
            <TouchableOpacity
              style={[styles.simPill, { borderColor: theme.primary }]}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(0)}
            >
              <Text style={styles.simPillEmoji}>⚡</Text>
              <Text style={[styles.simPillText, { color: theme.textPrimary }]}>Tata 60kW DC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simPill, { borderColor: '#3B82F6' }]}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(1)}
            >
              <Text style={styles.simPillEmoji}>🔵</Text>
              <Text style={[styles.simPillText, { color: theme.textPrimary }]}>Jio-bp 120kW</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simPill, { borderColor: '#10B981' }]}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(2)}
            >
              <Text style={styles.simPillEmoji}>🟢</Text>
              <Text style={[styles.simPillText, { color: theme.textPrimary }]}>Statiq 150kW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Charger Code Section */}
        <View
          style={[
            styles.manualCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.manualHeader}>
            <Text style={[styles.manualTitle, { color: theme.textPrimary }]}>
              Enter Charger ID Manually
            </Text>
            <Text style={[styles.manualSubtitle, { color: theme.textSecondary }]}>
              Can't scan the QR? Enter the alphanumeric ID from the charger screen:
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.manualInput,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g. TP-DEL-01 or JB-002"
              placeholderTextColor={theme.textMuted}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
              onPress={handleManualSubmit}
            >
              <Text style={styles.submitButtonText}>Connect ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Status Modal */}
      <StatusModal
        visible={showStatusModal}
        type="warning"
        title={statusMessage.title}
        message={statusMessage.message}
        buttonLabel="OK"
        onClose={() => setShowStatusModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    paddingBottom: 36,
  },

  // Torch Action in Header
  torchHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  torchHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Viewfinder Box
  cameraBox: {
    height: 310,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    ...shadows.card,
  },
  reticle: {
    width: 220,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#00D084',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#00D084',
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  crosshair: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 208, 132, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairText: {
    fontSize: 18,
  },
  scanSuccessOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.92)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  scanSuccessIcon: {
    fontSize: 40,
    color: '#00D084',
    fontWeight: '900',
    marginBottom: 4,
  },
  scanSuccessText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  scanSuccessStation: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },

  // Fallback / Permission Overlays
  permissionFallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fallbackCheckingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  permissionDeniedIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  permissionDeniedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  permissionDeniedSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  permissionActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  grantBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  settingsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  settingsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Instruction Banner
  instructionBannerBox: {
    position: 'absolute',
    top: 14,
    backgroundColor: 'rgba(7, 24, 36, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  instructionBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Scanner Sensor Status Pill
  scannerStatusPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotActive: {
    backgroundColor: '#00D084',
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
  scannerStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Simulation Container
  simulationContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  simulationHeader: {
    marginBottom: 10,
  },
  simulationTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  simulationSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  simulationPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    gap: 4,
  },
  simPillEmoji: {
    fontSize: 13,
  },
  simPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Manual Card
  manualCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1.2,
    ...shadows.card,
  },
  manualHeader: {
    marginBottom: 12,
  },
  manualTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  manualSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
  },
  submitButton: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  guestCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  guestLockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  ghostBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
