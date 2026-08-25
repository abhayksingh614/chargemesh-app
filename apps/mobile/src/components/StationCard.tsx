import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StationWithDetails } from '../services/mockData';
import { borderRadius, shadows } from '../theme';
import { useTheme } from '../context';
import { FavoriteButton } from './FavoriteButton';

interface StationCardProps {
  station: StationWithDetails;
  onPress: () => void;
  onNavigate?: () => void;
  isSelected?: boolean;
  customDistanceKm?: number;
  containerStyle?: any;
  userVehicleName?: string;
  isCompatibleWithUserEv?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onPress,
  onNavigate,
  isSelected = false,
  customDistanceKm,
  containerStyle,
  userVehicleName,
  isCompatibleWithUserEv = true,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const isAvailable = station.availableCount > 0;
  const inUseCount = Math.max(0, station.totalConnectors - station.availableCount);

  const distNum =
    typeof customDistanceKm === 'number'
      ? customDistanceKm
      : typeof station.distanceKm === 'number'
      ? station.distanceKm
      : 0.0;

  const displayDistance = distNum.toFixed(1);
  const estMins = Math.max(2, Math.round(distNum * 2.4));

  // Determine Primary Connector Type & Power
  const primaryConnector = station.connectors[0]?.type || 'CCS2';
  const isFastDc = station.maxPowerKw >= 50;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        isSelected && styles.cardSelected,
        containerStyle,
      ]}
    >
      {/* 1. Header: Operator Badge + High-Contrast Availability + Heart Button */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.cpoBadge,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
              borderColor: theme.border,
            },
            isSelected && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
          ]}
        >
          <Text
            style={[
              styles.cpoText,
              { color: theme.textPrimary },
              isSelected && { color: theme.primary },
            ]}
            numberOfLines={1}
          >
            {station.cpo.name}
          </Text>
        </View>

        <View style={styles.rightBadges}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isAvailable
                  ? isDark
                    ? 'rgba(0, 208, 132, 0.15)'
                    : '#DCFCE7'
                  : isDark
                  ? 'rgba(245, 158, 11, 0.15)'
                  : '#FEF3C7',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailable ? styles.dotGreen : styles.dotOrange,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isAvailable ? styles.textGreen : styles.textOrange,
              ]}
              numberOfLines={1}
            >
              {isAvailable
                ? `${station.availableCount} of ${station.totalConnectors} Free`
                : `0 of ${station.totalConnectors} Free (Busy)`}
            </Text>
          </View>

          {/* 1-Tap Favorite Bookmark Button */}
          <FavoriteButton stationId={station.id} size="md" />
        </View>
      </View>

      {/* 2. Station Name & Distance */}
      <View style={styles.nameDistanceRow}>
        <Text style={[styles.stationName, { color: theme.textPrimary }]} numberOfLines={1}>
          {station.name}
        </Text>
        <Text style={[styles.distanceBadgeText, { color: theme.textSecondary }]}>
          📍 {displayDistance} km · ~{estMins}m
        </Text>
      </View>
      <Text style={[styles.addressText, { color: theme.textSecondary }]} numberOfLines={1}>
        {station.address}, {station.city}
      </Text>

      {/* 3. EV Compatibility Highlight Strip (If Compatible) */}
      {isCompatibleWithUserEv && userVehicleName && (
        <View
          style={[
            styles.compatStrip,
            {
              backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.25)' : '#BBF7D0',
            },
          ]}
        >
          <Text style={styles.compatIcon}>⚡</Text>
          <Text
            style={[
              styles.compatText,
              { color: isDark ? '#00D084' : '#166534' },
            ]}
            numberOfLines={1}
          >
            Matches {userVehicleName} • Fast DC Port Ready
          </Text>
        </View>
      )}

      {/* 4. 3-Column Specifications & Tariff Grid */}
      <View
        style={[
          styles.infoRow,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
            borderColor: theme.border,
          },
        ]}
      >
        {/* Speed */}
        <View style={styles.infoPill}>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
            ⚡ {station.maxPowerKw} kW
          </Text>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]} numberOfLines={1}>
            {isFastDc ? 'DC Fast' : 'AC Standard'}
          </Text>
        </View>

        <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

        {/* Plug Types */}
        <View style={styles.infoPill}>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>
            🔌 {primaryConnector}
          </Text>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]} numberOfLines={1}>
            {station.connectors.length > 1
              ? `+${station.connectors.length - 1} more`
              : 'Standard Gun'}
          </Text>
        </View>

        <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

        {/* Price */}
        <View style={styles.infoPill}>
          <Text style={[styles.infoValue, { color: theme.primary }]} numberOfLines={1}>
            ₹{station.tariffPerKwh.toFixed(1)}
          </Text>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]} numberOfLines={1}>
            per kWh
          </Text>
        </View>
      </View>

      {/* 5. Clean Action Buttons Row */}
      <View style={styles.ctaRow}>
        <View style={styles.liveIndicator}>
          <Text style={styles.livePulseDot}>●</Text>
          <Text style={[styles.liveText, { color: theme.textSecondary }]}>Live verified</Text>
          {inUseCount > 0 && isAvailable && (
            <Text style={[styles.inUseMuted, { color: theme.textMuted }]} numberOfLines={1}>
              {' '}• {inUseCount} busy
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.viewDetailsBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.viewDetailsText,
                { color: theme.textPrimary },
              ]}
            >
              Details ›
            </Text>
          </TouchableOpacity>

          {onNavigate && (
            <TouchableOpacity
              style={[
                styles.navigateBtn,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={onNavigate}
              activeOpacity={0.85}
            >
              <Text style={styles.navigateBtnText}>
                Navigate ➔
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    ...shadows.card,
  },
  cardSelected: {
    borderWidth: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    maxWidth: '45%',
    flexShrink: 1,
  },
  cpoText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.full,
    gap: 5,
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
  },
  dotGreen: {
    backgroundColor: '#16A34A',
  },
  dotOrange: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  textGreen: {
    color: '#16A34A',
  },
  textOrange: {
    color: '#D97706',
  },
  nameDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
    gap: 8,
  },
  distanceBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    flexShrink: 0,
    marginTop: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    marginBottom: 8,
  },
  compatStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: borderRadius.sm,
    marginBottom: 10,
    borderWidth: 1,
    gap: 6,
  },
  compatIcon: {
    fontSize: 11,
  },
  compatText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  infoPill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoDivider: {
    width: 1,
    height: 22,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  livePulseDot: {
    color: '#16A34A',
    fontSize: 10,
    marginRight: 4,
  },
  liveText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  inUseMuted: {
    fontSize: 11.5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDetailsBtn: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '800',
  },
  navigateBtn: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  navigateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heartBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  heartIconText: {
    fontSize: 15,
  },
  heartTextActive: {
    color: '#16A34A',
  },
});
