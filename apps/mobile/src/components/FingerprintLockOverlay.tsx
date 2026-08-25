import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { promptFingerprintAuth } from '../services/fingerprintAuth';
import { borderRadius, shadows } from '../theme';
import { useTheme } from '../context';

interface FingerprintLockOverlayProps {
  visible: boolean;
  onUnlocked: () => void;
}

export const FingerprintLockOverlay: React.FC<FingerprintLockOverlayProps> = ({
  visible,
  onUnlocked,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const triggerAuth = useCallback(async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthError(null);

    const result = await promptFingerprintAuth({
      title: 'ChargeMesh App Lock',
      subtitle: 'Touch the fingerprint sensor to unlock',
      cancelLabel: 'Cancel',
    });

    setIsAuthenticating(false);

    if (result.success) {
      onUnlocked();
    } else {
      if (result.error === 'CANCELLED') {
        setAuthError('Authentication cancelled. Tap below to unlock.');
      } else if (result.error === 'LOCKOUT') {
        setAuthError('Too many failed attempts. Biometric sensor temporarily locked by device.');
      } else {
        setAuthError(result.message || 'Fingerprint not recognized. Please try again.');
      }
    }
  }, [isAuthenticating, onUnlocked]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (visible) {
      // Trigger native biometric prompt when overlay becomes visible
      timer = setTimeout(() => {
        triggerAuth();
      }, 350);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, triggerAuth]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? '#070E17' : '#0B192C' },
        ]}
      >
        {/* Header Branding */}
        <View style={styles.brandingHeader}>
          <Text style={styles.brandTitle}>ChargeMesh</Text>
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>🔒 APP LOCKED</Text>
          </View>
        </View>

        {/* Central Fingerprint Icon */}
        <View style={styles.centerContent}>
          <Animated.View
            style={[
              styles.iconCircleOuter,
              {
                borderColor: authError ? '#EF4444' : 'rgba(0, 208, 132, 0.4)',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircleInner,
                {
                  backgroundColor: authError
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(0, 208, 132, 0.15)',
                },
              ]}
            >
              <Text style={styles.fingerprintEmoji}>👆</Text>
            </View>
          </Animated.View>

          <Text style={styles.promptTitle}>Fingerprint App Lock</Text>
          <Text style={styles.promptSubtitle}>
            Touch your device fingerprint sensor to securely unlock ChargeMesh.
          </Text>

          {authError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {authError}</Text>
            </View>
          ) : null}

          {isAuthenticating && (
            <View style={styles.authenticatingRow}>
              <ActivityIndicator size="small" color="#00D084" />
              <Text style={styles.authenticatingText}>Waiting for fingerprint sensor...</Text>
            </View>
          )}
        </View>

        {/* Bottom Unlock Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.unlockButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.88}
            onPress={triggerAuth}
          >
            <Text style={styles.unlockButtonText}>Unlock with Fingerprint 👆</Text>
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            🔒 Secured by Android BiometricPrompt Hardware Keystore
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandingHeader: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  lockBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  iconCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprintEmoji: {
    fontSize: 48,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  errorContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '700',
    textAlign: 'center',
  },
  authenticatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  authenticatingText: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '600',
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
  },
  unlockButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  unlockButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  securityNote: {
    marginTop: 14,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
});
