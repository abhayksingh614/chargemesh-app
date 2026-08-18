import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { mockDefaultVehicle } from '../services/mockData';
import { Header } from '../components';
import { colors, typography, borderRadius, shadows } from '../theme';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const menuItems = [
    {
      icon: '🚗',
      title: 'My Electric Vehicle',
      subtitle: `${mockDefaultVehicle.make} ${mockDefaultVehicle.model}`,
      onPress: () => navigation.navigate('Vehicle'),
    },
    {
      icon: '💳',
      title: 'Payment Methods',
      subtitle: 'Razorpay UPI linked',
      onPress: () => Alert.alert('Payment Methods', 'Razorpay UPI / Cards configuration'),
    },
    {
      icon: '⭐',
      title: 'Saved Charging Stations',
      subtitle: '3 favorite locations',
      onPress: () => Alert.alert('Saved Stations', 'You have 3 bookmarked stations'),
    },
    {
      icon: '🌱',
      title: 'Sustainability & Eco Impact',
      subtitle: '76.7 kg CO₂ avoided to date',
      onPress: () => Alert.alert('Eco Impact', 'Total CO₂ avoided: 76.7 kg based on India Grid emission factors'),
    },
    {
      icon: '💬',
      title: 'Help & 24x7 Support',
      subtitle: 'Instant charging assistance & tickets',
      onPress: () => Alert.alert('24x7 Support', 'Contact ChargeMesh support: 1800-123-MESH'),
    },
    {
      icon: '🔒',
      title: 'Privacy & Terms of Service',
      subtitle: 'DPDP 2023 compliant data governance',
      onPress: () => Alert.alert('Privacy & Terms', 'ChargeMesh is compliant with DPDP 2023 guidelines'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Profile 👤"
        subtitle="Driver account & preferences"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Abhay Singh</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
            <Text style={styles.verifiedBadge}>✓ Verified EV Driver</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={styles.menuRow}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version & Non-negotiables */}
        <View style={styles.footer}>
          <Text style={styles.appVersion}>ChargeMesh Driver App • v0.1.0</Text>
          <Text style={styles.complianceNote}>
            Connected via OCPI 2.3.0 Interoperability Hub
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    ...shadows.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 4,
    fontSize: 11,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  appVersion: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  complianceNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 11,
  },
});
