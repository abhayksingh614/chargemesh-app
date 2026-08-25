import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { mockStations, StationWithDetails } from '../services/mockData';
import {
  StationCard,
  ActiveSessionBanner,
  ThreeDIcon,
  FavoriteButton,
  AuthGateModal,
} from '../components';
import { borderRadius, shadows } from '../theme';
import { useAuth, useCharging, useTheme, useLanguage } from '../context';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, activeVehicle, isGuest, isAuthenticated } = useAuth();
  const isGuestUser = isGuest || !isAuthenticated;
  const { isCharging } = useCharging();
  const { mode, theme, toggleTheme } = useTheme();
  const isDark = mode === 'dark';
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fast' | 'ac' | 'available'>('available');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [gateFeature, setGateFeature] = useState('Vehicle Garage');

  // Dynamic Time-Based Greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    let g = 'Good Evening';
    if (hour >= 4 && hour < 12) {
      g = t('home.greetingMorning') || 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      g = t('home.greetingAfternoon') || 'Good Afternoon';
    } else {
      g = t('home.greetingEvening') || 'Good Evening';
    }
    // Clean any trailing commas/spaces to guarantee strict "{Greeting}, {Name}" format
    return g.replace(/[, ]+$/, '');
  };

  const driverName = isGuestUser ? 'Explorer' : user?.name ? user.name.split(' ')[0] : 'Driver';
  const vehicleName = !isGuestUser && activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'My Car';

  // 1. Intelligent "Best Match For You" Station
  const bestMatchStation = useMemo<StationWithDetails>(() => {
    // Priority: available > DC fast > nearest
    const availableStations = mockStations.filter((s) => s.availableCount > 0);
    const sorted = [...(availableStations.length ? availableStations : mockStations)].sort(
      (a, b) => {
        // Boost stations matching user max power or >= 50kW
        const aScore = (a.availableCount > 0 ? 100 : 0) + (a.maxPowerKw >= 50 ? 50 : 0) - a.distanceKm * 2;
        const bScore = (b.availableCount > 0 ? 100 : 0) + (b.maxPowerKw >= 50 ? 50 : 0) - b.distanceKm * 2;
        return bScore - aScore;
      }
    );
    return sorted[0] || mockStations[0];
  }, []);

  // 2. Filtered Stations based on Search and Filter Pills
  const filteredStations = useMemo(() => {
    return mockStations.filter((station) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        station.name.toLowerCase().includes(q) ||
        station.cpo.name.toLowerCase().includes(q) ||
        station.city.toLowerCase().includes(q) ||
        (station.district && station.district.toLowerCase().includes(q)) ||
        station.state.toLowerCase().includes(q) ||
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
  }, [searchQuery, activeFilter]);

  const nearbyList = filteredStations.slice(0, 6);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* 1. Header: Logo, Theme Switcher, Wallet Balance & Profile */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.brandTitleWrap}>
          <Image
            source={require('../assets/logo/cm_fevicon_logo_trans.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>ChargeMesh</Text>
            <Text style={[styles.headerTagline, { color: theme.primary }]}>
              Universal EV Network
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.walletPill,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => {
              if (isGuestUser) {
                navigation.navigate('Login');
              } else {
                navigation.navigate('PaymentMethods');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.walletIcon}>⚡</Text>
            <Text style={[styles.walletBalanceText, { color: theme.primary }]}>
              {isGuestUser
                ? 'Login'
                : `₹${((user?.walletBalancePaise || 0) / 100).toLocaleString('en-IN')}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileAvatarButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                borderColor: theme.border,
              },
            ]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.profileAvatarText, { color: theme.textPrimary }]}>
              {driverName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Charging Banner if currently in session */}
      {isCharging && <ActiveSessionBanner />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. User Greeting & Active EV Selector Row */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>
              {getGreeting()}, {driverName}
            </Text>
            <Text style={[styles.greetingSubtitle, { color: theme.textSecondary }]}>
              Ready to find verified chargers.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.evSelectorPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F0FDF4',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#BBF7D0',
              },
            ]}
            onPress={() => {
              if (isGuestUser) {
                setGateFeature('Vehicle Garage');
                setShowAuthGate(true);
              } else {
                navigation.navigate('MyVehicles');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.evSelectorIcon}>🚗</Text>
            <Text
              style={[
                styles.evSelectorText,
                { color: isDark ? theme.textPrimary : '#166534' },
              ]}
              numberOfLines={1}
            >
              {vehicleName}
            </Text>
            <Text style={[styles.evSelectorChevron, { color: isDark ? theme.textMuted : '#166534' }]}>
              ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Universal Search & Quick Scan Bar */}
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
              placeholder="Search station, operator, city or area..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={[styles.clearSearchIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Quick Camera QR Launcher */}
            <TouchableOpacity
              style={[styles.scanQuickBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (isGuestUser) {
                  setGateFeature('QR Scanner');
                  setShowAuthGate(true);
                } else {
                  navigation.navigate('QRScanner');
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.scanQuickBtnText}>⚡ Scan QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. ⭐ "Best Match For Your EV" Recommendation Hero Card */}
        {bestMatchStation && (
          <View style={styles.bestMatchSection}>
            <View
              style={[
                styles.bestMatchCard,
                {
                  backgroundColor: isDark ? '#0F172A' : '#0B192C',
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#1E293B',
                },
              ]}
            >
              {/* Header Badge */}
              <View style={styles.bestMatchBadgeRow}>
                <View style={styles.bestMatchTag}>
                  <Text style={styles.bestMatchTagText}>⭐ BEST MATCH FOR YOUR EV</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.bestMatchDistance}>
                    📍 {bestMatchStation.distanceKm.toFixed(1)} km (
                    {Math.max(3, Math.round(bestMatchStation.distanceKm * 2.4))}m)
                  </Text>
                  <FavoriteButton stationId={bestMatchStation.id} size="sm" />
                </View>
              </View>

              {/* Station Name & CPO */}
              <Text style={styles.bestMatchTitle} numberOfLines={1}>
                {bestMatchStation.name}
              </Text>
              <Text style={styles.bestMatchSubtitle}>
                {bestMatchStation.cpo.name} • {bestMatchStation.address}
              </Text>

              {/* Specs & Availability Grid */}
              <View style={styles.bestMatchSpecsRow}>
                <View style={styles.bestMatchSpecItem}>
                  <Text style={styles.bestMatchSpecVal}>
                    🟢 {bestMatchStation.availableCount} of {bestMatchStation.totalConnectors} Free
                  </Text>
                  <Text style={styles.bestMatchSpecLbl}>Live Availability</Text>
                </View>

                <View style={styles.bestMatchSpecDivider} />

                <View style={styles.bestMatchSpecItem}>
                  <Text style={styles.bestMatchSpecVal}>
                    ⚡ {bestMatchStation.maxPowerKw} kW DC
                  </Text>
                  <Text style={styles.bestMatchSpecLbl}>Fast Charging</Text>
                </View>

                <View style={styles.bestMatchSpecDivider} />

                <View style={styles.bestMatchSpecItem}>
                  <Text style={[styles.bestMatchSpecVal, { color: '#00D084' }]}>
                    ₹{bestMatchStation.tariffPerKwh.toFixed(1)}
                  </Text>
                  <Text style={styles.bestMatchSpecLbl}>per kWh</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.bestMatchActionRow}>
                <TouchableOpacity
                  style={[styles.bestMatchPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() =>
                    navigation.navigate('StationDetail', { stationId: bestMatchStation.id })
                  }
                  activeOpacity={0.88}
                >
                  <Text style={styles.bestMatchPrimaryBtnText}>🗺️ View &amp; Charge ➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bestMatchSecondaryBtn}
                  onPress={() => navigation.navigate('Map')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bestMatchSecondaryBtnText}>Explore Map ›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 5. ⚡ Quick EV Services Navigation Section (Positioned Above Charging Hubs) */}
        <View
          style={[
            styles.quickServicesCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.quickServicesTitle, { color: theme.textPrimary }]}>
            Quick EV Services
          </Text>
          <View style={styles.quickServicesGrid}>
            <TouchableOpacity
              style={styles.quickServiceItem}
              onPress={() => navigation.navigate('MyVehicles')}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIconCircle}>
                <ThreeDIcon name="vehicle" size={36} />
              </View>
              <Text style={[styles.serviceItemLabel, { color: theme.textPrimary }]}>
                My Garage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickServiceItem}
              onPress={() => navigation.navigate('Activity')}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIconCircle}>
                <ThreeDIcon name="history" size={36} />
              </View>
              <Text style={[styles.serviceItemLabel, { color: theme.textPrimary }]}>
                Invoices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickServiceItem}
              onPress={() => navigation.navigate('Activity')}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIconCircle}>
                <ThreeDIcon name="bookings" size={36} />
              </View>
              <Text style={[styles.serviceItemLabel, { color: theme.textPrimary }]}>
                Reservations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickServiceItem}
              onPress={() => navigation.navigate('PaymentMethods')}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIconCircle}>
                <ThreeDIcon name="wallet" size={36} />
              </View>
              <Text style={[styles.serviceItemLabel, { color: theme.textPrimary }]}>
                Wallet &amp; FASTag
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Quick Filter Chips */}
        <View style={styles.filterChipsRow}>
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
              🟢 Available Now
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
              🚀 Fast DC (50kW+)
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
              🔌 AC Type-2
            </Text>
          </TouchableOpacity>

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
              All Chargers
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. Section Header: Nearby Verified Charging Stations */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Verified Charging Hubs ({filteredStations.length})
            </Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              Sorted by driving distance with real-time bay availability
            </Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <Text style={[styles.viewAllMapText, { color: theme.primary }]}>
              View Map 🗺️
            </Text>
          </TouchableOpacity>
        </View>

        {/* 8. Nearby Station Cards List */}
        {nearbyList.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            userVehicleName={vehicleName}
            isCompatibleWithUserEv={true}
            onPress={() => navigation.navigate('StationDetail', { stationId: station.id })}
          />
        ))}
      </ScrollView>

      {/* Global Centered Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName={gateFeature}
        onClose={() => setShowAuthGate(false)}
        onLogin={() => {
          setShowAuthGate(false);
          navigation.navigate('Login');
        }}
        onRegister={() => {
          setShowAuthGate(false);
          navigation.navigate('Register');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },

  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerTagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeToggleIcon: {
    fontSize: 14,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  walletIcon: {
    fontSize: 11,
  },
  walletBalanceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  profileAvatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileAvatarText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Greeting Section
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  evSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 5,
    maxWidth: 145,
  },
  evSelectorIcon: {
    fontSize: 12,
  },
  evSelectorText: {
    fontSize: 11.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  evSelectorChevron: {
    fontSize: 10,
    fontWeight: '900',
  },

  // Universal Search
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingLeft: 12,
    paddingRight: 6,
    height: 48,
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
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  scanQuickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  scanQuickBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Best Match Hero Card
  bestMatchSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bestMatchCard: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    borderWidth: 1.5,
    ...shadows.card,
  },
  bestMatchBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bestMatchTag: {
    backgroundColor: '#00D084',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  bestMatchTagText: {
    color: '#0B192C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bestMatchDistance: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11.5,
    fontWeight: '700',
  },
  bestMatchTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  bestMatchSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11.5,
    marginBottom: 12,
  },
  bestMatchSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  bestMatchSpecItem: {
    flex: 1,
    alignItems: 'center',
  },
  bestMatchSpecVal: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  bestMatchSpecLbl: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  bestMatchSpecDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  bestMatchActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bestMatchPrimaryBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestMatchPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  bestMatchSecondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bestMatchSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Filter Chips Row
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  chipButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  viewAllMapText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Quick Services Grid
  quickServicesCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 16,
    borderRadius: borderRadius.xxl,
  },
  quickServicesTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickServiceItem: {
    alignItems: 'center',
    flex: 1,
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
