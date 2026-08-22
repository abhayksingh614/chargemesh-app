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
  Image,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

const { height } = Dimensions.get('window');

interface AuthGateModalProps {
  visible: boolean;
  featureName?: string;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  visible,
  featureName = 'this feature',
  onClose,
  onLogin,
  onRegister,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        {/* Backdrop dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

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

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            bounces={false}
          >
            {/* Top Badge */}
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>🔒 Member Feature</Text>
            </View>

            {/* Glowing Circular Favicon Hero Logo */}
            <View style={styles.logoGlowRing}>
              <Image
                source={require('../assets/logo/cm_fevicon_logo_trans.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Sign in to access {featureName}</Text>
            <Text style={styles.subtitle}>
              Unlock fast charging across India, 1-click Fastag payments, live battery telemetry, and instant GST invoices.
            </Text>

            {/* Benefits List */}
            <View style={styles.perksContainer}>
              <View style={styles.perkRow}>
                <View style={styles.perkIconBadge}>
                  <Text style={styles.perkEmoji}>⚡</Text>
                </View>
                <View style={styles.perkTextWrap}>
                  <Text style={styles.perkHeading}>Multi-CPO Fast Charging</Text>
                  <Text style={styles.perkSub}>
                    One-tap remote start across Tata Power, Jio-bp, Statiq & Zeon
                  </Text>
                </View>
              </View>

              <View style={styles.perkDivider} />

              <View style={styles.perkRow}>
                <View style={styles.perkIconBadge}>
                  <Text style={styles.perkEmoji}>🎁</Text>
                </View>
                <View style={styles.perkTextWrap}>
                  <Text style={styles.perkHeading}>₹500 Welcome Charging Credit</Text>
                  <Text style={styles.perkSub}>
                    Instantly added to your Fast Wallet upon mobile verification
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.88}
              onPress={() => {
                onClose();
                onLogin();
              }}
            >
              <Text style={styles.loginBtnText}>Sign In with Mobile ➔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtn}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onRegister();
              }}
            >
              <Text style={styles.registerBtnText}>Create New Account (Get ₹500)</Text>
            </TouchableOpacity>

            {/* Skip / Continue as Guest */}
            <TouchableOpacity
              style={styles.continueGuestBtn}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={styles.continueGuestText}>Continue exploring as Guest</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: colors.ecoLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  logoGlowRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.ecoLight,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs + 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoImage: {
    width: 40,
    height: 40,
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
  perksContainer: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkIconBadge: {
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
  perkEmoji: {
    fontSize: 14,
  },
  perkTextWrap: {
    flex: 1,
  },
  perkHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  perkSub: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  perkDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs + 2,
  },
  loginBtn: {
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
  loginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  registerBtn: {
    width: '100%',
    backgroundColor: colors.surface,
    paddingVertical: 11,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: spacing.xs,
  },
  registerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  continueGuestBtn: {
    paddingVertical: spacing.xs,
    marginTop: 2,
  },
  continueGuestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
