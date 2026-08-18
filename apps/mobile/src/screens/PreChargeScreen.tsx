import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { mockStations, mockDefaultVehicle } from '../services/mockData';
import { Header, PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';
import { ChargeTarget } from '@chargemesh/shared-types';

interface PreChargeScreenProps {
  route: any;
  navigation: any;
}

export const PreChargeScreen: React.FC<PreChargeScreenProps> = ({
  route,
  navigation,
}) => {
  const stationId = route?.params?.stationId || mockStations[0].id;
  const connectorId = route?.params?.connectorId || mockStations[0].connectors[0].id;

  const station = mockStations.find(s => s.id === stationId) || mockStations[0];
  const connector = station.connectors.find(c => c.id === connectorId) || station.connectors[0];

  const [selectedTarget, setSelectedTarget] = useState<ChargeTarget>(ChargeTarget.AMOUNT);
  const [targetAmount, setTargetAmount] = useState<number>(500); // ₹500 default

  const estimatedKwh = (targetAmount / station.tariffPerKwh).toFixed(1);
  const estimatedMins = Math.round((Number(estimatedKwh) / connector.maxPower!) * 60);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Ready to Charge? ⚡"
        subtitle="Confirm session parameters"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Charger & Vehicle Confirmation */}
        <View style={styles.summaryCard}>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Station</Text>
            <Text style={styles.itemValue}>{station.name}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Operator (CPO)</Text>
            <Text style={styles.itemValue}>{station.cpo.name}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Connector</Text>
            <Text style={styles.itemValue}>{connector.type} • {connector.maxPower} kW DC</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Vehicle</Text>
            <Text style={styles.itemValue}>{mockDefaultVehicle.make} {mockDefaultVehicle.model}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.itemLabel}>Tariff Rate</Text>
            <Text style={styles.tariffHighlight}>₹{station.tariffPerKwh}/kWh</Text>
          </View>
        </View>

        {/* Set Charging Target */}
        <View style={styles.targetSection}>
          <Text style={styles.sectionTitle}>Select Charging Target</Text>
          
          <View style={styles.targetTypeTabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTarget === ChargeTarget.AMOUNT && styles.tabSelected]}
              onPress={() => setSelectedTarget(ChargeTarget.AMOUNT)}
            >
              <Text style={[styles.tabText, selectedTarget === ChargeTarget.AMOUNT && styles.tabTextSelected]}>
                By Amount (₹)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTarget === ChargeTarget.ENERGY && styles.tabSelected]}
              onPress={() => setSelectedTarget(ChargeTarget.ENERGY)}
            >
              <Text style={[styles.tabText, selectedTarget === ChargeTarget.ENERGY && styles.tabTextSelected]}>
                By Energy (kWh)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTarget === ChargeTarget.TIME && styles.tabSelected]}
              onPress={() => setSelectedTarget(ChargeTarget.TIME)}
            >
              <Text style={[styles.tabText, selectedTarget === ChargeTarget.TIME && styles.tabTextSelected]}>
                By Time (min)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Target Values */}
          <View style={styles.quickOptionsGrid}>
            {[200, 500, 1000, 1500].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.quickPill, targetAmount === amt && styles.quickPillSelected]}
                onPress={() => setTargetAmount(amt)}
              >
                <Text style={[styles.quickPillText, targetAmount === amt && styles.quickPillTextSelected]}>
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estimate Breakdown Card */}
        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>Session Estimate</Text>
          <View style={styles.estimateGrid}>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateValue}>~{estimatedKwh} kWh</Text>
              <Text style={styles.estimateLabel}>Energy</Text>
            </View>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateValue}>~{estimatedMins} min</Text>
              <Text style={styles.estimateLabel}>Est. Duration</Text>
            </View>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateValue}>₹{targetAmount}</Text>
              <Text style={styles.estimateLabel}>Pre-Auth</Text>
            </View>
          </View>
          <Text style={styles.legalDisclaimer}>
            *Final cost will be reconciled against actual CDR and energy consumed. Unused funds are automatically released.
          </Text>
        </View>

        {/* Payment Method Preview */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentTitle}>💳 Payment Method</Text>
            <Text style={styles.paymentChange}>Razorpay UPI</Text>
          </View>
          <Text style={styles.paymentSub}>upi-driver@okhdfcbank (Auto-deduct on session completion)</Text>
        </View>
      </ScrollView>

      {/* Start Charging CTA */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={`Authorize ₹${targetAmount} & Start Charging`}
          onPress={() => {
            navigation.navigate('LiveCharging', {
              stationId: station.id,
              connectorId: connector.id,
              targetAmount,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemLabel: {
    ...typography.bodySecondary,
  },
  itemValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  tariffHighlight: {
    ...typography.subtitle,
    color: colors.primary,
  },
  targetSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  targetTypeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabSelected: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: colors.darkGreen,
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickPill: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  quickPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.ecoLight,
  },
  quickPillText: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  quickPillTextSelected: {
    color: colors.primary,
  },
  estimateCard: {
    backgroundColor: colors.ecoLight,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  estimateTitle: {
    ...typography.subtitle,
    color: colors.darkGreen,
    marginBottom: 12,
  },
  estimateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  estimateItem: {
    alignItems: 'center',
  },
  estimateValue: {
    ...typography.h3,
    color: colors.darkGreen,
  },
  estimateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  legalDisclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paymentTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  paymentChange: {
    ...typography.captionBold,
    color: colors.primary,
  },
  paymentSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 20,
  },
});
