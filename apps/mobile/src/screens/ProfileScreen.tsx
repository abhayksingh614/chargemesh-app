import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Header,
  AuthGateModal,
  ConfirmationModal,
  StatusModal,
  FormInputModal,
  LanguageToggle,
  PrivacyPolicyModal,
  DataPrivacyModal,
  ReleaseUpdatesModal,
  LegalDocsModal,
  LegalDocType,
} from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useLanguage, useTheme } from '../context';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, vehicles, isGuest, activeVehicle, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [gateFeature, setGateFeature] = useState('');

  // Modals state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showEcoModal, setShowEcoModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New Legal, Privacy, and Release Modals
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showDataPrivacyModal, setShowDataPrivacyModal] = useState(false);
  const [showReleaseUpdatesModal, setShowReleaseUpdatesModal] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('terms');
  const [showLegalDocModal, setShowLegalDocModal] = useState(false);

  const triggerAuthGate = (feature: string) => {
    setGateFeature(feature);
    setShowAuthGate(true);
  };

  const handleWalletTopup = () => {
    if (isGuest) {
      triggerAuthGate(t('profile.walletTitle'));
      return;
    }
    navigation.navigate('AddMoney');
  };

  const openLegalDoc = (type: LegalDocType) => {
    setLegalDocType(type);
    setShowLegalDocModal(true);
  };

  // Group 1: Account & Connected Vehicles
  const accountItems = [
    {
      icon: '👤',
      title: t('account.pageTitle'),
      subtitle: 'Personal info, phone, email & preferences',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('My Account');
        } else {
          navigation.navigate('MyAccount');
        }
      },
    },
    {
      icon: '🚗',
      title: 'My Vehicles',
      subtitle: !isGuest && activeVehicle
        ? `Primary: ${activeVehicle.make} ${activeVehicle.model} • ${vehicles.length} in garage`
        : isGuest
        ? 'Sign in to add and sync your EV profile'
        : 'Manage your connected EVs and primary car',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Vehicle Management');
        } else {
          navigation.navigate('MyVehicles');
        }
      },
    },
    {
      icon: '💳',
      title: 'Payment Methods & FASTag',
      subtitle: 'UPI autopay, cards & expressway FASTag balance',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Payment Methods');
        } else {
          navigation.navigate('PaymentMethods');
        }
      },
    },
    {
      icon: '⭐',
      title: 'Favorite Stations',
      subtitle: 'Saved charging stations for 1-tap quick access',
      onPress: () => navigation.navigate('Favorites'),
    },
  ];

  // Group 2: Charging Activity & Sustainability
  const activityItems = [
    {
      icon: '⚡',
      title: 'Charging Activity',
      subtitle: 'Charging sessions, energy delivered & GST invoices',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Activity' }),
    },
    {
      icon: '🌱',
      title: 'Eco & Sustainability',
      subtitle: !isGuest && user?.co2SavedKg
        ? `${user.co2SavedKg.toFixed(0)} kg CO₂ prevented • Verified green impact`
        : '351 kg CO₂ prevented • Verified green impact',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Eco Impact Metrics');
        } else {
          navigation.navigate('EcoSustainability');
        }
      },
    },
  ];

  // Group 3: Release Updates / What's New
  const updateItems = [
    {
      icon: '✨',
      title: 'Release Updates',
      subtitle: 'v1.2.5 • See what’s new, fixes & features',
      badge: 'v1.2.5',
      onPress: () => setShowReleaseUpdatesModal(true),
    },
  ];

  // Group 4: Legal & Privacy Section
  const legalItems = [
    {
      icon: '🛡️',
      title: 'Privacy Policy',
      subtitle: 'DPDP Act 2023 compliance, data collection & usage',
      onPress: () => setShowPrivacyPolicyModal(true),
    },
    {
      icon: '🔒',
      title: 'Permissions & Privacy',
      subtitle: 'Review device permissions & data controls',
      onPress: () => setShowDataPrivacyModal(true),
    },
    {
      icon: '📜',
      title: 'Terms & Conditions',
      subtitle: 'Driver service agreement & charging protocol rules',
      onPress: () => openLegalDoc('terms'),
    },
    {
      icon: '💳',
      title: 'Payment & Refund Policy',
      subtitle: 'Session billing, automatic refunds & wallet terms',
      onPress: () => openLegalDoc('refund'),
    },
  ];

  // Group 5: Preferences & Support
  const preferenceItems = [
    {
      icon: '🌐',
      title: t('profile.menuLanguage'),
      subtitle: language === 'hi' ? 'वर्तमान भाषा: हिन्दी (बदलने के लिए टैप करें)' : 'Current Language: English (Tap to switch)',
      onPress: () => toggleLanguage(),
      isLanguageItem: true,
    },
    {
      icon: '🔑',
      title: t('profile.menuSecurity'),
      subtitle: t('profile.menuSecuritySub'),
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Account Security');
        } else {
          setShowChangePasswordModal(true);
        }
      },
    },
    {
      icon: '💬',
      title: t('profile.menuHelp'),
      subtitle: t('profile.menuHelpSub'),
      onPress: () => setShowSupportModal(true),
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={t('profile.title')}
        subtitle={t('common.appName') + ' Profile & Settings'}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guest Banner vs Profile Card */}
        {isGuest ? (
          <View
            style={[
              styles.guestBanner,
              {
                backgroundColor: isDark ? '#071826' : '#ECFDF5',
                borderColor: isDark ? 'rgba(0, 208, 132, 0.3)' : '#A7F3D0',
              },
            ]}
          >
            <View style={styles.guestBannerHeader}>
              <View style={styles.guestAvatar}>
                <Text style={styles.guestAvatarEmoji}>👤</Text>
              </View>
              <View style={styles.guestBannerTexts}>
                <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>Guest Explorer</Text>
                <Text style={[styles.guestSub, { color: theme.textSecondary }]}>Browsing nearby stations without login</Text>
              </View>
            </View>

            <View
              style={[
                styles.guestBenefitBox,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF' },
              ]}
            >
              <Text style={[styles.guestBenefitTitle, { color: theme.primary }]}>Member Privileges</Text>
              <Text style={[styles.guestBenefitItem, { color: theme.textSecondary }]}>• ₹100 welcome charging credit</Text>
              <Text style={[styles.guestBenefitItem, { color: theme.textSecondary }]}>• Remote start &amp; stop across 10+ CPOs</Text>
              <Text style={[styles.guestBenefitItem, { color: theme.textSecondary }]}>• Automated GST invoices &amp; tax receipts</Text>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInButtonText}>Sign In / Register ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => navigation.navigate('MyAccount')}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{user?.avatarUrl || user?.name?.charAt(0) || '👤'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user.phoneNumber || user.email}</Text>
              <View
                style={[
                  styles.verifiedBadge,
                  {
                    backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#ECFDF5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verifiedText,
                    { color: isDark ? '#00D084' : '#064E3B' },
                  ]}
                >
                  ✓ Verified Driver • View Profile ➔
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Wallet Balance Card */}
        <View
          style={[
            styles.walletCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#064E3B',
            },
          ]}
        >
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>FAST WALLET BALANCE</Text>
              <Text style={styles.walletBalance}>
                ₹{(user.walletBalancePaise / 100).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.topUpButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
              onPress={handleWalletTopup}
            >
              <Text style={styles.topUpText}>{t('profile.topUpBtn')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletFooter}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.totalSessions}</Text>
              <Text style={styles.statLbl}>{t('profile.statsSessions')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.totalKwhCharged.toFixed(0)} kWh</Text>
              <Text style={styles.statLbl}>{t('liveCharging.energyDelivered')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.co2SavedKg.toFixed(0)} kg</Text>
              <Text style={styles.statLbl}>{t('profile.statsCo2')} 🌱</Text>
            </View>
          </View>
        </View>

        {/* 1. Account & Vehicles Group */}
        <Text style={[styles.groupHeading, { color: theme.textSecondary }]}>ACCOUNT &amp; VEHICLES</Text>
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {accountItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < accountItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                  },
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Activity & Sustainability Group */}
        <Text style={[styles.groupHeading, { color: theme.textSecondary }]}>ACTIVITY &amp; SUSTAINABILITY</Text>
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {activityItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < activityItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                  },
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Product Updates & What's New Group */}
        <Text style={[styles.groupHeading, { color: theme.textSecondary }]}>PRODUCT UPDATES</Text>
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {updateItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7',
                  },
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                  {item.badge && (
                    <View style={styles.updateBadge}>
                      <Text style={styles.updateBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Legal & Privacy Group */}
        <Text style={[styles.groupHeading, { color: theme.textSecondary }]}>LEGAL &amp; PRIVACY</Text>
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {legalItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < legalItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                  },
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. Preferences & Support Group */}
        <Text style={[styles.groupHeading, { color: theme.textSecondary }]}>PREFERENCES &amp; SUPPORT</Text>
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {preferenceItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < preferenceItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary,
                  },
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              {item.isLanguageItem ? (
                <LanguageToggle />
              ) : (
                <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. Prominent Full-Width Red Log Out Button at the Bottom */}
        {!isGuest && (
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[
                styles.largeLogoutBtn,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECDD3',
                },
              ]}
              onPress={() => setShowLogoutConfirm(true)}
              activeOpacity={0.82}
            >
              <Text style={styles.logoutBtnIcon}>🔴</Text>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.versionFooter, { color: theme.textMuted }]}>
          {t('profile.appVersion')} • ChargeMesh Universal EV Network
        </Text>
      </ScrollView>

      {/* 1. Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName={gateFeature}
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      {/* 2. Dedicated Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to log out of your ChargeMesh account?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* 4. Driver Support Status Modal */}
      <StatusModal
        visible={showSupportModal}
        type="info"
        badge="24x7 Driver Support"
        iconEmoji="💬"
        title="ChargeMesh Help Center"
        message="We are here to ensure uninterrupted EV charging across all networks."
        details={[
          { icon: '📞', title: 'Toll-Free Helpline', value: '1800-123-6374' },
          { icon: '✉️', title: 'Support Email', value: 'support@chargemesh.com' },
          { icon: '⚡', title: 'On-Site CPO Escalation', description: 'Real-time connector reset & technician dispatch' },
        ]}
        buttonLabel="Close"
        onClose={() => setShowSupportModal(false)}
      />

      {/* 5. Sustainability / Eco Impact Modal */}
      <StatusModal
        visible={showEcoModal}
        type="success"
        badge="Sustainability 🌱"
        iconEmoji="🌍"
        title="Your Clean Mobility Impact"
        message="By charging with ChargeMesh, you prevent fossil fuel combustion and accelerate India's clean energy transition."
        details={[
          { icon: '⚡', title: 'Total Clean Energy', value: `${user.totalKwhCharged.toFixed(1)} kWh` },
          { icon: '🌱', title: 'CO₂ Prevented', value: `${user.co2SavedKg.toFixed(1)} kg` },
          { icon: '🌳', title: 'Tree Equivalent', value: '16 Trees Planted' },
        ]}
        buttonLabel="Awesome!"
        onClose={() => setShowEcoModal(false)}
      />

      {/* 6. Payment Methods Info Modal */}
      <StatusModal
        visible={showPaymentMethodsModal}
        type="payment"
        badge="Payment Security"
        iconEmoji="💳"
        title="Connected Payment Methods"
        message="ChargeMesh tokenizes all payment data in compliance with RBI standards. No raw card numbers are stored."
        details={[
          { icon: '📲', title: 'UPI Autopay', description: 'Instant auto-debit for completed charging sessions' },
          { icon: '🚗', title: 'Fastag Auto-Debit', description: 'Direct highway toll and plaza charging sync' },
          { icon: '🔒', title: 'RBI Card Tokenization', description: 'AES-256 encrypted gateway with Razorpay' },
        ]}
        buttonLabel="Done"
        onClose={() => setShowPaymentMethodsModal(false)}
      />

      {/* 7. Detailed Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
      />

      {/* 8. Data Privacy & Permissions Modal */}
      <DataPrivacyModal
        visible={showDataPrivacyModal}
        onClose={() => setShowDataPrivacyModal(false)}
        onRequestDataExport={() => {
          setShowDataPrivacyModal(false);
          setSuccessMessage('Your data export archive has been generated and queued for email delivery.');
          setShowSuccessModal(true);
        }}
        onRequestDataDeletion={() => {
          setShowDataPrivacyModal(false);
          setSuccessMessage('Your data deletion request has been submitted to the Grievance Officer.');
          setShowSuccessModal(true);
        }}
      />

      {/* 9. Release Updates / What's New Modal */}
      <ReleaseUpdatesModal
        visible={showReleaseUpdatesModal}
        onClose={() => setShowReleaseUpdatesModal(false)}
      />

      {/* 10. Legal Documents Modal (Terms, Refund, Open Source) */}
      <LegalDocsModal
        visible={showLegalDocModal}
        docType={legalDocType}
        onClose={() => setShowLegalDocModal(false)}
      />

      {/* 11. Change Password Form Modal */}
      <FormInputModal
        visible={showChangePasswordModal}
        badge="Account Security"
        iconEmoji="🔑"
        title="Change Password"
        subtitle="Enter your current password and choose a new secure password."
        submitLabel="Update Password"
        fields={[
          { key: 'current', label: 'Current Password', secureTextEntry: true, required: true },
          { key: 'newPass', label: 'New Password (min 8 chars)', secureTextEntry: true, required: true },
          { key: 'confirmPass', label: 'Confirm New Password', secureTextEntry: true, required: true },
        ]}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={async (values) => {
          if (!values.current || !values.newPass) return;
          setSuccessMessage('Your password has been updated successfully!');
          setShowSuccessModal(true);
        }}
      />

      {/* 12. General Success Status Modal */}
      <StatusModal
        visible={showSuccessModal}
        type="success"
        title="Operation Successful"
        message={successMessage}
        buttonLabel="Done"
        onClose={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  guestBanner: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  guestBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guestAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  guestAvatarEmoji: {
    fontSize: 22,
  },
  guestBannerTexts: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  guestSub: {
    fontSize: 12,
    marginTop: 2,
  },
  guestBenefitBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.2)',
  },
  guestBenefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  guestBenefitItem: {
    fontSize: 11.5,
    marginTop: 2,
  },
  signInButton: {
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    ...shadows.card,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userPhone: {
    fontSize: 12,
    marginTop: 1,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: 5,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  walletCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  walletBalance: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  topUpButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  topUpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: spacing.md,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statLbl: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  groupHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuContainer: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 15,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  updateBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  updateBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  menuArrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 22,
    marginBottom: 4,
  },
  largeLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    borderWidth: 1.2,
    gap: 8,
  },
  logoutBtnIcon: {
    fontSize: 14,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: spacing.xl,
    fontWeight: '500',
  },
});



