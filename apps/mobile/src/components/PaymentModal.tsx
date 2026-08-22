import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { AppModal } from './AppModal';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amountRupees: number) => void;
  currentBalancePaise?: number;
}

const PRESET_AMOUNTS = [200, 500, 1000, 2000];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  currentBalancePaise = 0,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'fastag'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handlePay = async () => {
    if (effectiveAmount < 50) {
      return;
    }
    setIsProcessing(true);
    // Simulate Razorpay / UPI intent payment
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(effectiveAmount);
      onClose();
    }, 1000);
  };

  return (
    <AppModal
      visible={visible}
      type="payment"
      badge="Fast Wallet ⚡"
      title="Top Up Charging Balance"
      subtitle={`Current Wallet: ₹${(currentBalancePaise / 100).toFixed(2)}`}
      onClose={onClose}
      primaryAction={{
        label: `Pay ₹${effectiveAmount.toFixed(0)} via ${selectedMethod.toUpperCase()}`,
        onPress: handlePay,
        loading: isProcessing,
        disabled: effectiveAmount < 50,
      }}
      dismissLabel="Cancel"
    >
      {/* Preset Amount Selector */}
      <View style={styles.presetsRow}>
        {PRESET_AMOUNTS.map((amt) => {
          const isSelected = selectedAmount === amt && !customAmount;
          return (
            <TouchableOpacity
              key={amt}
              style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
              onPress={() => {
                setSelectedAmount(amt);
                setCustomAmount('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                ₹{amt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Amount Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>OR ENTER CUSTOM AMOUNT (MIN ₹50)</Text>
        <View style={styles.customInputWrap}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.customInput}
            placeholder="e.g. 750"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(val) => {
              setCustomAmount(val.replace(/\D/g, ''));
            }}
          />
        </View>
      </View>

      {/* Payment Method Selector */}
      <View style={styles.methodGroup}>
        <Text style={styles.inputLabel}>PAYMENT METHOD</Text>
        <View style={styles.methodsRow}>
          <TouchableOpacity
            style={[styles.methodPill, selectedMethod === 'upi' && styles.methodPillActive]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.8}
          >
            <Text style={styles.methodIcon}>📲</Text>
            <Text
              style={[styles.methodText, selectedMethod === 'upi' && styles.methodTextActive]}
            >
              UPI Instant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodPill, selectedMethod === 'card' && styles.methodPillActive]}
            onPress={() => setSelectedMethod('card')}
            activeOpacity={0.8}
          >
            <Text style={styles.methodIcon}>💳</Text>
            <Text
              style={[styles.methodText, selectedMethod === 'card' && styles.methodTextActive]}
            >
              Cards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodPill, selectedMethod === 'fastag' && styles.methodPillActive]}
            onPress={() => setSelectedMethod('fastag')}
            activeOpacity={0.8}
          >
            <Text style={styles.methodIcon}>🚗</Text>
            <Text
              style={[styles.methodText, selectedMethod === 'fastag' && styles.methodTextActive]}
            >
              Fastag
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetBtnActive: {
    backgroundColor: colors.ecoLight,
    borderColor: colors.primary,
    ...shadows.card,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetTextActive: {
    color: colors.primaryDark,
  },
  inputGroup: {
    width: '100%',
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  customInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  methodGroup: {
    width: '100%',
    marginBottom: spacing.md,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  methodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodPillActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    ...shadows.card,
  },
  methodIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  methodTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
