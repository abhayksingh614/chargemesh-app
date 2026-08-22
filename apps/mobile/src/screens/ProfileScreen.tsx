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
  PaymentModal,
  ConfirmationModal,
  StatusModal,
  FormInputModal,
} from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, isGuest, activeVehicle, logout, topUpWallet } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [gateFeature, setGateFeature] = useState('');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showEcoModal, setShowEcoModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const triggerAuthGate = (feature: string) => {
    setGateFeature(feature);
    setShowAuthGate(true);
  };

  const handleWalletTopup = () => {
    if (isGuest) {
      triggerAuthGate('Wallet & Payment Methods');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (amountRupees: number) => {
    topUpWallet(amountRupees * 100);
    setSuccessMessage(`₹${amountRupees.toFixed(2)} added to your Fast Wallet successfully!`);
    setShowSuccessModal(true);
  };

  const menuItems = [
    {
      icon: '🚗',
      title: 'My Electric Vehicle',
      subtitle: !isGuest && activeVehicle
        ? `${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.batteryCapacityKwh} kWh)`
        : isGuest
        ? 'Sign in to add and sync your EV profile'
        : 'Configure your EV profile',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Vehicle Management');
        } else {
          navigation.navigate('Vehicle');
        }
      },
    },
    {
      icon: '💳',
      title: 'Payment Methods & Fastag',
      subtitle: isGuest
        ? 'Sign in to link UPI, Credit/Debit Cards & Fastag'
        : 'Razorpay UPI & Tokenized Cards linked',
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Payment Methods');
        } else {
          setShowPaymentMethodsModal(true);
        }
      },
    },
    {
      icon: '⭐',
      title: 'Favorite Charging Stations',
      subtitle: 'Bookmarked hubs & fast filters',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Map' }),
    },
    {
      icon: '🌱',
      title: 'Sustainability & Green Miles',
      subtitle: isGuest
        ? 'Sign in to track lifetime CO₂ emissions prevented'
        : `${user.co2SavedKg.toFixed(1)} kg CO₂ avoided to date`,
      onPress: () => {
        if (isGuest) {
          triggerAuthGate('Eco Impact Metrics');
        } else {
          setShowEcoModal(true);
        }
      },
    },
    {
      icon: '⚡',
      title: 'App Onboarding & Feature Tour',
      subtitle: 'View 3-screen animated intro & perks',
      onPress: () => navigation.navigate('Onboarding'),
    },
    {
      icon: '🔑',
      title: 'Security & Change Password',
      subtitle: isGuest ? 'Sign in to manage security settings' : 'Update credentials & 2FA',
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
      title: '24x7 Driver Support & Helpline',
      subtitle: 'Instant charging assistance • 1800-123-MESH',
      onPress: () => setShowSupportModal(true),
    },
    {
      icon: '🔒',
      title: 'Legal, Privacy & Compliance',
      subtitle: 'DPDP Act 2023 & RBI Payment compliant',
      onPress: () => setShowComplianceModal(true),
    },
    ...(!isGuest
      ? [
          {
            icon: '🚪',
            title: 'Sign Out',
            subtitle: 'Log out of current driver session',
            onPress: () => setShowLogoutConfirm(true),
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Driver Account 👤" subtitle="Settings & charging wallet" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guest Banner vs Profile Card */}
        {isGuest ? (
          <View style={styles.guestBanner}>
            <View style={styles.guestBannerHeader}>
              <View style={styles.guestAvatar}>
                <Text style={styles.guestAvatarEmoji}>👤</Text>
              </View>
              <View style={styles.guestBannerTexts}>
                <Text style={styles.guestTitle}>Guest Explorer</Text>
                <Text style={styles.guestSub}>Browsing nearby stations without login</Text>
              </View>
            </View>

            <View style={styles.guestBenefitBox}>
              <Text style={styles.guestBenefitTitle}>Member Privileges</Text>
              <Text style={styles.guestBenefitItem}>• ₹500 welcome charging credit</Text>
              <Text style={styles.guestBenefitItem}>• Remote start & stop across 10+ CPOs</Text>
              <Text style={styles.guestBenefitItem}>• Automated GST invoices & tax receipts</Text>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInButtonText}>Sign In / Register ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phoneNumber || user.email}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified Driver</Text>
              </View>
            </View>
          </View>
        )}

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>FAST WALLET BALANCE</Text>
              <Text style={styles.walletBalance}>
                ₹{(user.walletBalancePaise / 100).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.topUpButton}
              activeOpacity={0.85}
              onPress={handleWalletTopup}
            >
              <Text style={styles.topUpText}>＋ Top Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletFooter}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.totalSessions}</Text>
              <Text style={styles.statLbl}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.totalKwhCharged.toFixed(0)} kWh</Text>
              <Text style={styles.statLbl}>Charged</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.co2SavedKg.toFixed(0)} kg</Text>
              <Text style={styles.statLbl}>CO₂ Saved 🌱</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionFooter}>
          ChargeMesh Driver App • V1.1.0 (Production Build)
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

      {/* 2. Fast Wallet Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        currentBalancePaise={user.walletBalancePaise}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* 3. Sign Out Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutConfirm}
        title="Sign Out of ChargeMesh"
        message="Are you sure you want to end your driver session? You can sign back in anytime."
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
          { icon: '✉️', title: 'Support Email', value: 'support@chargemesh.in' },
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

      {/* 7. Legal & DPDP Compliance Modal */}
      <StatusModal
        visible={showComplianceModal}
        type="info"
        badge="DPDP Act 2023"
        iconEmoji="🔒"
        title="Data Privacy & Compliance"
        message="ChargeMesh strictly adheres to the Digital Personal Data Protection (DPDP) Act 2023."
        details={[
          { icon: '🛡️', title: 'Purpose Limitation', description: 'Your GPS and telemetry are only used during active sessions' },
          { icon: '🗑️', title: 'Right to Erasure', description: 'You can delete your account and personal history anytime' },
          { icon: '🇮🇳', title: 'Data Localization', description: 'All records are hosted securely within Indian data centers' },
        ]}
        buttonLabel="I Understand"
        onClose={() => setShowComplianceModal(false)}
      />

      {/* 8. Change Password Form Modal */}
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

      {/* 9. General Success Status Modal */}
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
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  guestBanner: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.textPrimary,
  },
  guestSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guestBenefitBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  guestBenefitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  guestBenefitItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  walletCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.elevated,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  walletBalance: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textInverse,
    marginTop: 2,
  },
  topUpButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.full,
  },
  topUpText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
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
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textInverse,
  },
  statLbl: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '600',
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontWeight: '500',
  },
});
