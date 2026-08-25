import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Connector, ConnectorStatus } from '@chargemesh/shared-types';
import { typography, borderRadius, shadows } from '../theme';
import { StatusBadge } from './StatusBadge';
import { FreshnessIndicator } from './FreshnessIndicator';
import { useTheme } from '../context';

interface ConnectorCardProps {
  connector: Connector;
  tariffPerKwh?: number;
  isVehicleCompatible?: boolean;
  onSelect?: () => void;
  selected?: boolean;
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  connector,
  tariffPerKwh = 18.0,
  isVehicleCompatible = true,
  onSelect,
  selected = false,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const isAvailable = connector.status === ConnectorStatus.AVAILABLE;
  const isUnknown = connector.status === ConnectorStatus.UNKNOWN;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      disabled={!isAvailable && !isUnknown}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
        selected && {
          backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : theme.primaryLight,
        },
        !isAvailable && !isUnknown && { opacity: 0.65, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB' },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.typeInfo}>
          <Text style={[styles.connectorType, { color: theme.textPrimary }]}>{connector.type}</Text>
          <Text style={[styles.powerType, { color: theme.textSecondary }]}>
            {connector.powerType === 'DC' ? '⚡ DC Fast' : '🔌 AC'} • {connector.maxPower} kW
          </Text>
        </View>
        <StatusBadge status={connector.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footerRow}>
        <View>
          <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Tariff</Text>
          <Text style={[styles.priceValue, { color: theme.primary }]}>₹{tariffPerKwh.toFixed(1)}/kWh</Text>
        </View>

        <View style={styles.rightFooter}>
          <FreshnessIndicator
            freshnessState={connector.freshnessState}
            dataAgeSeconds={connector.dataAgeSeconds}
          />
          {isVehicleCompatible && (
            <View
              style={[
                styles.compatBadge,
                {
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#86EFAC',
                },
              ]}
            >
              <Text style={[styles.compatText, { color: isDark ? '#00D084' : '#15803D' }]}>
                ✓ Compatible
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeInfo: {
    flex: 1,
  },
  connectorType: {
    ...typography.h3,
  },
  powerType: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightFooter: {
    alignItems: 'flex-end',
    gap: 6,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  compatBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  compatText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});
