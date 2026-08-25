import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useLanguage } from '../context';
import { StatusModal } from '../components';

const CM_COLORS = {
  primaryGreen: '#00D084',
  neonTeal: '#00BFA5',
  deepNavy: '#04121C',
  darkOverlay: 'rgba(4, 14, 24, 0.75)',
  glassCardBg: 'rgba(6, 20, 32, 0.90)',
  inputBg: 'rgba(2, 6, 23, 0.75)',
  subtleBorder: 'rgba(255, 255, 255, 0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
};

const GOOGLE_ACCOUNTS = [
  {
    name: 'Rahul',
    email: 'rahul@gmail.com',
    initial: 'R',
    bgColor: '#1E40AF',
  },
  {
    name: 'Abhay',
    email: 'abhay@gmail.com',
    initial: 'A',
    bgColor: '#047857',
  },
  {
    name: 'Junaid',
    email: 'junaid@gmail.com',
    initial: 'J',
    bgColor: '#7C3AED',
  },
];

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, sendPhoneOtp, loginWithPhoneOtp, loginWithGoogle, loginAsGuest, isLoading } =
    useAuth();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Sign-In Sheet State
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [signingInAccount, setSigningInAccount] = useState<string | null>(null);

  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusContent, setStatusContent] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    badge?: string;
  }>({
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    badge?: string
  ) => {
    setStatusContent({ title, message, type, badge });
    setShowStatusModal(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const raw = phoneNumber.replace(/\D/g, '');
    if (raw.length < 10) {
      showModal('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.', 'warning', 'Validation');
      return;
    }
    setIsSubmitting(true);
    const sent = await sendPhoneOtp(`+91${raw}`);
    setIsSubmitting(false);
    if (sent) {
      setOtpSent(true);
      setCountdown(30);
      showModal('OTP Code Sent 📲', `A 6-digit verification code was sent to +91 ${raw}.`, 'success', 'SMS Verification');
    } else {
      showModal('Delivery Failed', 'Could not send verification OTP. Please try again.', 'error');
    }
  };

  const handleVerifyPhoneOtp = async (codeToVerify = otp) => {
    const finalOtp = (codeToVerify || otp).trim();
    if (!finalOtp) {
      showModal('Missing OTP', 'Please enter the 6-digit verification code.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const success = await loginWithPhoneOtp(phoneNumber, finalOtp);
    setIsSubmitting(false);
    if (success) {
      try {
        navigation.replace('MainTabs');
      } catch {
        navigation.navigate('MainTabs');
      }
    } else {
      showModal('Verification Failed', 'The OTP code is invalid or has expired. Please try again.', 'error', 'Auth Error');
    }
  };

  const handlePasswordLogin = async () => {
    if (!emailOrPhone.trim()) {
      showModal('Missing Credentials', 'Please enter your registered email address or mobile number.', 'warning');
      return;
    }
    if (!password.trim()) {
      showModal('Missing Password', 'Please enter your account password.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const success = await login(emailOrPhone, password);
    setIsSubmitting(false);
    if (success) {
      try {
        navigation.replace('MainTabs');
      } catch {
        navigation.navigate('MainTabs');
      }
    } else {
      showModal('Sign In Failed', 'Invalid email/phone or password. Please verify and try again.', 'error');
    }
  };

  // Google Account Select
  const handleSelectGoogleAccount = async (account: (typeof GOOGLE_ACCOUNTS)[0]) => {
    setSigningInAccount(account.email);
    await new Promise((res) => setTimeout(res, 600)); // Realistic Google auth hand-shake
    const success = await loginWithGoogle({
      name: account.name,
      email: account.email,
    });
    setSigningInAccount(null);
    setShowGoogleSheet(false);
    if (success) {
      try {
        navigation.replace('MainTabs');
      } catch {
        navigation.navigate('MainTabs');
      }
    } else {
      showModal('Google Sign-In', 'Google sign-in could not be completed.', 'error');
    }
  };

  const handleSkip = async () => {
    await loginAsGuest();
    try {
      navigation.replace('MainTabs');
    } catch {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full-Screen Ambient EV Background Artwork */}
      <ImageBackground
        source={require('../assets/splash_bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar with Live Badge & Skip Button */}
          <View style={styles.topBar}>
            <View style={styles.liveMeshBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveMeshText}>{t('common.ocppLive')}</Text>
            </View>
            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.75}
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.skipButtonText}>{t('common.skip')} ➔</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Circular Favicon Hero Branding */}
              <View style={styles.headerSection}>
                <View style={styles.logoBadgeContainer}>
                  <Image
                    source={require('../assets/logo/cm_fevicon_logo_trans.png')}
                    style={styles.circularLogoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.brandTitle}>{t('common.appName')}</Text>
                <Text style={styles.tagline}>{t('common.tagline')}</Text>
              </View>

              {/* Main Sleek Glassmorphism Auth Card */}
              <View style={styles.card}>
                <Text style={styles.welcomeText}>{t('auth.welcomeBack')}</Text>
                <Text style={styles.instructionText}>
                  {t('auth.welcomeSubtitle')}
                </Text>

                {/* Auth Mode Toggle: Mobile OTP vs Email */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, authMode === 'phone' && styles.tabButtonActive]}
                    onPress={() => setAuthMode('phone')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, authMode === 'phone' && styles.tabTextActive]}>
                      📱 {t('auth.mobileOtp')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, authMode === 'email' && styles.tabButtonActive]}
                    onPress={() => setAuthMode('email')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, authMode === 'email' && styles.tabTextActive]}>
                      ✉️ {t('auth.emailPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {authMode === 'phone' ? (
                  /* Mobile Number & OTP Flow */
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{t('auth.mobileNumber')}</Text>
                      <View style={styles.phoneInputRow}>
                        <View style={styles.countryCodeBadge}>
                          <Text style={styles.countryFlag}>🇮🇳</Text>
                          <Text style={styles.countryCodeText}>+91</Text>
                        </View>
                        <TextInput
                          style={styles.phoneTextInput}
                          placeholder={t('auth.mobilePlaceholder')}
                          placeholderTextColor={CM_COLORS.textMuted}
                          value={phoneNumber}
                          onChangeText={(val) => {
                            setPhoneNumber(val.replace(/\D/g, '').slice(0, 10));
                            setOtpSent(false);
                          }}
                          keyboardType="phone-pad"
                          maxLength={10}
                        />
                      </View>
                    </View>

                    {otpSent && (
                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <Text style={styles.inputLabel}>{t('auth.otpLabel')}</Text>
                          <TouchableOpacity
                            onPress={handleSendOtp}
                            disabled={countdown > 0 || isSubmitting}
                          >
                            <Text
                              style={[
                                styles.resendText,
                                countdown > 0 && { color: CM_COLORS.textMuted },
                              ]}
                            >
                              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputIcon}>🔐</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder={t('auth.otpPlaceholder')}
                            placeholderTextColor={CM_COLORS.textMuted}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                          />
                        </View>
                      </View>
                    )}

                    {!otpSent ? (
                      <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.88}
                        onPress={handleSendOtp}
                        disabled={isSubmitting || isLoading}
                      >
                        {isSubmitting || isLoading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.loginButtonText}>{t('auth.getOtp')}</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.88}
                        onPress={() => handleVerifyPhoneOtp()}
                        disabled={isSubmitting || isLoading}
                      >
                        {isSubmitting || isLoading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.loginButtonText}>{t('auth.verifyContinue')}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  /* Email & Password Flow */
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{t('auth.emailLabel')}</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder={t('auth.emailPlaceholder')}
                          placeholderTextColor={CM_COLORS.textMuted}
                          value={emailOrPhone}
                          onChangeText={setEmailOrPhone}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <View style={styles.labelRow}>
                        <Text style={styles.inputLabel}>{t('auth.passwordLabel')}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            showModal(
                              'Password Reset 🔑',
                              'A password reset link and verification OTP will be sent to your registered mobile number.',
                              'info',
                              'Account Recovery'
                            )
                          }
                        >
                          <Text style={styles.forgotText}>{t('auth.forgot')}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder={t('auth.passwordPlaceholder')}
                          placeholderTextColor={CM_COLORS.textMuted}
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={styles.eyeToggle}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.loginButton}
                      activeOpacity={0.88}
                      onPress={handlePasswordLogin}
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.loginButtonText}>{t('auth.signInBtn')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Authentication Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  activeOpacity={0.85}
                  onPress={() => setShowGoogleSheet(true)}
                  disabled={isSubmitting || isLoading}
                >
                  <Text style={styles.googleIcon}>🌐</Text>
                  <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
                </TouchableOpacity>

                {/* Register Navigation Link */}
                <View style={styles.registerRow}>
                  <Text style={styles.registerPrompt}>{t('auth.newToChargeMesh')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>{t('auth.registerVehicle')} ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>

      {/* Interactive Google Sign-In Account Selector Modal */}
      <Modal
        visible={showGoogleSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoogleSheet(false)}
      >
        <View style={styles.googleModalBackdrop}>
          <View style={styles.googleModalCard}>
            <View style={styles.googleSheetHandle} />

            <View style={styles.googleHeaderRow}>
              <Text style={styles.googleBrandIcon}>🌐</Text>
              <Text style={styles.googleBrandTitle}>Sign in with Google</Text>
            </View>
            <Text style={styles.googleSubtitle}>Choose an account to continue to ChargeMesh</Text>

            <View style={styles.accountList}>
              {GOOGLE_ACCOUNTS.map((acc, index) => {
                const isThisLoading = signingInAccount === acc.email;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.accountItem}
                    activeOpacity={0.8}
                    onPress={() => handleSelectGoogleAccount(acc)}
                    disabled={signingInAccount !== null}
                  >
                    <View style={[styles.accountAvatar, { backgroundColor: acc.bgColor }]}>
                      <Text style={styles.accountAvatarText}>{acc.initial}</Text>
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{acc.name}</Text>
                      <Text style={styles.accountEmail}>{acc.email}</Text>
                    </View>
                    {isThisLoading ? (
                      <ActivityIndicator size="small" color="#1A73E8" />
                    ) : (
                      <Text style={styles.accountChevron}>➔</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.addAccountItem}
                activeOpacity={0.8}
                onPress={() => handleSelectGoogleAccount(GOOGLE_ACCOUNTS[0])}
              >
                <View style={styles.addAccountAvatar}>
                  <Text style={styles.addAccountPlus}>＋</Text>
                </View>
                <Text style={styles.addAccountText}>Use another account</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.googleCancelBtn}
              onPress={() => setShowGoogleSheet(false)}
            >
              <Text style={styles.googleCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Validation Alert Modal */}
      <StatusModal
        visible={showStatusModal}
        type={statusContent.type}
        title={statusContent.title}
        message={statusContent.message}
        badge={statusContent.badge}
        onClose={() => setShowStatusModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CM_COLORS.deepNavy,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CM_COLORS.darkOverlay,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : spacing.md,
    paddingBottom: spacing.xs,
  },
  liveMeshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CM_COLORS.primaryGreen,
    marginRight: 6,
  },
  liveMeshText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
    letterSpacing: 0.6,
  },
  skipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    ...shadows.card,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: CM_COLORS.primaryGreen,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoBadgeContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 208, 132, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CM_COLORS.primaryGreen,
    marginBottom: spacing.xs + 2,
    alignSelf: 'center',
    ...shadows.elevated,
  },
  circularLogoImage: {
    width: 42,
    height: 42,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: CM_COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12,
    color: CM_COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: CM_COLORS.glassCardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    ...shadows.elevated,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '800',
    color: CM_COLORS.textPrimary,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 12,
    color: CM_COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm - 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.22)',
    borderWidth: 1,
    borderColor: CM_COLORS.primaryGreen,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CM_COLORS.textMuted,
  },
  tabTextActive: {
    color: CM_COLORS.primaryGreen,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: CM_COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: CM_COLORS.primaryGreen,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CM_COLORS.inputBg,
    paddingHorizontal: spacing.sm + 2,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    marginRight: spacing.xs,
  },
  countryFlag: {
    fontSize: 15,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: CM_COLORS.textPrimary,
  },
  phoneTextInput: {
    flex: 1,
    height: 48,
    backgroundColor: CM_COLORS.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    paddingHorizontal: spacing.md,
    fontSize: 14.5,
    fontWeight: '600',
    color: CM_COLORS.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CM_COLORS.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: CM_COLORS.textPrimary,
    fontWeight: '500',
  },
  eyeToggle: {
    padding: spacing.xs,
  },
  eyeText: {
    fontSize: 15,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
    color: CM_COLORS.primaryGreen,
  },
  loginButton: {
    backgroundColor: CM_COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: CM_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CM_COLORS.subtleBorder,
  },
  dividerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: CM_COLORS.textMuted,
    marginHorizontal: spacing.sm,
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    ...shadows.card,
  },
  googleIcon: {
    fontSize: 17,
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: CM_COLORS.textPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerPrompt: {
    fontSize: 12.5,
    color: CM_COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
  },
  // Google Bottom Sheet Styles
  googleModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  googleModalCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
  },
  googleSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 16,
  },
  googleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  googleBrandIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  googleBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  googleSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
  },
  accountList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accountEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  accountChevron: {
    fontSize: 14,
    color: CM_COLORS.primaryGreen,
    fontWeight: '800',
  },
  addAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  addAccountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  addAccountPlus: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  addAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  googleCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  googleCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
