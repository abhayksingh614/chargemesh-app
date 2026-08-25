import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Header, ConfirmationModal, StatusModal, FavoriteButton } from '../components';
import { mockStations, StationWithDetails } from '../services/mockData';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme, useFavorites } from '../context';

interface FavoritesScreenProps {
  navigation: any;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { activeVehicle, isGuest } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const { favoriteStationIds, isAlertEnabled, toggleAlert, removeFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fast' | 'ac' | 'available'>('all');

  // Remove confirmation modal state
  const [removeTarget, setRemoveTarget] = useState<StationWithDetails | null>(null);

  // Status feedback modal state
  const [statusFeedback, setStatusFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title="Favorite Stations ❤️"
          subtitle="Quick access to your saved charging hubs"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.guestContainer}>
          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.guestLockCircle}>
              <Text style={{ fontSize: 36 }}>❤️</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Login Required ❤️
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Sign in to save and manage your favorite charging stations.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  borderColor: theme.primary,
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
                },
              ]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.88}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={[styles.ghostBtnText, { color: theme.textSecondary }]}>
                Continue Exploring
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Filter favorite stations
  const favoriteStations = useMemo(() => {
    return mockStations
      .filter((s) => favoriteStationIds.includes(s.id))
      .filter((station) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          station.name.toLowerCase().includes(q) ||
          station.cpo.name.toLowerCase().includes(q) ||
          station.city.toLowerCase().includes(q) ||
          station.address.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        if (activeFilter === 'available') {
          return station.availableCount > 0;
        }
        if (activeFilter === 'fast') {
          return station.maxPowerKw >= 50;
        }
        if (activeFilter === 'ac') {
          return station.connectors.some((c) => c.type === 'TYPE2');
        }
        return true;
      });
  }, [favoriteStationIds, searchQuery, activeFilter]);

  const handleToggleAlert = (station: StationWithDetails) => {
    const nextState = toggleAlert(station.id);

    setStatusFeedback({
      visible: true,
      title: nextState ? 'Availability Alert Enabled 🔔' : 'Alert Disabled',
      message: nextState
        ? `We'll send a high-priority notification as soon as a bay becomes free at ${station.name}.`
        : `Availability notifications turned off for ${station.name}.`,
    });
  };

  const handleRemoveFavoriteConfirm = () => {
    if (!removeTarget) return;
    removeFavorite(removeTarget.id);
    const removedName = removeTarget.name;
    setRemoveTarget(null);
    setStatusFeedback({
      visible: true,
      title: 'Removed from Favorites',
      message: `${removedName} has been removed from your saved stations shortlist.`,
    });
  };

  const handleOpenMaps = (station: StationWithDetails) => {
    const lat = station.coordinates.latitude;
    const lng = station.coordinates.longitude;
    const label = encodeURIComponent(station.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    }
  };

  // Helper for availability badge
  const getAvailabilityInfo = (station: StationWithDetails) => {
    if (station.availableCount >= 2) {
      return {
        label: `🟢 Available (${station.availableCount}/${station.totalConnectors} Free)`,
        bg: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7',
        textColor: '#15803D',
      };
    } else if (station.availableCount === 1) {
      return {
        label: `🟡 Limited Availability (1 Free)`,
        bg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
        textColor: '#B45309',
      };
    } else {
      return {
        label: `🔴 Unavailable (${station.totalConnectors} In Use)`,
        bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
        textColor: '#DC2626',
      };
    }
  };

  const vehicleName = activeVehicle
    ? `${activeVehicle.make} ${activeVehicle.model}`
    : 'Tata Nexon EV';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Header
        title="Favorite Stations ❤️"
        subtitle="Your saved charging stations for quick access."
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.inputSearchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInputField, { color: theme.textPrimary }]}
              placeholder="Search favorite stations..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={[styles.clearSearchIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. Horizontal Filter Chips */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[
              styles.chipButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                borderColor: theme.border,
              },
              activeFilter === 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.textSecondary },
                activeFilter === 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              All ({favoriteStationIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                borderColor: theme.border,
              },
              activeFilter === 'fast' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setActiveFilter('fast')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.textSecondary },
                activeFilter === 'fast' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              ⚡ DC Fast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                borderColor: theme.border,
              },
              activeFilter === 'ac' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setActiveFilter('ac')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.textSecondary },
                activeFilter === 'ac' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              🔌 AC
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chipButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                borderColor: theme.border,
              },
              activeFilter === 'available' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setActiveFilter('available')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: theme.textSecondary },
                activeFilter === 'available' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              🟢 Available
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Favorite Station Cards List */}
        {favoriteStations.length > 0 ? (
          <View style={styles.stationsList}>
            {favoriteStations.map((station) => {
              const avail = getAvailabilityInfo(station);
              const isAlertOn = isAlertEnabled(station.id);
              const isDc = station.maxPowerKw >= 50;

              return (
                <View
                  key={station.id}
                  style={[
                    styles.favCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {/* Top Bar: CPO Badge + Heart & Bell Actions */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cpoWrap}>
                      <Text style={styles.cpoTagText}>⚡ {station.cpo.name}</Text>
                    </View>

                    <View style={styles.headerIconsRow}>
                      {/* Availability Alert Bell */}
                      <TouchableOpacity
                        style={[
                          styles.actionIconBtn,
                          isAlertOn && styles.alertActiveBtn,
                          { borderColor: isAlertOn ? theme.primary : theme.border },
                        ]}
                        onPress={() => handleToggleAlert(station)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13 }}>{isAlertOn ? '🔔' : '🔕'}</Text>
                      </TouchableOpacity>

                      {/* Favorite Button */}
                      <FavoriteButton stationId={station.id} size="sm" />
                    </View>
                  </View>

                  {/* Title & Distance */}
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('StationDetail', { stationId: station.id })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.stationTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {station.name}
                    </Text>
                    <Text style={[styles.stationAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                      📍 {station.address}, {station.city}
                    </Text>
                  </TouchableOpacity>

                  {/* Availability Badge Row */}
                  <View style={styles.availabilityRow}>
                    <View style={[styles.availBadge, { backgroundColor: avail.bg }]}>
                      <Text style={[styles.availText, { color: avail.textColor }]}>
                        {avail.label}
                      </Text>
                    </View>

                    <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
                      📍 {station.distanceKm.toFixed(1)} km · ~
                      {Math.max(3, Math.round(station.distanceKm * 2.4))} min away
                    </Text>
                  </View>

                  {/* EV Compatibility Strip */}
                  <View
                    style={[
                      styles.compatStrip,
                      {
                        backgroundColor: isDark ? 'rgba(0, 208, 132, 0.05)' : '#F0FDF4',
                        borderColor: isDark ? 'rgba(0, 208, 132, 0.2)' : '#BBF7D0',
                      },
                    ]}
                  >
                    <Text style={styles.compatIcon}>✓</Text>
                    <Text
                      style={[styles.compatText, { color: isDark ? '#A7F3D0' : '#166534' }]}
                      numberOfLines={1}
                    >
                      Compatible with {vehicleName} • Fast Port
                    </Text>
                  </View>

                  {/* 3-Column Quick Specs */}
                  <View
                    style={[
                      styles.specsGrid,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.specColumn}>
                      <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                        {isDc ? 'DC Fast' : 'AC Standard'}
                      </Text>
                      <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                        ⚡ {station.maxPowerKw} kW
                      </Text>
                    </View>

                    <View style={styles.specDivider} />

                    <View style={styles.specColumn}>
                      <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                        {station.connectors[0]?.type || 'CCS2'}
                      </Text>
                      <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                        Connector
                      </Text>
                    </View>

                    <View style={styles.specDivider} />

                    <View style={styles.specColumn}>
                      <Text style={[styles.specVal, { color: theme.primary }]}>
                        ₹{station.tariffPerKwh.toFixed(1)}
                      </Text>
                      <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                        per kWh
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons: Navigate + View Station */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.navigateBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleOpenMaps(station)}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.navigateBtnText}>🗺️ Navigate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.viewStationBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate('StationDetail', { stationId: station.id })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.viewStationBtnText, { color: theme.textPrimary }]}>
                        View Station ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* 4. Empty State */
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={styles.emptyIcon}>⚡</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Favorite Stations Yet ⚡
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Save your frequently used charging stations for quick access, availability alerts, and 1-tap navigation.
            </Text>

            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
              activeOpacity={0.88}
            >
              <Text style={styles.exploreBtnText}>Explore Charging Stations →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Removing Favorite */}
      <ConfirmationModal
        visible={!!removeTarget}
        isDestructive={true}
        title="Remove from Favorites?"
        message={`Do you want to remove "${removeTarget?.name}" from your shortlist?`}
        confirmLabel="Remove"
        cancelLabel="Keep Favorite"
        onConfirm={handleRemoveFavoriteConfirm}
        onCancel={() => setRemoveTarget(null)}
      />

      {/* Status Feedback Modal */}
      <StatusModal
        visible={statusFeedback.visible}
        type="success"
        title={statusFeedback.title}
        message={statusFeedback.message}
        buttonLabel="Got It"
        onClose={() => setStatusFeedback((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Search Section
  searchSection: {
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    ...shadows.card,
  },
  inputSearchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  clearSearchIcon: {
    fontSize: 13,
    fontWeight: '800',
    padding: 4,
  },

  // Filter Chips Row
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Stations List
  stationsList: {
    gap: 12,
  },
  favCard: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    borderWidth: 1.2,
    ...shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoWrap: {
    backgroundColor: '#0B192C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  cpoTagText: {
    color: '#00D084',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertActiveBtn: {
    backgroundColor: '#DCFCE7',
  },
  stationTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 11.5,
    marginBottom: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  availText: {
    fontSize: 11,
    fontWeight: '800',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  compatStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: 6,
    marginBottom: 10,
  },
  compatIcon: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 11,
  },
  compatText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 12,
  },
  specColumn: {
    flex: 1,
    alignItems: 'center',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  specLbl: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  specDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navigateBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  viewStationBtn: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  viewStationBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  emptyStateCard: {
    borderRadius: borderRadius.xxl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.2,
    marginTop: 20,
    ...shadows.card,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  guestCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  guestLockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  ghostBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
