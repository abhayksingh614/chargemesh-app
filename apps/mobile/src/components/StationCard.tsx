import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StationWithDetails } from '../services/mockData';
import { colors, borderRadius, shadows } from '../theme';

interface StationCardProps {
  station: StationWithDetails;
  onPress: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({ station, onPress }) => {
  const isAvailable = station.availableCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Meta Bar */}
      <View style={styles.topRow}>
        <View style={styles.cpoBadge}>
          <Text style={styles.cpoText}>{station.cpo.name}</Text>
        </View>
        <View style={styles.rightBadges}>
          <View style={[styles.statusPill, isAvailable ? styles.statusAvailable : styles.statusBusy]}>
            <View style={[styles.statusDot, isAvailable ? styles.dotGreen : styles.dotOrange]} />
            <Text style={[styles.statusText, isAvailable ? styles.textGreen : styles.textOrange]}>
              {station.availableCount}/{station.totalConnectors} Available
            </Text>
          </View>
          <Text style={styles.distanceText}>📍 {station.distanceKm} km</Text>
        </View>
      </View>

      {/* Station Name & City */}
      <Text style={styles.stationName} numberOfLines={1}>
        {station.name}
      </Text>
      <Text style={styles.addressText} numberOfLines={1}>
        {station.address}, {station.city}
      </Text>

      {/* Key Metrics Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>⚡ {station.maxPowerKw} kW</Text>
          <Text style={styles.infoLabel}>Max Output</Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>₹{station.tariffPerKwh}</Text>
          <Text style={styles.infoLabel}>per kWh</Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoPill}>
          <Text style={styles.infoValue}>🔌 {station.totalConnectors} Ports</Text>
          <Text style={styles.infoLabel}>Total Bays</Text>
        </View>
      </View>

      {/* Action CTA */}
      <View style={styles.ctaRow}>
        <View style={styles.connectorTags}>
          {station.connectors.slice(0, 2).map((c, i) => (
            <View key={i} style={styles.connTag}>
              <Text style={styles.connTagText}>{c.type}</Text>
            </View>
          ))}
        </View>
        <View style={styles.viewChargersBtn}>
          <Text style={styles.viewChargersText}>View Chargers</Text>
          <Text style={styles.chevronIcon}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cpoText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusAvailable: {
    backgroundColor: colors.ecoLight,
  },
  statusBusy: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotGreen: {
    backgroundColor: colors.primary,
  },
  dotOrange: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textGreen: {
    color: colors.primaryDark,
  },
  textOrange: {
    color: '#92400E',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stationName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  infoPill: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  infoLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  connectorTags: {
    flexDirection: 'row',
    gap: 6,
  },
  connTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  viewChargersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  viewChargersText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
    marginRight: 2,
  },
  chevronIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textInverse,
  },
});
