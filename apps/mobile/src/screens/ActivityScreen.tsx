import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { mockRecentSessions, mockStations } from '../services/mockData';
import { Header, AuthGateModal, AppModal, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useLanguage, useTheme } from '../context';
import { ChargingSession } from '@chargemesh/shared-types';
import { WELCOME_BONUS_AMOUNT_RUPEES } from '../constants/appConstants';

interface ActivityScreenProps {
  navigation: any;
}

type NetworkFilter = 'all' | 'tata' | 'jiobp' | 'statiq' | 'chargezone' | 'zeon';
type DateFilter = 'all' | '7days' | '30days' | 'month';

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const { t } = useLanguage();

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkFilter>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<DateFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ChargingSession | null>(null);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  // Filter sessions by Network and Date Range
  const filteredSessions = useMemo(() => {
    return mockRecentSessions.filter((s) => {
      // 1. Network Filter
      if (selectedNetwork === 'tata' && s.cpoId !== 'cpo-tata') return false;
      if (selectedNetwork === 'jiobp' && s.cpoId !== 'cpo-jiobp') return false;
      if (selectedNetwork === 'statiq' && s.cpoId !== 'cpo-statiq') return false;
      if (selectedNetwork === 'chargezone' && s.cpoId !== 'cpo-chargezone') return false;
      if (selectedNetwork === 'zeon' && s.cpoId !== 'cpo-zeon') return false;

      // 2. Date Range Filter
      if (selectedDateRange !== 'all') {
        const sessionTime = new Date(s.startTime || Date.now()).getTime();
        const now = Date.now();
        if (selectedDateRange === '7days' && now - sessionTime > 7 * 86400 * 1000) return false;
        if (selectedDateRange === '30days' && now - sessionTime > 30 * 86400 * 1000) return false;
      }

      return true;
    });
  }, [selectedNetwork, selectedDateRange]);

  const handleViewReceipt = (session: ChargingSession) => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setActiveReceipt(session);
  };

  const getCpoDisplayName = (cpoId: string) => {
    switch (cpoId) {
      case 'cpo-tata':
        return '⚡ Tata Power EZ Charge';
      case 'cpo-jiobp':
        return '🔵 Jio-bp pulse';
      case 'cpo-statiq':
        return '⚡ Statiq Grid';
      case 'cpo-chargezone':
        return '🔋 ChargeZone';
      case 'cpo-zeon':
        return '⚡ Zeon Charging';
      default:
        return '⚡ Public EV Charger';
    }
  };

  const getStationName = (session: ChargingSession) => {
    const matched = mockStations.find((st) => st.id === session.locationId);
    return matched ? matched.name : 'ChargeMesh Verified EV Hub';
  };

  const resetFilters = () => {
    setSelectedNetwork('all');
    setSelectedDateRange('all');
    setShowFilterModal(false);
  };

  const hasActiveFilters = selectedNetwork !== 'all' || selectedDateRange !== 'all';

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title={`${t('activity.title')} ⚡`}
          subtitle={`${t('common.appName')} History`}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.guestCenteredContainer}>
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
              <Text style={{ fontSize: 36 }}>🧾</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Login Required 🔐
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Please log in or create an account to view your EV charging history, session telemetry, and download tax invoices.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Log In ➔</Text>
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
                Sign Up (Get ₹{WELCOME_BONUS_AMOUNT_RUPEES} Bonus)
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 1. Header with right Filter button */}
      <Header
        title={`${t('activity.title')} ⚡`}
        subtitle={`${t('common.appName')} History`}
        rightAction={
          <TouchableOpacity
            style={[
              styles.headerFilterBtn,
              {
                backgroundColor: hasActiveFilters
                  ? theme.primary
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : '#F1F5F9',
                borderColor: hasActiveFilters ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.82}
          >
            <Text
              style={[
                styles.headerFilterBtnText,
                { color: hasActiveFilters ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              ⚙ Filters
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* =========================================================================
            2. CHARGING SUMMARY CARD (EQUAL 3 COLUMNS WITH ICONS)
        ========================================================================= */}
            <View
              style={[
                styles.summaryBanner,
                {
                  backgroundColor: isDark ? '#0F172A' : '#0B192C',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#1E293B',
                },
              ]}
            >
              {/* Metric 1: Energy Charged */}
              <View style={styles.summaryMetric}>
                <Text style={styles.metricIcon}>⚡</Text>
                <Text style={styles.metricVal}>
                  {user?.totalKwhCharged ? user.totalKwhCharged.toFixed(1) : '428.5'} kWh
                </Text>
                <Text style={styles.metricLbl}>Energy Charged</Text>
              </View>

              <View style={styles.divider} />

              {/* Metric 2: Total Spent */}
              <View style={styles.summaryMetric}>
                <Text style={styles.metricIcon}>💰</Text>
                <Text style={styles.metricVal}>
                  ₹{user?.totalKwhCharged ? (user.totalKwhCharged * 18.2).toFixed(0) : '7,799'}
                </Text>
                <Text style={styles.metricLbl}>Total Spent</Text>
              </View>

              <View style={styles.divider} />

              {/* Metric 3: CO2 Prevented */}
              <View style={styles.summaryMetric}>
                <Text style={styles.metricIcon}>🌱</Text>
                <Text style={[styles.metricVal, { color: '#00D084' }]}>
                  {user?.co2SavedKg ? user.co2SavedKg.toFixed(0) : '351'} kg
                </Text>
                <Text style={styles.metricLbl}>CO₂ Prevented</Text>
              </View>
            </View>

            {/* =========================================================================
                3. NETWORK FILTER CHIPS (COMPACT HORIZONTAL SCROLL)
            ========================================================================= */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'all' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('all')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'all' && styles.pillTextActive,
                    ]}
                  >
                    All Networks
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'tata' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('tata')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'tata' && styles.pillTextActive,
                    ]}
                  >
                    ⚡ Tata Power
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'jiobp' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('jiobp')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'jiobp' && styles.pillTextActive,
                    ]}
                  >
                    🔵 Jio-bp pulse
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'statiq' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('statiq')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'statiq' && styles.pillTextActive,
                    ]}
                  >
                    ⚡ Statiq Grid
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'chargezone' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('chargezone')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'chargezone' && styles.pillTextActive,
                    ]}
                  >
                    🔋 ChargeZone
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                    selectedNetwork === 'zeon' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setSelectedNetwork('zeon')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: theme.textSecondary },
                      selectedNetwork === 'zeon' && styles.pillTextActive,
                    ]}
                  >
                    ⚡ Zeon Charging
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* =========================================================================
                4. SESSION INVOICES SECTION
            ========================================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
                SESSION INVOICES ({filteredSessions.length})
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={[styles.resetFilterText, { color: theme.primary }]}>
                    Reset Filters ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* If No Sessions Match Filter */}
            {filteredSessions.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={styles.emptyEmoji}>⚡</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No charging sessions yet ⚡
                </Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Your completed charging sessions will appear here.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyCtaBtn, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('Map')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.emptyCtaText}>Find a Charger →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredSessions.map((session) => {
                const costRupees = ((session.finalAmountPaise || 0) / 100).toFixed(2);
                const durationMins = Math.round((session.durationSeconds || 0) / 60);

                return (
                  <TouchableOpacity
                    key={session.id}
                    style={[
                      styles.sessionCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => handleViewReceipt(session)}
                    activeOpacity={0.92}
                  >
                    {/* Header Row */}
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.cpoBadge,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : '#F1F5F9',
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.cpoBadgeText, { color: theme.textPrimary }]}>
                          {getCpoDisplayName(session.cpoId)}
                        </Text>
                      </View>
                      <View style={styles.dateAndMoreRow}>
                        <Text style={[styles.sessionDate, { color: theme.textSecondary }]}>
                          {new Date(session.startTime || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleViewReceipt(session)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={{ marginLeft: 6 }}
                        >
                          <Text style={[styles.moreIcon, { color: theme.textSecondary }]}>⋮</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Session Metrics Container (3 Columns) */}
                    <View
                      style={[
                        styles.metricsRow,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : '#F8FAFC',
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
                          {session.energyKwh} kWh
                        </Text>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                          Energy
                        </Text>
                      </View>

                      <View
                        style={[styles.metricVerticalDivider, { backgroundColor: theme.border }]}
                      />

                      <View style={styles.metricItem}>
                        <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
                          {durationMins} min
                        </Text>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                          Duration
                        </Text>
                      </View>

                      <View
                        style={[styles.metricVerticalDivider, { backgroundColor: theme.border }]}
                      />

                      <View style={styles.metricItem}>
                        <Text style={[styles.metricNumber, { color: '#00D084' }]}>
                          ₹{costRupees}
                        </Text>
                        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                          Total Paid
                        </Text>
                      </View>
                    </View>

                    {/* Footer Row: Status & View Receipt Action */}
                    <View style={styles.cardFooter}>
                      <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                          Reconciled &amp; Billed
                        </Text>
                      </View>

                      <View style={styles.receiptActionWrap}>
                        <Text style={styles.receiptDocIcon}>📄</Text>
                        <Text style={[styles.receiptBtnText, { color: theme.primary }]}>
                          View Receipt →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* =========================================================================
                5. CHARGING INSIGHTS ANALYTICS CARD
            ========================================================================= */}
            <View
              style={[
                styles.insightsCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.insightsHeader}>
                <View style={styles.insightsHeaderLeft}>
                  <Text style={styles.insightsIcon}>📊</Text>
                  <Text style={[styles.insightsTitle, { color: theme.textPrimary }]}>
                    Your Charging Insights
                  </Text>
                </View>
                <Text style={[styles.insightsChevron, { color: theme.textSecondary }]}>›</Text>
              </View>

              <View
                style={[
                  styles.insightsMetricsRow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.03)'
                      : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.insightMetricItem}>
                  <Text style={[styles.insightMetricVal, { color: theme.textPrimary }]}>
                    16.2 kWh
                  </Text>
                  <Text style={[styles.insightMetricLbl, { color: theme.textSecondary }]}>
                    Avg. Energy / Session
                  </Text>
                </View>

                <View
                  style={[styles.metricVerticalDivider, { backgroundColor: theme.border }]}
                />

                <View style={styles.insightMetricItem}>
                  <Text style={[styles.insightMetricVal, { color: theme.textPrimary }]}>
                    31 min
                  </Text>
                  <Text style={[styles.insightMetricLbl, { color: theme.textSecondary }]}>
                    Avg. Duration
                  </Text>
                </View>

                <View
                  style={[styles.metricVerticalDivider, { backgroundColor: theme.border }]}
                />

                <View style={styles.insightMetricItem}>
                  <Text style={[styles.insightMetricVal, { color: '#00D084' }]}>
                    2.1 kg
                  </Text>
                  <Text style={[styles.insightMetricLbl, { color: theme.textSecondary }]}>
                    Avg. CO₂ / Session
                  </Text>
                </View>
              </View>
            </View>

            {/* =========================================================================
                6. SUSTAINABILITY MESSAGE CARD
            ========================================================================= */}
            <View
              style={[
                styles.sustainabilityCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(0, 208, 132, 0.05)'
                    : '#F6FDF9',
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.2)' : 'rgba(0, 208, 132, 0.25)',
                },
              ]}
            >
              <View style={styles.sustainIconBox}>
                <Text style={{ fontSize: 20 }}>💡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sustainTitle, { color: theme.primary }]}>
                  Keep charging green!
                </Text>
                <Text style={[styles.sustainSub, { color: theme.textSecondary }]}>
                  You've prevented{' '}
                  <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                    {user?.co2SavedKg ? user.co2SavedKg.toFixed(0) : '351'} kg
                  </Text>{' '}
                  of CO₂. Great job for a cleaner tomorrow.
                </Text>
              </View>
            </View>
      </ScrollView>

      {/* =========================================================================
          7. MULTI-CRITERIA FILTER BOTTOM SHEET MODAL
      ========================================================================= */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />
          <View
            style={[
              styles.filterSheet,
              { backgroundColor: theme.surface, borderTopColor: theme.border },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.filterSheetHeader}>
              <Text style={[styles.filterSheetTitle, { color: theme.textPrimary }]}>
                ⚙ Filter Charging Activity
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={[styles.filterCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Date Range Selection */}
            <Text style={[styles.filterGroupLabel, { color: theme.textSecondary }]}>
              DATE RANGE
            </Text>
            <View style={styles.filterOptionsGrid}>
              {[
                { id: 'all', label: 'All Time' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
              ].map((opt) => {
                const isSelected = selectedDateRange === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.filterOptionChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                        borderColor: theme.border,
                      },
                      isSelected && {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setSelectedDateRange(opt.id as DateFilter)}
                  >
                    <Text
                      style={[
                        styles.filterOptionChipText,
                        { color: theme.textSecondary },
                        isSelected && { color: theme.primary, fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Network Selection */}
            <Text style={[styles.filterGroupLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              CHARGING NETWORK
            </Text>
            <View style={styles.filterOptionsGrid}>
              {[
                { id: 'all', label: 'All Operators' },
                { id: 'tata', label: 'Tata Power' },
                { id: 'jiobp', label: 'Jio-bp pulse' },
                { id: 'statiq', label: 'Statiq Grid' },
                { id: 'chargezone', label: 'ChargeZone' },
                { id: 'zeon', label: 'Zeon' },
              ].map((opt) => {
                const isSelected = selectedNetwork === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.filterOptionChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                        borderColor: theme.border,
                      },
                      isSelected && {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setSelectedNetwork(opt.id as NetworkFilter)}
                  >
                    <Text
                      style={[
                        styles.filterOptionChipText,
                        { color: theme.textSecondary },
                        isSelected && { color: theme.primary, fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActionRow}>
              <TouchableOpacity
                style={[styles.filterResetBtn, { borderColor: theme.border }]}
                onPress={resetFilters}
              >
                <Text style={[styles.filterResetBtnText, { color: theme.textSecondary }]}>
                  Reset All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterApplyBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName="Charging History &amp; Tax Invoices"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      {/* Itemized GST Tax Invoice AppModal */}
      {activeReceipt && (
        <AppModal
          visible={!!activeReceipt}
          type="payment"
          badge="GST Tax Invoice"
          iconEmoji="📄"
          title={`Session Invoice #${activeReceipt.cpoSessionId?.slice(-6)?.toUpperCase() || 'RECEIPT'}`}
          subtitle={`Verified cross-CPO transaction via ${getCpoDisplayName(activeReceipt.cpoId)}`}
          onClose={() => setActiveReceipt(null)}
          details={[
            { icon: '📍', title: 'Charging Station', value: getStationName(activeReceipt) },
            { icon: '🏢', title: 'Network Operator', value: getCpoDisplayName(activeReceipt.cpoId) },
            { icon: '⚡', title: 'Energy Consumed', value: `${activeReceipt.energyKwh} kWh` },
            {
              icon: '⏱️',
              title: 'Total Duration',
              value: `${Math.round((activeReceipt.durationSeconds || 0) / 60)} Minutes`,
            },
            {
              icon: '🔋',
              title: 'Battery Level',
              value: '18% → 82% (+64%)',
            },
            {
              icon: '💰',
              title: 'Total Amount (Incl. 18% GST)',
              value: `₹${((activeReceipt.finalAmountPaise || 0) / 100).toFixed(2)}`,
            },
            { icon: '💳', title: 'Payment Method', value: 'ChargeMesh Fast Wallet' },
            { icon: '🏛️', title: 'GST Compliance', value: 'IRN Generated & Verified' },
            {
              icon: '🆔',
              title: 'Session ID',
              value: activeReceipt.cpoSessionId || activeReceipt.id,
            },
          ]}
          primaryAction={{
            label: 'Download Invoice (PDF)',
            onPress: () => {
              setActiveReceipt(null);
              setShowDownloadSuccess(true);
            },
          }}
          dismissLabel="Close"
        />
      )}

      {/* Download Success Modal */}
      <StatusModal
        visible={showDownloadSuccess}
        type="success"
        badge="Downloaded"
        iconEmoji="📥"
        title="Invoice Saved Successfully"
        message="Tax invoice PDF has been downloaded and sent to your registered email address."
        buttonLabel="Done"
        onClose={() => setShowDownloadSuccess(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Header Filter Action
  headerFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  headerFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Summary Banner
  summaryBanner: {
    flexDirection: 'row',
    borderRadius: borderRadius.xxl,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.card,
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 15,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  metricLbl: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  // Horizontal Network Filter Chips
  filterSection: {
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Session Invoices Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Session Card
  sessionCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cpoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  cpoBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dateAndMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreIcon: {
    fontSize: 14,
    fontWeight: '900',
    paddingHorizontal: 4,
  },

  // Metrics Container
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricVerticalDivider: {
    width: 1,
    height: 24,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  receiptActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptDocIcon: {
    fontSize: 12,
  },
  receiptBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Empty State
  emptyStateCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCtaBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Insights Card
  insightsCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1.2,
    ...shadows.card,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightsIcon: {
    fontSize: 15,
  },
  insightsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  insightsChevron: {
    fontSize: 16,
    fontWeight: '900',
  },
  insightsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  insightMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightMetricVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  insightMetricLbl: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  // Sustainability Card
  sustainabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  sustainIconBox: {
    marginRight: 12,
  },
  sustainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  sustainSub: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Guest Activity Card
  guestActivityCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  guestActivityIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  guestActivityTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  guestActivitySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  signInButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Filter Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
  },
  filterSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterCloseText: {
    fontSize: 16,
    fontWeight: '800',
    padding: 4,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  filterOptionChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  filterResetBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  filterApplyBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  guestCenteredContainer: {
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
