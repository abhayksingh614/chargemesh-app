import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { spacing, borderRadius, shadows } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '../context';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
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
    outputRange: [20, 0],
  });

  const cardOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.85, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        {/* Backdrop touch */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

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
          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={onCancel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Close dialog"
            accessibilityRole="button"
          >
            <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>

          <View style={[styles.iconCircle, isDestructive && styles.iconCircleDanger]}>
            <Text style={styles.iconEmoji}>{isDestructive ? '⚠️' : '⚡'}</Text>
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>{cancelLabel}</Text>
            </TouchableOpacity>

            <View style={styles.confirmWrapper}>
              <PrimaryButton
                title={confirmLabel}
                onPress={onConfirm}
                variant={isDestructive ? 'danger' : 'primary'}
              />
            </View>
          </View>
        </Animated.View>
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
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.2,
    position: 'relative',
    ...shadows.elevated,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    marginTop: spacing.xs,
  },
  iconCircleDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmWrapper: {
    flex: 1,
  },
});
