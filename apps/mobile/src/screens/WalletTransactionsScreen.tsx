import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Header, StatusModal } from '../components';
import { loadWalletTransactions, mockWalletTransactions, WalletTransaction } from '../services/walletData';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme } from '../context';

interface WalletTransactionsScreenProps {
  route?: any;
  navigation: any;
}

export const WalletTransactionsScreen: React.FC<WalletTransactionsScreenProps> = ({
  route,
  navigation,
}) => {
  const { user, isGuest } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>([
    ...mockWalletTransactions,
  ]);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'added' | 'debited' | 'refunded' | 'failed' | 'pending'
  >('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const walletBalancePaise = isGuest ? 0 : (user?.walletBalancePaise || 0);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

  const refreshTransactions = useCallback(async () => {
    const list = await loadWalletTransactions();
    setAllTransactions([...list]);
  }, []);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  useEffect(() => {
    if (route?.params?.transactionId) {
      const found = allTransactions.find((t) => t.id === route.params.transactionId) ||
        mockWalletTransactions.find((t) => t.id === route.params.transactionId);
      if (found) {
        setSelectedTx(found);
      }
    }
  }, [route?.params?.transactionId, allTransactions]);
  const [statusFeedback, setStatusFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleShareReceipt = async (tx: WalletTransaction) => {
    try {
      await Share.share({
        message: `ChargeMesh Wallet Receipt\nTransaction ID: ${tx.referenceId}\nAmount: ₹${tx.amountRupees.toFixed(2)}\nType: ${tx.title}\nStatus: ${tx.status}\nDate: ${tx.dateStr} ${tx.timeStr}`,
      });
    } catch {
      // Ignored
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type Filter
      if (activeFilter === 'added') {
        if (!tx.type.includes('TOPUP') || tx.status !== 'SUCCESS') return false;
      } else if (activeFilter === 'debited') {
        if (tx.type !== 'WALLET_DEBIT') return false;
      } else if (activeFilter === 'refunded') {
        if (tx.type !== 'WALLET_REFUND') return false;
      } else if (activeFilter === 'failed') {
        if (tx.status !== 'FAILED') return false;
      } else if (activeFilter === 'pending') {
        if (tx.status !== 'PENDING') return false;
      }

      // Date Filter
      if (dateFilter === 'today') {
        if (tx.dateGroup !== 'TODAY') return false;
      } else if (dateFilter === 'week') {
        // Within 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (tx.rawTimestamp < sevenDaysAgo) return false;
      }

      return true;
    });
  }, [activeFilter, dateFilter, allTransactions]);

  // Group by dateGroup
  const groupedTransactions = useMemo(() => {
    const map = new Map<string, WalletTransaction[]>();
    filteredTransactions.forEach((tx) => {
      const existing = map.get(tx.dateGroup) || [];
      existing.push(tx);
      map.set(tx.dateGroup, existing);
    });
    return Array.from(map.entries());
  }, [filteredTransactions]);

  const getStatusBadge = (status: 'SUCCESS' | 'PENDING' | 'FAILED') => {
    if (status === 'SUCCESS') {
      return {
        text: 'Successful',
        color: '#15803D',
        bg: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7',
        dotColor: '#16A34A',
      };
    } else if (status === 'PENDING') {
      return {
        text: 'Pending',
        color: '#B45309',
        bg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
        dotColor: '#D97706',
      };
    } else {
      return {
        text: 'Failed',
        color: '#DC2626',
        bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
        dotColor: '#EF4444',
      };
    }
  };

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Wallet Transactions" onBack={() => navigation.goBack()} />
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
              Login Required
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Please log in or create an account to view your ChargeMesh Wallet transactions and statements.
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Header
        title="Wallet Transactions"
        subtitle="Your ChargeMesh wallet activity"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Wallet Balance Summary Bar */}
        <View
          style={[
            styles.balanceSummaryCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#1E293B',
            },
          ]}
        >
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>CURRENT WALLET BALANCE</Text>
            <Text style={styles.balanceValue}>
              ₹{(walletBalancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.balanceSubText}>
              Available for 1-Tap EV charging and FASTag plaza payments
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addMoneyBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddMoney')}
            activeOpacity={0.88}
          >
            <Text style={styles.addMoneyBtnText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Type Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'added', label: '🟢 Money Added' },
            { key: 'debited', label: '⚡ Debited' },
            { key: 'refunded', label: '🔄 Refunded' },
            { key: 'failed', label: '🔴 Failed' },
            { key: 'pending', label: '🟡 Pending' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.chipButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                  borderColor: theme.border,
                },
                activeFilter === chip.key && {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveFilter(chip.key as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.textSecondary },
                  activeFilter === chip.key && { color: theme.primary, fontWeight: '800' },
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3. Date Filter Pills */}
        <View style={styles.dateFilterRow}>
          {[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
          ].map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[
                styles.dateFilterPill,
                dateFilter === d.key && [
                  styles.dateFilterPillActive,
                  { backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7' },
                ],
              ]}
              onPress={() => setDateFilter(d.key as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dateFilterText,
                  { color: theme.textSecondary },
                  dateFilter === d.key && { color: theme.primary, fontWeight: '800' },
                ]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Grouped Transaction List */}
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([dateGroup, items]) => (
            <View key={dateGroup} style={styles.dateGroupContainer}>
              <Text style={[styles.dateGroupHeader, { color: theme.textSecondary }]}>
                {dateGroup}
              </Text>

              <View style={[styles.itemsGroupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {items.map((tx, idx) => {
                  const badge = getStatusBadge(tx.status);
                  const isLast = idx === items.length - 1;

                  return (
                    <TouchableOpacity
                      key={tx.id}
                      style={[
                        styles.transactionRow,
                        {
                          backgroundColor: theme.surface,
                          borderBottomColor: isLast ? 'transparent' : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedTx(tx)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.txIconBox}>
                        <Text style={{ fontSize: 20 }}>
                          {tx.type === 'WALLET_REFUND'
                            ? '🔄'
                            : tx.type === 'WALLET_DEBIT'
                            ? '⚡'
                            : tx.status === 'FAILED'
                            ? '❌'
                            : '💰'}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.txTopRow}>
                          <Text style={[styles.txTitle, { color: theme.textPrimary }]}>
                            {tx.title}
                          </Text>
                          <Text
                            style={[
                              styles.txAmount,
                              {
                                color:
                                  tx.status === 'FAILED'
                                    ? '#94A3B8'
                                    : tx.isCredit
                                    ? '#16A34A'
                                    : '#EF4444',
                                fontWeight: '900',
                              },
                            ]}
                          >
                            {tx.isCredit ? '+ ₹' : '− ₹'}{tx.amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>

                        <View style={styles.txBottomRow}>
                          <Text style={[styles.txSubtitle, { color: theme.textSecondary }]}>
                            {tx.subtitle} · {tx.timeStr}
                          </Text>

                          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                            <View
                              style={[styles.statusDot, { backgroundColor: badge.dotColor }]}
                            />
                            <Text style={[styles.statusPillText, { color: badge.color }]}>
                              {badge.text}
                            </Text>
                          </View>
                        </View>

                        {/* Running Balance Row */}
                        <View style={styles.txRunningRow}>
                          <Text style={[styles.runningBalanceText, { color: theme.textMuted }]}>
                            Balance: ₹{tx.balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Text>
                          <Text
                            style={[
                              styles.creditDebitTag,
                              {
                                color: tx.isCredit ? '#16A34A' : '#EF4444',
                                backgroundColor: tx.isCredit
                                  ? isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7'
                                  : isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                              },
                            ]}
                          >
                            {tx.isCredit ? 'CREDIT' : 'DEBIT'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          /* 5. Empty State */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Wallet Transactions Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Transactions related to wallet top-ups, refunds, and wallet payments will appear here.
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddMoney')}
              activeOpacity={0.88}
            >
              <Text style={styles.emptyAddBtnText}>Add Money →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Transaction Details Modal / Sheet */}
      {selectedTx && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalTopRow}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>
                Transaction Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Amount and Status Hero */}
            <View style={styles.receiptHero}>
              <Text style={[styles.receiptAmount, { color: theme.textPrimary }]}>
                {selectedTx.isCredit ? '+' : '-'}₹{selectedTx.amountRupees.toFixed(2)}
              </Text>
              <View
                style={[
                  styles.receiptStatusPill,
                  { backgroundColor: getStatusBadge(selectedTx.status).bg },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusBadge(selectedTx.status).dotColor },
                  ]}
                />
                <Text
                  style={[
                    styles.receiptStatusText,
                    { color: getStatusBadge(selectedTx.status).color },
                  ]}
                >
                  {getStatusBadge(selectedTx.status).text}
                </Text>
              </View>
            </View>

            {/* Details Table */}
            <View
              style={[
                styles.receiptTable,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.receiptRow}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  Payment Method
                </Text>
                <Text style={[styles.rowVal, { color: theme.textPrimary }]}>
                  {selectedTx.paymentMethodName}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  Account / VPA Detail
                </Text>
                <Text style={[styles.rowVal, { color: theme.textPrimary }]}>
                  {selectedTx.paymentMethodDetail}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  Transaction ID
                </Text>
                <Text style={[styles.rowVal, { color: theme.primary, fontWeight: '800' }]}>
                  {selectedTx.referenceId}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  Date &amp; Time
                </Text>
                <Text style={[styles.rowVal, { color: theme.textPrimary }]}>
                  {selectedTx.dateStr} · {selectedTx.timeStr}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  Balance After Transaction
                </Text>
                <Text style={[styles.rowVal, { color: theme.textPrimary, fontWeight: '800' }]}>
                  ₹{selectedTx.balanceAfterRupees.toFixed(2)}
                </Text>
              </View>

              {selectedTx.remarks && (
                <View style={styles.remarksBox}>
                  <Text style={[styles.remarksLabel, { color: theme.textMuted }]}>
                    NOTE / REMARKS
                  </Text>
                  <Text style={[styles.remarksVal, { color: theme.textSecondary }]}>
                    {selectedTx.remarks}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={[styles.shareReceiptBtn, { borderColor: theme.border }]}
                onPress={() => handleShareReceipt(selectedTx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.shareReceiptText, { color: theme.textPrimary }]}>
                  📤 Share Receipt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.doneReceiptBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSelectedTx(null)}
                activeOpacity={0.88}
              >
                <Text style={styles.doneReceiptText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
    padding: spacing.md,
    paddingBottom: 40,
  },

  // Balance Summary Card
  balanceSummaryCard: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    ...shadows.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
    paddingRight: 10,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  balanceSubText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
    marginTop: 4,
    lineHeight: 14,
  },
  addMoneyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // Type Filter Chips
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
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

  // Date Filter Row
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  dateFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  dateFilterPillActive: {
    borderRadius: borderRadius.sm,
  },
  dateFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Grouped Date UI
  dateGroupContainer: {
    marginBottom: 16,
  },
  dateGroupHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  itemsGroupCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.card,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  txTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txRunningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  runningBalanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  creditDebitTag: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: borderRadius.sm,
  },
  emptyCard: {
    borderRadius: borderRadius.xxl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.2,
    marginTop: 20,
    ...shadows.card,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyAddBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Receipt Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xxl,
    padding: 20,
    borderWidth: 1.5,
    ...shadows.card,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '900',
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '800',
    padding: 4,
  },
  receiptHero: {
    alignItems: 'center',
    marginVertical: 10,
  },
  receiptAmount: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  receiptStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 5,
  },
  receiptStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  receiptTable: {
    borderRadius: borderRadius.xl,
    padding: 12,
    borderWidth: 1,
    marginVertical: 14,
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  rowVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  remarksBox: {
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 8,
    marginTop: 4,
  },
  remarksLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  remarksVal: {
    fontSize: 11,
    lineHeight: 15,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  shareReceiptBtn: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  shareReceiptText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  doneReceiptBtn: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneReceiptText: {
    color: '#FFFFFF',
    fontSize: 13,
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
