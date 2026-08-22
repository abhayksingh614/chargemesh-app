import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Header, PrimaryButton, AuthGateModal, StatusModal } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context';
import { ConnectorType } from '@chargemesh/shared-types';

interface VehicleScreenProps {
  navigation: any;
}

export const VehicleScreen: React.FC<VehicleScreenProps> = ({ navigation }) => {
  const { vehicles, activeVehicle, isGuest, setActiveVehicleId, addVehicle } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusContent, setStatusContent] = useState({ title: '', message: '', type: 'success' as any });

  const [newMake, setNewMake] = useState('MG');
  const [newModel, setNewModel] = useState('ZS EV');
  const [newBatteryKwh, setNewBatteryKwh] = useState('50.3');
  const [newMaxDcPower, setNewMaxDcPower] = useState('50');

  const handleAddVehicle = () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }

    if (!newMake.trim() || !newModel.trim()) {
      setStatusContent({
        title: 'Incomplete Vehicle Details',
        message: 'Please provide both Make (e.g. Tata, MG) and Model name.',
        type: 'error',
      });
      setShowStatusModal(true);
      return;
    }

    addVehicle({
      make: newMake.trim(),
      model: newModel.trim(),
      batteryCapacityKwh: parseFloat(newBatteryKwh) || 40.5,
      maxDcPowerKw: parseFloat(newMaxDcPower) || 50,
      maxAcPowerKw: 7.4,
      connectorTypes: [ConnectorType.CCS2, ConnectorType.TYPE2],
      isDefault: false,
    });

    setShowAddForm(false);
    setStatusContent({
      title: 'Vehicle Added to Garage! 🚗',
      message: `${newMake} ${newModel} (${newBatteryKwh} kWh) is configured. Compatibility filters and charging duration curves will now calibrate to this battery.`,
      type: 'success',
    });
    setShowStatusModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My EV Garage 🚗"
        subtitle="Manage vehicles & connector compatibility"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guest Warning Banner if in Guest Mode */}
        {isGuest && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestBannerTitle}>Guest Vehicle Preview</Text>
            <Text style={styles.guestBannerSub}>
              Sign in to save multiple EVs, sync battery profiles, and get tailored charging curves.
            </Text>
            <TouchableOpacity
              style={styles.guestBannerBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.guestBannerBtnText}>Sign In with Mobile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active EV Card */}
        <Text style={styles.sectionHeader}>Active Vehicle for Routing & Filters</Text>

        {vehicles.map((v) => {
          const isActive = v.id === activeVehicle?.id;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
              onPress={() => {
                if (isGuest) {
                  setShowAuthGate(true);
                } else {
                  setActiveVehicleId(v.id);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Text style={styles.carEmoji}>🚘</Text>
                </View>
                <View style={styles.vehDetails}>
                  <Text style={styles.carName}>
                    {v.make} {v.model}
                  </Text>
                  <Text style={styles.carVariant}>{v.variant || 'Standard Range'}</Text>
                </View>
                {isActive && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                )}
              </View>

              <View style={styles.specsDivider} />

              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specVal}>{v.batteryCapacityKwh} kWh</Text>
                  <Text style={styles.specLbl}>Battery Pack</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specVal}>{v.maxDcPowerKw || 50} kW</Text>
                  <Text style={styles.specLbl}>Max DC Fast</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specVal}>{v.connectorTypes.join(', ')}</Text>
                  <Text style={styles.specLbl}>Ports</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Add New Vehicle Button */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addVehBtn}
            onPress={() => {
              if (isGuest) {
                setShowAuthGate(true);
              } else {
                setShowAddForm(true);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.addVehText}>＋ Add Another Electric Vehicle</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New EV</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BRAND / MAKE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MG, Tata, Hyundai, BYD"
                placeholderTextColor={colors.textMuted}
                value={newMake}
                onChangeText={setNewMake}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MODEL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ZS EV, Ioniq 5, Atto 3"
                placeholderTextColor={colors.textMuted}
                value={newModel}
                onChangeText={setNewModel}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>BATTERY (KWH)</Text>
                <TextInput
                  style={styles.input}
                  value={newBatteryKwh}
                  onChangeText={setNewBatteryKwh}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>MAX DC (KW)</Text>
                <TextInput
                  style={styles.input}
                  value={newMaxDcPower}
                  onChangeText={setNewMaxDcPower}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Save Vehicle" onPress={handleAddVehicle} />
              </View>
            </View>
          </View>
        )}

        {/* Compatibility Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            ChargeMesh uses your active vehicle's battery capacity and plug types to automatically
            filter out incompatible chargers and compute accurate charging duration forecasts.
          </Text>
        </View>
      </ScrollView>

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={showAuthGate}
        featureName="EV Garage & Compatibility Profiles"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      {/* Status Modal for Vehicle Added / Errors */}
      <StatusModal
        visible={showStatusModal}
        type={statusContent.type}
        title={statusContent.title}
        message={statusContent.message}
        buttonLabel="Great"
        onClose={() => setShowStatusModal(false)}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  guestBanner: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  guestBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guestBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  guestBannerBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  guestBannerBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  vehicleCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 192, 115, 0.03)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  carEmoji: {
    fontSize: 20,
  },
  vehDetails: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  carVariant: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  activePillText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  specsDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  specLbl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  addVehBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginVertical: spacing.sm,
  },
  addVehText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.sm,
    ...shadows.elevated,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formRow: {
    flexDirection: 'row',
  },
  formButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginRight: spacing.sm,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
