import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { mockStations } from '../services/mockData';
import { Header, PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface QRScannerScreenProps {
  navigation: any;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);

  const handleSimulateScan = () => {
    // Navigate directly to pre-charge with sample station
    navigation.navigate('PreCharge', {
      stationId: mockStations[0].id,
      connectorId: mockStations[0].connectors[0].id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Scan & Charge ⚡"
        subtitle="Point camera at charger QR code"
      />

      <View style={styles.container}>
        {/* Simulated Camera Viewport */}
        <View style={styles.cameraBox}>
          <View style={styles.scanTarget}>
            {/* Viewport Corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.scanInstruction}>
              Align QR code within frame
            </Text>
          </View>

          {/* Flashlight toggle */}
          <TouchableOpacity
            style={[styles.torchButton, torchOn && styles.torchButtonOn]}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Text style={styles.torchText}>💡 {torchOn ? 'Flash On' : 'Flash Off'}</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Quick Scan Trigger */}
        <PrimaryButton
          title="⚡ Simulate QR Code Scan (Demo)"
          onPress={handleSimulateScan}
          style={styles.demoButton}
        />

        {/* Manual Charger Code Fallback */}
        <View style={styles.manualCard}>
          <Text style={styles.manualTitle}>Can't scan QR?</Text>
          <Text style={styles.manualSubtitle}>
            Enter the 6 to 10 digit Charger ID printed on the EVSE unit
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="e.g. TP-OKH-001"
              placeholderTextColor={colors.textSecondary}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleSimulateScan}
            >
              <Text style={styles.applyBtnText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cameraBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scanTarget: {
    width: 220,
    height: 220,
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
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanInstruction: {
    ...typography.captionBold,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  torchButton: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  torchButtonOn: {
    backgroundColor: colors.primary,
  },
  torchText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
  demoButton: {
    marginVertical: 14,
  },
  manualCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  manualSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: colors.darkGreen,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    ...typography.button,
    fontSize: 14,
  },
});
