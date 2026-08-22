import React, { useState } from 'react';
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
  Dimensions,
} from 'react-native';
import { mockStations, StationWithDetails } from '../services/mockData';
import { StationCard, ActiveSessionBanner, ThreeDIcon } from '../components';
import { spacing, borderRadius } from '../theme';
import { useAuth, useCharging, useTheme } from '../context';

const { width } = Dimensions.get('window');

// 5 Quick Actions with 3D Embossed Depth Icons
const QUICK_ACTIONS = [
  {
    id: 'scan',
    label: 'Scan & Charge',
    iconName: 'scan' as const,
    route: 'QRScanner',
  },
  {
    id: 'vehicles',
    label: 'My Vehicles',
    iconName: 'vehicle' as const,
    route: 'Vehicle',
  },
  {
    id: 'history',
    label: 'Charging History',
    iconName: 'history' as const,
    route: 'Activity',
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    iconName: 'bookings' as const,
    route: 'Activity',
  },
  {
    id: 'wallet',
    label: 'Wallet & Pay',
    iconName: 'wallet' as const,
    route: 'Profile',
  },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, activeVehicle } = useAuth();
  const { isCharging } = useCharging();
  const { mode, theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fast' | 'ac' | 'available'>('all');
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});
  const [batteryPercent] = useState(62);
  const [batteryRangeKm] = useState(219);
  const [isRefreshingEv, setIsRefreshingEv] = useState(false);

  // Dynamic Time-Based Greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const toggleFavorite = (stationId: string) => {
    setFavorites((prev) => ({ ...prev, [stationId]: !prev[stationId] }));
  };

  const handleRefreshEv = () => {
    setIsRefreshingEv(true);
    setTimeout(() => {
      setIsRefreshingEv(false);
    }, 600);
  };

  // Filtered stations based on Search, State, District, and Quick Category Pills
  const filteredStations = mockStations.filter((station) => {
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

  // Dynamically sorted nearby stations based on distanceKm
  const nearbyStations: StationWithDetails[] = [...mockStations]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  const driverName = user?.name ? user.name.split(' ')[0] : 'Abhay';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* 1. Header: Compact, No Excessive Gap */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* Left: Brand Identity */}
        <View style={styles.brandTitleWrap}>
          <Image
            source={require('../assets/logo/cm_fevicon_logo_trans.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>ChargeMesh</Text>
            <Text style={[styles.headerTagline, { color: theme.primary }]}>
              Charge Smarter. Drive Further.
            </Text>
          </View>
        </View>

        {/* Right: Theme Toggle, Wallet Balance & Profile Shortcut */}
        <View style={styles.headerRightActions}>
          {/* Light / Dark Mode Toggle Switch */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Text style={styles.themeToggleIcon}>{theme.isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.walletPill,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.walletIcon}>⚡</Text>
            <Text style={[styles.walletBalanceText, { color: theme.primary }]}>
              ₹{((user?.walletBalancePaise || 10000) / 100).toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileAvatarButton,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
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

      {/* Active Charging Banner if in session */}
      {isCharging && <ActiveSessionBanner />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. User Greeting (Dynamic Time-Based) */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>
            {getGreeting()}, {driverName}! 👋
          </Text>
          <Text style={[styles.greetingSubtitle, { color: theme.textSecondary }]}>
            Let's power your next journey.
          </Text>
        </View>

        {/* 3. Find Charging Station (Primary Action Card) */}
        <View
          style={[
            styles.searchCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* Card Header */}
          <View style={styles.searchCardHeader}>
            <View style={styles.searchTitleRow}>
              <Text style={styles.searchTitleIcon}>⚡</Text>
              <Text style={[styles.searchCardTitle, { color: theme.textPrimary }]}>
                Find EV Charging Station
              </Text>
            </View>
            <Text style={[styles.searchCardSubtitle, { color: theme.textSecondary }]}>
              Locate 5,000+ verified chargers across all CPO networks
            </Text>
          </View>

          {/* Search Input Bar */}
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.inputSearchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInputField, { color: theme.textPrimary }]}
              placeholder="Search state, district, city or station..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearchIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Chips */}
          <View style={styles.filterChipsRow}>
            <TouchableOpacity
              style={[
                styles.chipButton,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
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

            <TouchableOpacity
              style={[
                styles.chipButton,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
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
                ⚡ Fast DC (50kW+)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chipButton,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
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
                { backgroundColor: theme.inputBg, borderColor: theme.border },
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
          </View>

          {/* Primary CTA Buttons (Explore on Map + Scan QR) */}
          <View style={styles.ctaButtonsRow}>
            <TouchableOpacity
              style={[styles.primaryCtaBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>🗺️ Explore Interactive Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryCtaBtn,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => navigation.navigate('QRScanner')}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryCtaText, { color: theme.textPrimary }]}>
                📷 Scan Charger
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Quick Actions Grid (5 Clean 3D Embossed Icons) */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>
            Quick Services
          </Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate(action.route)}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconContainer}>
                  <ThreeDIcon name={action.iconName} size={48} />
                </View>
                <Text
                  style={[styles.quickActionLabel, { color: theme.textPrimary }]}
                  numberOfLines={2}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. EV Telemetry Status Card */}
        <TouchableOpacity
          style={[
            styles.evStatusCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Vehicle')}
        >
          {/* Top Row: Vehicle Name & Connectivity */}
          <View style={styles.evCardTopRow}>
            <View style={styles.evVehicleInfo}>
              <Text style={[styles.evTagLabel, { color: theme.textMuted }]}>
                CONNECTED VEHICLE
              </Text>
              <Text style={[styles.evModelTitle, { color: theme.textPrimary }]}>
                {activeVehicle
                  ? `${activeVehicle.make} ${activeVehicle.model}`
                  : 'Tata Nexon EV Empowered+'}
              </Text>
            </View>
            <View style={[styles.evConnectedPill, { backgroundColor: theme.primaryLight }]}>
              <View style={[styles.connectedDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.connectedText, { color: theme.primary }]}>Connected</Text>
            </View>
          </View>

          {/* Battery Telemetry Meters */}
          <View
            style={[
              styles.evTelemetryGrid,
              { backgroundColor: theme.inputBg },
            ]}
          >
            <View style={styles.telemetryStatBox}>
              <Text style={[styles.telemetryValueLarge, { color: theme.textPrimary }]}>
                {batteryPercent}%
              </Text>
              <Text style={[styles.telemetryLabel, { color: theme.textSecondary }]}>
                Battery Level
              </Text>
              {/* Visual Battery Bar */}
              <View
                style={[
                  styles.batteryBarBg,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1' },
                ]}
              >
                <View
                  style={[
                    styles.batteryBarFill,
                    { width: `${batteryPercent}%`, backgroundColor: theme.primary },
                  ]}
                />
              </View>
            </View>

            <View
              style={[
                styles.telemetryDivider,
                { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1' },
              ]}
            />

            <View style={styles.telemetryStatBox}>
              <Text style={[styles.telemetryValueLarge, { color: theme.textPrimary }]}>
                {batteryRangeKm} km
              </Text>
              <Text style={[styles.telemetryLabel, { color: theme.textSecondary }]}>
                Estimated Range
              </Text>
              <Text style={[styles.telemetryEfficiency, { color: theme.primary }]}>
                ⚡ 142 Wh/km eco rate
              </Text>
            </View>
          </View>

          {/* Footer Info & Refresh */}
          <View style={styles.evCardFooter}>
            <Text style={[styles.lastUpdatedText, { color: theme.textMuted }]}>
              Last Updated: 5 min ago • Battery Guard Active
            </Text>
            <TouchableOpacity
              onPress={handleRefreshEv}
              style={styles.refreshIconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshIconEmoji}>
                {isRefreshingEv ? '⏳' : '🔄'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* 6. Nearby Charging Stations (Horizontal Cards with Real Distances) */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>
                Nearby Charging Stations
              </Text>
              <Text style={[styles.sectionHeaderSubtitle, { color: theme.textSecondary }]}>
                Verified high-speed hubs with live availability
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Station Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbyCardsScroll}
          >
            {nearbyStations.map((st) => {
              const isFav = !!favorites[st.id];
              const isAvailable = st.availableCount > 0;
              const estTimeMins = Math.max(3, Math.round(st.distanceKm * 2.5));

              return (
                <View
                  key={st.id}
                  style={[
                    styles.nearbyStationCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  {/* Top CPO Header & Favorite Button */}
                  <View style={styles.nearbyCardTop}>
                    <View style={styles.cpoBadge}>
                      <Text style={styles.cpoBadgeText}>{st.cpo.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(st.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Station Name */}
                  <Text style={[styles.nearbyStationName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {st.name}
                  </Text>

                  {/* Availability Badge */}
                  <View style={styles.nearbyAvailabilityRow}>
                    <View
                      style={[
                        styles.availDot,
                        {
                          backgroundColor: isAvailable
                            ? theme.primary
                            : '#EF4444',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.availText,
                        {
                          color: isAvailable
                            ? theme.primary
                            : '#EF4444',
                        },
                      ]}
                    >
                      {isAvailable
                        ? `🟢 ${st.availableCount}/${st.totalConnectors} Free Bays`
                        : '🔴 In Use'}
                    </Text>
                  </View>

                  {/* Distance & Travel Time */}
                  <Text style={[styles.nearbyDistanceText, { color: theme.textMuted }]}>
                    📍 {st.distanceKm} km • {estTimeMins} min away
                  </Text>

                  {/* Specs & Pricing Pill */}
                  <View style={styles.nearbySpecsRow}>
                    <View
                      style={[
                        styles.specTag,
                        { backgroundColor: theme.inputBg },
                      ]}
                    >
                      <Text style={[styles.specTagText, { color: theme.textSecondary }]}>
                        {st.maxPowerKw >= 50 ? 'DC Fast' : 'AC Type-2'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.specTag,
                        { backgroundColor: theme.inputBg },
                      ]}
                    >
                      <Text style={[styles.specTagText, { color: theme.textSecondary }]}>
                        {st.maxPowerKw} kW • CCS2
                      </Text>
                    </View>
                  </View>

                  {/* Price & CTA Button */}
                  <View
                    style={[
                      styles.nearbyCardBottomRow,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <View>
                      <Text style={[styles.nearbyTariffLabel, { color: theme.textMuted }]}>
                        TARIFF
                      </Text>
                      <Text style={[styles.nearbyPriceText, { color: theme.primary }]}>
                        ₹{st.tariffPerKwh}/kWh
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.nearbyChargeCta, { backgroundColor: theme.primary }]}
                      onPress={() =>
                        navigation.navigate('StationDetail', { stationId: st.id })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.nearbyChargeCtaText}>Start ⚡</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 7. FastPay Banner */}
        <TouchableOpacity
          style={[
            styles.paymentBannerCard,
            {
              backgroundColor: theme.isDark ? 'rgba(6, 26, 42, 0.95)' : '#ECFDF5',
              borderColor: theme.isDark ? 'rgba(0, 208, 132, 0.35)' : '#A7F3D0',
            },
          ]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.paymentBannerLeft}>
            <View style={[styles.paymentBannerBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.paymentBannerBadgeText, { color: theme.primary }]}>
                FASTPAY ENABLED • ₹100 BONUS
              </Text>
            </View>
            <Text style={[styles.paymentBannerTitle, { color: theme.textPrimary }]}>
              Charge. Pay. Go Seamlessly.
            </Text>
            <Text style={[styles.paymentBannerSub, { color: theme.textSecondary }]}>
              Use UPI, Fastag or Wallet and get instant digital GST tax invoices.
            </Text>
            {/* Visual Badges */}
            <View style={styles.paymentMethodsRow}>
              <View
                style={[
                  styles.payPill,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF' },
                ]}
              >
                <Text style={[styles.payPillText, { color: theme.textPrimary }]}>📲 UPI AutoDebit</Text>
              </View>
              <View
                style={[
                  styles.payPill,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF' },
                ]}
              >
                <Text style={[styles.payPillText, { color: theme.textPrimary }]}>🛣️ Fastag</Text>
              </View>
              <View
                style={[
                  styles.payPill,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF' },
                ]}
              >
                <Text style={[styles.payPillText, { color: theme.textPrimary }]}>🧾 GST Invoices</Text>
              </View>
            </View>
          </View>
          <View style={[styles.paymentArrowWrap, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.paymentArrowText, { color: theme.primary }]}>➔</Text>
          </View>
        </TouchableOpacity>

        {/* 8. Matching Charging Hubs / Network Stations Section */}
        <View style={styles.listHeaderRow}>
          <View>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>
              Matching Charging Hubs ({filteredStations.length})
            </Text>
            <Text style={[styles.sectionHeaderSubtitle, { color: theme.textSecondary }]}>
              5,000+ Interoperable bays across Delhi-NCR &amp; India
            </Text>
          </View>
        </View>

        {/* Stations List or Empty State */}
        {filteredStations.length > 0 ? (
          filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() =>
                navigation.navigate('StationDetail', { stationId: station.id })
              }
            />
          ))
        ) : (
          <View
            style={[
              styles.emptySearchBox,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={styles.emptySearchIcon}>🔍</Text>
            <Text style={[styles.emptySearchTitle, { color: theme.textPrimary }]}>
              No Charging Hubs Found
            </Text>
            <Text style={[styles.emptySearchSub, { color: theme.textSecondary }]}>
              No stations match "{searchQuery}". Try searching for another state, district, or city.
            </Text>
            <TouchableOpacity
              style={[styles.emptyResetBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
            >
              <Text style={styles.emptyResetBtnText}>Clear Search &amp; Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  // 1. Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 17.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerTagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 15,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  walletIcon: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: '800',
  },

  // 2. Greeting
  greetingSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },

  // 3. Search Card
  searchCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.2,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  searchCardHeader: {
    marginBottom: 12,
  },
  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTitleIcon: {
    fontSize: 17,
    marginRight: 6,
  },
  searchCardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  searchCardSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    marginBottom: 12,
  },
  inputSearchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  clearSearchIcon: {
    fontSize: 13,
    padding: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  chipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryCtaBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: '#031726',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  secondaryCtaBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // 4. Quick Actions Grid
  quickActionsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.sm + 2,
  },
  quickActionItem: {
    width: (width - 32) / 5,
    alignItems: 'center',
  },
  actionIconContainer: {
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
  },

  // 5. EV Telemetry Card
  evStatusCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  evCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  evVehicleInfo: {
    flex: 1,
  },
  evTagLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  evModelTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  evConnectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectedText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  evTelemetryGrid: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: 12,
    alignItems: 'center',
  },
  telemetryStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryValueLarge: {
    fontSize: 22,
    fontWeight: '900',
  },
  telemetryLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  batteryBarBg: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  telemetryDivider: {
    width: 1,
    height: 38,
  },
  telemetryEfficiency: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 4,
  },
  evCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  lastUpdatedText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  refreshIconButton: {
    padding: 4,
  },
  refreshIconEmoji: {
    fontSize: 14,
  },

  // 6. Nearby Stations
  nearbySection: {
    marginTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
  sectionHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  nearbyCardsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  nearbyStationCard: {
    width: 260,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.2,
    padding: 14,
  },
  nearbyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  cpoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  favIcon: {
    fontSize: 14,
  },
  nearbyStationName: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  nearbyAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  nearbyDistanceText: {
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  nearbySpecsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  specTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  specTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nearbyCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  nearbyTariffLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  nearbyPriceText: {
    fontSize: 13,
    fontWeight: '900',
  },
  nearbyChargeCta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  nearbyChargeCtaText: {
    color: '#031726',
    fontSize: 11,
    fontWeight: '900',
  },

  // 7. Payment Banner
  paymentBannerCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  paymentBannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  paymentBannerBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  paymentBannerTitle: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  paymentBannerSub: {
    fontSize: 11,
    marginTop: 3,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  payPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  payPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  paymentArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentArrowText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // 8. List Header
  listHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },

  // Empty Search Box
  emptySearchBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptySearchTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySearchSub: {
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
