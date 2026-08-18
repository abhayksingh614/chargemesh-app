import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Connector, ConnectorStatus } from '@chargemesh/shared-types';
import { colors, typography, borderRadius, shadows } from '../theme';
import { StatusBadge } from './StatusBadge';
import { FreshnessIndicator } from './FreshnessIndicator';

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
  const isAvailable = connector.status === ConnectorStatus.AVAILABLE;
  const isUnknown = connector.status === ConnectorStatus.UNKNOWN;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      disabled={!isAvailable && !isUnknown}
      style={[
        styles.card,
        selected && styles.cardSelected,
        !isAvailable && !isUnknown && styles.cardDisabled,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.typeInfo}>
          <Text style={styles.connectorType}>{connector.type}</Text>
          <Text style={styles.powerType}>
            {connector.powerType === 'DC' ? '⚡ DC Fast' : '🔌 AC'} • {connector.maxPower} kW
          </Text>
        </View>
        <StatusBadge status={connector.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.priceLabel}>Tariff</Text>
          <Text style={styles.priceValue}>₹{tariffPerKwh.toFixed(1)}/kWh</Text>
        </View>

        <View style={styles.rightFooter}>
          <FreshnessIndicator
            freshnessState={connector.freshnessState}
            dataAgeSeconds={connector.dataAgeSeconds}
          />
          {isVehicleCompatible && (
            <View style={styles.compatBadge}>
              <Text style={styles.compatText}>✓ Compatible</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.ecoLight,
  },
  cardDisabled: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
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
    color: colors.textPrimary,
  },
  powerType: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceValue: {
    ...typography.subtitle,
    color: colors.primary,
  },
  rightFooter: {
    alignItems: 'flex-end',
    gap: 4,
  },
  compatBadge: {
    backgroundColor: colors.status.availableBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  compatText: {
    ...typography.captionBold,
    color: colors.status.available,
    fontSize: 11,
  },
});
