import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header, AuthGateModal, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme, useLanguage } from '../context';
import { Vehicle } from '@chargemesh/shared-types';

interface VehicleScreenProps {
  navigation: any;
}

export const VehicleScreen: React.FC<VehicleScreenProps> = ({ navigation }) => {
  const { vehicles, activeVehicle, isGuest, setActiveVehicleId } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusContent, setStatusContent] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'info' | 'error',
    badge: '',
    iconEmoji: '',
  });

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title={t('vehicle.title') || 'EV Garage'}
          subtitle="Manage your connected electric vehicles"
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
              <Text style={{ fontSize: 36 }}>🔐</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Login Required 🔐
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Please log in or create an account to add and manage your vehicles.
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
                  backgroundColor: 'rgba(0, 208, 132, 0.08)',
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

  const handleSwitchActive = (v: Vehicle) => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setActiveVehicleId(v.id);
    setStatusContent({
      title: 'Active EV Switched 🟢',
      message: `${v.make} ${v.model} (${v.variant || 'Standard'}) is now selected as your primary vehicle for charging filters and duration calculations.`,
      type: 'success',
      badge: 'Active Primary',
      iconEmoji: '⚡',
    });
    setShowStatusModal(true);
  };

  const handleAddVehiclePress = () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    navigation.navigate('AddVehicle');
  };

  const handleViewAllVehiclesPress = () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    navigation.navigate('MyVehicles');
  };

  const active = activeVehicle || vehicles[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={t('vehicle.title')}
        subtitle={t('vehicle.subtitle')}
        rightAction={
          <TouchableOpacity
            style={[styles.manageHeaderBtn, { borderColor: theme.border }]}
            onPress={handleViewAllVehiclesPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.manageHeaderBtnText, { color: theme.primary }]}>
              My Vehicles ➔
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            1. GUEST EXPLORER BANNER
        ========================================================================= */}
        {isGuest && (
          <View style={[styles.guestBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>⚡</Text>
            <Text style={[styles.guestBannerTitle, { color: theme.textPrimary }]}>
              Guest Vehicle Preview
            </Text>
            <Text style={[styles.guestBannerSub, { color: theme.textSecondary }]}>
              Sign in to save multiple EVs, sync battery health profiles, and get tailored charging curves.
            </Text>
            <TouchableOpacity
              style={[styles.guestBannerBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.guestBannerBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================================================
            2. ACTIVE PRIMARY VEHICLE HERO CARD
        ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('vehicle.activeVehicle')}
          </Text>
          <View style={styles.primaryBadgePill}>
            <Text style={styles.primaryBadgePillText}>🟢 Primary Active</Text>
          </View>
        </View>

        {active ? (
          <View
            style={[
              styles.heroVehicleCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
              },
            ]}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroCarEmoji}>🚘</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroCarName, { color: theme.textPrimary }]}>
                  {active.make} {active.model}
                </Text>
                <Text style={[styles.heroCarVariant, { color: theme.textSecondary }]}>
                  {active.variant || 'Standard Range'}
                  {(active as any).nickname ? ` • "${(active as any).nickname}"` : ''}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Technical Specifications Grid */}
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                  {active.batteryCapacityKwh} kWh
                </Text>
                <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                  Battery Pack
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                  {active.maxDcPowerKw || 50} kW
                </Text>
                <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                  Max DC Fast
                </Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                  {active.maxAcPowerKw || 7.4} kW
                </Text>
                <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                  AC Charging
                </Text>
              </View>
            </View>

            {/* Connector Ports */}
            <View style={styles.portsContainer}>
              <Text style={[styles.portsLabel, { color: theme.textSecondary }]}>
                Compatible Plugs:
              </Text>
              <View style={styles.portPillsRow}>
                {active.connectorTypes.map((port) => (
                  <View
                    key={port}
                    style={[
                      styles.portPill,
                      {
                        backgroundColor: 'rgba(0, 208, 132, 0.12)',
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text style={styles.portPillText}>⚡ {port}</Text>
                  </View>
                ))}
              </View>
            </View>

            {active.registrationPlate && (
              <View style={[styles.plateBanner, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.plateLabel, { color: theme.textSecondary }]}>REGISTRATION PLATE</Text>
                <Text style={[styles.plateValue, { color: theme.textPrimary }]}>{active.registrationPlate}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🚗</Text>
            <Text style={[styles.emptyCardTitle, { color: theme.textPrimary }]}>No Vehicles Connected</Text>
          </View>
        )}

        {/* =========================================================================
            3. CONNECTED VEHICLES SWITCHER
        ========================================================================= */}
        {vehicles.length > 1 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Switch Connected EV
              </Text>
              <Text style={[styles.connectedCountText, { color: theme.textSecondary }]}>
                {vehicles.length} in garage
              </Text>
            </View>

            <View style={styles.vehiclesListColumn}>
              {vehicles.map((v) => {
                const isActive = v.id === active?.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.switcherItem,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      isActive && {
                        borderColor: theme.primary,
                        backgroundColor: 'rgba(0, 208, 132, 0.05)',
                      },
                    ]}
                    onPress={() => handleSwitchActive(v)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.switcherIcon}>
                      <Text style={{ fontSize: 18 }}>🚘</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.switcherTitle, { color: theme.textPrimary }]}>
                        {v.make} {v.model}
                      </Text>
                      <Text style={[styles.switcherSub, { color: theme.textSecondary }]}>
                        {v.batteryCapacityKwh} kWh • {v.variant || 'Standard'}
                      </Text>
                    </View>
                    {isActive ? (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Active ✓</Text>
                      </View>
                    ) : (
                      <View style={[styles.selectTag, { borderColor: theme.border }]}>
                        <Text style={[styles.selectTagText, { color: theme.textSecondary }]}>
                          Select
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* =========================================================================
            4. CHARGING NETWORK COMPATIBILITY MATRIX
        ========================================================================= */}
        <View style={[styles.compatCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.compatTitle, { color: theme.textPrimary }]}>
            🔌 ChargeMesh Interoperability Grid
          </Text>
          <Text style={[styles.compatSub, { color: theme.textSecondary }]}>
            Your {active?.make} {active?.model} supports seamless plug-and-charge across verified Indian CPOs:
          </Text>

          <View style={styles.cpoGrid}>
            {[
              { name: 'Tata Power EZ', status: 'Full DC/AC Support' },
              { name: 'Jio-bp pulse', status: 'High-Power DC 60-120 kW' },
              { name: 'Statiq Grid', status: 'Fast CCS2 Supported' },
              { name: 'ChargeZone', status: 'Highway High-Speed Hubs' },
              { name: 'Zeon Charging', status: '150 kW Ultra-Fast' },
              { name: 'Ather / Local AC', status: 'Type 2 3.3-7.4 kW' },
            ].map((cpo, idx) => (
              <View key={idx} style={[styles.cpoItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.cpoName, { color: theme.textPrimary }]}>✓ {cpo.name}</Text>
                <Text style={[styles.cpoStatus, { color: theme.textSecondary }]}>{cpo.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* =========================================================================
            5. DEDICATED ACTION BUTTONS
        ========================================================================= */}
        <View style={styles.actionButtonsStack}>
          <TouchableOpacity
            style={[styles.primaryAddBtn, { backgroundColor: theme.primary }]}
            onPress={handleAddVehiclePress}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryAddBtnText}>＋ Add Electric Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryManageBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={handleViewAllVehiclesPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryManageBtnText, { color: theme.textPrimary }]}>
              🚗 View & Manage My Vehicles ({vehicles.length})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName="EV Garage & Multiple Vehicles"
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
        title={statusContent.title}
        message={statusContent.message}
        type={statusContent.type}
        badge={statusContent.badge}
        iconEmoji={statusContent.iconEmoji}
        onClose={() => setShowStatusModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  manageHeaderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  manageHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  guestBanner: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  guestBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  guestBannerSub: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  guestBannerBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  guestBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryBadgePill: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  primaryBadgePillText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '800',
  },
  connectedCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroVehicleCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroCarEmoji: {
    fontSize: 24,
  },
  heroCarName: {
    fontSize: 18,
    fontWeight: '900',
  },
  heroCarVariant: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  specLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  portsContainer: {
    marginTop: 14,
  },
  portsLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  portPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  portPillText: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '800',
  },
  plateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  plateLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plateValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  vehiclesListColumn: {
    gap: 8,
  },
  switcherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    padding: 12,
  },
  switcherIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  switcherTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  switcherSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  activeTag: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  activeTagText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '800',
  },
  selectTag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  selectTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  compatCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: 20,
    ...shadows.card,
  },
  compatTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  compatSub: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 12,
  },
  cpoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cpoItem: {
    width: '48%',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    padding: 8,
  },
  cpoName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  cpoStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtonsStack: {
    marginTop: 24,
    gap: 12,
  },
  primaryAddBtn: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryManageBtn: {
    height: 50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryManageBtnText: {
    fontSize: 14,
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
