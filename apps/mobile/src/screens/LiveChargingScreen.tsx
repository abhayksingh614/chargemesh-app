import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { mockStations } from '../services/mockData';
import { PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface LiveChargingScreenProps {
  route: any;
  navigation: any;
}

export const LiveChargingScreen: React.FC<LiveChargingScreenProps> = ({
  route,
  navigation,
}) => {
  const stationId = route?.params?.stationId || mockStations[0].id;
  const connectorId = route?.params?.connectorId || mockStations[0].connectors[0].id;
  const targetAmount = route?.params?.targetAmount || 500;

  const station = mockStations.find(s => s.id === stationId) || mockStations[0];
  const connector = station.connectors.find(c => c.id === connectorId) || station.connectors[0];

  const [energyDeliveredKwh, setEnergyDeliveredKwh] = useState<number>(3.2);
  const [currentPowerKw, setCurrentPowerKw] = useState<number>(54.6);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(340); // ~5m 40s
  const [batterySoc, setBatterySoc] = useState<number>(44); // 44%

  // Simulated charging tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setEnergyDeliveredKwh((prev) => +(prev + 0.015).toFixed(3));
      setCurrentPowerKw(+(54 + Math.sin(Date.now() / 3000) * 2).toFixed(1));
      if (elapsedSeconds % 45 === 0) {
        setBatterySoc((prev) => Math.min(prev + 1, 100));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [elapsedSeconds]);

  const currentCostPaise = Math.round(energyDeliveredKwh * station.tariffPerKwh * 100);
  const currentCostRupees = (currentCostPaise / 100).toFixed(2);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopCharging = () => {
    Alert.alert(
      'Stop Charging Session?',
      'Are you sure you want to stop? Final amount will be calculated from delivered energy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Stop',
          style: 'destructive',
          onPress: () => {
            navigation.replace('SessionComplete', {
              stationId: station.id,
              energyDeliveredKwh,
              durationSeconds: elapsedSeconds,
              finalAmountRupees: currentCostRupees,
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Session Active Top Bar */}
      <View style={styles.topStatus}>
        <View style={styles.livePill}>
          <View style={styles.pulsingDot} />
          <Text style={styles.livePillText}>CHARGING ACTIVE</Text>
        </View>
        <Text style={styles.cpoHeader}>{station.cpo.name}</Text>
      </View>

      <View style={styles.container}>
        {/* Visual Pulse Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterRing}>
            <Text style={styles.batterySocText}>{batterySoc}%</Text>
            <Text style={styles.batteryLabel}>Battery SOC</Text>
            <Text style={styles.currentSpeedText}>⚡ {currentPowerKw} kW</Text>
          </View>
        </View>

        {/* Live Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricBoxValue}>{energyDeliveredKwh.toFixed(2)}</Text>
            <Text style={styles.metricBoxUnit}>kWh Delivered</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricBoxValue}>{formatDuration(elapsedSeconds)}</Text>
            <Text style={styles.metricBoxUnit}>Duration (MM:SS)</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricBoxValue}>₹{currentCostRupees}</Text>
            <Text style={styles.metricBoxUnit}>Accrued Cost</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricBoxValue}>₹{targetAmount}</Text>
            <Text style={styles.metricBoxUnit}>Target Limit</Text>
          </View>
        </View>

        {/* Station Details Footer */}
        <View style={styles.stationInfoCard}>
          <Text style={styles.stationTitle}>{station.name}</Text>
          <Text style={styles.stationConnector}>
            Connector 1 • {connector.type} • Tariff: ₹{station.tariffPerKwh}/kWh
          </Text>
          <Text style={styles.telemetryHealth}>
            ✓ Encrypted CPO Telemetry stream active
          </Text>
        </View>
      </View>

      {/* Stop Charging Button */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Stop Charging"
          variant="danger"
          onPress={handleStopCharging}
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
  topStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  livePillText: {
    ...typography.captionBold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cpoHeader: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meterContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  meterRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.ecoLight,
    borderWidth: 8,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batterySocText: {
    ...typography.metricLarge,
    fontSize: 48,
    color: colors.darkGreen,
  },
  batteryLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  currentSpeedText: {
    ...typography.subtitle,
    color: colors.primary,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginVertical: 20,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  metricBoxValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  metricBoxUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  stationInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  stationTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  stationConnector: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  telemetryHealth: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 8,
    fontSize: 11,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
