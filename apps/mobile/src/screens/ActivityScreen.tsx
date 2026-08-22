import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { mockRecentSessions } from '../services/mockData';
import { Header, AuthGateModal, AppModal, StatusModal } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useAuth } from '../context';

interface ActivityScreenProps {
  navigation: any;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tata' | 'jiobp'>('all');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<typeof mockRecentSessions[0] | null>(null);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  const filteredSessions = mockRecentSessions.filter((s) => {
    if (selectedFilter === 'tata') return s.cpoId === 'cpo-tata';
    if (selectedFilter === 'jiobp') return s.cpoId === 'cpo-jiobp';
    return true;
  });

  const handleViewReceipt = (session: typeof mockRecentSessions[0]) => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setActiveReceipt(session);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Charging Activity 📜"
        subtitle="Unified cross-CPO transaction history"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* If Guest Driver */}
        {isGuest ? (
          <View style={styles.guestActivityCard}>
            <Text style={styles.guestActivityIcon}>🔒</Text>
            <Text style={styles.guestActivityTitle}>Sign In to View Invoices & Activity</Text>
            <Text style={styles.guestActivitySub}>
              Track your charging sessions, energy consumed (kWh), accrued costs, and download GST tax invoices across all CPO networks.
            </Text>

            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInButtonText}>Sign In with Mobile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>Create New Account (Get ₹500)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Monthly Summary Banner */}
            <View style={styles.summaryBanner}>
              <View style={styles.summaryMetric}>
                <Text style={styles.metricVal}>{user.totalKwhCharged.toFixed(1)} kWh</Text>
                <Text style={styles.metricLbl}>Energy Charged</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryMetric}>
                <Text style={styles.metricVal}>₹{(user.totalKwhCharged * 18.2).toFixed(0)}</Text>
                <Text style={styles.metricLbl}>Total Spent</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryMetric}>
                <Text style={[styles.metricVal, { color: colors.primary }]}>
                  {user.co2SavedKg.toFixed(0)} kg
                </Text>
                <Text style={styles.metricLbl}>CO₂ Prevented 🌱</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.pill, selectedFilter === 'all' && styles.pillActive]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.pillText, selectedFilter === 'all' && styles.pillTextActive]}>
                  All Networks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pill, selectedFilter === 'tata' && styles.pillActive]}
                onPress={() => setSelectedFilter('tata')}
              >
                <Text style={[styles.pillText, selectedFilter === 'tata' && styles.pillTextActive]}>
                  Tata Power
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pill, selectedFilter === 'jiobp' && styles.pillActive]}
                onPress={() => setSelectedFilter('jiobp')}
              >
                <Text style={[styles.pillText, selectedFilter === 'jiobp' && styles.pillTextActive]}>
                  Jio-bp pulse
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Session Invoices ({filteredSessions.length})</Text>

            {filteredSessions.map((session) => {
              const costRupees = ((session.finalAmountPaise || 0) / 100).toFixed(2);
              const durationMins = Math.round((session.durationSeconds || 0) / 60);

              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cpoBadge}>
                      <Text style={styles.cpoBadgeText}>
                        {session.cpoId === 'cpo-tata' ? '⚡ Tata Power' : '🔵 Jio-bp pulse'}
                      </Text>
                    </View>
                    <Text style={styles.sessionDate}>
                      {new Date(session.startTime || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricNumber}>{session.energyKwh} kWh</Text>
                      <Text style={styles.metricLabel}>Energy</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricNumber}>{durationMins} min</Text>
                      <Text style={styles.metricLabel}>Duration</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricNumber, { color: colors.primary }]}>
                        ₹{costRupees}
                      </Text>
                      <Text style={styles.metricLabel}>Total Paid</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.statusRow}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Reconciled & Billed</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.receiptBtn}
                      onPress={() => handleViewReceipt(session)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.receiptBtnText}>View Receipt 📄</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* 1. Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName="Charging History & Tax Invoices"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      {/* 2. Itemized GST Tax Invoice AppModal */}
      {activeReceipt && (
        <AppModal
          visible={!!activeReceipt}
          type="payment"
          badge="GST Tax Invoice"
          iconEmoji="📄"
          title={`Session Invoice #${activeReceipt.cpoSessionId?.slice(-6)?.toUpperCase() || 'RECEIPT'}`}
          subtitle={`Verified cross-CPO transaction via ${
            activeReceipt.cpoId === 'cpo-tata' ? 'Tata Power EZ Charge' : 'Jio-bp pulse'
          }`}
          onClose={() => setActiveReceipt(null)}
          details={[
            { icon: '⚡', title: 'Energy Consumed', value: `${activeReceipt.energyKwh} kWh` },
            {
              icon: '⏱️',
              title: 'Total Charging Time',
              value: `${Math.round((activeReceipt.durationSeconds || 0) / 60)} Minutes`,
            },
            {
              icon: '💰',
              title: 'Total Amount (Incl. 18% GST)',
              value: `₹${((activeReceipt.finalAmountPaise || 0) / 100).toFixed(2)}`,
            },
            { icon: '💳', title: 'Payment Method', value: 'ChargeMesh Fast Wallet' },
            { icon: '🏛️', title: 'GST Compliance', value: 'IRN Generated & Verified' },
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

      {/* 3. Download Success Modal */}
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
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  guestActivityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guestActivityIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  guestActivityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  guestActivitySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  signInButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signInButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  registerButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryMetric: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textInverse,
  },
  metricLbl: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cpoBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  cpoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  receiptBtn: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
