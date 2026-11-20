import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addWalletTransaction,
  loadWalletTransactions,
  mockWalletTransactions,
  WalletTransaction,
} from './walletData';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
}));

describe('Mobile WalletData Service (Financial Integrity & Local Persistence)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with canonical demo wallet transactions', () => {
    expect(mockWalletTransactions.length).toBeGreaterThan(0);
    const firstTx = mockWalletTransactions[0];
    expect(firstTx.id).toBeDefined();
    expect(firstTx.referenceId).toBeDefined();
    expect(firstTx.amountRupees).toBeGreaterThan(0);
    expect(['SUCCESS', 'PENDING', 'FAILED']).toContain(firstTx.status);
  });

  it('should add a new wallet transaction and persist to AsyncStorage', async () => {
    const initialCount = mockWalletTransactions.length;
    const newTx: WalletTransaction = {
      id: `tx-test-${Date.now()}`,
      referenceId: `REF-${Date.now()}`,
      type: 'WALLET_TOPUP_UPI',
      title: '₹500 Added',
      subtitle: 'UPI Top-Up',
      amountRupees: 500,
      isCredit: true,
      status: 'SUCCESS',
      dateGroup: 'TODAY',
      dateStr: '20 Nov 2026',
      timeStr: '11:00 AM',
      rawTimestamp: Date.now(),
      paymentMethodName: 'UPI (GPay)',
      paymentMethodDetail: '•••• 1234',
      balanceBeforeRupees: 1000,
      balanceAfterRupees: 1500,
    };

    addWalletTransaction(newTx);
    expect(mockWalletTransactions.length).toBe(initialCount + 1);
    expect(mockWalletTransactions[0].id).toBe(newTx.id);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@chargemesh_wallet_transactions_v126',
      expect.any(String),
    );
  });

  it('should prevent duplicate insertion of transactions with same id or referenceId', () => {
    const duplicateTx: WalletTransaction = { ...mockWalletTransactions[0] };
    const countBefore = mockWalletTransactions.length;

    addWalletTransaction(duplicateTx);
    expect(mockWalletTransactions.length).toBe(countBefore);
  });

  it('should load persisted transactions from AsyncStorage if available', async () => {
    const persistedMock: WalletTransaction[] = [
      {
        id: 'tx-persisted-01',
        referenceId: 'REF-P01',
        type: 'WALLET_TOPUP_CARD',
        title: '₹2,000 Added',
        subtitle: 'HDFC Card',
        amountRupees: 2000,
        isCredit: true,
        status: 'SUCCESS',
        dateGroup: 'TODAY',
        dateStr: '20 Nov 2026',
        timeStr: '11:00 AM',
        rawTimestamp: Date.now(),
        paymentMethodName: 'HDFC Visa',
        paymentMethodDetail: '•••• 4321',
        balanceBeforeRupees: 500,
        balanceAfterRupees: 2500,
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(persistedMock));

    const loaded = await loadWalletTransactions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('tx-persisted-01');
  });
});
