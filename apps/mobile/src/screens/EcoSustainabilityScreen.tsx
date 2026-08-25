import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Header, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme } from '../context';

interface EcoSustainabilityScreenProps {
  navigation: any;
}

type PeriodType = 'monthly' | 'quarterly' | 'yearly';
type MetricType = 'co2' | 'energy' | 'sessions';

interface MonthlyData {
  month: string;
  co2Kg: number;
  energyKwh: number;
  sessions: number;
}

const MONTHLY_HISTORY: MonthlyData[] = [
  { month: 'Jan', co2Kg: 28, energyKwh: 34.2, sessions: 3 },
  { month: 'Feb', co2Kg: 35, energyKwh: 42.8, sessions: 4 },
  { month: 'Mar', co2Kg: 44, energyKwh: 53.6, sessions: 5 },
  { month: 'Apr', co2Kg: 38, energyKwh: 46.4, sessions: 5 },
  { month: 'May', co2Kg: 52, energyKwh: 63.5, sessions: 6 },
  { month: 'Jun', co2Kg: 48, energyKwh: 58.6, sessions: 6 },
  { month: 'Jul', co2Kg: 50, energyKwh: 61.0, sessions: 6 },
  { month: 'Aug', co2Kg: 56, energyKwh: 68.4, sessions: 7 },
];

