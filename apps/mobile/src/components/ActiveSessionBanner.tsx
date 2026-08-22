import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCharging } from '../context';
import { colors, spacing } from '../theme';

export const ActiveSessionBanner: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeSession, isCharging } = useCharging();

  if (!isCharging || !activeSession) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => navigation.navigate('LiveCharging')}
    >
      <View style={styles.leftCol}>
        <View style={styles.badge}>
          <Text style={styles.pulseDot}>⚡</Text>
          <Text style={styles.badgeText}>LIVE CHARGE</Text>
        </View>
        <Text style={styles.stationTitle} numberOfLines={1}>
          {activeSession.station.name}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.metricItem}>
          <Text style={styles.socValue}>{Math.round(activeSession.currentSoc)}%</Text>
          <Text style={styles.metricLabel}>{activeSession.currentPowerKw.toFixed(0)} kW</Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  leftCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pulseDot: {
    fontSize: 12,
    marginRight: 4,
    color: colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  stationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  socValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});
