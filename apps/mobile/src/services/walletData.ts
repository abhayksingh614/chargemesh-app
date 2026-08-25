import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_WALLET_TRANSACTIONS } from './demoUserData';

export type WalletTransactionType =
  | 'WALLET_TOPUP_UPI'
  | 'WALLET_TOPUP_CARD'
  | 'WALLET_DEBIT'
  | 'WALLET_REFUND'
  | 'WALLET_TRANSACTION_FAILED'
  | 'WALLET_TRANSACTION_PENDING';

export type WalletTransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface WalletTransaction {
  id: string;
  referenceId: string;
  type: WalletTransactionType;
  title: string;
  subtitle: string;
  amountRupees: number;
  isCredit: boolean;
  status: WalletTransactionStatus;
  dateGroup: string; // "TODAY", "26 AUG 2026", "25 AUG 2026", "24 AUG 2026", "23 AUG 2026", "21 AUG 2026", "19 AUG 2026", "18 AUG 2026"
  dateStr: string; // e.g. "26 Aug 2026"
  timeStr: string; // e.g. "04:30 PM"
  rawTimestamp: number;
  paymentMethodName: string;
  paymentMethodDetail: string;
  balanceBeforeRupees: number;
  balanceAfterRupees: number;
  remarks?: string;
}

const WALLET_TX_STORAGE_KEY = '@chargemesh_wallet_transactions_v126';

export const mockWalletTransactions: WalletTransaction[] = [...DEMO_WALLET_TRANSACTIONS];

/**
 * Add a new transaction record to both in-memory array and AsyncStorage
 */
export const addWalletTransaction = (tx: WalletTransaction) => {
  // Prevent duplicate insertion by id or referenceId
  const exists = mockWalletTransactions.some(
    (item) => item.id === tx.id || item.referenceId === tx.referenceId
  );
  if (!exists) {
    mockWalletTransactions.unshift(tx);
  }
  AsyncStorage.setItem(WALLET_TX_STORAGE_KEY, JSON.stringify(mockWalletTransactions)).catch(() => {});
};

/**
 * Load persisted wallet transactions from AsyncStorage
 */
export const loadWalletTransactions = async (): Promise<WalletTransaction[]> => {
  try {
    const raw = await AsyncStorage.getItem(WALLET_TX_STORAGE_KEY);
    if (raw) {
      const parsed: WalletTransaction[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mockWalletTransactions.length = 0;
        mockWalletTransactions.push(...parsed);
        return mockWalletTransactions;
      }
    }
  } catch {}
  return mockWalletTransactions;
};
