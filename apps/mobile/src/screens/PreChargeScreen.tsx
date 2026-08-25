import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { mockStations } from '../services/mockData';
import { Header, PrimaryButton, AuthGateModal, StatusModal } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { ChargeTarget } from '@chargemesh/shared-types';
import { useAuth, useCharging, useLanguage } from '../context';

interface PreChargeScreenProps {
  route: any;
  navigation: any;
}

export const PreChargeScreen: React.FC<PreChargeScreenProps> = ({
  route,
  navigation,
}) => {
  const { activeVehicle, isGuest } = useAuth();
  const { startSession } = useCharging();
  const { t } = useLanguage();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const stationId = route?.params?.stationId || mockStations[0].id;
  const connectorId = route?.params?.connectorId || mockStations[0].connectors[0].id;

  const station = mockStations.find((s) => s.id === stationId) || mockStations[0];
  const connector =
    station.connectors.find((c) => c.id === connectorId) || station.connectors[0];

  const [selectedTarget, setSelectedTarget] = useState<ChargeTarget>(ChargeTarget.AMOUNT);
  const [targetAmount, setTargetAmount] = useState<number>(500); // ₹500 default
  const [targetEnergyKwh, setTargetEnergyKwh] = useState<number>(25); // 25 kWh
  const [targetSoc, setTargetSoc] = useState<number>(85); // 85%
  const [targetMins, setTargetMins] = useState<number>(35); // 35 mins
  const [isStarting, setIsStarting] = useState(false);

  // Estimation formulas
  const batteryCap = activeVehicle?.batteryCapacityKwh || 40.5;
  const currentEstSoc = 28; // starting test SOC: 28%
  const stationPower = connector.maxPower || 60;
  const tariff = station.tariffPerKwh || 18.5;

  let estimatedKwhNumber = 0;
  let estimatedDurationMins = 0;
  let estimatedTotalAmount = 0;

  if (selectedTarget === ChargeTarget.AMOUNT) {
    estimatedTotalAmount = targetAmount;
    estimatedKwhNumber = Math.round((targetAmount / tariff) * 10) / 10;
    estimatedDurationMins = Math.max(
      5,
      Math.round((estimatedKwhNumber / stationPower) * 60)
    );
  } else if (selectedTarget === ChargeTarget.ENERGY) {
    estimatedKwhNumber = targetEnergyKwh;
    estimatedTotalAmount = Math.round(targetEnergyKwh * tariff);
    estimatedDurationMins = Math.max(
      5,
      Math.round((targetEnergyKwh / stationPower) * 60)
    );
  } else if (selectedTarget === ChargeTarget.BATTERY) {
    const socDiff = Math.max(5, targetSoc - currentEstSoc);
    estimatedKwhNumber = Math.round(((socDiff / 100) * batteryCap) * 10) / 10;
    estimatedTotalAmount = Math.round(estimatedKwhNumber * tariff);
    estimatedDurationMins = Math.max(
      5,
      Math.round((estimatedKwhNumber / stationPower) * 60)
    );
  } else {
    estimatedDurationMins = targetMins;
    estimatedKwhNumber = Math.round(((targetMins / 60) * stationPower) * 10) / 10;
    estimatedTotalAmount = Math.round(estimatedKwhNumber * tariff);
  }

  const handleStartCharging = async () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }

    setIsStarting(true);
    try {
      let targetVal = targetAmount;
      if (selectedTarget === ChargeTarget.ENERGY) targetVal = targetEnergyKwh;
      if (selectedTarget === ChargeTarget.BATTERY) targetVal = targetSoc;
      if (selectedTarget === ChargeTarget.TIME) targetVal = targetMins;

      await startSession(station, connector, selectedTarget, targetVal, currentEstSoc);
      navigation.replace('LiveCharging');
    } catch {
      setShowErrorModal(true);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t('preCharge.title')}
        subtitle={t('preCharge.subtitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Charger & Vehicle Confirmation Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Station</Text>
            <Text style={styles.itemValue} numberOfLines={1}>
              {station.name}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Operator Network</Text>
            <Text style={styles.itemValue}>{station.cpo.name}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Connector</Text>
            <Text style={styles.itemValue}>
              {connector.type} • {connector.maxPower} kW DC Fast
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Target Vehicle</Text>
            <Text style={styles.itemValue}>
              {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Standard EV'}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Tariff Rate</Text>
            <Text style={styles.tariffHighlight}>₹{station.tariffPerKwh}/kWh</Text>
          </View>
        </View>

        {/* Set Charging Target Tabs */}
        <View style={styles.targetSection}>
          <Text style={styles.sectionTitle}>Set Charging Target</Text>

          <View style={styles.targetTypeTabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTarget === ChargeTarget.AMOUNT && styles.tabSelected,
              ]}
              onPress={() => setSelectedTarget(ChargeTarget.AMOUNT)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTarget === ChargeTarget.AMOUNT && styles.tabTextSelected,
                ]}
              >
                ₹ Amount
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTarget === ChargeTarget.BATTERY && styles.tabSelected,
              ]}
              onPress={() => setSelectedTarget(ChargeTarget.BATTERY)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTarget === ChargeTarget.BATTERY && styles.tabTextSelected,
                ]}
              >
                % Battery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTarget === ChargeTarget.ENERGY && styles.tabSelected,
              ]}
              onPress={() => setSelectedTarget(ChargeTarget.ENERGY)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTarget === ChargeTarget.ENERGY && styles.tabTextSelected,
                ]}
              >
                kWh Energy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTarget === ChargeTarget.TIME && styles.tabSelected,
              ]}
              onPress={() => setSelectedTarget(ChargeTarget.TIME)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTarget === ChargeTarget.TIME && styles.tabTextSelected,
                ]}
              >
                ⏱️ Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Preset Selector Buttons */}
          <View style={styles.presetContainer}>
            {selectedTarget === ChargeTarget.AMOUNT && (
              <View style={styles.presetRow}>
                {[300, 500, 800, 1200].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.presetChip,
                      targetAmount === amt && styles.presetChipActive,
                    ]}
                    onPress={() => setTargetAmount(amt)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        targetAmount === amt && styles.presetChipTextActive,
                      ]}
                    >
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedTarget === ChargeTarget.BATTERY && (
              <View style={styles.presetRow}>
                {[80, 85, 90, 100].map((soc) => (
                  <TouchableOpacity
                    key={soc}
                    style={[
                      styles.presetChip,
                      targetSoc === soc && styles.presetChipActive,
                    ]}
                    onPress={() => setTargetSoc(soc)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        targetSoc === soc && styles.presetChipTextActive,
                      ]}
                    >
                      {soc}% {soc === 80 ? '⚡ (Fast)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedTarget === ChargeTarget.ENERGY && (
              <View style={styles.presetRow}>
                {[15, 25, 35, 45].map((kwh) => (
                  <TouchableOpacity
                    key={kwh}
                    style={[
                      styles.presetChip,
                      targetEnergyKwh === kwh && styles.presetChipActive,
                    ]}
                    onPress={() => setTargetEnergyKwh(kwh)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        targetEnergyKwh === kwh && styles.presetChipTextActive,
                      ]}
                    >
                      {kwh} kWh
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedTarget === ChargeTarget.TIME && (
              <View style={styles.presetRow}>
                {[20, 30, 45, 60].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.presetChip,
                      targetMins === m && styles.presetChipActive,
                    ]}
                    onPress={() => setTargetMins(m)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        targetMins === m && styles.presetChipTextActive,
                      ]}
                    >
                      {m} mins
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Session Forecast Projection Box */}
          <View style={styles.forecastBox}>
            <View style={styles.forecastCol}>
              <Text style={styles.forecastVal}>~{estimatedKwhNumber} kWh</Text>
              <Text style={styles.forecastLbl}>Est. Energy</Text>
            </View>
            <View style={styles.forecastDivider} />
            <View style={styles.forecastCol}>
              <Text style={styles.forecastVal}>~{estimatedDurationMins} min</Text>
              <Text style={styles.forecastLbl}>Est. Time</Text>
            </View>
            <View style={styles.forecastDivider} />
            <View style={styles.forecastCol}>
              <Text style={[styles.forecastVal, { color: colors.primary }]}>
                ₹{estimatedTotalAmount}
              </Text>
              <Text style={styles.forecastLbl}>Est. Cost</Text>
            </View>
          </View>
        </View>

        {/* Payment & Security Notice */}
        <View style={styles.paymentNoticeCard}>
          <Text style={styles.noticeIcon}>🔒</Text>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Pre-Authorized via Razorpay</Text>
            <Text style={styles.noticeSub}>
              Only actual delivered energy will be billed upon session stop.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={isStarting ? t('preCharge.initiating') : t('preCharge.proceedToCharge')}
          onPress={handleStartCharging}
          disabled={isStarting}
        />
      </View>

      <AuthGateModal
        visible={showAuthGate}
        featureName="Live EV Charging"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      <StatusModal
        visible={showErrorModal}
        type="error"
        title="Session Initiation Failed"
        message="Unable to handshake with the charging point. Please check connector plug status and try again."
        buttonLabel="Retry"
        onClose={() => setShowErrorModal(false)}
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
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  tariffHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  targetSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  targetTypeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 3,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabSelected: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  presetContainer: {
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  presetChip: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: 'rgba(0, 192, 115, 0.12)',
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetChipTextActive: {
    color: colors.primary,
  },
  forecastBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  forecastCol: {
    alignItems: 'center',
  },
  forecastVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  forecastLbl: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  forecastDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  paymentNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noticeSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
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
});
