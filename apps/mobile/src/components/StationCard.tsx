import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StationWithDetails } from '../services/mockData';
import { colors, typography, borderRadius, shadows } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface StationCardProps {
  station: StationWithDetails;
  onPress: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({ station, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.cpoBadge}>
          <Text style={styles.cpoText}>{station.cpo.name}</Text>
        </View>
        <Text style={styles.distanceText}>📍 {station.distanceKm} km</Text>
      </View>

      <Text style={styles.stationName} numberOfLines={1}>
        {station.name}
      </Text>
      
      <Text style={styles.addressText} numberOfLines={1}>
        {station.address}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>
            {station.availableCount}/{station.totalConnectors}
          </Text>
          <Text style={styles.infoLabel}>Available</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>⚡ {station.maxPowerKw} kW</Text>
          <Text style={styles.infoLabel}>Max Speed</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>₹{station.tariffPerKwh}/kWh</Text>
          <Text style={styles.infoLabel}>Starting Price</Text>
        </View>
      </View>

      <PrimaryButton
        title="View Chargers"
        onPress={onPress}
        style={styles.ctaButton}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoBadge: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  cpoText: {
    ...typography.captionBold,
    color: colors.darkGreen,
  },
  distanceText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  stationName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  infoPill: {
    alignItems: 'center',
  },
  infoValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ctaButton: {
    height: 44,
  },
});
