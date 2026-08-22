import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Header,
  ChargingGauge,
  MetricCard,
  PrimaryButton,
  ConfirmationModal,
} from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useCharging } from '../context';

interface LiveChargingScreenProps {
  navigation: any;
}

export const LiveChargingScreen: React.FC<LiveChargingScreenProps> = ({ navigation }) => {
  const { activeSession, lastCompletedSession, isCharging, stopSession } = useCharging();
  const [showStopModal, setShowStopModal] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // If session completes, navigate to SessionComplete screen
  useEffect(() => {
    if (!isCharging && lastCompletedSession) {
      navigation.replace('SessionComplete');
    }
  }, [isCharging, lastCompletedSession]);

  if (!activeSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Charging Status ⚡" onBack={() => navigation.navigate('MainTabs')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔌</Text>
          <Text style={styles.emptyTitle}>No Active Charging Session</Text>
          <Text style={styles.emptySubtitle}>
            Scan a QR code or select a charger to begin charging.
          </Text>
          <PrimaryButton
            title="Discover Chargers"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
            style={styles.discoverBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCostRupees = (activeSession.accruedCostPaise / 100).toFixed(2);

  const handleConfirmStop = async () => {
    setIsStopping(true);
    setShowStopModal(false);
    await stopSession();
    setIsStopping(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Minimize Option */}
      <Header
        title="Live Charging ⚡"
        subtitle={`${activeSession.station.name}`}
        rightAction={
          <TouchableOpacity
            style={styles.minimizeBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.minimizeText}>Minimize ✕</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Network & Station Pill */}
        <View style={styles.networkPillRow}>
          <View style={styles.networkPill}>
            <Text style={styles.networkPillText}>
              {activeSession.station.cpo.name} • {activeSession.connector.type}
            </Text>
          </View>
          <View style={styles.liveIndicator}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveText}>TELEMETRY LIVE</Text>
          </View>
        </View>

        {/* Animated Charging Gauge */}
        <ChargingGauge
          socPercent={activeSession.currentSoc}
          powerKw={activeSession.currentPowerKw}
          isCharging={isCharging}
        />

        {/* Target Milestone Progress */}
        <View style={styles.targetProgressCard}>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Target Milestone</Text>
            <Text style={styles.targetValue}>
              {activeSession.targetType === 'BATTERY'
                ? `${activeSession.targetValue}% Battery`
                : activeSession.targetType === 'AMOUNT'
                ? `₹${activeSession.targetValue} Amount`
                : activeSession.targetType === 'ENERGY'
                ? `${activeSession.targetValue} kWh`
                : `${activeSession.targetValue} mins`}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, activeSession.currentSoc)}%` },
              ]}
            />
          </View>
        </View>

        {/* Live Telemetry Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <MetricCard
              icon="⚡"
              label="Charging Power"
              value={activeSession.currentPowerKw.toFixed(1)}
              unit="kW"
              subtitle="DC High Speed"
              color={colors.primary}
            />
            <MetricCard
              icon="🔋"
              label="Energy Delivered"
              value={activeSession.energyDeliveredKwh.toFixed(2)}
              unit="kWh"
              subtitle={`Rate: ₹${activeSession.tariffPerKwh}/kWh`}
              color={colors.primaryDark}
            />
          </View>

          <View style={styles.metricRow}>
            <MetricCard
              icon="⏱️"
              label="Session Time"
              value={formatDuration(activeSession.elapsedSeconds)}
              subtitle={`~${activeSession.estimatedRemainingMinutes}m remaining`}
              color={colors.textPrimary}
            />
            <MetricCard
              icon="💰"
              label="Accrued Cost"
              value={`₹${currentCostRupees}`}
              subtitle="Pre-authorized"
              color={colors.primary}
            />
          </View>
        </View>

        {/* Eco Impact Live Stat */}
        <View style={styles.ecoBanner}>
          <Text style={styles.ecoIcon}>🌱</Text>
          <Text style={styles.ecoText}>
            You have prevented{' '}
            <Text style={styles.ecoBold}>{activeSession.carbonSavedKg.toFixed(2)} kg</Text> of
            CO₂ emissions in this session.
          </Text>
        </View>
      </ScrollView>

      {/* Stop Charging Button */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={isStopping ? 'Stopping Session...' : '🛑 Stop Charging'}
          variant="danger"
          onPress={() => setShowStopModal(true)}
          disabled={isStopping}
        />
      </View>

      {/* Safety Confirmation Modal */}
      <ConfirmationModal
        visible={showStopModal}
        title="Stop Charging Session?"
        message="Are you sure you want to end charging? The session will complete and a final receipt will be generated based on energy delivered."
        confirmLabel="Confirm & Stop"
        cancelLabel="Keep Charging"
        isDestructive={true}
        onConfirm={handleConfirmStop}
        onCancel={() => setShowStopModal(false)}
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
  minimizeBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minimizeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  networkPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
  },
  networkPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  networkPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    color: colors.primary,
    fontSize: 12,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  targetProgressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  targetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  targetValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  metricsGrid: {
    width: '100%',
    marginTop: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 115, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 115, 0.2)',
  },
  ecoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  ecoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  ecoBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  discoverBtn: {
    minWidth: 200,
  },
});
