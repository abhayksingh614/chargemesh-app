import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme } from '../context';
import { addWalletTransaction, WalletTransaction } from '../services/walletData';

interface AddMoneyScreenProps {
  navigation: any;
}

type PaymentMethodType = 'saved_card' | 'saved_upi' | 'new_upi' | 'new_card' | 'net_banking';

interface BankOption {
  id: string;
  name: string;
  code: string;
  icon: string;
}

const POPULAR_BANKS: BankOption[] = [
  { id: 'b-hdfc', name: 'HDFC Bank', code: 'HDFC', icon: '🏦' },
  { id: 'b-icici', name: 'ICICI Bank', code: 'ICICI', icon: '🏦' },
  { id: 'b-sbi', name: 'State Bank of India', code: 'SBIN', icon: '🏛️' },
  { id: 'b-axis', name: 'Axis Bank', code: 'UTIB', icon: '🏦' },
  { id: 'b-kotak', name: 'Kotak Mahindra Bank', code: 'KKBK', icon: '🏢' },
];

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export const AddMoneyScreen: React.FC<AddMoneyScreenProps> = ({ navigation }) => {
  const { user, isGuest, topUpWallet } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  // Amount Selection State
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmountText, setCustomAmountText] = useState<string>('1000');
  const [amountError, setAmountError] = useState<string>('');

  // Payment Method Selection State
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('saved_card');
  const [selectedBank, setSelectedBank] = useState<string>('b-hdfc');

  // Inline New UPI State
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [upiError, setUpiError] = useState<string>('');

  // Inline New Card State
  const [cardholderName, setCardholderName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardError, setCardError] = useState<string>('');

  // Payment Execution State ('idle' | 'processing' | 'success' | 'failed' | 'pending')
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed' | 'pending'>('idle');
  const [completedTx, setCompletedTx] = useState<WalletTransaction | null>(null);

  const currentBalanceRupees = (user?.walletBalancePaise || 0) / 100;
  const balanceAfterRupees = currentBalanceRupees + (selectedAmount || 0);

  // If Guest User tries to access Add Money
  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Add Money" onBack={() => navigation.goBack()} />
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
              Please log in or create an account to add funds to your ChargeMesh Wallet.
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

  // Handle Preset vs Custom Amount Selection
  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmountText(amt.toString());
    setAmountError('');
  };

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomAmountText(cleaned);
    const num = parseInt(cleaned, 10) || 0;
    setSelectedAmount(num);

    if (num > 0 && num < 100) {
      setAmountError('Minimum wallet top-up amount is ₹100');
    } else if (num > 50000) {
      setAmountError('Maximum wallet top-up limit is ₹50,000 per transaction');
    } else {
      setAmountError('');
    }
  };

  // Card formatting helpers
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
    if (cardError) setCardError('');
  };

  const handleCardExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
    if (cardError) setCardError('');
  };

  // Execute Payment
  const handleExecutePayment = () => {
    // 1. Amount validation
    if (!selectedAmount || selectedAmount < 100) {
      setAmountError('Please enter an amount of at least ₹100');
      return;
    }
    if (selectedAmount > 50000) {
      setAmountError('Maximum wallet top-up limit is ₹50,000');
      return;
    }

    // 2. Payment method specific validation
    if (paymentType === 'new_upi') {
      const trimmed = customUpiId.trim().toLowerCase();
      if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) {
        setUpiError('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
      setUpiError('');
    }

    if (paymentType === 'new_card') {
      const rawCard = cardNumber.replace(/\s+/g, '');
      if (!cardholderName.trim()) {
        setCardError('Please enter the cardholder name');
        return;
      }
      if (rawCard.length < 16) {
        setCardError('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setCardError('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError('Please enter a valid 3-digit CVV');
        return;
      }
      setCardError('');
    }

    // 3. Initiate Processing State
    setPaymentState('processing');

    setTimeout(() => {
      const amountPaise = selectedAmount * 100;
      const refId = `CM${Date.now().toString().slice(-10)}`;
      const topUpResult = topUpWallet(amountPaise, refId);
      const calculatedBalanceAfter = topUpResult.newBalancePaise / 100;

      // Determine Payment Method Label
      let methodTitle = 'UPI';
      let methodDetail = 'abhay@upi';
      if (paymentType === 'saved_card') {
        methodTitle = 'HDFC Visa Debit Card';
        methodDetail = '•••• •••• •••• 4821';
      } else if (paymentType === 'new_card') {
        methodTitle = 'Visa Debit Card';
        methodDetail = `•••• •••• •••• ${cardNumber.replace(/\s+/g, '').slice(-4)}`;
      } else if (paymentType === 'new_upi') {
        methodTitle = 'UPI';
        methodDetail = customUpiId.trim().toLowerCase();
      } else if (paymentType === 'net_banking') {
        const bankObj = POPULAR_BANKS.find((b) => b.id === selectedBank);
        methodTitle = bankObj ? bankObj.name : 'Net Banking';
        methodDetail = 'Direct Bank Gateway';
      }

      // Record in Wallet Transaction History (Separate from EV Charging Activity)
      const newTransaction: WalletTransaction = {
        id: `tx-${Date.now()}`,
        referenceId: refId,
        type: paymentType.includes('card') ? 'WALLET_TOPUP_CARD' : 'WALLET_TOPUP_UPI',
        title: `₹${selectedAmount.toLocaleString('en-IN')} Added`,
        subtitle: `${methodTitle} · ${methodDetail}`,
        amountRupees: selectedAmount,
        isCredit: true,
        status: 'SUCCESS',
        dateGroup: 'TODAY',
        dateStr: 'Today',
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawTimestamp: Date.now(),
        paymentMethodName: methodTitle,
        paymentMethodDetail: methodDetail,
        balanceBeforeRupees: currentBalanceRupees,
        balanceAfterRupees: calculatedBalanceAfter,
        remarks: 'Instant wallet credit via secure payment gateway',
      };

      addWalletTransaction(newTransaction);
      setCompletedTx(newTransaction);
      setPaymentState('success');
    }, 1500);
  };

  // SUCCESS STATE VIEW
  if (paymentState === 'success') {
    const authoritativeBalanceAfter = (user?.walletBalancePaise || 0) / 100;

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Payment Status" onBack={() => navigation.navigate('PaymentMethods')} />
        <ScrollView
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.4)' : '#86EFAC',
                },
              ]}
            >
              <View style={styles.successIconCircle}>
                <Text style={styles.successCheckIcon}>✓</Text>
              </View>

              <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>
                Payment Successful
              </Text>
              <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
                ₹{selectedAmount.toLocaleString('en-IN')} has been added to your ChargeMesh Wallet.
              </Text>

              {/* Receipt Summary Box */}
              <View
                style={[
                  styles.receiptBox,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                    Transaction ID
                  </Text>
                  <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                    {completedTx?.referenceId}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                    Payment Method
                  </Text>
                  <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                    {completedTx?.subtitle || 'UPI'}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                    Payment Status
                  </Text>
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>🟢 Confirmed</Text>
                  </View>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>
                    Amount Added
                  </Text>
                  <Text style={[styles.receiptValueGreen, { color: theme.primary }]}>
                    +₹{selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={[styles.receiptDivider, { backgroundColor: theme.border }]} />

                <View style={styles.receiptRow}>
                  <Text
                    style={[
                      styles.receiptLabel,
                      { color: theme.textPrimary, fontWeight: '800' },
                    ]}
                  >
                    Updated Wallet Balance
                  </Text>
                  <Text
                    style={[styles.receiptBalanceHighlight, { color: theme.textPrimary }]}
                  >
                    ₹{authoritativeBalanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Group with Perfect Vertical Rhythm */}
              <View style={styles.successActionGroup}>
                <TouchableOpacity
                  style={[styles.successPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('PaymentMethods')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.successPrimaryBtnText}>Go to Wallet ›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.successSecondaryBtn,
                    {
                      borderColor: theme.primary,
                      backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate('WalletTransactions', {
                      transactionId: completedTx?.id,
                    })
                  }
                  activeOpacity={0.88}
                >
                  <Text style={[styles.successSecondaryBtnText, { color: theme.primary }]}>
                    View Transaction 🧾
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.successGhostBtn}
                  onPress={() => navigation.navigate('MainTabs')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.successGhostBtnText, { color: theme.textSecondary }]}>
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PROCESSING STATE VIEW
  if (paymentState === 'processing') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Processing Payment" />
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.processingTitle, { color: theme.textPrimary }]}>
            Processing Payment...
          </Text>
          <Text style={[styles.processingSub, { color: theme.textSecondary }]}>
            Connecting securely with your bank &amp; NPCI payment gateway. Please do not close or press back.
          </Text>
          <View style={styles.secureBadge}>
            <Text style={{ fontSize: 13 }}>🔒 256-Bit TLS 1.3 Bank-Grade Encryption</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // DEFAULT FORM VIEW
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title="Add Money"
        subtitle="Add funds to your ChargeMesh Wallet securely."
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================================
            1. CURRENT WALLET BALANCE SUMMARY CARD
        ========================================================================= */}
        <View
          style={[
            styles.balanceHeroCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#1E293B',
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>CURRENT WALLET BALANCE</Text>
              <Text style={styles.heroAmount}>
                ₹{currentBalanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>AUTO-AUTH READY</Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            2. ENTER AMOUNT SECTION
        ========================================================================= */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            ENTER AMOUNT
          </Text>

          {/* Amount Input Box */}
          <View
            style={[
              styles.amountInputWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: amountError ? '#EF4444' : theme.border,
              },
            ]}
          >
            <Text style={[styles.rupeeSymbol, { color: theme.primary }]}>₹</Text>
            <TextInput
              style={[styles.amountTextInput, { color: theme.textPrimary }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              value={customAmountText}
              onChangeText={handleCustomAmountChange}
              maxLength={6}
            />
            {customAmountText.length > 0 && (
              <TouchableOpacity
                onPress={() => handleCustomAmountChange('')}
                style={styles.clearBtn}
              >
                <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {amountError ? (
            <Text style={styles.errorText}>{amountError}</Text>
          ) : null}

          {/* Preset Quick Amount Chips */}
          <View style={styles.presetRow}>
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(0, 208, 132, 0.2)'
                          : '#DCFCE7'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : '#F1F5F9',
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectPreset(amt)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isSelected ? theme.primary : theme.textPrimary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* =========================================================================
            3. CHOOSE PAYMENT METHOD SECTION
        ========================================================================= */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            CHOOSE PAYMENT METHOD
          </Text>

          {/* Option A: Saved Visa Card */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              {
                backgroundColor: theme.surface,
                borderColor: paymentType === 'saved_card' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setPaymentType('saved_card');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeftGroup}>
              <View style={styles.radioOuter}>
                {paymentType === 'saved_card' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <View style={styles.methodIconBox}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                    Visa •••• 4821
                  </Text>
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                </View>
                <Text style={[styles.methodSub, { color: theme.textSecondary }]}>
                  Expires 08/29 · HDFC Bank
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Option B: Saved UPI (abhay@upi) */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              {
                backgroundColor: theme.surface,
                borderColor: paymentType === 'saved_upi' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setPaymentType('saved_upi');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeftGroup}>
              <View style={styles.radioOuter}>
                {paymentType === 'saved_upi' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <View style={styles.methodIconBox}>
                <Text style={{ fontSize: 20 }}>📱</Text>
              </View>
              <View>
                <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                  UPI (Google Pay / PhonePe)
                </Text>
                <Text style={[styles.methodSub, { color: theme.textSecondary }]}>
                  abhay@upi · Fast Instant Approval
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Option C: Enter New UPI ID */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              {
                backgroundColor: theme.surface,
                borderColor: paymentType === 'new_upi' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setPaymentType('new_upi');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeftGroup}>
              <View style={styles.radioOuter}>
                {paymentType === 'new_upi' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <View style={styles.methodIconBox}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                  Pay with other UPI ID
                </Text>
                <Text style={[styles.methodSub, { color: theme.textSecondary }]}>
                  Enter custom VPA (e.g. mobile@paytm)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {paymentType === 'new_upi' && (
            <View
              style={[
                styles.inlineFormContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                UPI ID / VPA
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: upiError ? '#EF4444' : theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="e.g. rahul@oksbi"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                value={customUpiId}
                onChangeText={(t) => {
                  setCustomUpiId(t);
                  if (upiError) setUpiError('');
                }}
              />
              {upiError ? <Text style={styles.errorText}>{upiError}</Text> : null}
            </View>
          )}

          {/* Option D: Debit / Credit Card (Inline Add Card) */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              {
                backgroundColor: theme.surface,
                borderColor: paymentType === 'new_card' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setPaymentType('new_card');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeftGroup}>
              <View style={styles.radioOuter}>
                {paymentType === 'new_card' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <View style={styles.methodIconBox}>
                <Text style={{ fontSize: 20 }}>➕</Text>
              </View>
              <View>
                <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                  + Add New Card
                </Text>
                <Text style={[styles.methodSub, { color: theme.textSecondary }]}>
                  Visa, Mastercard, RuPay with RBI Tokenisation
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {paymentType === 'new_card' && (
            <View
              style={[
                styles.inlineFormContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Cardholder Name
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Name as printed on card"
                placeholderTextColor={theme.textMuted}
                value={cardholderName}
                onChangeText={setCardholderName}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                Card Number
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
              />

              <View style={styles.cardTwoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                    Expiry Date
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                      },
                    ]}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="number-pad"
                    value={cardExpiry}
                    onChangeText={handleCardExpiryChange}
                  />
                </View>

                <View style={{ width: 14 }} />

                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                    CVV
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                      },
                    ]}
                    placeholder="123"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    value={cardCvv}
                    onChangeText={setCardCvv}
                  />
                </View>
              </View>

              {cardError ? <Text style={styles.errorText}>{cardError}</Text> : null}
            </View>
          )}

          {/* Option E: Net Banking */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              {
                backgroundColor: theme.surface,
                borderColor: paymentType === 'net_banking' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setPaymentType('net_banking');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeftGroup}>
              <View style={styles.radioOuter}>
                {paymentType === 'net_banking' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <View style={styles.methodIconBox}>
                <Text style={{ fontSize: 20 }}>🏛️</Text>
              </View>
              <View>
                <Text style={[styles.methodTitle, { color: theme.textPrimary }]}>
                  Net Banking
                </Text>
                <Text style={[styles.methodSub, { color: theme.textSecondary }]}>
                  All Indian major banks supported
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {paymentType === 'net_banking' && (
            <View
              style={[
                styles.inlineFormContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Select Your Bank
              </Text>
              <View style={styles.bankGrid}>
                {POPULAR_BANKS.map((b) => {
                  const isBankSelected = selectedBank === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.bankChip,
                        {
                          backgroundColor: isBankSelected
                            ? isDark
                              ? 'rgba(0, 208, 132, 0.2)'
                              : '#DCFCE7'
                            : theme.surface,
                          borderColor: isBankSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedBank(b.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 16 }}>{b.icon}</Text>
                      <Text
                        style={[
                          styles.bankChipText,
                          {
                            color: isBankSelected ? theme.primary : theme.textPrimary,
                            fontWeight: isBankSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* =========================================================================
            4. PAYMENT SUMMARY & DYNAMIC CTA
        ========================================================================= */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
            Payment Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Top-up Amount
            </Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              ₹{selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Payment Method
            </Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {paymentType === 'saved_card'
                ? 'Visa •••• 4821'
                : paymentType === 'saved_upi'
                ? 'UPI (abhay@upi)'
                : paymentType === 'new_upi'
                ? customUpiId || 'UPI'
                : paymentType === 'new_card'
                ? 'New Debit / Credit Card'
                : 'Net Banking'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabelBold, { color: theme.textPrimary }]}>
              Wallet Balance After Payment
            </Text>
            <Text style={[styles.summaryBalanceHighlight, { color: theme.primary }]}>
              ₹{balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: selectedAmount >= 100 ? theme.primary : '#94A3B8',
                marginTop: 16,
              },
            ]}
            onPress={handleExecutePayment}
            disabled={selectedAmount < 100}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>
              Pay ₹{selectedAmount.toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityFooter}>
            <Text style={[styles.securityFooterText, { color: theme.textMuted }]}>
              🔒 Protected by 256-Bit Bank-Grade Encryption · Instant Wallet Credit
            </Text>
          </View>
        </View>
      </ScrollView>
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
  balanceHeroCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  activePill: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: '#00D084',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activePillText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
    marginBottom: 10,
  },
  rupeeSymbol: {
    fontSize: 26,
    fontWeight: '800',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    padding: 0,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontSize: 13,
  },
  methodOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    ...shadows.card,
  },
  methodLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  methodIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  methodSub: {
    fontSize: 12,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: '#166534',
    fontSize: 9,
    fontWeight: '800',
  },
  inlineFormContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 14,
    marginTop: -4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  cardTwoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bankChipText: {
    fontSize: 12,
  },
  summaryCard: {
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  summaryLabelBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryBalanceHighlight: {
    fontSize: 16,
    fontWeight: '900',
  },
  primaryBtn: {
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
  securityFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  securityFooterText: {
    fontSize: 11,
    fontWeight: '500',
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
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
  },
  processingSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  secureBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    borderColor: '#00D084',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  resultCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  resultSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 13,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  receiptValueGreen: {
    fontSize: 15,
    fontWeight: '900',
  },
  receiptBalanceHighlight: {
    fontSize: 18,
    fontWeight: '900',
  },
  receiptDivider: {
    height: 1,
    marginVertical: 8,
  },
  resultScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  successCheckIcon: {
    fontSize: 38,
    fontWeight: '900',
    color: '#16A34A',
  },
  successBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  successBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00D084',
  },
  successActionGroup: {
    width: '100%',
    gap: 12,
  },
  successPrimaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  successPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  successSecondaryBtn: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successSecondaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  successGhostBtn: {
    width: '100%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  successGhostBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
