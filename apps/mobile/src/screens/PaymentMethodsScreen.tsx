import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Header, StatusModal, ConfirmationModal, FormInputModal, PaymentModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme } from '../context';

interface PaymentMethodsScreenProps {
  navigation: any;
}

interface PaymentMethodItem {
  id: string;
  type: 'upi' | 'card' | 'fastag';
  title: string;
  subtitle: string;
  isDefault: boolean;
  statusLabel?: string;
  icon: string;
  cardBrand?: 'Visa' | 'Mastercard' | 'RuPay';
}

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ navigation }) => {
  const { user, activeVehicle, isGuest, topUpWallet } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  // Wallet State strictly from authenticated user (0 if guest)
  const walletBalancePaise = isGuest ? 0 : (user?.walletBalancePaise || 0);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Standardized Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([
    {
      id: 'pm-1',
      type: 'upi',
      title: 'UPI (Google Pay)',
      subtitle: 'abhay@upi',
      isDefault: true,
      statusLabel: 'Default',
      icon: '📱',
    },
    {
      id: 'pm-2',
      type: 'card',
      title: 'HDFC Visa Debit Card',
      subtitle: '•••• •••• •••• 4821 · Exp 08/29',
      isDefault: false,
      statusLabel: 'Saved',
      icon: '💳',
      cardBrand: 'Visa',
    },
    {
      id: 'pm-3',
      type: 'fastag',
      title: 'Tata Nexon EV FASTag',
      subtitle: `${activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Tata Nexon EV'} · DL 8C BC 2026`,
      isDefault: false,
      statusLabel: 'Connected',
      icon: '🏷️',
    },
  ]);

  // FASTag AutoPay State
  const [isFastagAutoPay, setIsFastagAutoPay] = useState(true);

  // Billing & GST State
  const [gstType, setGstType] = useState<'individual' | 'business'>('business');
  const [gstin, setGstin] = useState('07AABCC1234F1Z5');
  const [billingName, setBillingName] = useState('ChargeMesh EV Fleet');
  const [billingAddress, setBillingAddress] = useState('DLF Cyber City, Phase 2, Gurugram 122002');

  // Modals & Flows
  const [showSelectMethodModal, setShowSelectMethodModal] = useState(false);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddFastagModal, setShowAddFastagModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // UPI Form State
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiSetAsDefault, setUpiSetAsDefault] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

  // Card Form State
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardCvvInput, setCardCvvInput] = useState('');
  const [cardSetAsDefault, setCardSetAsDefault] = useState(false);
  const [cardError, setCardError] = useState('');
  const [isVerifyingCard, setIsVerifyingCard] = useState(false);

  // Status Feedback Modal
  const [statusFeedback, setStatusFeedback] = useState<{
    title: string;
    message: string;
    visible: boolean;
  }>({
    title: '',
    message: '',
    visible: false,
  });

  // Detect card network
  const getCardBrand = (num: string): 'Visa' | 'Mastercard' | 'RuPay' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    return 'RuPay';
  };

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumberInput(formatted);
    if (cardError) setCardError('');
  };

  // Format Expiry (MM/YY)
  const handleCardExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiryInput(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiryInput(cleaned);
    }
    if (cardError) setCardError('');
  };

  // Validate & Submit UPI
  const handleVerifyAndAddUpi = () => {
    const trimmed = upiIdInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) {
      setUpiError('Invalid UPI ID. Please check the entered UPI ID (e.g. name@upi) and try again.');
      return;
    }

    setUpiError('');
    setIsVerifyingUpi(true);

    setTimeout(() => {
      setIsVerifyingUpi(false);
      setShowAddUpiModal(false);

      const newPm: PaymentMethodItem = {
        id: `pm-${Date.now()}`,
        type: 'upi',
        title: 'UPI',
        subtitle: trimmed,
        isDefault: upiSetAsDefault,
        statusLabel: upiSetAsDefault ? 'Default' : 'Saved',
        icon: '📱',
      };

      setPaymentMethods((prev) => {
        if (upiSetAsDefault) {
          return [newPm, ...prev.map((p) => ({ ...p, isDefault: false, statusLabel: p.type === 'fastag' ? 'Connected' : 'Saved' }))];
        }
        return [newPm, ...prev];
      });

      setUpiIdInput('');
      setStatusFeedback({
        title: 'UPI Added Successfully ✓',
        message: `${trimmed} has been verified and saved to your account.`,
        visible: true,
      });
    }, 1200);
  };

  // Validate & Submit Card (with simulated RBI Tokenization)
  const handleVerifyAndAddCard = () => {
    const rawCardNum = cardNumberInput.replace(/\s+/g, '');
    if (!cardholderName.trim()) {
      setCardError('Please enter the cardholder name as printed on the card.');
      return;
    }
    if (rawCardNum.length < 16) {
      setCardError('Invalid card details. Please check the 16-digit card number and try again.');
      return;
    }
    if (cardExpiryInput.length < 5) {
      setCardError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cardCvvInput.length < 3) {
      setCardError('Please enter a valid 3-digit CVV from the back of your card.');
      return;
    }

    setCardError('');
    setIsVerifyingCard(true);

    setTimeout(() => {
      setIsVerifyingCard(false);
      setShowAddCardModal(false);

      const brand = getCardBrand(rawCardNum);
      const maskedCard = `${brand} •••• ${rawCardNum.slice(-4)}`;
      const newPm: PaymentMethodItem = {
        id: `pm-${Date.now()}`,
        type: 'card',
        title: maskedCard,
        subtitle: `Expires ${cardExpiryInput}`,
        isDefault: cardSetAsDefault,
        statusLabel: cardSetAsDefault ? 'Default' : 'Saved',
        icon: '💳',
        cardBrand: brand,
      };

      setPaymentMethods((prev) => {
        if (cardSetAsDefault) {
          return [newPm, ...prev.map((p) => ({ ...p, isDefault: false, statusLabel: p.type === 'fastag' ? 'Connected' : 'Saved' }))];
        }
        return [newPm, ...prev];
      });

      // Clear sensitive data from state
      setCardholderName('');
      setCardNumberInput('');
      setCardExpiryInput('');
      setCardCvvInput('');

      setStatusFeedback({
        title: 'Card Added Successfully ✓',
        message: `${maskedCard} has been tokenized securely with RBI compliance and saved.`,
        visible: true,
      });
    }, 1400);
  };

  const handleSetDefaultMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
        statusLabel: pm.id === id ? 'Default' : pm.type === 'fastag' ? 'Connected' : 'Saved',
      }))
    );
    setStatusFeedback({
      title: 'Default Payment Updated',
      message: 'Your preferred payment method for upcoming EV sessions has been updated.',
      visible: true,
    });
  };

  const handleDeleteMethodConfirm = () => {
    if (!deleteTarget) return;
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== deleteTarget.id));
    setDeleteTarget(null);
    setStatusFeedback({
      title: 'Payment Method Removed',
      message: `${deleteTarget.name} has been unlinked from your account.`,
      visible: true,
    });
  };

  const handleWalletTopupSuccess = (amountRupees: number) => {
    topUpWallet(amountRupees * 100);
    setStatusFeedback({
      title: 'Wallet Recharged! ⚡',
      message: `₹${amountRupees.toFixed(2)} added to your ChargeMesh Fast Wallet.`,
      visible: true,
    });
  };

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Wallet & FASTag" onBack={() => navigation.goBack()} />
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
              Please log in or create an account to access your ChargeMesh Wallet, manage payment methods, and view transactions.
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
        title="Payment Methods & FASTag"
        subtitle="Manage your payment options for faster charging."
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================================
            SECTION 1 — CHARGEMESH WALLET
        ========================================================================= */}
        <View
          style={[
            styles.walletCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#0B192C',
              borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#1E293B',
            },
          ]}
        >
          <View style={styles.walletHeaderRow}>
            <View style={styles.walletTitleGroup}>
              <View style={styles.walletIconCircle}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
              </View>
              <View>
                <Text style={styles.walletCardLabel}>ChargeMesh Fast Wallet</Text>
                <Text style={styles.walletSubtitle}>1-Tap Auto-Authorization</Text>
              </View>
            </View>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>ACTIVE ✓</Text>
            </View>
          </View>

          {/* Balance Display */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>
              ₹{(walletBalancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.balanceSubText}>Available Balance</Text>
          </View>

          {/* Wallet Actions: Dedicated navigation to WalletTransactions */}
          <View style={styles.walletActionsRow}>
            <TouchableOpacity
              style={[styles.addMoneyBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddMoney')}
              activeOpacity={0.88}
            >
              <Text style={styles.addMoneyBtnText}>+ Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => navigation.navigate('WalletTransactions')}
              activeOpacity={0.8}
            >
              <Text style={styles.historyBtnText}>Transaction History ›</Text>
            </TouchableOpacity>
          </View>

          {/* Auto Recharge Row */}
          <View style={styles.autoRechargeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoRechargeTitle}>
                Auto-recharge: {autoRechargeEnabled ? 'On' : 'Off'}
              </Text>
              <Text style={styles.autoRechargeSub}>
                Auto-adds ₹500 when wallet balance falls below ₹200
              </Text>
            </View>
            <Switch
              value={autoRechargeEnabled}
              onValueChange={setAutoRechargeEnabled}
              trackColor={{ false: '#334155', true: '#00D084' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* =========================================================================
            SECTION 2 & 3 — PAYMENT METHODS (UNIFIED CONSISTENT CARDS)
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              PAYMENT METHODS ({paymentMethods.length})
            </Text>
            <TouchableOpacity onPress={() => setShowSelectMethodModal(true)}>
              <Text style={[styles.addMethodLink, { color: theme.primary }]}>
                + Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.methodsList}>
            {paymentMethods.map((pm) => {
              const isDefault = pm.isDefault;

              return (
                <View
                  key={pm.id}
                  style={[
                    styles.uniformCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isDefault ? theme.primary : theme.border,
                    },
                    isDefault && (isDark ? styles.defaultCardDark : styles.defaultCardLight),
                  ]}
                >
                  {/* Top Line: Icon + Titles + Status Badge */}
                  <View style={styles.cardTopLine}>
                    <View style={styles.methodInfoGroup}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : isDefault
                              ? '#DCFCE7'
                              : '#F1F5F9',
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 18 }}>{pm.icon}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.methodName, { color: theme.textPrimary }]}>
                          {pm.title}
                        </Text>
                        <Text style={[styles.methodDetail, { color: theme.textSecondary }]}>
                          {pm.subtitle}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusPill,
                        isDefault
                          ? styles.statusPillDefault
                          : pm.type === 'fastag'
                          ? styles.statusPillConnected
                          : styles.statusPillSaved,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillLabel,
                          isDefault
                            ? styles.statusLabelDefault
                            : pm.type === 'fastag'
                            ? styles.statusLabelConnected
                            : styles.statusLabelSaved,
                        ]}
                      >
                        {isDefault ? 'Default' : pm.statusLabel || 'Saved'}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Line: Actions */}
                  <View style={styles.cardBottomLine}>
                    <View style={styles.actionsGroup}>
                      {isDefault ? (
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => {
                            const next = paymentMethods.find((p) => !p.isDefault);
                            if (next) handleSetDefaultMethod(next.id);
                          }}
                        >
                          <Text style={[styles.actionLinkText, { color: theme.primary }]}>
                            Change
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => handleSetDefaultMethod(pm.id)}
                        >
                          <Text style={[styles.actionLinkText, { color: theme.primary }]}>
                            Set as Default
                          </Text>
                        </TouchableOpacity>
                      )}

                      {pm.type === 'fastag' ? (
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => setShowAddFastagModal(true)}
                        >
                          <Text style={[styles.actionLinkText, { color: theme.textSecondary }]}>
                            Manage ›
                          </Text>
                        </TouchableOpacity>
                      ) : pm.type === 'card' ? (
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => setShowAddCardModal(true)}
                        >
                          <Text style={[styles.actionLinkText, { color: theme.textSecondary }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionLink}
                          onPress={() => setShowAddUpiModal(true)}
                        >
                          <Text style={[styles.actionLinkText, { color: theme.textSecondary }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionLink}
                        onPress={() => setDeleteTarget({ id: pm.id, name: pm.title })}
                      >
                        <Text style={styles.deleteLinkText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* =========================================================================
            SECTION 4 — FASTAG 1-TAP AUTOPAY BANNER
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.autoPayCard,
              {
                backgroundColor: isDark ? 'rgba(0, 208, 132, 0.06)' : '#F0FDF4',
                borderColor: isDark ? 'rgba(0, 208, 132, 0.25)' : '#BBF7D0',
              },
            ]}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.autoPayHeading, { color: theme.primary }]}>
                ⚡ 1-Tap FASTag AutoPay
              </Text>
              <Text style={[styles.autoPaySub, { color: theme.textSecondary }]}>
                Enable faster and more seamless charging payments with FASTag directly at highway partner EV plazas.
              </Text>
            </View>
            <Switch
              value={isFastagAutoPay}
              onValueChange={setIsFastagAutoPay}
              trackColor={{ false: '#334155', true: '#00D084' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* =========================================================================
            SECTION 5 — BILLING & GST
        ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            BILLING &amp; GST DETAILS
          </Text>

          <View
            style={[
              styles.billingCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, { color: theme.textSecondary }]}>
                Account Type:
              </Text>
              <Text style={[styles.billingVal, { color: theme.textPrimary }]}>
                {gstType === 'business' ? '🏢 Corporate / Business' : '👤 Individual'}
              </Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, { color: theme.textSecondary }]}>
                GSTIN:
              </Text>
              <Text style={[styles.billingVal, { color: theme.primary, fontWeight: '800' }]}>
                {gstin}
              </Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, { color: theme.textSecondary }]}>
                Billing Entity:
              </Text>
              <Text style={[styles.billingVal, { color: theme.textPrimary }]}>
                {billingName}
              </Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, { color: theme.textSecondary }]}>
                Address:
              </Text>
              <Text
                style={[styles.billingVal, { color: theme.textSecondary, flex: 1, textAlign: 'right' }]}
                numberOfLines={2}
              >
                {billingAddress}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.manageBillingBtn, { borderColor: theme.border }]}
              onPress={() => setShowGstModal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.manageBillingText, { color: theme.primary }]}>
                Manage Billing Details →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            SECTION 6 — PAYMENT SECURITY
        ========================================================================= */}
        <View
          style={[
            styles.securityCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.securityTitle, { color: theme.textPrimary }]}>
              Payment Security
            </Text>
            <Text style={[styles.securitySub, { color: theme.textSecondary }]}>
              Your payment information is securely processed through RBI-compliant, PCI-DSS certified tokenized payment gateways.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* =========================================================================
          STEP 1: METHOD SELECTION MODAL (Choose UPI or Card)
      ========================================================================= */}
      {showSelectMethodModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Add Payment Method
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Choose how you'd like to pay for EV charging.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSelectMethodModal(false)}>
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Option 1: UPI */}
            <TouchableOpacity
              style={[
                styles.methodOptionCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              onPress={() => {
                setShowSelectMethodModal(false);
                setShowAddUpiModal(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.optionIconCircle}>
                <Text style={{ fontSize: 22 }}>📱</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>UPI</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Pay instantly using your UPI ID / VPA.
                </Text>
              </View>
              <Text style={[styles.optionChevron, { color: theme.primary }]}>›</Text>
            </TouchableOpacity>

            {/* Option 2: Debit / Credit Card */}
            <TouchableOpacity
              style={[
                styles.methodOptionCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              onPress={() => {
                setShowSelectMethodModal(false);
                setShowAddCardModal(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.optionIconCircle}>
                <Text style={{ fontSize: 22 }}>💳</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
                  Debit / Credit Card
                </Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Save your card securely with RBI tokenization.
                </Text>
              </View>
              <Text style={[styles.optionChevron, { color: theme.primary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =========================================================================
          STEP 2A: DEDICATED ADD UPI MODAL
      ========================================================================= */}
      {showAddUpiModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add UPI</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Add your UPI ID to make faster payments.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddUpiModal(false)}>
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* UPI Input */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                UPI ID / VPA
              </Text>
              <TextInput
                style={[
                  styles.textInputBox,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    borderColor: upiError ? '#EF4444' : theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="e.g. name@upi or mobile@okhdfcbank"
                placeholderTextColor={theme.textMuted}
                value={upiIdInput}
                onChangeText={(text) => {
                  setUpiIdInput(text);
                  if (upiError) setUpiError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {upiError ? (
                <Text style={styles.fieldErrorText}>{upiError}</Text>
              ) : (
                <Text style={[styles.fieldHintText, { color: theme.textSecondary }]}>
                  Supported: Google Pay, PhonePe, Paytm, BHIM, and Bank VPAs
                </Text>
              )}
            </View>

            {/* Set As Default Toggle */}
            <View style={styles.defaultToggleRow}>
              <Text style={[styles.defaultToggleLabel, { color: theme.textPrimary }]}>
                Set as default payment method
              </Text>
              <Switch
                value={upiSetAsDefault}
                onValueChange={setUpiSetAsDefault}
                trackColor={{ false: '#334155', true: '#00D084' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.primaryModalBtn, { backgroundColor: theme.primary }]}
              onPress={handleVerifyAndAddUpi}
              disabled={isVerifyingUpi}
              activeOpacity={0.88}
            >
              {isVerifyingUpi ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryModalBtnText}>Verify &amp; Add UPI</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =========================================================================
          STEP 2B: DEDICATED ADD CARD MODAL (RBI Compliant Tokenization)
      ========================================================================= */}
      {showAddCardModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Card</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Add a debit or credit card for faster payments.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Cardholder Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                Cardholder Name
              </Text>
              <TextInput
                style={[
                  styles.textInputBox,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Name on card"
                placeholderTextColor={theme.textMuted}
                value={cardholderName}
                onChangeText={setCardholderName}
              />
            </View>

            {/* Card Number */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                  Card Number
                </Text>
                {cardNumberInput.length > 0 && (
                  <Text style={[styles.cardBrandBadge, { color: theme.primary }]}>
                    {getCardBrand(cardNumberInput)}
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.textInputBox,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={cardNumberInput}
                onChangeText={handleCardNumberChange}
              />
            </View>

            {/* Expiry & CVV Row */}
            <View style={styles.cardHalfRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                  Expiry Date
                </Text>
                <TextInput
                  style={[
                    styles.textInputBox,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="MM / YY"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={cardExpiryInput}
                  onChangeText={handleCardExpiryChange}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>CVV</Text>
                  <Text style={[styles.cvvHintIcon, { color: theme.textMuted }]}>ℹ️</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInputBox,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="CVV"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  value={cardCvvInput}
                  onChangeText={setCardCvvInput}
                />
              </View>
            </View>

            {cardError ? <Text style={styles.fieldErrorText}>{cardError}</Text> : null}

            {/* Tokenization Notice */}
            <View style={styles.tokenNoticeBox}>
              <Text style={styles.tokenNoticeIcon}>🔒</Text>
              <Text style={[styles.tokenNoticeText, { color: theme.textSecondary }]}>
                Secured per RBI guidelines. Your card is tokenized via RBI-compliant 3D-Secure authentication.
              </Text>
            </View>

            {/* Set As Default Toggle */}
            <View style={styles.defaultToggleRow}>
              <Text style={[styles.defaultToggleLabel, { color: theme.textPrimary }]}>
                Set as default payment method
              </Text>
              <Switch
                value={cardSetAsDefault}
                onValueChange={setCardSetAsDefault}
                trackColor={{ false: '#334155', true: '#00D084' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.primaryModalBtn, { backgroundColor: theme.primary }]}
              onPress={handleVerifyAndAddCard}
              disabled={isVerifyingCard}
              activeOpacity={0.88}
            >
              {isVerifyingCard ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryModalBtnText}>Continue Securely</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Topup Payment Modal */}
      <PaymentModal
        visible={showTopupModal}
        currentBalancePaise={walletBalancePaise}
        onClose={() => setShowTopupModal(false)}
        onSuccess={handleWalletTopupSuccess}
      />

      {/* Dedicated Connect FASTag Modal */}
      <FormInputModal
        visible={showAddFastagModal}
        title="Connect FASTag"
        subtitle="Link your FASTag for quick and seamless EV charging payments."
        fields={[
          {
            key: 'tagNumber',
            label: 'FASTag RFID Tag ID',
            placeholder: 'e.g. 3416 1782 9901 4821',
            required: true,
          },
          {
            key: 'plate',
            label: 'Vehicle Registration Plate',
            placeholder: 'e.g. DL 8C BC 2026',
            defaultValue: activeVehicle?.registrationPlate || '',
            required: true,
          },
        ]}
        submitLabel="Link FASTag"
        onClose={() => setShowAddFastagModal(false)}
        onSubmit={(values) => {
          setShowAddFastagModal(false);
          setStatusFeedback({
            title: 'FASTag Connected ✓',
            message: `FASTag linked to ${values.plate || 'Tata Nexon EV'} is active for 1-Tap payments.`,
            visible: true,
          });
        }}
      />

      {/* Manage GST & Billing Modal */}
      <FormInputModal
        visible={showGstModal}
        title="Manage Billing & GST"
        subtitle="Invoices will be generated with these details for input tax credit (ITC)."
        fields={[
          {
            key: 'gstin',
            label: '15-Digit GSTIN',
            placeholder: 'e.g. 07AABCC1234F1Z5',
            defaultValue: gstin,
            required: true,
          },
          {
            key: 'businessName',
            label: 'Billing Name',
            placeholder: 'Company Name Pvt Ltd',
            defaultValue: billingName,
            required: true,
          },
          {
            key: 'address',
            label: 'Billing Address',
            placeholder: 'Official registered address for tax invoice...',
            defaultValue: billingAddress,
            multiline: true,
            required: true,
          },
        ]}
        submitLabel="Save Billing Details"
        onClose={() => setShowGstModal(false)}
        onSubmit={(values) => {
          setShowGstModal(false);
          if (values.gstin) setGstin(values.gstin);
          if (values.businessName) setBillingName(values.businessName);
          if (values.address) setBillingAddress(values.address);
          setGstType('business');
          setStatusFeedback({
            title: 'Billing Profile Updated',
            message: 'All future tax invoices will reflect updated GSTIN credentials.',
            visible: true,
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteTarget}
        isDestructive={true}
        title="Remove Payment Method?"
        message={`Are you sure you want to remove ${deleteTarget?.name}? You can re-link it anytime.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleDeleteMethodConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Status Feedback Modal */}
      <StatusModal
        visible={statusFeedback.visible}
        type="success"
        title={statusFeedback.title}
        message={statusFeedback.message}
        buttonLabel="Done"
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

  // Section Wrap
  sectionWrap: {
    marginBottom: 16,
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
  addMethodLink: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Wallet Card
  walletCard: {
    borderRadius: borderRadius.xxl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    ...shadows.card,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCardLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  walletSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
  },
  verifiedPill: {
    backgroundColor: '#00D084',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  verifiedPillText: {
    color: '#0B192C',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  balanceContainer: {
    marginVertical: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  balanceSubText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  walletActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  addMoneyBtn: {
    flex: 1.2,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  historyBtn: {
    flex: 1.2,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  autoRechargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 10,
  },
  autoRechargeTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  autoRechargeSub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10.5,
    marginTop: 1,
  },

  // Uniform Payment Method Cards
  methodsList: {
    gap: 10,
  },
  uniformCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    ...shadows.card,
  },
  defaultCardLight: {
    backgroundColor: '#F0FDF4',
  },
  defaultCardDark: {
    backgroundColor: 'rgba(0, 208, 132, 0.05)',
  },
  cardTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  methodDetail: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillDefault: {
    backgroundColor: '#00D084',
  },
  statusPillConnected: {
    backgroundColor: '#DCFCE7',
  },
  statusPillSaved: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  statusPillLabel: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusLabelDefault: {
    color: '#0B192C',
  },
  statusLabelConnected: {
    color: '#15803D',
  },
  statusLabelSaved: {
    color: '#64748B',
  },

  // Card Bottom Actions
  cardBottomLine: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionLink: {
    paddingVertical: 2,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteLinkText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  // 1-Tap AutoPay Feature Box
  autoPayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    ...shadows.card,
  },
  autoPayHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  autoPaySub: {
    fontSize: 11.5,
    lineHeight: 15,
  },

  // Billing & GST
  billingCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    ...shadows.card,
    gap: 8,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  billingVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  manageBillingBtn: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
    alignItems: 'center',
  },
  manageBillingText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Security Card
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  securitySub: {
    fontSize: 10.5,
    lineHeight: 14,
  },

  // Modal Sheet Components
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
    maxWidth: 400,
    borderRadius: borderRadius.xxl,
    padding: 20,
    borderWidth: 1.5,
    ...shadows.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '800',
    padding: 4,
  },

  // Method Option Cards
  methodOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.2,
    marginBottom: 12,
    gap: 12,
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 15,
  },
  optionChevron: {
    fontSize: 20,
    fontWeight: '900',
  },

  // Field Inputs
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBrandBadge: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  textInputBox: {
    height: 46,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  fieldHintText: {
    fontSize: 10.5,
    marginTop: 4,
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  cardHalfRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cvvHintIcon: {
    fontSize: 11,
  },
  tokenNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.06)',
    padding: 10,
    borderRadius: borderRadius.md,
    marginBottom: 12,
    gap: 6,
  },
  tokenNoticeIcon: {
    fontSize: 13,
  },
  tokenNoticeText: {
    fontSize: 10.5,
    flex: 1,
    lineHeight: 14,
  },
  defaultToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  defaultToggleLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  primaryModalBtn: {
    height: 46,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
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
