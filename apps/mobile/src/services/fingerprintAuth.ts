import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { FingerprintAuth } = NativeModules;

const FINGERPRINT_LOCK_KEY = '@chargemesh_fingerprint_lock_enabled_v1';
const LAST_ACTIVE_TIMESTAMP_KEY = '@chargemesh_app_last_active_ts';

export type FingerprintAvailabilityStatus =
  | 'AVAILABLE'
  | 'NOT_ENROLLED'
  | 'NOT_SUPPORTED'
  | 'HARDWARE_UNAVAILABLE'
  | 'NOT_AVAILABLE';

export interface FingerprintStatusResult {
  status: FingerprintAvailabilityStatus;
  isAvailable: boolean;
  isEnrolled: boolean;
}

export interface FingerprintAuthResult {
  success: boolean;
  error?: 'CANCELLED' | 'LOCKOUT' | 'NOT_ENROLLED' | 'ERROR' | 'ACTIVITY_NULL' | 'EXCEPTION';
  message?: string;
  errorCode?: number;
}

/**
 * Check if the device has a fingerprint sensor and has enrolled fingerprints
 */
export const checkFingerprintStatus = async (): Promise<FingerprintStatusResult> => {
  if (Platform.OS === 'android' && FingerprintAuth?.isFingerprintAvailable) {
    try {
      const res = await FingerprintAuth.isFingerprintAvailable();
      return {
        status: res.status || 'NOT_AVAILABLE',
        isAvailable: Boolean(res.isAvailable),
        isEnrolled: Boolean(res.isEnrolled),
      };
    } catch (e: any) {
      return {
        status: 'NOT_AVAILABLE',
        isAvailable: false,
        isEnrolled: false,
      };
    }
  }

  return {
    status: 'NOT_SUPPORTED',
    isAvailable: false,
    isEnrolled: false,
  };
};

/**
 * Launch Android's secure native BiometricPrompt for fingerprint authentication
 */
export const promptFingerprintAuth = async (options?: {
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
}): Promise<FingerprintAuthResult> => {
  if (Platform.OS === 'android' && FingerprintAuth?.authenticate) {
    try {
      const res = await FingerprintAuth.authenticate(
        options?.title || 'Fingerprint App Lock',
        options?.subtitle || 'Touch the fingerprint sensor to unlock ChargeMesh',
        options?.cancelLabel || 'Cancel'
      );
      return {
        success: Boolean(res.success),
        error: res.error,
        message: res.message,
        errorCode: res.errorCode,
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'EXCEPTION',
        message: e.message || 'Biometric authentication failed',
      };
    }
  }

  // Fallback for non-android environments
  return { success: true };
};

/**
 * Open device's native fingerprint / security settings
 */
export const openDeviceSecuritySettings = async (): Promise<void> => {
  if (Platform.OS === 'android' && FingerprintAuth?.openSecuritySettings) {
    try {
      await FingerprintAuth.openSecuritySettings();
    } catch {}
  }
};

/**
 * Retrieve whether Fingerprint App Lock is enabled in user settings
 */
export const getFingerprintLockEnabled = async (): Promise<boolean> => {
  try {
    const val = await AsyncStorage.getItem(FINGERPRINT_LOCK_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

/**
 * Save user preference for Fingerprint App Lock
 */
export const setFingerprintLockEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(FINGERPRINT_LOCK_KEY, enabled ? 'true' : 'false');
  } catch {}
};

/**
 * Record last active timestamp for background timeout calculation
 */
export const recordAppLastActive = async () => {
  try {
    await AsyncStorage.setItem(LAST_ACTIVE_TIMESTAMP_KEY, Date.now().toString());
  } catch {}
};

/**
 * Check if the app lock timeout has elapsed (e.g. > 15s in background or cold start)
 */
export const shouldRequireUnlockOnResume = async (): Promise<boolean> => {
  const isEnabled = await getFingerprintLockEnabled();
  if (!isEnabled) return false;

  try {
    const raw = await AsyncStorage.getItem(LAST_ACTIVE_TIMESTAMP_KEY);
    if (!raw) return true;
    const lastActive = parseInt(raw, 10);
    const elapsedMs = Date.now() - lastActive;
    return elapsedMs > 15000; // 15 seconds lock timeout
  } catch {
    return true;
  }
};
