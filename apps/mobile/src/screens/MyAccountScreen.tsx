import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  FlatList,
} from 'react-native';
import {
  Header,
  PrimaryButton,
  StatusModal,
  ConfirmationModal,
  PaymentModal,
  AuthGateModal,
} from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme, useLanguage } from '../context';
import { UserGender, ConnectorType } from '@chargemesh/shared-types';
import stateDistrictJson from '../data/stateDistrictMaster.json';
import {
  checkFingerprintStatus,
  promptFingerprintAuth,
  openDeviceSecuritySettings,
  getFingerprintLockEnabled,
  setFingerprintLockEnabled,
} from '../services/fingerprintAuth';

interface MyAccountScreenProps {
  navigation: any;
}

const AVATAR_PRESETS = ['👤', '⚡', '🚗', '🔋', '🛡️', '🇮🇳', '🌟', '🔌'];

const STATE_DISTRICT_MAP: Record<string, string[]> = (stateDistrictJson as any).states || {};
const ALL_STATES_LIST: string[] = Object.keys(STATE_DISTRICT_MAP);

const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName) return [];
  const match = Object.keys(STATE_DISTRICT_MAP).find(
    (s) => s.toLowerCase() === stateName.toLowerCase()
  );
  return match && STATE_DISTRICT_MAP[match] ? STATE_DISTRICT_MAP[match] : [];
};

