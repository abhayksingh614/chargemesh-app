import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { mockStations } from '../services/mockData';
import {
  Header,
  BookingModal,
  FormInputModal,
  StatusModal,
  AuthGateModal,
  FavoriteButton,
} from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { Connector, ConnectorStatus } from '@chargemesh/shared-types';
import { useAuth, useTheme } from '../context';
import { WELCOME_BONUS_AMOUNT_RUPEES } from '../constants/appConstants';

interface StationDetailScreenProps {
  route: any;
  navigation: any;
}

export const StationDetailScreen: React.FC<StationDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { isGuest, activeVehicle } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const stationId = route?.params?.stationId || mockStations[0].id;
  const station = mockStations.find((s) => s.id === stationId) || mockStations[0];

  const [selectedConnector, setSelectedConnector] = useState<Connector>(
    station.connectors.find((c) => c.status === ConnectorStatus.AVAILABLE) || station.connectors[0]
  );

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateConfig, setAuthGateConfig] = useState({
    title: '',
    subtitle: '',
    featureName: 'this feature',
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalContent, setStatusModalContent] = useState({
    title: '',
    message: '',
    type: 'success' as any,
  });

  const isAvailable = station.availableCount > 0;
  const inUseCount = Math.max(0, station.totalConnectors - station.availableCount);
  const vehicleName = activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Your EV';

  const handleBooking = () => {
    if (isGuest) {
      setAuthGateConfig({
        title: 'Reserve Charging Bay 📅',
        subtitle: 'Sign in or create an account to reserve and hold a charging bay.',
        featureName: 'Slot Reservation',
      });
      setShowAuthGate(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (_connectorId: string, durationMinutes: number) => {
    setStatusModalContent({
      title: 'Slot Reserved Successfully! ⚡',
      message: `Bay ${selectedConnector.type} has been held exclusively for ${durationMinutes} minutes at ${station.name}. Navigate now to plug in.`,
      type: 'success',
    });
    setShowStatusModal(true);
  };

  const handleOpenMaps = () => {
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={station.name}
        subtitle={station.cpo.name}
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerRightGroup}>
            <FavoriteButton
              stationId={station.id}
              size="md"
              onToggle={(nextState) => {
                setStatusModalContent({
                  title: nextState ? 'Added to Favorites ❤️' : 'Removed from Favorites',
                  message: nextState
                    ? `${station.name} is saved to your Favorite Stations shortlist.`
                    : `${station.name} was removed from your saved stations.`,
                  type: 'success',
                });
                setShowStatusModal(true);
              }}
            />

            <TouchableOpacity
              style={[
                styles.reportBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setShowReportModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.reportBtnText, { color: theme.textSecondary }]}>
                ⚠️ Report
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Hero Availability & Live Data Trust Banner */}
        <View
          style={[
            styles.heroStatusBanner,
            {
              backgroundColor: isAvailable ? (isDark ? '#064E3B' : '#DCFCE7') : '#FEF3C7',
              borderColor: isAvailable ? '#10B981' : '#F59E0B',
            },
          ]}
        >
          <View style={styles.heroStatusTopRow}>
            <View style={styles.heroStatusBadge}>
              <View
                style={[
                  styles.statusPulseDot,
                  { backgroundColor: isAvailable ? '#16A34A' : '#D97706' },
                ]}
              />
              <Text
                style={[
                  styles.heroStatusText,
                  { color: isAvailable ? (isDark ? '#A7F3D0' : '#15803D') : '#B45309' },
                ]}
              >
                {isAvailable
                  ? `${station.availableCount} of ${station.totalConnectors} Chargers Free Right Now`
                  : `All ${station.totalConnectors} Chargers In Use`}
              </Text>
            </View>
            {inUseCount > 0 && isAvailable && (
              <Text
                style={[
                  styles.heroInUseText,
                  { color: isDark ? 'rgba(255,255,255,0.7)' : '#374151' },
                ]}
              >
                {inUseCount} charging
              </Text>
            )}
          </View>

          <View style={styles.liveTrustRow}>
            <Text style={styles.liveTrustIcon}>⚡</Text>
            <Text
              style={[
                styles.liveTrustText,
                { color: isDark ? 'rgba(255,255,255,0.85)' : '#1E293B' },
              ]}
            >
              Live verified • Updated 20 sec ago via direct network sync
            </Text>
          </View>
        </View>

        {/* 2. Key Decision Metrics 3-Column Box */}
        <View
          style={[
            styles.decisionCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#1E293B',
            },
          ]}
        >
          <View style={styles.decisionRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⚡</Text>
              <Text style={styles.summaryValue}>{station.maxPowerKw} kW</Text>
              <Text style={styles.summaryLabel}>Max DC Speed</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text style={[styles.summaryValue, { color: '#00D084' }]}>
                ₹{station.tariffPerKwh.toFixed(1)}
              </Text>
              <Text style={styles.summaryLabel}>Tariff / kWh</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📍</Text>
              <Text style={styles.summaryValue}>{station.distanceKm.toFixed(1)} km</Text>
              <Text style={styles.summaryLabel}>
                ~{Math.max(3, Math.round(station.distanceKm * 2.4))}m drive
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Visual Physical Charger Guns (Connector Selector) */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            SELECT CHARGING GUN ({station.connectors.length} BAYS)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Tap a gun to check compatibility, speed and reserve a slot:
          </Text>

          <View style={styles.connectorsList}>
            {station.connectors.map((c, index) => {
              const isSelected = selectedConnector.id === c.id;
              const isGunAvailable = c.status === ConnectorStatus.AVAILABLE;
              const isDc = c.powerType.includes('DC') || c.type.includes('CCS');

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.gunCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    isSelected && styles.gunCardSelected,
                  ]}
                  onPress={() => setSelectedConnector(c)}
                  activeOpacity={0.88}
                >
                  <View style={styles.gunHeader}>
                    <View style={styles.gunTitleWrap}>
                      <Text style={styles.gunNumberBadge}>Gun #{index + 1}</Text>
                      <Text style={[styles.gunTypeTitle, { color: theme.textPrimary }]}>
                        {c.type} • {c.maxPower} kW {isDc ? 'DC Fast' : 'AC'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.gunStatusPill,
                        isGunAvailable ? styles.statusAvailable : styles.statusBusy,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          isGunAvailable ? styles.dotGreen : styles.dotOrange,
                        ]}
                      />
                      <Text
                        style={[
                          styles.gunStatusText,
                          isGunAvailable ? styles.textGreen : styles.textOrange,
                        ]}
                      >
                        {isGunAvailable ? 'Available' : 'In Use'}
                      </Text>
                    </View>
                  </View>

                  {/* Compatibility Badge */}
                  {c.type === 'CCS2' && (
                    <View style={styles.gunCompatBadge}>
                      <Text style={styles.compatCheck}>✓</Text>
                      <Text style={styles.compatLabel}>
                        Recommended for {vehicleName} (Supports up to {c.maxPower}kW)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Station Location & Amenities */}
        <View
          style={[
            styles.amenitiesCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.amenitiesTitle, { color: theme.textPrimary }]}>
            Location &amp; Amenities
          </Text>

          <Text style={[styles.addressLine, { color: theme.textPrimary }]}>
            📍 {station.address}, {station.city}
          </Text>

          <Text style={[styles.timingLine, { color: theme.textSecondary }]}>
            🕒 {station.openingTimes || '24x7 Open'}
          </Text>

          {station.directions && (
            <Text style={[styles.directionsLine, { color: theme.textSecondary }]}>
              ℹ️ {station.directions}
            </Text>
          )}

          {/* Amenity Pills */}
          <View style={styles.amenityChipsRow}>
            {['☕ Café & Dining', '🚻 Restrooms', '🅿️ Free EV Parking', '🛡️ 24/7 Security', '📶 Free WiFi'].map(
              (amenity, i) => (
                <View
                  key={i}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.amenityChipText, { color: theme.textPrimary }]}>
                    {amenity}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* 5. Fixed Floating Bottom Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.directionsActionBtn, { borderColor: theme.border }]}
          onPress={handleOpenMaps}
          activeOpacity={0.8}
        >
          <Text style={styles.directionsActionIcon}>🗺️</Text>
          <Text style={[styles.directionsActionText, { color: theme.textPrimary }]}>
            Navigate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.startChargeActionBtn,
            { backgroundColor: isAvailable ? theme.primary : '#94A3B8' },
          ]}
          onPress={() => {
            if (isGuest) {
              setAuthGateConfig({
                title: 'Create Your ChargeMesh Account',
                subtitle: `Sign up to start charging and get ₹${WELCOME_BONUS_AMOUNT_RUPEES} welcome bonus.`,
                featureName: 'Charging Session',
              });
              setShowAuthGate(true);
              return;
            }
            if (isAvailable) {
              navigation.navigate('QRScanner');
            } else {
              handleBooking();
            }
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.startChargeActionText}>
            {isAvailable ? '⚡ Scan & Start Charge' : '📅 Reserve When Free'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        stationName={station.name}
        connectors={station.connectors}
        onClose={() => setShowBookingModal(false)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Report Issue Modal */}
      <FormInputModal
        visible={showReportModal}
        title="Report Station Issue"
        subtitle={`Help fellow EV drivers by reporting broken or blocked chargers at ${station.name}.`}
        fields={[
          {
            key: 'issueType',
            label: 'Issue Category',
            placeholder: 'e.g. Gun damaged, Blocked by ICE car, Power cut',
            required: true,
          },
          {
            key: 'notes',
            label: 'Additional Details',
            placeholder: 'Provide any helpful context for CPO repair crew...',
            multiline: true,
          },
        ]}
        submitLabel="Submit Report"
        onClose={() => setShowReportModal(false)}
        onSubmit={(_values) => {
          setShowReportModal(false);
          setStatusModalContent({
            title: 'Report Submitted',
            message: 'Thank you for reporting! Operational alert sent to charging network.',
            type: 'success',
          });
          setShowStatusModal(true);
        }}
      />

      {/* Global Centered Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        title={authGateConfig.title}
        subtitle={authGateConfig.subtitle}
        featureName={authGateConfig.featureName}
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

      {/* Status Modal */}
      <StatusModal
        visible={showStatusModal}
        type={statusModalContent.type}
        title={statusModalContent.title}
        message={statusModalContent.message}
        buttonLabel="Got It"
        onClose={() => setShowStatusModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 90,
  },

  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favHeaderBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  favHeaderBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  favHeaderIcon: {
    fontSize: 16,
  },
  favIconActive: {
    color: '#16A34A',
  },
  reportBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  reportBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Hero Status Banner
  heroStatusBanner: {
    borderRadius: borderRadius.xl,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    ...shadows.card,
  },
  heroStatusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroStatusText: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroInUseText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  liveTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveTrustIcon: {
    fontSize: 12,
  },
  liveTrustText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Decision Card
  decisionCard: {
    borderRadius: borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    ...shadows.card,
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
    marginTop: 2,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Section Wrap
  sectionWrap: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  connectorsList: {
    gap: 10,
  },
  gunCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    ...shadows.card,
  },
  gunCardSelected: {
    borderWidth: 2,
  },
  gunHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gunTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gunNumberBadge: {
    backgroundColor: '#00D084',
    color: '#0B192C',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gunTypeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  gunStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusBusy: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#16A34A',
  },
  dotOrange: {
    backgroundColor: '#D97706',
  },
  gunStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textGreen: {
    color: '#15803D',
  },
  textOrange: {
    color: '#B45309',
  },
  gunCompatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: 8,
    gap: 5,
  },
  compatCheck: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 11,
  },
  compatLabel: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },

  // Amenities Card
  amenitiesCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
    ...shadows.card,
  },
  amenitiesTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  timingLine: {
    fontSize: 12,
    marginBottom: 4,
  },
  directionsLine: {
    fontSize: 11.5,
    marginBottom: 10,
  },
  amenityChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  amenityChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Bottom Floating Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  directionsActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
  },
  directionsActionIcon: {
    fontSize: 14,
  },
  directionsActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  startChargeActionBtn: {
    flex: 2,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChargeActionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
