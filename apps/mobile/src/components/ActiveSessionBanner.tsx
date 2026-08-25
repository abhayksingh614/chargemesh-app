import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCharging, useTheme } from '../context';
import { spacing } from '../theme';

export const ActiveSessionBanner: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeSession, isCharging } = useCharging();
  const { theme } = useTheme();

  if (!isCharging || !activeSession) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.primary,
        },
      ]}
      onPress={() => navigation.navigate('LiveCharging')}
    >
      <View style={styles.leftCol}>
        <View style={styles.badge}>
          <Text style={[styles.pulseDot, { color: theme.primary }]}>⚡</Text>
          <Text style={[styles.badgeText, { color: theme.primary }]}>LIVE CHARGE</Text>
        </View>
        <Text style={[styles.stationTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {activeSession.station.name}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.metricItem}>
          <Text style={[styles.socValue, { color: theme.primary }]}>
            {Math.round(activeSession.currentSoc)}%
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            {activeSession.currentPowerKw.toFixed(0)} kW
          </Text>
        </View>
        <Text style={[styles.arrowIcon, { color: theme.textSecondary }]}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 2,
    borderTopColor: '#00D084',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#00D084',
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
    color: '#00D084',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.8,
  },
  stationTitle: {
    fontSize: 13,
    fontWeight: '600',
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
    color: '#00D084',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
});

