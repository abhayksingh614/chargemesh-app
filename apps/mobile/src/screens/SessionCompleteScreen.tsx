import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { mockStations } from '../services/mockData';
import { PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface SessionCompleteScreenProps {
  route: any;
  navigation: any;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  route,
  navigation,
}) => {
  const stationId = route?.params?.stationId || mockStations[0].id;
  const energyDeliveredKwh = route?.params?.energyDeliveredKwh || 18.5;
  const durationSeconds = route?.params?.durationSeconds || 1920;
  const finalAmountRupees = route?.params?.finalAmountRupees || '342.25';

  const station = mockStations.find(s => s.id === stationId) || mockStations[0];
  const co2AvoidedKg = (energyDeliveredKwh * 0.71).toFixed(1);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    return `${mins} mins`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon & Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.successEmoji}>⚡</Text>
          </View>
          <Text style={styles.title}>Charging Complete!</Text>
          <Text style={styles.subtitle}>
            Your vehicle is charged and receipt has been generated.
          </Text>
        </View>

        {/* Invoice Summary Card */}
        <View style={styles.receiptCard}>
          <View style={styles.totalAmountSection}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{finalAmountRupees}</Text>
            <Text style={styles.paymentMethod}>Paid via Razorpay UPI</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Station</Text>
            <Text style={styles.receiptVal}>{station.name}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Operator</Text>
            <Text style={styles.receiptVal}>{station.cpo.name}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Energy Delivered</Text>
            <Text style={styles.receiptVal}>{Number(energyDeliveredKwh).toFixed(2)} kWh</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Duration</Text>
            <Text style={styles.receiptVal}>{formatDuration(durationSeconds)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Tariff Applied</Text>
            <Text style={styles.receiptVal}>₹{station.tariffPerKwh}/kWh</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Transaction Ref</Text>
            <Text style={styles.refCode}>CM-TXN-2026-8819</Text>
          </View>
        </View>

        {/* Eco Impact Storytelling */}
        <View style={styles.ecoCard}>
          <Text style={styles.ecoTitle}>🌱 Eco Impact Contribution</Text>
          <Text style={styles.ecoValue}>~{co2AvoidedKg} kg CO₂</Text>
          <Text style={styles.ecoDescription}>
            Estimated tailpipe emissions avoided compared to an internal combustion engine vehicle.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTAs */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Done & Return Home"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={styles.doneBtn}
        />
        <PrimaryButton
          title="Download Tax Invoice (PDF)"
          variant="outline"
          onPress={() => Alert.alert('Invoice', 'Tax Invoice PDF generated and sent to email.')}
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
    alignItems: 'center',
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ecoLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 36,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: 20,
  },
  totalAmountSection: {
    alignItems: 'center',
    paddingBottom: 14,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.metricLarge,
    color: colors.darkGreen,
    marginVertical: 4,
  },
  paymentMethod: {
    ...typography.captionBold,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  receiptVal: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  refCode: {
    ...typography.captionBold,
    color: colors.primary,
    fontFamily: 'Courier',
  },
  ecoCard: {
    backgroundColor: colors.ecoLight,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    width: '100%',
  },
  ecoTitle: {
    ...typography.subtitle,
    color: colors.darkGreen,
    marginBottom: 6,
  },
  ecoValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  ecoDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
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
    gap: 10,
  },
  doneBtn: {
    marginBottom: 2,
  },
});
