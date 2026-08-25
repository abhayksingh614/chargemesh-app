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
import { spacing, borderRadius, shadows } from '../theme';
import { useTheme } from '../context';
import { WELCOME_BONUS_AMOUNT_RUPEES } from '../constants/appConstants';

const { height } = Dimensions.get('window');

interface AuthGateModalProps {
  visible: boolean;
  featureName?: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onContinueExploring?: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  visible,
  featureName = 'this feature',
  title,
  subtitle,
  onClose,
  onLogin,
  onRegister,
  onContinueExploring,
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
  }, [visible, animValue]);

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const cardOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.85, 1],
  });

  const displayTitle =
    title || (featureName ? `Sign in to access ${featureName}` : 'Login Required 🔐');
  const displaySubtitle =
    subtitle ||
    `Join ChargeMesh to unlock fast EV charging across India, live telemetry, and ₹${WELCOME_BONUS_AMOUNT_RUPEES} welcome bonus.`;

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
              backgroundColor: theme.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
          pointerEvents="auto"
        >
          {/* Top-Right Absolute Close Cross Button */}
          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: theme.border,
              },
            ]}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Close dialog"
            accessibilityRole="button"
          >
            <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            bounces={false}
          >
            {/* Top Badge */}
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.12)' : '#ECFDF5',
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#A7F3D0',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                🔐 Login Required
              </Text>
            </View>

            {/* Glowing Circular Favicon Hero Logo */}
            <View
              style={[
                styles.logoGlowRing,
                {
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.12)' : '#ECFDF5',
                  borderColor: isDark ? 'rgba(0, 208, 132, 0.35)' : '#BBF7D0',
                },
              ]}
            >
              <Image
                source={require('../assets/logo/cm_fevicon_logo_trans.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title & Subtitle */}
            <Text style={[styles.title, { color: theme.textPrimary }]}>{displayTitle}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {displaySubtitle}
            </Text>

            {/* Benefits List */}
            <View
              style={[
                styles.perksContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.perkRow}>
                <View
                  style={[
                    styles.perkIconBadge,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={styles.perkEmoji}>⚡</Text>
                </View>
                <View style={styles.perkTextWrap}>
                  <Text style={[styles.perkHeading, { color: theme.textPrimary }]}>
                    Multi-CPO Fast Charging
                  </Text>
                  <Text style={[styles.perkSub, { color: theme.textSecondary }]}>
                    One-tap remote start across Tata Power, Jio-bp, Statiq & Kazam
                  </Text>
                </View>
              </View>

              <View style={[styles.perkDivider, { backgroundColor: theme.border }]} />

              <View style={styles.perkRow}>
                <View
                  style={[
                    styles.perkIconBadge,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={styles.perkEmoji}>🎁</Text>
                </View>
                <View style={styles.perkTextWrap}>
                  <Text style={[styles.perkHeading, { color: theme.textPrimary }]}>
                    ₹{WELCOME_BONUS_AMOUNT_RUPEES} Welcome Bonus
                  </Text>
                  <Text style={[styles.perkSub, { color: theme.textSecondary }]}>
                    Instantly credited to your Fast Wallet upon registration
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Action Button: Log In */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.88}
              onPress={() => {
                onClose();
                onLogin();
              }}
            >
              <Text style={styles.loginBtnText}>Log In ➔</Text>
            </TouchableOpacity>

            {/* Secondary Action Button: Sign Up */}
            <TouchableOpacity
              style={[
                styles.registerBtn,
                {
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
                  borderColor: theme.primary,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onRegister();
              }}
            >
              <Text style={[styles.registerBtnText, { color: theme.primary }]}>
                Sign Up (Get ₹{WELCOME_BONUS_AMOUNT_RUPEES} Bonus)
              </Text>
            </TouchableOpacity>

            {/* Tertiary / Continue Exploring */}
            <TouchableOpacity
              style={styles.continueGuestBtn}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                if (onContinueExploring) onContinueExploring();
              }}
            >
              <Text style={[styles.continueGuestText, { color: theme.textMuted }]}>
                Continue Exploring
              </Text>
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
    width: '92%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    ...shadows.elevated,
    borderWidth: 1.5,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '800',
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
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  logoGlowRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs + 2,
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  perksContainer: {
    width: '100%',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
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
  },
  perkSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  perkDivider: {
    height: 1,
    marginVertical: spacing.xs + 2,
  },
  loginBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  loginBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  registerBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: spacing.xs,
  },
  registerBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  continueGuestBtn: {
    paddingVertical: spacing.xs,
    marginTop: 2,
  },
  continueGuestText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
