import React, { useState } from 'react';
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

const EV_MODELS = [
  'Tata Nexon EV (Max / Empowered)',
  'Tata Punch EV / Tiago EV',
  'MG ZS EV / Windsor EV',
  'Mahindra XUV400 EV',
  'Hyundai Ioniq 5 / Kona',
  'BYD Atto 3 / Seal',
  'Ather 450X / 450S (2W)',
  'Ola S1 Pro / Air (2W)',
  'Other EV Model',
];

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, loginWithGoogle, loginAsGuest, isLoading } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEv, setSelectedEv] = useState(EV_MODELS[0]);
  const [password, setPassword] = useState('');
  const [showEvDropdown, setShowEvDropdown] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal
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

  const handleRegister = async () => {
    if (!name.trim()) {
      showModal('Name Required', 'Please enter your full name.', 'warning', 'Validation');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showModal('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.', 'warning', 'Validation');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showModal('Invalid Email Address', 'Please provide a valid email address for tax invoices.', 'warning', 'Validation');
      return;
    }
    if (!agreeTerms) {
      showModal('Terms Required', 'Please accept the DPDP terms to complete driver registration.', 'warning', 'Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    const success = await register(name, email, `+91 ${cleanPhone}`, password, selectedEv);
    setIsSubmitting(false);

    if (success) {
      showModal(
        'Welcome to ChargeMesh! ⚡',
        'Your driver account is active. ₹100 welcome charging credit has been credited to your Fast Wallet.',
        'success',
        'Registration Complete'
      );
      setTimeout(() => {
        try {
          navigation.replace('MainTabs');
        } catch {
          navigation.navigate('MainTabs');
        }
      }, 1200);
    } else {
      showModal('Registration Failed', 'Could not create account. Please check your credentials and try again.', 'error');
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    const success = await loginWithGoogle();
    setIsSubmitting(false);
    if (success) {
      try {
        navigation.replace('MainTabs');
      } catch {
        navigation.navigate('MainTabs');
      }
    } else {
      showModal('Google Sign-Up', 'Google sign-up could not be completed at this time.', 'error');
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

      {/* Dark Translucent Overlay */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar with Back and Top-Right Skip Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.75}
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
              {/* Header Branding */}
              <View style={styles.headerSection}>
                <View style={styles.logoBadgeContainer}>
                  <Image
                    source={require('../assets/logo/cm_fevicon_logo_trans.png')}
                    style={styles.circularLogoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>{t('auth.createAccountTitle')}</Text>
                <Text style={styles.subtitle}>
                  {t('auth.createAccountSubtitle')}
                </Text>
              </View>

              {/* Form Glass Card */}
              <View style={styles.card}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.fullNameLabel')} *</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.fullNamePlaceholder')}
                      placeholderTextColor={CM_COLORS.textMuted}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Mobile Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.mobileNumber')} *</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryFlag}>🇮🇳</Text>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneTextInput}
                      placeholder={t('auth.mobilePlaceholder')}
                      placeholderTextColor={CM_COLORS.textMuted}
                      value={phone}
                      onChangeText={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.emailLabel')} *</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={CM_COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Primary EV Model Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.primaryEvLabel')} *</Text>
                  <TouchableOpacity
                    style={styles.evDropdownButton}
                    onPress={() => setShowEvDropdown(!showEvDropdown)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.inputIcon}>🚗</Text>
                    <Text style={styles.evDropdownText} numberOfLines={1}>
                      {selectedEv}
                    </Text>
                    <Text style={styles.evDropdownArrow}>{showEvDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {showEvDropdown && (
                    <View style={styles.dropdownList}>
                      {EV_MODELS.map((ev, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dropdownItem,
                            selectedEv === ev && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setSelectedEv(ev);
                            setShowEvDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedEv === ev && styles.dropdownItemTextActive,
                            ]}
                          >
                            {ev}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Optional Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.passwordLabel')}</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.passwordPlaceholder')}
                      placeholderTextColor={CM_COLORS.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* DPDP Compliance Agreement */}
                <TouchableOpacity
                  style={styles.termsRow}
                  activeOpacity={0.8}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                    {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>
                    {t('auth.agreeTerms')}
                  </Text>
                </TouchableOpacity>

                {/* Register Submit Button */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isSubmitting || isLoading}
                  activeOpacity={0.88}
                >
                  {isSubmitting || isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.registerButtonText}>{t('auth.registerBtn')} ➔</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Quick Sign-Up */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignUp}
                  activeOpacity={0.85}
                  disabled={isSubmitting || isLoading}
                >
                  <Text style={styles.googleIcon}>🌐</Text>
                  <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.loginRow}>
                  <Text style={styles.loginPrompt}>{t('auth.alreadyRegistered')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>{t('auth.signInBtn')} ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>

      {/* Validation Status Modal */}
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
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: CM_COLORS.textPrimary,
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: CM_COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: CM_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: CM_COLORS.glassCardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    ...shadows.elevated,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '800',
    color: CM_COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
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
  input: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: CM_COLORS.textPrimary,
    fontWeight: '500',
  },
  evDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CM_COLORS.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  evDropdownText: {
    flex: 1,
    fontSize: 13.5,
    color: CM_COLORS.textPrimary,
    fontWeight: '600',
  },
  evDropdownArrow: {
    fontSize: 11,
    color: CM_COLORS.primaryGreen,
  },
  dropdownList: {
    backgroundColor: 'rgba(4, 18, 28, 0.95)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
  dropdownItemText: {
    fontSize: 13,
    color: CM_COLORS.textSecondary,
  },
  dropdownItemTextActive: {
    color: CM_COLORS.primaryGreen,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: CM_COLORS.subtleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: CM_COLORS.inputBg,
  },
  checkboxActive: {
    backgroundColor: CM_COLORS.primaryGreen,
    borderColor: CM_COLORS.primaryGreen,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    color: CM_COLORS.textSecondary,
    lineHeight: 16,
  },
  termsLink: {
    color: CM_COLORS.primaryGreen,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: CM_COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: CM_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md + 2,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginPrompt: {
    fontSize: 12.5,
    color: CM_COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
  },
});