export const MyAccountScreen: React.FC<MyAccountScreenProps> = ({ navigation }) => {
  const { user, isGuest, activeVehicle, updateUserProfile, logout, topUpWallet } = useAuth();
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  // Modals & Sheets State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown Pickers for State & District inside Edit Modal
  const [activePicker, setActivePicker] = useState<'state' | 'district' | 'gender' | null>(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');

  // Edit Form Fields State
  const [editFirstName, setEditFirstName] = useState(
    user?.firstName || (user?.name ? user.name.split(' ')[0] : '') || ''
  );
  const [editLastName, setEditLastName] = useState(
    user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || ''
  );
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editDob, setEditDob] = useState(user?.dob || '1995-06-14');
  const [editGender, setEditGender] = useState<UserGender>(user?.gender || UserGender.MALE);
  const [editState, setEditState] = useState(user?.state || 'Nct of Delhi');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'New Delhi');
  const [editCity, setEditCity] = useState(user?.city || 'New Delhi');
  const [editPincode, setEditPincode] = useState(user?.pincode || '110001');
  const [editAddress, setEditAddress] = useState(user?.address || 'Connaught Place, New Delhi');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preference Toggles State
  const [autoFilterPlugs, setAutoFilterPlugs] = useState(
    user?.chargingPreferences?.autoFilterIncompatible ?? true
  );
  const [speedPref, setSpeedPref] = useState<'ULTRA_FAST' | 'FAST' | 'AC_FAST' | 'ALL'>(
    user?.chargingPreferences?.preferredSpeed ?? 'ULTRA_FAST'
  );
  const [radiusKm, setRadiusKm] = useState<number>(
    user?.chargingPreferences?.searchRadiusKm ?? 25
  );

  // Notification Toggles State
  const [notifSession, setNotifSession] = useState(
    user?.notificationPreferences?.sessionAlerts ?? true
  );
  const [notifComplete, setNotifComplete] = useState(
    user?.notificationPreferences?.completionAlerts ?? true
  );
  const [notifStation, setNotifStation] = useState(
    user?.notificationPreferences?.stationAvailabilityAlerts ?? true
  );
  const [notifEmailInvoice, setNotifEmailInvoice] = useState(
    user?.notificationPreferences?.emailInvoices ?? true
  );
  const [notifPromo, setNotifPromo] = useState(
    user?.notificationPreferences?.promotionalOffers ?? false
  );
  const [biometricLock, setBiometricLock] = useState(false);
  const [showFingerprintNotEnrolledModal, setShowFingerprintNotEnrolledModal] = useState(false);

  React.useEffect(() => {
    getFingerprintLockEnabled().then(setBiometricLock);
  }, []);

  const handleToggleFingerprintLock = async (enabled: boolean) => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }

    if (enabled) {
      const status = await checkFingerprintStatus();
      if (status.status === 'NOT_ENROLLED') {
        setShowFingerprintNotEnrolledModal(true);
        setBiometricLock(false);
        return;
      }
      if (status.status === 'NOT_SUPPORTED') {
        setSuccessMsg('Fingerprint sensor hardware is not supported or not available on this device.');
        setShowSuccessModal(true);
        setBiometricLock(false);
        return;
      }

      // Prompt native fingerprint verification
      const auth = await promptFingerprintAuth({
        title: 'Enable Fingerprint App Lock',
        subtitle: 'Touch the fingerprint sensor to verify your identity',
        cancelLabel: 'Cancel',
      });

      if (auth.success) {
        setBiometricLock(true);
        await setFingerprintLockEnabled(true);
        setSuccessMsg('Fingerprint App Lock Enabled ✓\nYour registered fingerprint will be required whenever you open ChargeMesh.');
        setShowSuccessModal(true);
      } else {
        setBiometricLock(false);
        await setFingerprintLockEnabled(false);
        if (auth.error !== 'CANCELLED') {
          setSuccessMsg(auth.message || 'Could not verify fingerprint. Please try again.');
          setShowSuccessModal(true);
        }
      }
    } else {
      // Disabling fingerprint lock
      const auth = await promptFingerprintAuth({
        title: 'Disable Fingerprint App Lock',
        subtitle: 'Touch the fingerprint sensor to confirm',
        cancelLabel: 'Cancel',
      });

      if (auth.success) {
        setBiometricLock(false);
        await setFingerprintLockEnabled(false);
        setSuccessMsg('Fingerprint App Lock Disabled\nApp lock has been turned off.');
        setShowSuccessModal(true);
      } else {
        setBiometricLock(true);
      }
    }
  };

  // State and District master lists
  const allStatesList = ALL_STATES_LIST;
  const districtsForSelectedState = useMemo(() => {
    return getDistrictsForState(editState);
  }, [editState]);

  const filteredStates = useMemo(() => {
    if (!pickerSearchQuery.trim()) return allStatesList;
    const q = pickerSearchQuery.toLowerCase().trim();
    return allStatesList.filter((s) => s.toLowerCase().includes(q));
  }, [allStatesList, pickerSearchQuery]);

  const filteredDistricts = useMemo(() => {
    if (!pickerSearchQuery.trim()) return districtsForSelectedState;
    const q = pickerSearchQuery.toLowerCase().trim();
    return districtsForSelectedState.filter((d) => d.toLowerCase().includes(q));
  }, [districtsForSelectedState, pickerSearchQuery]);

  // Open Edit Form Modal with pre-populated values
  const handleOpenEdit = () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setEditFirstName(user?.firstName || (user?.name ? user.name.split(' ')[0] : '') || '');
    setEditLastName(user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || '');
    setEditPhone(user?.phoneNumber || '');
    setEditEmail(user?.email || '');
    setEditDob(user?.dob || '1995-06-14');
    setEditGender(user?.gender || UserGender.MALE);
    setEditState(user?.state || 'Nct of Delhi');
    setEditDistrict(user?.district || 'New Delhi');
    setEditCity(user?.city || 'New Delhi');
    setEditPincode(user?.pincode || '110001');
    setEditAddress(user?.address || 'Connaught Place, New Delhi');
    setFormError('');
    setShowEditModal(true);
  };

  // State Change handler: Automatically reset district to first valid district
  const handleSelectState = (stateName: string) => {
    setEditState(stateName);
    const newDistricts = getDistrictsForState(stateName);
    setEditDistrict(newDistricts.length > 0 ? newDistricts[0] : '');
    setActivePicker(null);
    setPickerSearchQuery('');
  };

  // Save Profile Changes
  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) {
      setFormError(t('account.nameRequired'));
      return;
    }
    if (!editPhone.trim() || editPhone.replace(/\D/g, '').length < 10) {
      setFormError(t('account.phoneRequired'));
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setFormError(t('account.emailRequired'));
      return;
    }
    if (editPincode.trim() && editPincode.replace(/\D/g, '').length !== 6) {
      setFormError(t('account.pincodeInvalid'));
      return;
    }

    setIsSaving(true);
    setFormError('');

    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
    const updatedData = {
      name: fullName,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      phoneNumber: editPhone.trim(),
      email: editEmail.trim(),
      dob: editDob.trim(),
      gender: editGender,
      state: editState,
      district: editDistrict,
      city: editCity.trim(),
      pincode: editPincode.trim(),
      address: editAddress.trim(),
      profileCompletionPercentage: 100,
    };

    updateUserProfile(updatedData);

    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    setShowEditModal(false);
    setSuccessMsg(t('account.updateSuccess'));
    setShowSuccessModal(true);
  };

  // Update Charging Preference Toggle directly
  const handleToggleAutoFilter = (val: boolean) => {
    setAutoFilterPlugs(val);
    updateUserProfile({
      chargingPreferences: {
        autoFilterIncompatible: val,
        preferredSpeed: speedPref,
        preferredConnector: activeVehicle?.connectorTypes[0] || ConnectorType.CCS2,
        preferredNetworks: user?.chargingPreferences?.preferredNetworks || ['Tata Power EZ Charge'],
        searchRadiusKm: radiusKm,
      },
    });
  };

  const handleSelectSpeed = (spd: 'ULTRA_FAST' | 'FAST' | 'AC_FAST' | 'ALL') => {
    setSpeedPref(spd);
    updateUserProfile({
      chargingPreferences: {
        autoFilterIncompatible: autoFilterPlugs,
        preferredSpeed: spd,
        preferredConnector: activeVehicle?.connectorTypes[0] || ConnectorType.CCS2,
        preferredNetworks: user?.chargingPreferences?.preferredNetworks || ['Tata Power EZ Charge'],
        searchRadiusKm: radiusKm,
      },
    });
  };

  const handleSelectRadius = (rad: number) => {
    setRadiusKm(rad);
    updateUserProfile({
      chargingPreferences: {
        autoFilterIncompatible: autoFilterPlugs,
        preferredSpeed: speedPref,
        preferredConnector: activeVehicle?.connectorTypes[0] || ConnectorType.CCS2,
        preferredNetworks: user?.chargingPreferences?.preferredNetworks || ['Tata Power EZ Charge'],
        searchRadiusKm: rad,
      },
    });
  };

  // Top Up Wallet
  const handleWalletSuccess = (amountRupees: number) => {
    topUpWallet(amountRupees * 100);
    setSuccessMsg(`${t('modals.topUpSuccess')}${amountRupees.toFixed(2)}`);
    setShowSuccessModal(true);
  };

  const completionPct = user?.profileCompletionPercentage || 95;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={t('account.pageTitle')}
        subtitle={t('account.pageSubtitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            1. HERO PROFILE & AVATAR CARD
        ========================================================================= */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heroTopRow}>
            {/* Avatar with edit badge */}
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
              onPress={() => setShowAvatarPicker(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.avatarEmoji}>{user?.avatarUrl || '👤'}</Text>
              <View style={[styles.avatarEditBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarEditBadgeIcon}>✏️</Text>
              </View>
            </TouchableOpacity>

            {/* User Title & Badges */}
            <View style={styles.heroDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.heroName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {user?.name || 'EV Driver'}
                </Text>
                <View style={[styles.verifiedPill, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.verifiedPillText, { color: '#16A34A' }]}>✓ Verified</Text>
                </View>
              </View>

              <Text style={[styles.heroSubText, { color: theme.textSecondary }]}>
                {user?.phoneNumber || user?.email || 'driver@chargemesh.com'}
              </Text>

              <View style={styles.codeRow}>
                <View style={[styles.userCodeBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.userCodeText, { color: theme.primary }]}>
                    ID: {user?.userCode || `CM-DRV-${user?.phoneNumber ? user.phoneNumber.slice(-4) : '2026'}`}
                  </Text>
                </View>
                <Text style={[styles.memberSinceText, { color: theme.textMuted }]}>
                  {user?.memberSince ? `Member since ${user.memberSince}` : 'Active Member'}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Completion Bar */}
          <View style={[styles.completionBox, { backgroundColor: theme.inputBg }]}>
            <View style={styles.completionHeaderRow}>
              <Text style={[styles.completionTitle, { color: theme.textPrimary }]}>
                {t('account.profileCompletion')}
              </Text>
              <Text style={[styles.completionPercent, { color: theme.primary }]}>
                {completionPct}% Complete
              </Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${completionPct}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
            <Text style={[styles.completionPrompt, { color: theme.textMuted }]}>
              {t('account.completePrompt')}
            </Text>
          </View>

          {/* Primary Edit Profile Action */}
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
            onPress={handleOpenEdit}
            activeOpacity={0.8}
          >
            <Text style={[styles.editProfileBtnText, { color: theme.primary }]}>
              {t('account.editProfileBtn')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            2. PERSONAL INFORMATION CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              👤 {t('account.sectionPersonal')}
            </Text>
            <TouchableOpacity onPress={handleOpenEdit}>
              <Text style={[styles.sectionEditLink, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.fullName')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{user?.name || 'EV Driver'}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.mobileNumber')}</Text>
              <View style={styles.verifiedRow}>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{user?.phoneNumber || 'Not provided'}</Text>
                {user?.isPhoneVerified ? <Text style={styles.greenTick}> ✓</Text> : null}
              </View>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.emailAddress')}</Text>
              <View style={styles.verifiedRow}>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{user?.email || 'Not provided'}</Text>
                {user?.isEmailVerified ? <Text style={styles.greenTick}> ✓</Text> : null}
              </View>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.dob')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{user?.dob || 'Not set'}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.gender')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {user?.gender === UserGender.FEMALE ? t('account.genderFemale') : t('account.genderMale')}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            3. LOCATION INFORMATION CARD (Dynamic State & District)
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              📍 {t('account.sectionLocation')}
            </Text>
            <TouchableOpacity onPress={handleOpenEdit}>
              <Text style={[styles.sectionEditLink, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.state')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {user?.state || 'Not set'}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.district')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {user?.district || 'Not set'}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.city')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {user?.city || 'Not set'}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.pincode')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {user?.pincode || 'Not set'}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('account.address')}</Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary, flex: 1, textAlign: 'right' }]}>
                {user?.address || 'A-42, Barakhamba Road, Connaught Place'}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            4. EV & VEHICLE INFORMATION CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              🚗 {t('account.sectionVehicle')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyVehicles')}>
              <Text style={[styles.sectionEditLink, { color: theme.primary }]}>
                My Vehicles ➔
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.vehicleHighlightBox, { backgroundColor: theme.inputBg }]}>
            <View style={styles.vehicleHeaderRow}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.vehicleMakeModel, { color: theme.textPrimary }]}>
                  {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Tata Nexon EV Max'}
                </Text>
                <Text style={[styles.vehiclePlateText, { color: theme.primary }]}>
                  {activeVehicle?.registrationPlate || 'DL 8C BC 2026'}
                </Text>
              </View>
            </View>

            <View style={styles.vehicleSpecsRow}>
              <View style={styles.vehSpecCol}>
                <Text style={[styles.vehSpecVal, { color: theme.textPrimary }]}>
                  {activeVehicle?.batteryCapacityKwh || 40.5} kWh
                </Text>
                <Text style={[styles.vehSpecLbl, { color: theme.textMuted }]}>
                  {t('account.batteryCapacity')}
                </Text>
              </View>
              <View style={[styles.vehSpecDivider, { backgroundColor: theme.border }]} />
              <View style={styles.vehSpecCol}>
                <Text style={[styles.vehSpecVal, { color: theme.textPrimary }]}>
                  {activeVehicle?.maxDcPowerKw || 50} kW
                </Text>
                <Text style={[styles.vehSpecLbl, { color: theme.textMuted }]}>
                  {t('account.maxDcSpeed')}
                </Text>
              </View>
              <View style={[styles.vehSpecDivider, { backgroundColor: theme.border }]} />
              <View style={styles.vehSpecCol}>
                <Text style={[styles.vehSpecVal, { color: theme.textPrimary }]}>
                  {activeVehicle?.connectorTypes?.join(', ') || 'CCS2, Type 2'}
                </Text>
                <Text style={[styles.vehSpecLbl, { color: theme.textMuted }]}>
                  {t('account.chargingStandard')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================================
            5. JOINING BONUS & REWARDS SUMMARY CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
            🎁 {t('account.sectionBonus')}
          </Text>

          <View style={[styles.bonusCardInner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <View style={styles.bonusHeaderRow}>
              <View>
                <Text style={[styles.bonusTitle, { color: '#166534' }]}>
                  {t('account.joiningBonusTitle')}
                </Text>
                <Text style={[styles.bonusAmountText, { color: '#15803D' }]}>
                  {t('account.joiningBonusAmount')}
                </Text>
              </View>
              <View style={[styles.bonusStatusBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.bonusStatusText, { color: '#15803D' }]}>
                  {t('account.bonusStatusCredited')}
                </Text>
              </View>
            </View>
            <Text style={[styles.bonusDescription, { color: '#14532D' }]}>
              {t('account.bonusDesc')}
            </Text>
          </View>
        </View>

        {/* =========================================================================
            6. CHARGING & ROUTING PREFERENCES CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 14 }]}>
            ⚡ {t('account.sectionChargingPref')}
          </Text>

          {/* Auto-Filter incompatible plugs toggle */}
          <View style={styles.preferenceRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.prefTitle, { color: theme.textPrimary }]}>
                {t('account.autoFilterIncompatible')}
              </Text>
              <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>
                {t('account.autoFilterDesc')}
              </Text>
            </View>
            <Switch
              value={autoFilterPlugs}
              onValueChange={handleToggleAutoFilter}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* Preferred Charging Speed Segmented Chips */}
          <Text style={[styles.prefSubHeader, { color: theme.textSecondary }]}>
            {t('account.preferredSpeed')}
          </Text>
          <View style={styles.speedChipsRow}>
            {(['ULTRA_FAST', 'FAST', 'AC_FAST', 'ALL'] as const).map((spd) => {
              const isSelected = speedPref === spd;
              const label =
                spd === 'ULTRA_FAST'
                  ? '120kW+ DC'
                  : spd === 'FAST'
                  ? '50-120kW'
                  : spd === 'AC_FAST'
                  ? '22kW AC'
                  : 'All Speeds';
              return (
                <TouchableOpacity
                  key={spd}
                  style={[
                    styles.chipBtn,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => handleSelectSpeed(spd)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      { color: theme.textSecondary },
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* Auto-Search Radius */}
          <Text style={[styles.prefSubHeader, { color: theme.textSecondary }]}>
            {t('account.searchRadius')}
          </Text>
          <View style={styles.speedChipsRow}>
            {[10, 25, 50].map((rad) => {
              const isSelected = radiusKm === rad;
              return (
                <TouchableOpacity
                  key={rad}
                  style={[
                    styles.chipBtn,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => handleSelectRadius(rad)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      { color: theme.textSecondary },
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {rad} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* App Language (Bilingual English / Hindi) Preference */}
          <Text style={[styles.prefSubHeader, { color: theme.textSecondary }]}>
            🌐 {t('profile.menuLanguage')}
          </Text>
          <View style={styles.speedChipsRow}>
            {[
              { id: 'en' as const, label: '🇬🇧 English' },
              { id: 'hi' as const, label: '🇮🇳 हिन्दी (Hindi)' },
            ].map((lang) => {
              const isSelected = language === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.chipBtn,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setLanguage(lang.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      { color: theme.textSecondary },
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* =========================================================================
            7. NOTIFICATIONS & COMMUNICATION PREFERENCES CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 14 }]}>
            🔔 {t('account.sectionCommunication')}
          </Text>

          <View style={styles.preferenceRow}>
            <Text style={[styles.prefTitle, { color: theme.textPrimary, flex: 1 }]}>
              {t('account.liveSessionAlerts')}
            </Text>
            <Switch
              value={notifSession}
              onValueChange={setNotifSession}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          <View style={styles.preferenceRow}>
            <Text style={[styles.prefTitle, { color: theme.textPrimary, flex: 1 }]}>
              {t('account.sessionCompletionAlerts')}
            </Text>
            <Switch
              value={notifComplete}
              onValueChange={setNotifComplete}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          <View style={styles.preferenceRow}>
            <Text style={[styles.prefTitle, { color: theme.textPrimary, flex: 1 }]}>
              {t('account.stationAlerts')}
            </Text>
            <Switch
              value={notifStation}
              onValueChange={setNotifStation}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          <View style={styles.preferenceRow}>
            <Text style={[styles.prefTitle, { color: theme.textPrimary, flex: 1 }]}>
              {t('account.emailInvoices')}
            </Text>
            <Switch
              value={notifEmailInvoice}
              onValueChange={setNotifEmailInvoice}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          <View style={styles.preferenceRow}>
            <Text style={[styles.prefTitle, { color: theme.textPrimary, flex: 1 }]}>
              {t('account.promotionalOffers')}
            </Text>
            <Switch
              value={notifPromo}
              onValueChange={setNotifPromo}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* =========================================================================
            8. SECURITY & ACCOUNT ACTIONS CARD
        ========================================================================= */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 14 }]}>
            🔒 {t('account.sectionSecurity')}
          </Text>

          {/* Change Password */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionRowTitle, { color: theme.textPrimary }]}>
              🔑 {t('account.changePassword')}
            </Text>
            <Text style={[styles.actionRowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* Biometric Lock Toggle */}
          <View style={styles.preferenceRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.prefTitle, { color: theme.textPrimary }]}>
                👆 {t('account.biometricLock')}
              </Text>
              <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>
                {t('account.biometricDesc')}
              </Text>
            </View>
            <Switch
              value={biometricLock}
              onValueChange={handleToggleFingerprintLock}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* Delete Account */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowDeleteConfirm(true)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.actionRowTitle, { color: '#EF4444' }]}>
                🗑️ {t('account.deleteAccount')}
              </Text>
              <Text style={[styles.prefDesc, { color: theme.textMuted, marginTop: 2 }]}>
                {t('account.deleteAccountWarning')}
              </Text>
            </View>
            <Text style={[styles.actionRowArrow, { color: '#EF4444' }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

          {/* Sign Out CTA */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowLogoutConfirm(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionRowTitle, { color: '#DC2626', fontWeight: '800' }]}>
              🚪 {t('account.signOut')}
            </Text>
            <Text style={[styles.actionRowArrow, { color: '#DC2626' }]}>➔</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* =========================================================================
          EDIT PROFILE MODAL (Pre-populated, validated, State-to-District linked)
      ========================================================================= */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {t('account.editProfileBtn')}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalCloseIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {formError}</Text>
                </View>
              ) : null}

              {/* Name Fields */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.firstName')}</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editFirstName}
                    onChangeText={setEditFirstName}
                    placeholder="e.g. Rahul"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.lastName')}</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editLastName}
                    onChangeText={setEditLastName}
                    placeholder="e.g. Sharma"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              {/* Phone & Email */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.mobileNumber')}</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  placeholder="+91 94126 02135"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.emailAddress')}</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="rahul@gmail.com"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* DOB & Gender */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.dob')}</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editDob}
                    onChangeText={setEditDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.gender')}</Text>
                  <TouchableOpacity
                    style={[styles.dropdownSelectBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                    onPress={() => setActivePicker('gender')}
                  >
                    <Text style={[styles.dropdownSelectText, { color: theme.textPrimary }]}>
                      {editGender === UserGender.FEMALE ? 'Female' : 'Male'}
                    </Text>
                    <Text style={{ color: theme.textMuted }}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* State Picker Button */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.state')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelectBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={() => {
                    setPickerSearchQuery('');
                    setActivePicker('state');
                  }}
                >
                  <Text style={[styles.dropdownSelectText, { color: theme.textPrimary }]}>
                    🏛️ {editState || t('account.selectState')}
                  </Text>
                  <Text style={{ color: theme.textMuted }}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* District Picker Button (Dynamically strictly dependent on State) */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.district')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelectBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={() => {
                    setPickerSearchQuery('');
                    setActivePicker('district');
                  }}
                >
                  <Text style={[styles.dropdownSelectText, { color: theme.textPrimary }]}>
                    📍 {editDistrict || t('account.selectDistrict')}
                  </Text>
                  <Text style={{ color: theme.textMuted }}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* City & Pincode */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.city')}</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="New Delhi"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.pincode')}</Text>
                  <TextInput
                    style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editPincode}
                    onChangeText={setEditPincode}
                    keyboardType="numeric"
                    maxLength={6}
                    placeholder="110001"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              {/* Residential Address */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('account.address')}</Text>
                <TextInput
                  style={[
                    styles.inputBox,
                    { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary, height: 72, textAlignVertical: 'top' },
                  ]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                  placeholder="Street address, building, landmark"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.cancelModalBtn, { borderColor: theme.border }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={[styles.cancelModalBtnText, { color: theme.textSecondary }]}>
                    {t('account.cancelBtn')}
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <PrimaryButton
                    title={isSaving ? t('account.savingProfile') : t('account.saveProfileBtn')}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  />
                </View>
              </View>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          DYNAMIC STATE & DISTRICT PICKER MODAL
      ========================================================================= */}
      <Modal visible={activePicker !== null} animationType="fade" transparent onRequestClose={() => setActivePicker(null)}>
        <View style={styles.pickerModalOverlay}>
          <View style={[styles.pickerModalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {activePicker === 'state'
                  ? `🏛️ ${t('account.selectState')} (36 States/UTs)`
                  : activePicker === 'district'
                  ? `📍 ${t('account.selectDistrict')} (${editState})`
                  : 'Select Gender'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={[styles.modalCloseIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {activePicker !== 'gender' && (
              <TextInput
                style={[styles.pickerSearchInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder={activePicker === 'state' ? 'Search State or UT...' : `Search districts in ${editState}...`}
                placeholderTextColor={theme.textMuted}
                value={pickerSearchQuery}
                onChangeText={setPickerSearchQuery}
              />
            )}

            {activePicker === 'gender' ? (
              <View style={{ paddingVertical: 10 }}>
                {[
                  { id: UserGender.MALE, label: t('account.genderMale') },
                  { id: UserGender.FEMALE, label: t('account.genderFemale') },
                  { id: UserGender.OTHER, label: t('account.genderOther') },
                  { id: UserGender.PREFER_NOT_TO_SAY, label: t('account.genderPreferNot') },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.pickerRow, { borderColor: theme.border }]}
                    onPress={() => {
                      setEditGender(g.id);
                      setActivePicker(null);
                    }}
                  >
                    <Text style={[styles.pickerRowText, { color: theme.textPrimary }]}>{g.label}</Text>
                    {editGender === g.id && <Text style={{ color: theme.primary, fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <FlatList
                data={activePicker === 'state' ? filteredStates : filteredDistricts}
                keyExtractor={(item, index) => `${item}-${index}`}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerRow, { borderColor: theme.border }]}
                    onPress={() => {
                      if (activePicker === 'state') {
                        handleSelectState(item);
                      } else {
                        setEditDistrict(item);
                        setActivePicker(null);
                        setPickerSearchQuery('');
                      }
                    }}
                  >
                    <Text style={[styles.pickerRowText, { color: theme.textPrimary }]}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 380 }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          AVATAR PRESET PICKER MODAL
      ========================================================================= */}
      <Modal visible={showAvatarPicker} animationType="fade" transparent onRequestClose={() => setShowAvatarPicker(false)}>
        <View style={styles.pickerModalOverlay}>
          <View style={[styles.pickerModalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Choose Profile Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
                <Text style={[styles.modalCloseIcon, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.avatarGrid}>
              {AVATAR_PRESETS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.avatarPresetBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={() => {
                    updateUserProfile({ avatarUrl: emoji });
                    setShowAvatarPicker(false);
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Status & Confirmation Modals */}
      <StatusModal
        visible={showSuccessModal}
        type="success"
        badge="Success"
        iconEmoji="🎉"
        title="Profile Updated"
        message={successMsg}
        buttonLabel="Done"
        onConfirm={() => setShowSuccessModal(false)}
        onClose={() => setShowSuccessModal(false)}
      />

      <StatusModal
        visible={showPasswordModal}
        type="info"
        badge="Security"
        iconEmoji="🔑"
        title={t('modals.passwordTitle')}
        message="A secure 6-digit OTP has been dispatched to your verified mobile number to authenticate credential reset."
        buttonLabel="Verify & Proceed"
        onConfirm={() => setShowPasswordModal(false)}
        onClose={() => setShowPasswordModal(false)}
      />

      <ConfirmationModal
        visible={showLogoutConfirm}
        title="Sign Out of ChargeMesh"
        message="Are you sure you want to end your current session? You can sign back in anytime with your registered credentials."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete ChargeMesh Account?"
        message="This action is permanent and irreversible. All saved wallet credits, charging sessions, and EV garage profiles will be erased."
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Account"
        isDestructive={true}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await logout();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmationModal
        visible={showFingerprintNotEnrolledModal}
        title="Fingerprint Not Set Up"
        message="Please add a fingerprint in your phone's security settings before enabling Fingerprint App Lock."
        confirmLabel="Open Security Settings"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setShowFingerprintNotEnrolledModal(false);
          await openDeviceSecuritySettings();
        }}
        onCancel={() => setShowFingerprintNotEnrolledModal(false)}
      />

      <AuthGateModal
        visible={showAuthGate}
        featureName="Account Management"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      <PaymentModal
        visible={showPaymentModal}
        currentBalancePaise={user?.walletBalancePaise || 0}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleWalletSuccess}
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
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarEditBadgeIcon: {
    fontSize: 10,
  },
  heroDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  verifiedPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  heroSubText: {
    fontSize: 13,
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  userCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  userCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  memberSinceText: {
    fontSize: 11,
  },
  completionBox: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  completionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  completionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  completionPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  completionPrompt: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  editProfileBtn: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionEditLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoDivider: {
    height: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenTick: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 13,
  },
  vehicleHighlightBox: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleMakeModel: {
    fontSize: 15,
    fontWeight: '800',
  },
  vehiclePlateText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  vehicleSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  vehSpecCol: {
    alignItems: 'center',
    flex: 1,
  },
  vehSpecVal: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  vehSpecLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  vehSpecDivider: {
    width: 1,
    height: 24,
  },
  bonusCardInner: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  bonusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bonusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bonusAmountText: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  bonusStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  bonusStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  bonusDescription: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  prefDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  prefSubHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  speedChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  actionRowArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: borderRadius.md,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  dropdownSelectBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerModalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.elevated,
  },
  pickerSearchInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 10,
  },
  pickerRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerRowText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  avatarPresetBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
