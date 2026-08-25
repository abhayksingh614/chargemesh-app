import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Header, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme, useLanguage } from '../context';
import { Vehicle } from '@chargemesh/shared-types';

interface MyVehiclesScreenProps {
  navigation: any;
}

export const MyVehiclesScreen: React.FC<MyVehiclesScreenProps> = ({ navigation }) => {
  const { vehicles, activeVehicle, isGuest, setActiveVehicleId, updateVehicle, deleteVehicle } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const { t } = useLanguage();

  // Edit Modal State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editPlate, setEditPlate] = useState('');

  // Delete Confirmation State
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'info' | 'error',
    badge: '',
    iconEmoji: '',
  });

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title={t('myVehicles.pageTitle') || 'My Vehicles'}
          subtitle="Manage your connected electric vehicles"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.guestContainer}>
          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.guestLockCircle}>
              <Text style={{ fontSize: 36 }}>🔐</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
              Login Required 🔐
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Please log in or create an account to add and manage your vehicles.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  borderColor: theme.primary,
                  backgroundColor: isDark ? 'rgba(0, 208, 132, 0.08)' : '#F0FDF4',
                },
              ]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.88}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={[styles.ghostBtnText, { color: theme.textSecondary }]}>
                Continue Exploring
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleSetPrimary = (vehicle: Vehicle) => {
    setActiveVehicleId(vehicle.id);
    setStatusConfig({
      title: 'Primary Vehicle Updated 🟢',
      message: `${vehicle.make} ${vehicle.model} (${vehicle.variant || 'Standard'}) is now your active vehicle. Charging station filters and duration curves are calibrated to this battery.`,
      type: 'success',
      badge: 'Active Primary',
      iconEmoji: '⚡',
    });
    setShowStatusModal(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditNickname((vehicle as any).nickname || '');
    setEditPlate(vehicle.registrationPlate || '');
  };

  const handleSaveEdit = () => {
    if (!editingVehicle) return;

    updateVehicle(editingVehicle.id, {
      registrationPlate: editPlate.trim().toUpperCase() || undefined,
      ...(editNickname.trim() ? { nickname: editNickname.trim() } : {}),
    });

    setEditingVehicle(null);
    setStatusConfig({
      title: 'Vehicle Updated ✓',
      message: 'Vehicle nickname and registration plate details have been saved.',
      type: 'success',
      badge: 'Saved',
      iconEmoji: '🚗',
    });
    setShowStatusModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingVehicle) return;
    deleteVehicle(deletingVehicle.id);
    setDeletingVehicle(null);
    setStatusConfig({
      title: 'Vehicle Removed',
      message: 'The selected vehicle has been removed from your ChargeMesh account.',
      type: 'info',
      badge: 'Removed',
      iconEmoji: '🗑️',
    });
    setShowStatusModal(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 1. Header with unified styling */}
      <Header
        title={t('myVehicles.pageTitle')}
        subtitle={t('myVehicles.pageSubtitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            2. CONNECTED VEHICLE SUMMARY DASHBOARD
        ========================================================================= */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryLeft}>
            <View style={[styles.summaryIconBox, { backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : 'rgba(0, 208, 132, 0.10)' }]}>
              <Text style={styles.summaryEmoji}>🚗</Text>
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
                {vehicles.length} {vehicles.length === 1 ? 'EV Connected' : 'EVs Connected'}
              </Text>
              <Text style={[styles.summarySubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                {activeVehicle
                  ? `Active Primary: ${activeVehicle.make} ${activeVehicle.model}`
                  : 'No active primary vehicle'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.summaryAddBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddVehicle')}
            activeOpacity={0.85}
          >
            <Text style={styles.summaryAddBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            3. VEHICLE CARDS LIST
        ========================================================================= */}
        {vehicles.length === 0 ? (
          /* Empty State */
          <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(0, 208, 132, 0.12)' : 'rgba(0, 208, 132, 0.08)' }]}>
              <Text style={styles.emptyEmoji}>⚡</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {t('myVehicles.emptyTitle')}
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {t('myVehicles.emptySub')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddVehicle')}
              activeOpacity={0.88}
            >
              <Text style={styles.emptyAddBtnText}>＋ Add Your First EV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((v) => {
            const isPrimary = v.id === activeVehicle?.id || v.isDefault;
            return (
              <View
                key={v.id}
                style={[
                  styles.vehicleCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  isPrimary && {
                    borderColor: theme.primary,
                    borderWidth: 1.5,
                    backgroundColor: isDark ? 'rgba(0, 208, 132, 0.05)' : '#F7FDF9',
                  },
                ]}
              >
                {/* Top Area: Icon, Name & Status Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.carBrandAvatar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' }]}>
                    <Text style={styles.carEmoji}>🚘</Text>
                  </View>
                  <View style={styles.carInfoText}>
                    <Text style={[styles.carName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {v.make} {v.model}
                    </Text>
                    <Text style={[styles.carVariant, { color: theme.textSecondary }]} numberOfLines={1}>
                      {v.variant || 'Standard'}
                      {(v as any).nickname ? ` • "${(v as any).nickname}"` : ''}
                    </Text>
                  </View>
                  {isPrimary ? (
                    <View style={styles.primaryBadgePill}>
                      <View style={styles.primaryDot} />
                      <Text style={styles.primaryBadgePillText}>Primary</Text>
                    </View>
                  ) : (
                    <View style={[styles.notPrimaryBadgePill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9', borderColor: theme.border }]}>
                      <Text style={[styles.notPrimaryBadgeText, { color: theme.textSecondary }]}>Not Primary</Text>
                    </View>
                  )}
                </View>

                {/* Primary Compatibility Information Strip */}
                {isPrimary && (
                  <View style={styles.activeFilteringBanner}>
                    <Text style={styles.activeFilteringText}>
                      ⚡ Active Compatibility Filtering & Charging Duration Calibration
                    </Text>
                  </View>
                )}

                <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                {/* 4. Balanced 3-Column Specifications Layout with Vertical Dividers */}
                <View style={styles.specsGrid}>
                  <View style={styles.specColumn}>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {v.batteryCapacityKwh} kWh
                    </Text>
                    <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                      Battery Pack
                    </Text>
                  </View>

                  <View style={[styles.specVerticalDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.specColumn}>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {v.maxDcPowerKw || 50} kW
                    </Text>
                    <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                      Max DC Fast
                    </Text>
                  </View>

                  <View style={[styles.specVerticalDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.specColumn}>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]} numberOfLines={1}>
                      {v.registrationPlate || 'Not Set'}
                    </Text>
                    <Text style={[styles.specLbl, { color: theme.textSecondary }]}>
                      Plate No.
                    </Text>
                  </View>
                </View>

                {/* 5. Compatible Charging Ports */}
                <View style={styles.portsSection}>
                  <Text style={[styles.portsLabel, { color: theme.textSecondary }]}>
                    Compatible Ports:
                  </Text>
                  <View style={styles.portsList}>
                    {v.connectorTypes.map((port) => (
                      <View
                        key={port}
                        style={[
                          styles.portChip,
                          {
                            borderColor: theme.border,
                            backgroundColor: theme.surface,
                          },
                        ]}
                      >
                        <Text style={[styles.portChipText, { color: theme.textPrimary }]}>
                          ⚡ {port}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                {/* 6. Vehicle Actions */}
                <View style={styles.actionsRow}>
                  {!isPrimary ? (
                    <TouchableOpacity
                      style={[styles.setPrimaryActionBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleSetPrimary(v)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.setPrimaryActionText}>
                        Set as Primary
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.currentPrimaryIndicator, { backgroundColor: isDark ? 'rgba(0, 208, 132, 0.15)' : '#DCFCE7' }]}>
                      <Text style={styles.currentPrimaryIndicatorText}>
                        ✓ Currently Primary
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.editActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={() => handleOpenEdit(v)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.editActionBtnText, { color: theme.textPrimary }]}>
                      ✏️ Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteActionBtn,
                      {
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
                      },
                    ]}
                    onPress={() => setDeletingVehicle(v)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.deleteActionBtnText, { color: '#EF4444' }]}>
                      🗑 Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* =========================================================================
            7. CHARGEMESH INTEL / INFORMATION CARD
        ========================================================================= */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.infoCardIconBox}>
            <Text style={{ fontSize: 20 }}>💡</Text>
          </View>
          <Text style={[styles.infoCardText, { color: theme.textSecondary }]}>
            ChargeMesh uses your active vehicle's{' '}
            <Text style={[styles.infoCardHighlight, { color: theme.primary }]}>battery capacity</Text> and{' '}
            <Text style={[styles.infoCardHighlight, { color: theme.primary }]}>plug types</Text> to automatically
            filter out{' '}
            <Text style={[styles.infoCardHighlight, { color: theme.primary }]}>incompatible chargers</Text> and
            calculate accurate{' '}
            <Text style={[styles.infoCardHighlight, { color: theme.primary }]}>
              charging duration forecasts
            </Text>
            .
          </Text>
        </View>

        {/* =========================================================================
            8. ADD ANOTHER EV (DASHED BORDER CARD CTA)
        ========================================================================= */}
        {vehicles.length > 0 && (
          <TouchableOpacity
            style={[
              styles.dashedAddCard,
              {
                borderColor: theme.primary,
                backgroundColor: isDark ? 'rgba(0, 208, 132, 0.04)' : '#F6FDF9',
              },
            ]}
            onPress={() => navigation.navigate('AddVehicle')}
            activeOpacity={0.85}
          >
            <View style={styles.dashedAddLeft}>
              <View style={[styles.dashedAddIconCircle, { backgroundColor: theme.primary }]}>
                <Text style={styles.dashedAddIconEmoji}>＋</Text>
              </View>
              <View style={styles.dashedAddTextBox}>
                <Text style={[styles.dashedAddTitle, { color: theme.primary }]}>
                  ＋ Add Another EV
                </Text>
                <Text style={[styles.dashedAddSubtitle, { color: theme.textSecondary }]}>
                  Connect a new EV to unlock smarter insights and a better charging experience.
                </Text>
              </View>
            </View>
            <Text style={[styles.dashedAddArrow, { color: theme.primary }]}>→</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* =========================================================================
          9. EDIT VEHICLE MODAL
      ========================================================================= */}
      <Modal
        visible={!!editingVehicle}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingVehicle(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Edit {editingVehicle?.make} {editingVehicle?.model}
            </Text>

            <View style={{ width: '100%', marginTop: 14 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                VEHICLE NICKNAME
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g. Daily Driver, Family Car"
                placeholderTextColor={theme.textMuted}
                value={editNickname}
                onChangeText={setEditNickname}
              />
            </View>

            <View style={{ width: '100%', marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                REGISTRATION / NUMBER PLATE
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    textTransform: 'uppercase',
                  },
                ]}
                placeholder="e.g. DL 8C BC 2026"
                placeholderTextColor={theme.textMuted}
                value={editPlate}
                onChangeText={setEditPlate}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setEditingVehicle(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveEdit}
                activeOpacity={0.88}
              >
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          10. DELETE CONFIRMATION MODAL
      ========================================================================= */}
      <Modal
        visible={!!deletingVehicle}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingVehicle(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: '#EF4444' }]}>
            <View style={styles.deleteIconCircle}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
            </View>

            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {t('myVehicles.deleteConfirmTitle')}
            </Text>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Are you sure you want to remove{' '}
              <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                {deletingVehicle?.make} {deletingVehicle?.model}
              </Text>{' '}
              from your ChargeMesh garage?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setDeletingVehicle(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDeleteBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleConfirmDelete}
                activeOpacity={0.88}
              >
                <Text style={styles.modalDeleteBtnText}>Remove Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <StatusModal
        visible={showStatusModal}
        title={statusConfig.title}
        message={statusConfig.message}
        type={statusConfig.type}
        badge={statusConfig.badge}
        iconEmoji={statusConfig.iconEmoji}
        onClose={() => setShowStatusModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 36,
  },

  // 1. Connected Vehicle Summary Card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  summaryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryEmoji: {
    fontSize: 20,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  summaryAddBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  summaryAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // 2. Empty State
  emptyContainer: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: spacing.md,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyAddBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // 3. Vehicle Cards
  vehicleCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carBrandAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  carEmoji: {
    fontSize: 22,
  },
  carInfoText: {
    flex: 1,
    marginRight: 8,
  },
  carName: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  carVariant: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  primaryBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  primaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },
  primaryBadgePillText: {
    color: '#16A34A',
    fontSize: 11.5,
    fontWeight: '800',
  },
  notPrimaryBadgePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  notPrimaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeFilteringBanner: {
    backgroundColor: 'rgba(0, 208, 132, 0.09)',
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  activeFilteringText: {
    color: '#00A86B',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    marginVertical: 13,
  },

  // 4. Specifications Grid (3 balanced columns)
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  specColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  specVal: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  specLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  specVerticalDivider: {
    width: 1,
    height: 28,
    opacity: 0.8,
  },

  // 5. Compatible Ports
  portsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  portsLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginRight: 2,
  },
  portsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  portChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  portChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 6. Action Controls
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setPrimaryActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  currentPrimaryIndicator: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPrimaryIndicatorText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '800',
  },
  editActionBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  deleteActionBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // 7. Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 13,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  infoCardIconBox: {
    marginRight: 10,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  infoCardHighlight: {
    fontWeight: '700',
  },

  // 8. Dashed Add Another EV Card
  dashedAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: spacing.sm,
  },
  dashedAddLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  dashedAddIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dashedAddIconEmoji: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  dashedAddTextBox: {
    flex: 1,
  },
  dashedAddTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  dashedAddSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 15,
  },
  dashedAddArrow: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 6,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 16, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.elevated,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  guestCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  guestLockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  ghostBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
