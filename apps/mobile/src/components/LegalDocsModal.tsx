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

export type LegalDocType = 'terms' | 'refund';

interface LegalDocsModalProps {
  visible: boolean;
  docType: LegalDocType;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  visible,
  docType,
  onClose,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const docTitles: Record<LegalDocType, { title: string; subtitle: string; icon: string }> = {
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Driver service agreement & usage terms • New Delhi, India',
      icon: '📜',
    },
    refund: {
      title: 'Payment & Refund Policy',
      subtitle: 'Charging session billing & wallet refund rules',
      icon: '💳',
    },
  };

  const doc = docTitles[docType] || docTitles.terms;

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
          {/* Header */}
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
                  <Text style={styles.headerIcon}>{doc.icon}</Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {doc.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                    {doc.subtitle}
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

          {/* Scrollable Document Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {docType === 'terms' && (
              <>
                <Text style={[styles.heading, { color: theme.primary }]}>
                  1. Agreement to Terms
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  By downloading, accessing, or using the ChargeMesh application (chargemesh.com), you agree to be bound by these Terms and Conditions. ChargeMesh provides an interoperable EV roaming discovery, reservation, and session payment gateway connecting drivers with verified Charge Point Operators (CPOs) across India.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  2. EV Charging Protocol &amp; Equipment Use
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  Drivers are responsible for ensuring that their electric vehicle is mechanically and electrically compatible with the selected charger dispenser (CCS2, Type-2, GB/T) and adheres to manufacturer safety standards. ChargeMesh coordinates digital authorization and payment processing but is not responsible for physical dispenser hardware faults.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  3. Tariffs, Overstay &amp; Idle Fees
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  Tariffs are calculated per kWh delivered plus applicable statutory GST. Where designated by CPO partner locations, idle fees may apply if an EV remains plugged into a DC fast charger bay after charging has reached 100% SoC.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  4. Account Security &amp; Fair Use
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  Users must maintain the confidentiality of their login credentials. Fraudulent misuse of wallet balances, promotional codes, or unauthorized physical tampering with charging hardware is strictly prohibited.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  5. Governing Law &amp; Jurisdiction
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with ChargeMesh shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
                </Text>
              </>
            )}

            {docType === 'refund' && (
              <>
                <Text style={[styles.heading, { color: theme.primary }]}>
                  1. Charging Session Billing
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  Charging sessions are billed in real-time based on the exact energy delivered (kWh) as reported by the OCPP compliant meter on the charging dispenser. An itemized GST invoice is automatically generated upon session completion.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  2. Failed Charging Sessions &amp; Automatic Refunds
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  If a session fails to deliver energy due to a dispenser malfunction, grid power cut, or sudden connector disconnection within 3 minutes of start, any pre-authorized hold or wallet deduction is automatically released or refunded to your ChargeMesh Fast Wallet within 15 minutes.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  3. Wallet Balance Refunds
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  Unused Fast Wallet balances deposited by the driver can be refunded back to the original source bank account / UPI VPA upon request via the Support Desk (support@chargemesh.com) within 5 to 7 business days, in compliance with RBI guidelines.
                </Text>

                <Text style={[styles.heading, { color: theme.primary }]}>
                  4. Dispute Resolution
                </Text>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  For billing discrepancies, drivers may submit a ticket with the Session ID in the Help Desk or email support@chargemesh.com within 30 days of the transaction.
                </Text>
              </>
            )}
          </ScrollView>

          {/* Footer */}
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
              <Text style={styles.doneButtonText}>Done</Text>
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
    height: SCREEN_HEIGHT * 0.85,
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
    paddingBottom: 24,
  },
  heading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 10,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 19,
    marginBottom: 12,
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
