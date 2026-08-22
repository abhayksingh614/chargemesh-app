import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { PrimaryButton, StatusModal } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useCharging } from '../context';

interface SessionCompleteScreenProps {
  navigation: any;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({ navigation }) => {
  const { lastCompletedSession, clearCompletedSession } = useCharging();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const session = lastCompletedSession;
  const energyDeliveredKwh = session?.energyDeliveredKwh || 18.5;
  const durationSeconds = session?.elapsedSeconds || 1800;
  const finalAmountRupees = session
    ? (session.accruedCostPaise / 100).toFixed(2)
    : '342.25';
  const stationName = session?.station.name || 'Connaught Place Fast Charging Hub';
  const cpoName = session?.station.cpo.name || 'Tata Power EZ Charge';
  const tariffPerKwh = session?.tariffPerKwh || 18.5;
  const co2SavedKg = session?.carbonSavedKg.toFixed(2) || '15.17';

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDone = () => {
    clearCompletedSession();
    navigation.replace('MainTabs');
  };

  const handleDownloadInvoice = () => {
    setShowInvoiceModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon & Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.successEmoji}>⚡</Text>
          </View>
          <Text style={styles.title}>Charging Complete!</Text>
          <Text style={styles.subtitle}>
            Your battery has reached the configured charge target safely.
          </Text>
        </View>

        {/* Receipt & Bill Summary Card */}
        <View style={styles.receiptCard}>
          <View style={styles.totalAmountSection}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT BILLED</Text>
            <Text style={styles.totalValue}>₹{finalAmountRupees}</Text>
            <View style={styles.reconciledPill}>
              <Text style={styles.reconciledText}>✓ Paid via Fast Wallet</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Session Metrics Breakdown */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Station Hub</Text>
              <Text style={styles.detailVal} numberOfLines={1}>
                {stationName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CPO Network</Text>
              <Text style={styles.detailVal}>{cpoName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Energy Delivered</Text>
              <Text style={styles.detailVal}>{energyDeliveredKwh.toFixed(2)} kWh</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailVal}>{formatDuration(durationSeconds)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Average Tariff</Text>
              <Text style={styles.detailVal}>₹{tariffPerKwh}/kWh</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Environmental Savings Banner */}
          <View style={styles.ecoImpactRow}>
            <Text style={styles.ecoEmoji}>🌱</Text>
            <View style={styles.ecoTextWrap}>
              <Text style={styles.ecoTitle}>{co2SavedKg} kg CO₂ Prevented</Text>
              <Text style={styles.ecoSub}>
                Thank you for driving electric and reducing urban emissions.
              </Text>
            </View>
          </View>

          {/* Download Invoice Button */}
          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Text style={styles.invoiceButtonText}>📄 View Tax Invoice Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Done / Continue CTA */}
      <View style={styles.bottomBar}>
        <PrimaryButton title="Done & Return Home" onPress={handleDone} />
      </View>

      {/* Invoice Download Status Modal */}
      <StatusModal
        visible={showInvoiceModal}
        type="success"
        badge="Tax Invoice"
        iconEmoji="📄"
        title="Official Tax Invoice Ready"
        message={`Invoice #${session?.sessionId || 'INV-2026-0818'} for ₹${finalAmountRupees} is saved to your account and emailed to your registered address.`}
        details={[
          { icon: '⚡', title: 'Energy Billed', value: `${energyDeliveredKwh.toFixed(2)} kWh` },
          { icon: '⏱️', title: 'Duration', value: formatDuration(durationSeconds) },
          { icon: '💰', title: 'Total Paid', value: `₹${finalAmountRupees}` },
          { icon: '🏛️', title: 'GSTIN', value: '07AABCT2384P1Z4' },
        ]}
        buttonLabel="Done"
        onClose={() => setShowInvoiceModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 110,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.ecoLight,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  successEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.elevated,
  },
  totalAmountSection: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: 4,
  },
  reconciledPill: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  reconciledText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  dashedDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  detailsGrid: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ecoImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ecoLight,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ecoEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  ecoTextWrap: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  ecoSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  invoiceButton: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  invoiceButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.md,
    ...shadows.elevated,
  },
});
