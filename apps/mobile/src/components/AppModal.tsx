import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { spacing, borderRadius, shadows } from '../theme';
import { useTheme } from '../context';

const { height } = Dimensions.get('window');

export type ModalType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'confirmation'
  | 'delete'
  | 'payment'
  | 'booking'
  | 'input';

export interface ModalAction {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
}

export interface ModalPerkOrDetail {
  icon?: string;
  title: string;
  description?: string;
  value?: string;
}

export interface AppModalProps {
  visible: boolean;
  type?: ModalType;
  title: string;
  subtitle?: string;
  badge?: string;
  iconEmoji?: string;
  details?: ModalPerkOrDetail[];
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  dismissLabel?: string;
  onClose: () => void;
  showCloseButton?: boolean;
  children?: React.ReactNode;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  type = 'info',
  title,
  subtitle,
  badge,
  iconEmoji,
  details,
  primaryAction,
  secondaryAction,
  dismissLabel,
  onClose,
  showCloseButton = true,
  children,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [visible]);

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const cardTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const cardOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.85, 1],
  });

  const getTypeStyling = () => {
    switch (type) {
      case 'success':
        return {
          emoji: iconEmoji || '✅',
          ringBg: isDark ? 'rgba(0, 208, 132, 0.16)' : '#DCFCE7',
          ringBorder: isDark ? '#00D084' : '#86EFAC',
          badgeText: badge || 'Success',
          badgeBg: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
          badgeColor: isDark ? '#00D084' : '#15803D',
          primaryBtnBg: theme.primary,
        };
      case 'error':
        return {
          emoji: iconEmoji || '⚠️',
          ringBg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEE2E2',
          ringBorder: isDark ? '#EF4444' : '#FCA5A5',
          badgeText: badge || 'Action Required',
          badgeBg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
          badgeColor: isDark ? '#FCA5A5' : '#991B1B',
          primaryBtnBg: '#EF4444',
        };
      case 'warning':
        return {
          emoji: iconEmoji || '⚡',
          ringBg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FEF3C7',
          ringBorder: isDark ? '#F59E0B' : '#FCD34D',
          badgeText: badge || 'Notice',
          badgeBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
          badgeColor: isDark ? '#FDE68A' : '#92400E',
          primaryBtnBg: '#F59E0B',
        };
      case 'delete':
        return {
          emoji: iconEmoji || '🗑️',
          ringBg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEE2E2',
          ringBorder: isDark ? '#EF4444' : '#FCA5A5',
          badgeText: badge || 'Confirm Removal',
          badgeBg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
          badgeColor: isDark ? '#FCA5A5' : '#991B1B',
          primaryBtnBg: '#EF4444',
        };
      case 'payment':
        return {
          emoji: iconEmoji || '💳',
          ringBg: isDark ? 'rgba(59, 130, 246, 0.16)' : '#EFF6FF',
          ringBorder: isDark ? '#3B82F6' : '#93C5FD',
          badgeText: badge || 'Payment & Billing',
          badgeBg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
          badgeColor: isDark ? '#93C5FD' : '#1E40AF',
          primaryBtnBg: theme.primary,
        };
      case 'booking':
        return {
          emoji: iconEmoji || '🔌',
          ringBg: isDark ? 'rgba(0, 208, 132, 0.16)' : '#DCFCE7',
          ringBorder: isDark ? '#00D084' : '#86EFAC',
          badgeText: badge || 'Slot Reservation',
          badgeBg: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
          badgeColor: isDark ? '#00D084' : '#15803D',
          primaryBtnBg: theme.primary,
        };
      case 'confirmation':
        return {
          emoji: iconEmoji || '🛡️',
          ringBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
          ringBorder: isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1',
          badgeText: badge || 'Confirm Action',
          badgeBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
          badgeColor: theme.textPrimary,
          primaryBtnBg: theme.primary,
        };
      case 'input':
        return {
          emoji: iconEmoji || '✏️',
          ringBg: isDark ? 'rgba(0, 208, 132, 0.16)' : '#F0FDF4',
          ringBorder: isDark ? '#00D084' : '#BBF7D0',
          badgeText: badge || 'Form',
          badgeBg: isDark ? 'rgba(0, 208, 132, 0.15)' : '#F0FDF4',
          badgeColor: isDark ? '#00D084' : '#166534',
          primaryBtnBg: theme.primary,
        };
      case 'info':
      default:
        return {
          emoji: iconEmoji || '⚡',
          ringBg: isDark ? 'rgba(0, 208, 132, 0.16)' : '#DCFCE7',
          ringBorder: isDark ? '#00D084' : '#A7F3D0',
          badgeText: badge || 'ChargeMesh',
          badgeBg: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
          badgeColor: isDark ? '#00D084' : '#064E3B',
          primaryBtnBg: theme.primary,
        };
    }
  };

  const styleConfig = getTypeStyling();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
              },
            ]}
            pointerEvents="auto"
          >
            {/* Top-Right Absolute Close Cross Button */}
            {showCloseButton && (
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                    borderColor: theme.border,
                  },
                ]}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                accessibilityLabel="Close dialog"
                accessibilityRole="button"
              >
                <Text style={[styles.closeIcon, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            )}

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Badge Pill */}
              {styleConfig.badgeText && (
                <View style={[styles.badgePill, { backgroundColor: styleConfig.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: styleConfig.badgeColor }]}>
                    {styleConfig.badgeText}
                  </Text>
                </View>
              )}

              {/* Glowing Icon Ring */}
              <View
                style={[
                  styles.iconRing,
                  {
                    backgroundColor: styleConfig.ringBg,
                    borderColor: styleConfig.ringBorder,
                  },
                ]}
              >
                <Text style={styles.iconEmoji}>{styleConfig.emoji}</Text>
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {subtitle}
                </Text>
              )}

              {/* Custom Children (e.g. form inputs, preset selectors) */}
              {children}

              {/* Itemized Details / Perks List */}
              {details && details.length > 0 && (
                <View
                  style={[
                    styles.detailsContainer,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : theme.surfaceSecondary,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {details.map((item, index) => (
                    <View key={index}>
                      <View style={styles.detailRow}>
                        {item.icon && (
                          <View
                            style={[
                              styles.detailIconBadge,
                              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF' },
                            ]}
                          >
                            <Text style={styles.detailEmoji}>{item.icon}</Text>
                          </View>
                        )}
                        <View style={styles.detailTextWrap}>
                          <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>
                            {item.title}
                          </Text>
                          {item.description && (
                            <Text style={[styles.detailDescription, { color: theme.textSecondary }]}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                        {item.value && (
                          <Text style={[styles.detailValue, { color: theme.primary }]}>
                            {item.value}
                          </Text>
                        )}
                      </View>
                      {index < details.length - 1 && (
                        <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Primary Action Button */}
              {primaryAction && (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: styleConfig.primaryBtnBg },
                    primaryAction.variant === 'secondary' && {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                      borderColor: theme.border,
                      borderWidth: 1,
                    },
                    primaryAction.disabled && styles.btnDisabled,
                  ]}
                  activeOpacity={0.88}
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.loading || primaryAction.disabled}
                >
                  {primaryAction.loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonText,
                        primaryAction.variant === 'secondary' && { color: theme.textPrimary },
                      ]}
                    >
                      {primaryAction.label}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Secondary Action Button */}
              {secondaryAction && (
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : theme.surfaceSecondary,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={secondaryAction.onPress}
                  disabled={secondaryAction.loading || secondaryAction.disabled}
                >
                  {secondaryAction.loading ? (
                    <ActivityIndicator color={theme.textPrimary} />
                  ) : (
                    <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
                      {secondaryAction.label}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Dismiss Action */}
              {dismissLabel && (
                <TouchableOpacity
                  style={styles.dismissBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={[styles.dismissText, { color: theme.textSecondary }]}>
                    {dismissLabel}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  keyboardWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'relative',
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 16,
    ...shadows.elevated,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
  },
  scrollView: {
    flexGrow: 0,
    width: '100%',
    maxHeight: height * 0.78,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 18 : 14,
    includeFontPadding: false,
  },
  scrollBody: {
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 2,
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailEmoji: {
    fontSize: 14,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailDescription: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#064E3B',
    marginLeft: spacing.sm,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.xs + 2,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDanger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnSecondaryText: {
    color: '#0F172A',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  dismissBtn: {
    paddingVertical: spacing.xs,
    marginTop: 2,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});

