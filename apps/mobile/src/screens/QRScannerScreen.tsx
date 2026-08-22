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
} from 'react-native';
import { mockStations } from '../services/mockData';
import { Header, StatusModal } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface QRScannerScreenProps {
  navigation: any;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanningSimulation, setIsScanningSimulation] = useState(false);
  const [simulatedStationName, setSimulatedStationName] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', message: '' });

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanSuccessScale = useRef(new Animated.Value(0)).current;

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'ChargeMesh Camera Permission',
            message:
              'ChargeMesh requires camera access to scan charger QR codes and start sessions instantly.',
            buttonPositive: 'Grant Permission',
            buttonNegative: 'Cancel',
          }
        );
        setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch {
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(true);
    }
  };

  useEffect(() => {
    requestCameraPermission();

    // Laser sweep animation loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 190,
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
  }, []);

  const handleSimulateScan = async (stationIndex = 0) => {
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

    // 600ms realistic camera QR decode delay
    await new Promise((res) => setTimeout(res, 700));

    setIsScanningSimulation(false);
    scanSuccessScale.setValue(0);

    navigation.navigate('PreCharge', {
      stationId: station.id,
      connectorId: availableConnector.id,
    });
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setStatusMessage({
        title: 'Missing Charger Code',
        message: 'Please enter the 6 to 8-digit numeric code printed below the QR code on the charger.',
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Scan Charger QR 📷"
        subtitle="Point camera at charger sticker or enter code"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={[styles.torchBtn, torchOn && styles.torchBtnActive]}
            onPress={() => setTorchOn(!torchOn)}
            activeOpacity={0.8}
          >
            <Text style={styles.torchIcon}>{torchOn ? '🔦 ON' : '💡 Flash'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Viewfinder Reticle Area */}
        <View style={styles.cameraBox}>
          {/* Laser Reticle */}
          <View style={styles.reticle}>
            {/* Corner Bracket Guides */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated Laser Scan Line */}
            <Animated.View
              style={[
                styles.laserLine,
                {
                  transform: [{ translateY: scanLineAnim }],
                },
              ]}
            />

            {/* Center Aim Crosshair */}
            <View style={styles.crosshair}>
              <Text style={styles.crosshairText}>⚡</Text>
            </View>

            {/* Simulation Scan Success Overlay */}
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

          {/* Scanner Sensor Status Pill */}
          <View style={styles.scannerStatusPill}>
            <View
              style={[
                styles.statusDot,
                hasCameraPermission ? styles.statusDotActive : styles.statusDotPending,
              ]}
            />
            <Text style={styles.scannerStatusText}>
              {hasCameraPermission
                ? 'Camera Sensor Active • Ready to Scan'
                : 'Camera Permission Required (Use Simulation Below)'}
            </Text>
          </View>

          {/* Permission Prompt if Denied */}
          {hasCameraPermission === false && (
            <TouchableOpacity
              style={styles.permissionBtn}
              activeOpacity={0.85}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionBtnText}>Enable Camera Access</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ⚡ Prominent Simulation Bar for Instant Testing */}
        <View style={styles.simulationContainer}>
          <View style={styles.simulationHeader}>
            <Text style={styles.simulationTag}>⚡ 1-TAP SIMULATED QR SCANS</Text>
            <Text style={styles.simulationSub}>Test real charging without a physical QR code</Text>
          </View>
          <View style={styles.simulationPillsRow}>
            <TouchableOpacity
              style={styles.simPill}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(0)}
            >
              <Text style={styles.simPillEmoji}>⚡</Text>
              <Text style={styles.simPillText}>Tata 60kW DC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simPill, { borderColor: '#3B82F6' }]}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(1)}
            >
              <Text style={styles.simPillEmoji}>🔵</Text>
              <Text style={styles.simPillText}>Jio-bp 120kW</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simPill, { borderColor: '#10B981' }]}
              activeOpacity={0.8}
              onPress={() => handleSimulateScan(2)}
            >
              <Text style={styles.simPillEmoji}>🟢</Text>
              <Text style={styles.simPillText}>Statiq 150kW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Simulated QR Hubs for Instant Testing */}
        <View style={styles.presetSection}>
          <Text style={styles.presetHeading}>Verified Partner Charging Bays:</Text>
          <View style={styles.presetGrid}>
            <TouchableOpacity
              style={styles.presetCard}
              activeOpacity={0.88}
              onPress={() => handleSimulateScan(0)}
            >
              <View style={styles.presetIconWrap}>
                <Text style={styles.presetEmoji}>⚡</Text>
              </View>
              <View style={styles.presetInfo}>
                <Text style={styles.presetTitle}>Tata Power EZ Charge</Text>
                <Text style={styles.presetSubtitle}>60 kW CCS2 • CP New Delhi</Text>
              </View>
              <Text style={styles.presetScanTag}>SCAN ➔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetCard}
              activeOpacity={0.88}
              onPress={() => handleSimulateScan(1)}
            >
              <View style={[styles.presetIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.presetEmoji}>🔵</Text>
              </View>
              <View style={styles.presetInfo}>
                <Text style={styles.presetTitle}>Jio-bp pulse Hub</Text>
                <Text style={styles.presetSubtitle}>120 kW Dual Gun • CyberCity</Text>
              </View>
              <Text style={styles.presetScanTag}>SCAN ➔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetCard}
              activeOpacity={0.88}
              onPress={() => handleSimulateScan(2)}
            >
              <View style={[styles.presetIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.presetEmoji}>🟢</Text>
              </View>
              <View style={styles.presetInfo}>
                <Text style={styles.presetTitle}>Statiq HyperCharge</Text>
                <Text style={styles.presetSubtitle}>150 kW Ultra-Fast • Sector 29</Text>
              </View>
              <Text style={styles.presetScanTag}>SCAN ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Station ID Numeric Form */}
        <View style={styles.manualCard}>
          <Text style={styles.manualTitle}>Or Enter Charger ID Manually</Text>
          <Text style={styles.manualSubtitle}>
            Located underneath the QR sticker (e.g. CM-DEL-001)
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. CM-DEL-001"
              placeholderTextColor={colors.textMuted}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleManualSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>Connect ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Validation Alert Modal */}
      <StatusModal
        visible={showStatusModal}
        type="warning"
        title={statusMessage.title}
        message={statusMessage.message}
        onClose={() => setShowStatusModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.md,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  torchBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  torchBtnActive: {
    backgroundColor: colors.ecoLight,
    borderColor: colors.primary,
  },
  torchIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cameraBox: {
    width: '100%',
    height: 270,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  reticle: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  crosshair: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairText: {
    fontSize: 16,
  },
  scanSuccessOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    width: 190,
  },
  scanSuccessIcon: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  scanSuccessText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scanSuccessStation: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  scannerStatusPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  statusDotPending: {
    backgroundColor: colors.warning,
  },
  scannerStatusText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '600',
  },
  permissionBtn: {
    position: 'absolute',
    top: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  permissionBtnText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  simulationContainer: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  simulationHeader: {
    marginBottom: spacing.xs + 2,
  },
  simulationTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  simulationSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  simulationPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xs,
  },
  simPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.card,
  },
  simPillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  simPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  presetHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  presetGrid: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  presetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.ecoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  presetEmoji: {
    fontSize: 16,
  },
  presetInfo: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  presetScanTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  manualCard: {
    width: '100%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  manualTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  manualSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
});