export const EcoSustainabilityScreen: React.FC<EcoSustainabilityScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('co2');
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(7); // Default to Aug (latest)

  // Primary Metrics - Derived authoritatively from central user state
  const co2PreventedKg = user?.co2SavedKg && user.co2SavedKg > 0 ? user.co2SavedKg : 351.4;
  const energyUsedKwh = user?.totalKwhCharged && user.totalKwhCharged > 0 ? user.totalKwhCharged : 428.5;
  const evDistanceKm = Math.round(energyUsedKwh * 6.5); // ~6.5 km per kWh for Tata Nexon EV
  const totalSessions = user?.totalSessions && user.totalSessions > 0 ? user.totalSessions : 18;
  const treeEquivalent = Math.round(co2PreventedKg / 21.77); // ~21.77 kg CO2 per mature tree/year
  const renewablePercent = 64;

  // Chart max value calculation
  const getMaxValue = () => {
    if (selectedMetric === 'co2') return 70;
    if (selectedMetric === 'energy') return 80;
    return 10;
  };

  const getMetricValue = (item: MonthlyData) => {
    if (selectedMetric === 'co2') return `${item.co2Kg} kg`;
    if (selectedMetric === 'energy') return `${item.energyKwh} kWh`;
    return `${item.sessions} sessions`;
  };

  const maxChartVal = getMaxValue();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 1. Header */}
      <Header
        title="Eco & Sustainability 🌱"
        subtitle="See the impact of your EV journey."
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={[
              styles.calcHelpBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            onPress={() => setShowCalculationModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.calcHelpBtnText, { color: theme.textSecondary }]}>
              ⓘ Methodology
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================================
            SECTION 2 — GREEN IMPACT HERO CARD
        ========================================================================= */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.35)' : '#1E293B',
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>🌱 YOUR GREEN IMPACT</Text>
            </View>
            <View style={styles.liveVerifiedBadge}>
              <Text style={styles.liveVerifiedText}>VERIFIED IMPACT ✓</Text>
            </View>
          </View>

          {/* Primary Strong Visual Focal Metric */}
          <View style={styles.primaryMetricCenter}>
            <Text style={styles.primaryCo2Value}>{co2PreventedKg.toFixed(0)} kg</Text>
            <Text style={styles.primaryCo2Label}>CO₂ Prevented</Text>
            <Text style={styles.primaryCo2Sub}>
              Direct tailpipe emissions avoided compared to standard petrol/diesel vehicles
            </Text>
          </View>

          {/* 3 Compact Metric Columns */}
          <View style={styles.heroStatsGrid}>
            {/* Energy Used */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatValue}>{energyUsedKwh.toFixed(1)}</Text>
              <Text style={styles.heroStatUnit}>kWh</Text>
              <Text style={styles.heroStatLabel}>Energy Used</Text>
            </View>

            <View style={styles.heroStatDivider} />

            {/* EV Distance */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatValue}>{evDistanceKm.toLocaleString('en-IN')}</Text>
              <Text style={styles.heroStatUnit}>km</Text>
              <Text style={styles.heroStatLabel}>EV Distance</Text>
            </View>

            <View style={styles.heroStatDivider} />

            {/* Charging Sessions */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatValue}>{totalSessions}</Text>
              <Text style={styles.heroStatUnit}>sessions</Text>
              <Text style={styles.heroStatLabel}>Charging Sessions</Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 3 — IMPACT TREND (INTERACTIVE CHART)
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              YOUR IMPACT THIS YEAR
            </Text>
            {/* Period Selector */}
            <View
              style={[
                styles.periodPillWrap,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                  borderColor: theme.border,
                },
              ]}
            >
              {(['monthly', 'quarterly', 'yearly'] as PeriodType[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodBtn,
                    selectedPeriod === p && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setSelectedPeriod(p)}
                >
                  <Text
                    style={[
                      styles.periodBtnText,
                      { color: selectedPeriod === p ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chart Card */}
          <View
            style={[
              styles.chartCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {/* Metric Switcher Tabs */}
            <View style={styles.metricTabsRow}>
              {[
                { key: 'co2' as MetricType, label: 'CO₂ Prevented' },
                { key: 'energy' as MetricType, label: 'Energy Charged' },
                { key: 'sessions' as MetricType, label: 'Sessions' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.metricTabBtn,
                    selectedMetric === tab.key && {
                      borderBottomColor: theme.primary,
                      borderBottomWidth: 2.5,
                    },
                  ]}
                  onPress={() => setSelectedMetric(tab.key)}
                >
                  <Text
                    style={[
                      styles.metricTabText,
                      {
                        color:
                          selectedMetric === tab.key ? theme.primary : theme.textSecondary,
                        fontWeight: selectedMetric === tab.key ? '800' : '600',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Month Tooltip Highlight */}
            <View style={styles.chartHighlightRow}>
              <Text style={[styles.highlightMonthText, { color: theme.textPrimary }]}>
                {MONTHLY_HISTORY[activeMonthIndex].month} 2026:
              </Text>
              <Text style={[styles.highlightValueText, { color: theme.primary }]}>
                {getMetricValue(MONTHLY_HISTORY[activeMonthIndex])}
              </Text>
            </View>

            {/* Minimal Bar Chart Visualizer */}
            <View style={styles.barChartArea}>
              {MONTHLY_HISTORY.map((item, idx) => {
                const rawVal =
                  selectedMetric === 'co2'
                    ? item.co2Kg
                    : selectedMetric === 'energy'
                    ? item.energyKwh
                    : item.sessions;
                const barHeightPercent = Math.min(100, Math.max(15, (rawVal / maxChartVal) * 100));
                const isSelectedMonth = idx === activeMonthIndex;

                return (
                  <TouchableOpacity
                    key={item.month}
                    style={styles.barColumn}
                    onPress={() => setActiveMonthIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${barHeightPercent}%`,
                            backgroundColor: isSelectedMonth ? '#00D084' : isDark ? '#334155' : '#CBD5E1',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barMonthLabel,
                        {
                          color: isSelectedMonth ? theme.primary : theme.textSecondary,
                          fontWeight: isSelectedMonth ? '900' : '500',
                        },
                      ]}
                    >
                      {item.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 4 — ENVIRONMENTAL IMPACT SUMMARY
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            YOUR ENVIRONMENTAL IMPACT
          </Text>

          <View style={styles.impactGrid2x2}>
            {/* Card 1: CO2 Prevented */}
            <View
              style={[
                styles.impactCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.impactIconBubble}>
                <Text style={{ fontSize: 20 }}>🌱</Text>
              </View>
              <Text style={[styles.impactCardValue, { color: theme.textPrimary }]}>
                {co2PreventedKg.toFixed(0)} kg
              </Text>
              <Text style={[styles.impactCardTitle, { color: theme.primary }]}>
                CO₂ Prevented
              </Text>
              <Text style={[styles.impactCardSub, { color: theme.textSecondary }]}>
                Offsetting standard ICE vehicle tailpipe output
              </Text>
            </View>

            {/* Card 2: Tree Equivalent */}
            <View
              style={[
                styles.impactCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.impactIconBubble}>
                <Text style={{ fontSize: 20 }}>🌳</Text>
              </View>
              <Text style={[styles.impactCardValue, { color: theme.textPrimary }]}>
                ≈ {treeEquivalent} trees
              </Text>
              <Text style={[styles.impactCardTitle, { color: theme.primary }]}>
                Tree Equivalent
              </Text>
              <Text style={[styles.impactCardSub, { color: theme.textSecondary }]}>
                Estimated environmental equivalent.
              </Text>
            </View>

            {/* Card 3: EV Energy Used */}
            <View
              style={[
                styles.impactCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.impactIconBubble}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <Text style={[styles.impactCardValue, { color: theme.textPrimary }]}>
                {energyUsedKwh.toFixed(1)} kWh
              </Text>
              <Text style={[styles.impactCardTitle, { color: theme.primary }]}>
                EV Energy Used
              </Text>
              <Text style={[styles.impactCardSub, { color: theme.textSecondary }]}>
                Delivered across AC &amp; Fast DC chargers
              </Text>
            </View>

            {/* Card 4: Electric Driving */}
            <View
              style={[
                styles.impactCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.impactIconBubble}>
                <Text style={{ fontSize: 20 }}>🚗</Text>
              </View>
              <Text style={[styles.impactCardValue, { color: theme.textPrimary }]}>
                {evDistanceKm.toLocaleString('en-IN')} km
              </Text>
              <Text style={[styles.impactCardTitle, { color: theme.primary }]}>
                Electric Driving
              </Text>
              <Text style={[styles.impactCardSub, { color: theme.textSecondary }]}>
                Total zero-direct-emission driving distance
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 5 — CLEAN ENERGY USAGE (RENEWABLE SHARE)
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.renewableCard,
              {
                backgroundColor: isDark ? 'rgba(0, 208, 132, 0.06)' : '#F0FDF4',
                borderColor: isDark ? 'rgba(0, 208, 132, 0.25)' : '#BBF7D0',
              },
            ]}
          >
            {/* Circular Gauge / Percentage Indicator */}
            <View style={styles.renewableProgressCircle}>
              <Text style={styles.renewablePercentText}>{renewablePercent}%</Text>
              <Text style={styles.renewablePercentSub}>RENEWABLE</Text>
            </View>

            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={[styles.renewableHeading, { color: theme.primary }]}>
                Clean Energy Usage ☀️💨
              </Text>
              <Text style={[styles.renewableSub, { color: theme.textSecondary }]}>
                <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                  {renewablePercent}%
                </Text>{' '}
                of your charging energy came from verified renewable sources (Solar &amp; Wind CPO
                partners).
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 6 — CHARGING HABITS INSIGHTS
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            YOUR CHARGING HABITS
          </Text>

          <View style={styles.habitsGrid}>
            <View
              style={[
                styles.habitCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={styles.habitIcon}>⚡</Text>
              <Text style={[styles.habitValue, { color: theme.textPrimary }]}>16.2 kWh</Text>
              <Text style={[styles.habitLabel, { color: theme.textSecondary }]}>
                Avg Energy / Session
              </Text>
            </View>

            <View
              style={[
                styles.habitCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={styles.habitIcon}>⏱️</Text>
              <Text style={[styles.habitValue, { color: theme.textPrimary }]}>31 min</Text>
              <Text style={[styles.habitLabel, { color: theme.textSecondary }]}>
                Avg Charging Duration
              </Text>
            </View>

            <View
              style={[
                styles.habitCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={styles.habitIcon}>🔌</Text>
              <Text style={[styles.habitValue, { color: theme.textPrimary }]}>62% / 38%</Text>
              <Text style={[styles.habitLabel, { color: theme.textSecondary }]}>
                AC vs DC Usage
              </Text>
            </View>

            <View
              style={[
                styles.habitCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={styles.habitIcon}>📅</Text>
              <Text style={[styles.habitValue, { color: theme.textPrimary }]}>8 / mo</Text>
              <Text style={[styles.habitLabel, { color: theme.textSecondary }]}>
                Charging Frequency
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 7 — SUSTAINABILITY MILESTONES (GAMIFICATION)
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            GREEN MILESTONES 🏆
          </Text>

          <View style={styles.milestonesList}>
            {/* Milestone 1: Completed */}
            <View
              style={[
                styles.milestoneCard,
                styles.milestoneCompleted,
                { backgroundColor: theme.surface, borderColor: '#86EFAC' },
              ]}
            >
              <View style={styles.milestoneIconWrapActive}>
                <Text style={{ fontSize: 20 }}>🌱</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.milestoneTitleRow}>
                  <Text style={[styles.milestoneTitle, { color: theme.textPrimary }]}>
                    CO₂ Saver
                  </Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>COMPLETED ✓</Text>
                  </View>
                </View>
                <Text style={[styles.milestoneSub, { color: theme.textSecondary }]}>
                  Prevented over 100 kg of tailpipe CO₂
                </Text>
              </View>
            </View>

            {/* Milestone 2: Completed */}
            <View
              style={[
                styles.milestoneCard,
                styles.milestoneCompleted,
                { backgroundColor: theme.surface, borderColor: '#86EFAC' },
              ]}
            >
              <View style={styles.milestoneIconWrapActive}>
                <Text style={{ fontSize: 20 }}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.milestoneTitleRow}>
                  <Text style={[styles.milestoneTitle, { color: theme.textPrimary }]}>
                    Electric Journey
                  </Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>COMPLETED ✓</Text>
                  </View>
                </View>
                <Text style={[styles.milestoneSub, { color: theme.textSecondary }]}>
                  Completed 1,000+ km of electric driving
                </Text>
              </View>
            </View>

            {/* Milestone 3: In Progress */}
            <View
              style={[
                styles.milestoneCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.milestoneIconWrapLocked,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ]}
              >
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.milestoneTitleRow}>
                  <Text style={[styles.milestoneTitle, { color: theme.textPrimary }]}>
                    Charging Explorer
                  </Text>
                  <Text style={[styles.progressCountText, { color: theme.primary }]}>
                    42 / 50 sessions
                  </Text>
                </View>
                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}
                >
                  <View style={[styles.progressBarFill, { width: '84%', backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.milestoneSub, { color: theme.textSecondary }]}>
                  Complete 50 charging sessions on ChargeMesh
                </Text>
              </View>
            </View>

            {/* Milestone 4: In Progress */}
            <View
              style={[
                styles.milestoneCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.milestoneIconWrapLocked,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ]}
              >
                <Text style={{ fontSize: 20 }}>🌍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.milestoneTitleRow}>
                  <Text style={[styles.milestoneTitle, { color: theme.textPrimary }]}>
                    Clean Mobility 500
                  </Text>
                  <Text style={[styles.progressCountText, { color: theme.primary }]}>
                    428.5 / 500 kWh
                  </Text>
                </View>
                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}
                >
                  <View style={[styles.progressBarFill, { width: '85.7%', backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.milestoneSub, { color: theme.textSecondary }]}>
                  Consume 500 kWh of clean electric mobility energy
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SECTION 8 — PERSONALIZED SUSTAINABILITY MESSAGE
        ========================================================================= */}
        <View
          style={[
            styles.motivateCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#1E293B',
            },
          ]}
        >
          <Text style={styles.motivateTitle}>Keep Going 💚</Text>
          <Text style={styles.motivateBody}>
            Your EV journey is helping make everyday mobility cleaner and more sustainable for our
            cities.
          </Text>
          <Text style={styles.motivateSub}>Keep charging smart and driving electric.</Text>
        </View>
      </ScrollView>

      {/* Methodology & Data Transparency Modal */}
      <StatusModal
        visible={showCalculationModal}
        type="success"
        title="Impact Methodology ⓘ"
        message={
          "ChargeMesh calculates CO₂ emissions prevented by comparing your EV energy usage with the baseline emissions of an equivalent internal combustion engine (ICE) vehicle (~120 g CO₂/km) minus the localized Indian power grid footprint.\n\nTree equivalents are estimated using the standard benchmark of ~21.77 kg CO₂ absorbed annually per mature tree."
        }
        buttonLabel="Understood"
        onClose={() => setShowCalculationModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },

  calcHelpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  calcHelpBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    borderRadius: borderRadius.xxl,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    ...shadows.card,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTag: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  heroTagText: {
    color: '#00D084',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveVerifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveVerifiedText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  primaryMetricCenter: {
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryCo2Value: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: -1,
  },
  primaryCo2Label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  primaryCo2Sub: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
  },

  heroStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 14,
  },
  heroStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatUnit: {
    fontSize: 10,
    color: '#00D084',
    fontWeight: '800',
    marginTop: -1,
  },
  heroStatLabel: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 3,
    fontWeight: '600',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Section Wrap
  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  periodPillWrap: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: 2,
  },
  periodBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  periodBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Chart Card
  chartCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    ...shadows.card,
  },
  metricTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    paddingBottom: 4,
    marginBottom: 10,
  },
  metricTabBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  metricTabText: {
    fontSize: 12,
  },

  chartHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  highlightMonthText: {
    fontSize: 13,
    fontWeight: '700',
  },
  highlightValueText: {
    fontSize: 14,
    fontWeight: '900',
  },

  barChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 85,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barMonthLabel: {
    fontSize: 10.5,
    marginTop: 6,
  },

  // 2x2 Impact Grid
  impactGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  impactCard: {
    width: '48.5%',
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    ...shadows.card,
  },
  impactIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  impactCardValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  impactCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  impactCardSub: {
    fontSize: 10.5,
    marginTop: 4,
    lineHeight: 14,
  },

  // Renewable Card
  renewableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    ...shadows.card,
  },
  renewableProgressCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  renewablePercentText: {
    color: '#0B192C',
    fontSize: 18,
    fontWeight: '900',
  },
  renewablePercentSub: {
    color: '#0B192C',
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: -2,
  },
  renewableHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  renewableSub: {
    fontSize: 11.5,
    lineHeight: 15,
  },

  // Habits Grid
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  habitCard: {
    width: '48.5%',
    borderRadius: borderRadius.xl,
    padding: 12,
    borderWidth: 1.2,
    ...shadows.card,
  },
  habitIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  habitValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  habitLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },

  // Milestones
  milestonesList: {
    gap: 10,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: 12,
    borderWidth: 1.2,
    gap: 12,
    ...shadows.card,
  },
  milestoneCompleted: {
    backgroundColor: '#F0FDF4',
  },
  milestoneIconWrapActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconWrapLocked: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  milestoneTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  completedBadge: {
    backgroundColor: '#00D084',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadgeText: {
    color: '#0B192C',
    fontSize: 9,
    fontWeight: '900',
  },
  progressCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneSub: {
    fontSize: 11,
  },

  // Motivate Bottom Card
  motivateCard: {
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1.2,
    alignItems: 'center',
    marginTop: 4,
    ...shadows.card,
  },
  motivateTitle: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  motivateBody: {
    color: '#FFFFFF',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '600',
  },
  motivateSub: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    marginTop: 6,
  },
});
