import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { mockRecentSessions } from '../services/mockData';
import { Header } from '../components';
import { colors, typography, borderRadius, shadows } from '../theme';

interface ActivityScreenProps {
  navigation: any;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Charging Activity 📜"
        subtitle="Unified cross-CPO charging history"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monthly Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryMetric}>
            <Text style={styles.metricVal}>44.9 kWh</Text>
            <Text style={styles.metricLbl}>Energy Charged</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryMetric}>
            <Text style={styles.metricVal}>₹810.55</Text>
            <Text style={styles.metricLbl}>Total Spent</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryMetric}>
            <Text style={styles.metricVal}>31.8 kg</Text>
            <Text style={styles.metricLbl}>CO₂ Avoided</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Recent Sessions</Text>

        {mockRecentSessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            activeOpacity={0.85}
            style={styles.sessionCard}
            onPress={() => Alert.alert('Session Record', `CDR verified for ${session.cpoSessionId}`)}
          >
            <View style={styles.sessionTopRow}>
              <View style={styles.cpoBadge}>
                <Text style={styles.cpoText}>{session.cpoId === 'cpo-tata' ? 'Tata Power' : 'Jio-bp'}</Text>
              </View>
              <Text style={styles.statusCompleted}>✓ Completed</Text>
            </View>

            <Text style={styles.stationTitle}>
              {session.locationId === 'loc-okhla' ? 'Tata Power — Okhla Phase 3' : 'Jio-bp pulse — Aerocity'}
            </Text>

            <View style={styles.metricsRow}>
              <View>
                <Text style={styles.label}>Energy</Text>
                <Text style={styles.value}>{session.energyKwh} kWh</Text>
              </View>
              <View>
                <Text style={styles.label}>Duration</Text>
                <Text style={styles.value}>{Math.round(session.durationSeconds! / 60)} mins</Text>
              </View>
              <View>
                <Text style={styles.label}>Amount Paid</Text>
                <Text style={styles.priceValue}>₹{(session.finalAmountPaise! / 100).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.timestamp}>
                {new Date(session.startTime!).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.receiptLink}>Download Invoice →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: colors.darkGreen,
    borderRadius: borderRadius.xl,
    padding: 18,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  metricLbl: {
    ...typography.caption,
    color: colors.ecoLight,
    marginTop: 2,
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.card,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpoBadge: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  cpoText: {
    ...typography.captionBold,
    color: colors.darkGreen,
  },
  statusCompleted: {
    ...typography.captionBold,
    color: colors.status.available,
  },
  stationTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: 2,
  },
  priceValue: {
    ...typography.subtitle,
    color: colors.primary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  receiptLink: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
