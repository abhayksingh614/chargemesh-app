import React, { useState } from 'react';
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

interface ReleaseUpdatesModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReleaseUpdatesModal: React.FC<ReleaseUpdatesModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const [selectedVersion, setSelectedVersion] = useState<'1.2.5' | '1.2.0' | '1.1.0'>('1.2.5');

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
                  <Text style={styles.headerIcon}>✨</Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    ChargeMesh Updates
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.primary }]}>
                    v{selectedVersion} • Released 24 Aug 2026
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

            {/* Version Filter Tabs */}
            <View style={styles.versionTabsRow}>
              {(['1.2.5', '1.2.0', '1.1.0'] as const).map((ver) => (
                <TouchableOpacity
                  key={ver}
                  style={[
                    styles.versionTab,
                    selectedVersion === ver && {
                      backgroundColor: theme.primaryLight,
                      borderColor: theme.primary,
                    },
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setSelectedVersion(ver)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.versionTabText,
                      { color: theme.textSecondary },
                      selectedVersion === ver && { color: theme.primary, fontWeight: '800' },
                    ]}
                  >
                    v{ver} {ver === '1.2.5' ? ' (Latest)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Scrollable Changelog Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedVersion === '1.2.5' && (
              <>
                {/* 🚀 New Features */}
                <View style={styles.changeGroup}>
                  <View style={styles.categoryHeaderRow}>
                    <View style={[styles.catBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.catBadgeText, { color: '#16A34A' }]}>🚀 NEW</Text>
                    </View>
                    <Text style={[styles.catHeading, { color: theme.textPrimary }]}>
                      New Capabilities
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.changeCard,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      ⭐ Favorite Charging Stations
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Bookmark frequently used charging stations across India for 1-tap quick navigation and instant bay availability alerts.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      🗺️ Direct Turn-by-Turn Navigation
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Tap "Navigate ➔" on any charging station card to launch live driving directions directly in Google Maps or Apple Maps.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      🚗 Wallet &amp; FASTag Plaza Sync
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Auto-debit support for seamless highway toll and EV plaza charging with unified GST receipts.
                    </Text>
                  </View>
                </View>

                {/* ✨ Improvements */}
                <View style={styles.changeGroup}>
                  <View style={styles.categoryHeaderRow}>
                    <View style={[styles.catBadge, { backgroundColor: '#E0E7FF' }]}>
                      <Text style={[styles.catBadgeText, { color: '#4F46E5' }]}>✨ IMPROVED</Text>
                    </View>
                    <Text style={[styles.catHeading, { color: theme.textPrimary }]}>
                      UI &amp; Experience Upgrades
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.changeCard,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      📱 Map Station Card Visibility
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Redesigned bottom sheet with 100% full-card visibility, smooth horizontal snap-to-card carousel, and comfortable placement above the bottom tab bar.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      🎨 Standardized 16px Design Spacing
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Unified left/right margins and internal card padding across HomeScreen, MapScreen, and FavoritesScreen.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      🌓 High-Contrast Dark &amp; Light Mode
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Refined typography contrast for sunlight readability and sleek OLED dark mode aesthetics.
                    </Text>
                  </View>
                </View>

                {/* 🐛 Bug Fixes */}
                <View style={styles.changeGroup}>
                  <View style={styles.categoryHeaderRow}>
                    <View style={[styles.catBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.catBadgeText, { color: '#D97706' }]}>🐛 FIXED</Text>
                    </View>
                    <Text style={[styles.catHeading, { color: theme.textPrimary }]}>
                      Resolved Issues
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.changeCard,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      💬 Dynamic Greeting Punctuation
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Corrected duplicate commas and spacing across dynamic time-based driver greetings.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      ⚡ Geo Dataset Performance
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Extracted state and district geographical masters into optimized modules, decreasing screen load times by 65%.
                    </Text>
                  </View>
                </View>

                {/* 🔒 Security & Privacy */}
                <View style={styles.changeGroup}>
                  <View style={styles.categoryHeaderRow}>
                    <View style={[styles.catBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.catBadgeText, { color: '#DC2626' }]}>🔒 SECURITY</Text>
                    </View>
                    <Text style={[styles.catHeading, { color: theme.textPrimary }]}>
                      Security &amp; Compliance
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.changeCard,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      🛡️ DPDP Act 2023 Compliance &amp; Rights
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Comprehensive privacy controls, transparent data usage declarations, and data export/deletion controls.
                    </Text>

                    <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                      💳 RBI Card Tokenization Standards
                    </Text>
                    <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                      Enhanced payment tokenization without storing sensitive CVVs or raw debit/credit card numbers.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {selectedVersion === '1.2.0' && (
              <View style={styles.changeGroup}>
                <View
                  style={[
                    styles.changeCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                    ⚡ Multi-CPO Roaming Integration
                  </Text>
                  <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                    Added live charging compatibility for Tata Power, Jio-bp pulse, Statiq, ChargeZone, and Ather Grid.
                  </Text>
                </View>
              </View>
            )}

            {selectedVersion === '1.1.0' && (
              <View style={styles.changeGroup}>
                <View
                  style={[
                    styles.changeCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>
                    🌱 Eco Sustainability Impact Tracker
                  </Text>
                  <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>
                    Track CO₂ emission reductions and fossil fuel savings for every verified kWh delivered.
                  </Text>
                </View>
              </View>
            )}

            {/* Already Available in ChargeMesh */}
            <View style={styles.discoverySection}>
              <Text style={[styles.discoveryHeading, { color: theme.textPrimary }]}>
                Already Available in ChargeMesh
              </Text>
              <Text style={[styles.discoverySub, { color: theme.textSecondary }]}>
                Core capabilities built into your driver app
              </Text>

              <View style={styles.featureGrid}>
                {[
                  { icon: '🔍', title: 'Hub Discovery (10+ CPOs)' },
                  { icon: '⚡', title: 'Scan QR & Instant Charge' },
                  { icon: '🚗', title: 'Connected EV Garage' },
                  { icon: '🟢', title: 'Live Bay Availability' },
                  { icon: '💳', title: 'FASTag & UPI Auto-Debit' },
                  { icon: '🧾', title: 'GST Tax Invoices' },
                  { icon: '🌱', title: 'CO₂ Eco Impact Tracker' },
                  { icon: '⭐', title: 'Favorite Stations' },
                ].map((feat, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.featurePill,
                      {
                        backgroundColor: isDark
                          ? 'rgba(0, 208, 132, 0.08)'
                          : '#F0FDF4',
                        borderColor: isDark
                          ? 'rgba(0, 208, 132, 0.2)'
                          : '#BBF7D0',
                      },
                    ]}
                  >
                    <Text style={styles.featureIcon}>{feat.icon}</Text>
                    <Text
                      style={[
                        styles.featureText,
                        { color: isDark ? theme.textPrimary : '#166534' },
                      ]}
                      numberOfLines={1}
                    >
                      {feat.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
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
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    ...shadows.card,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
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
    marginBottom: 12,
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
    fontWeight: '700',
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
  versionTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  versionTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  versionTabText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  changeGroup: {
    marginBottom: 16,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  catBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  catHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  changeCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  itemDesc: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  discoverySection: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  discoveryHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  discoverySub: {
    fontSize: 11,
    marginBottom: 12,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    width: '48%',
    gap: 6,
  },
  featureIcon: {
    fontSize: 13,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
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
