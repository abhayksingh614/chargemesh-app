import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { borderRadius, shadows } from '../theme';
import { useTheme } from '../context';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Top Drag Indicator & Header */}
          <View style={styles.headerArea}>
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(0, 208, 132, 0.15)'
                        : '#DCFCE7',
                    },
                  ]}
                >
                  <Text style={styles.headerIcon}>🛡️</Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    Privacy Policy
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                    Last updated: 24 August 2026 • DPDP Act 2023 Compliant
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#F1F5F9',
                    borderColor: theme.border,
                  },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.closeBtnText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Policy Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Introduction */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                1. Introduction &amp; Scope
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                Welcome to ChargeMesh. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy outlines how ChargeMesh collects, processes, stores, and protects personal data when you use our mobile application, EV roaming aggregation services, and connected charging solutions.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                By creating an account or using ChargeMesh, you consent to the data practices described in this policy, formulated in compliance with the Digital Personal Data Protection (DPDP) Act 2023 and relevant regulations.
              </Text>
            </View>

            {/* Information We Collect */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                2. Information We Collect
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                We collect only the information strictly necessary to provide reliable EV charging discovery, session management, and transaction settlements:
              </Text>
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : '#F8FAFC',
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.bulletTitle, { color: theme.textPrimary }]}>
                  • Personal &amp; Account Details:
                </Text>
                <Text style={[styles.bulletBody, { color: theme.textSecondary }]}>
                  Name, verified mobile number, email address, and authentication credentials.
                </Text>

                <Text style={[styles.bulletTitle, { color: theme.textPrimary, marginTop: 8 }]}>
                  • Electric Vehicle (EV) Specifications:
                </Text>
                <Text style={[styles.bulletBody, { color: theme.textSecondary }]}>
                  Make, model, variant, battery capacity (kWh), maximum supported charging power (kW), and connector gun types (e.g. CCS2, Type-2, GB/T).
                </Text>

                <Text style={[styles.bulletTitle, { color: theme.textPrimary, marginTop: 8 }]}>
                  • Location &amp; Telemetry Data:
                </Text>
                <Text style={[styles.bulletBody, { color: theme.textSecondary }]}>
                  Precise GPS coordinates collected during app use to discover nearest charging stations, provide turn-by-turn navigation, and calculate travel distances.
                </Text>

                <Text style={[styles.bulletTitle, { color: theme.textPrimary, marginTop: 8 }]}>
                  • Charging Session &amp; Transaction Records:
                </Text>
                <Text style={[styles.bulletBody, { color: theme.textSecondary }]}>
                  Charging duration, energy delivered (kWh), peak power, station identifier, CPO network, tariff breakdown, and GST tax invoice receipts.
                </Text>

                <Text style={[styles.bulletTitle, { color: theme.textPrimary, marginTop: 8 }]}>
                  • Payment &amp; Wallet Identifiers:
                </Text>
                <Text style={[styles.bulletBody, { color: theme.textSecondary }]}>
                  Tokenized payment tokens, UPI VPA handles, wallet balances, and FASTag account identifiers for automatic toll plaza charging.
                </Text>
              </View>
            </View>

            {/* How We Use Data */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                3. How We Use Your Data
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                Your data is processed strictly for legitimate operational purposes:
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                1. <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Charging Discovery:</Text> Matching your EV model with compatible live stations across 10+ CPO networks.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                2. <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Remote Session Control:</Text> Sending OCPP start/stop commands to charging dispensers via secure WebSockets.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textPrimary }]}>
                3. <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Automated Invoicing &amp; Taxes:</Text> Generating legal GST receipts and recording energy consumption.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                4. <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Safety &amp; Fraud Prevention:</Text> Preventing unauthorized session access and monitoring bay availability.
              </Text>
            </View>

            {/* Location Data */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                4. Location Data Protection
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                ChargeMesh collects foreground location coordinates only when the app is active to compute real-time distances to charging hubs. We do NOT track your background location continuously when the app is closed. You can revoke location permissions at any time via your device settings.
              </Text>
            </View>

            {/* Payment Data Security */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                5. Payment Processing &amp; Card Security
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                All financial payments are handled by RBI-authorized Payment Aggregators (such as Razorpay) using end-to-end AES-256 encryption and RBI-mandated card tokenization. ChargeMesh never stores raw debit/credit card numbers or CVVs on our servers.
              </Text>
            </View>

            {/* Data Sharing */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                6. Data Sharing &amp; Third Parties
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                We do not sell your personal data. We only share necessary parameters with authorized ecosystem partners:
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Charge Point Operators (CPOs):</Text> Station identifiers and session tokens to authorize charging.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textPrimary }]}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Mapping Services:</Text> Coordinates for routing via Apple Maps / OpenStreetMap / MapLibre.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textPrimary }]}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Cloud Infrastructure:</Text> Secure ISO/IEC 27001 certified cloud servers located within the Republic of India.
              </Text>
            </View>

            {/* User Rights */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                7. Your Privacy Rights (DPDP Act)
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                Under Indian data protection laws, you possess the right to:
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                • Request access to personal data held by ChargeMesh.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                • Correct outdated or inaccurate account records.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                • Request complete deletion/erasure of your profile and charging history.
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                • Withdraw consent for marketing and non-essential telemetry.
              </Text>
            </View>

            {/* Data Retention & Security */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                8. Retention &amp; Security Controls
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                We retain account records for as long as your account remains active. Transaction logs are retained as required by Indian taxation laws. All stored information is protected by multi-factor authentication, TLS 1.3 encryption in transit, and localized database encryption.
              </Text>
            </View>

            {/* Grievance Redressal */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                9. Grievance Officer &amp; Inquiries
              </Text>
              <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                For any privacy requests, questions, or grievances regarding your data, please contact our designated Data Protection Officer:
              </Text>
              <View
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0, 208, 132, 0.08)'
                      : '#F0FDF4',
                    borderColor: isDark
                      ? 'rgba(0, 208, 132, 0.25)'
                      : '#BBF7D0',
                  },
                ]}
              >
                <Text style={[styles.contactTitle, { color: theme.textPrimary }]}>
                  ChargeMesh Privacy &amp; Data Protection Desk
                </Text>
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                  📧 Privacy: privacy@chargemesh.com • Info: info@chargemesh.com
                </Text>
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                  📞 Support Helpline: 1800-123-6374 (Mon–Sat, 9AM–6PM IST)
                </Text>
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                  📍 New Delhi, India
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <View
            style={[
              styles.footerArea,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
              onPress={onClose}
              activeOpacity={0.88}
            >
              <Text style={styles.doneButtonText}>I Understand &amp; Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    ...shadows.card,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 19,
    marginBottom: 8,
  },
  infoBox: {
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  bulletTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  bulletBody: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 2,
  },
  contactCard: {
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  footerArea: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  doneButton: {
    height: 46,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
