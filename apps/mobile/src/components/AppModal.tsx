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
import { colors, spacing, borderRadius, shadows } from '../theme';

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
          ringBg: '#DCFCE7',
          ringBorder: '#86EFAC',
          badgeText: badge || 'Success',
          badgeBg: colors.ecoLight,
          badgeColor: colors.primaryDark,
          primaryBtnBg: colors.primary,
        };
      case 'error':
        return {
          emoji: iconEmoji || '⚠️',
          ringBg: '#FEE2E2',
          ringBorder: '#FCA5A5',
          badgeText: badge || 'Action Required',
          badgeBg: '#FEE2E2',
          badgeColor: '#991B1B',
          primaryBtnBg: colors.danger,
        };
      case 'warning':
        return {
          emoji: iconEmoji || '⚡',
          ringBg: '#FEF3C7',
          ringBorder: '#FCD34D',
          badgeText: badge || 'Notice',
          badgeBg: '#FEF3C7',
          badgeColor: '#92400E',
          primaryBtnBg: colors.warning,
        };
      case 'delete':
        return {
          emoji: iconEmoji || '🗑️',
          ringBg: '#FEE2E2',
          ringBorder: '#FCA5A5',
          badgeText: badge || 'Confirm Removal',
          badgeBg: '#FEE2E2',
          badgeColor: '#991B1B',
          primaryBtnBg: colors.danger,
        };
      case 'payment':
        return {
          emoji: iconEmoji || '💳',
          ringBg: '#EFF6FF',
          ringBorder: '#93C5FD',
          badgeText: badge || 'Payment & Billing',
          badgeBg: '#EFF6FF',
          badgeColor: '#1E40AF',
          primaryBtnBg: colors.primary,
        };
      case 'booking':
        return {
          emoji: iconEmoji || '📅',
          ringBg: '#F5F3FF',
          ringBorder: '#C4B5FD',
          badgeText: badge || 'Reservation',
          badgeBg: '#F5F3FF',
          badgeColor: '#5B21B6',
          primaryBtnBg: colors.primary,
        };
      case 'confirmation':
        return {
          emoji: iconEmoji || '❓',
          ringBg: '#F1F5F9',
          ringBorder: '#CBD5E1',
          badgeText: badge || 'Confirmation',
          badgeBg: '#F1F5F9',
          badgeColor: '#334155',
          primaryBtnBg: colors.primary,
        };
      case 'input':
        return {
          emoji: iconEmoji || '✏️',
          ringBg: '#F0FDF4',
          ringBorder: '#BBF7D0',
          badgeText: badge || 'Form',
          badgeBg: '#F0FDF4',
          badgeColor: '#166534',
          primaryBtnBg: colors.primary,
        };
      case 'info':
      default:
        return {
          emoji: iconEmoji || '⚡',
          ringBg: colors.ecoLight,
          ringBorder: '#A7F3D0',
          badgeText: badge || 'ChargeMesh',
          badgeBg: colors.ecoLight,
          badgeColor: colors.primaryDark,
          primaryBtnBg: colors.primary,
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
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
              },
            ]}
            pointerEvents="auto"
          >
            {/* Top-Right Absolute Close Cross Button */}
            {showCloseButton && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                accessibilityLabel="Close dialog"
                accessibilityRole="button"
              >
                <Text style={styles.closeIcon}>✕</Text>
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
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              {/* Custom Children (e.g. form inputs, preset selectors) */}
              {children}

              {/* Itemized Details / Perks List */}
              {details && details.length > 0 && (
                <View style={styles.detailsContainer}>
                  {details.map((item, index) => (
                    <View key={index}>
                      <View style={styles.detailRow}>
                        {item.icon && (
                          <View style={styles.detailIconBadge}>
                            <Text style={styles.detailEmoji}>{item.icon}</Text>
                          </View>
                        )}
                        <View style={styles.detailTextWrap}>
                          <Text style={styles.detailTitle}>{item.title}</Text>
                          {item.description && (
                            <Text style={styles.detailDescription}>{item.description}</Text>
                          )}
                        </View>
                        {item.value && <Text style={styles.detailValue}>{item.value}</Text>}
                      </View>
                      {index < details.length - 1 && <View style={styles.detailDivider} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Primary Action Button */}
              {primaryAction && (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    primaryAction.variant === 'danger' && styles.btnDanger,
                    primaryAction.variant === 'secondary' && styles.btnSecondary,
                    primaryAction.disabled && styles.btnDisabled,
                  ]}
                  activeOpacity={0.88}
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.loading || primaryAction.disabled}
                >
                  {primaryAction.loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonText,
                        primaryAction.variant === 'secondary' && styles.btnSecondaryText,
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
                  style={styles.secondaryButton}
                  activeOpacity={0.85}
                  onPress={secondaryAction.onPress}
                  disabled={secondaryAction.loading || secondaryAction.disabled}
                >
                  {secondaryAction.loading ? (
                    <ActivityIndicator color={colors.textPrimary} />
                  ) : (
                    <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
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
                  <Text style={styles.dismissText}>{dismissLabel}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 16,
    ...shadows.elevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.textPrimary,
  },
  detailDescription: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
    marginLeft: spacing.sm,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs + 2,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDanger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
  btnSecondary: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  btnSecondaryText: {
    color: colors.textPrimary,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.surface,
    paddingVertical: 11,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dismissBtn: {
    paddingVertical: spacing.xs,
    marginTop: 2,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
