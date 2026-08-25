import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header, StatusModal } from '../components';
import { spacing, borderRadius, shadows } from '../theme';
import { useAuth, useTheme, useLanguage } from '../context';
import { ConnectorType } from '@chargemesh/shared-types';
import evCatalogJson from '../data/evCatalog.json';

interface AddVehicleScreenProps {
  navigation: any;
}

interface CatalogVariant {
  name: string;
  batteryCapacityKwh: number;
  maxDcPowerKw: number;
  maxAcPowerKw: number;
  rangeKm: number;
  connectorTypes: string[];
}

interface CatalogModel {
  id: string;
  name: string;
  variants: CatalogVariant[];
}

interface CatalogBrand {
  id: string;
  name: string;
  logoEmoji: string;
  models: CatalogModel[];
}

const AVAILABLE_CONNECTORS = [
  { id: ConnectorType.CCS2, label: 'CCS2 (DC Fast)', emoji: '⚡' },
  { id: ConnectorType.TYPE2, label: 'Type 2 (AC Fast)', emoji: '🔌' },
  { id: ConnectorType.GBT, label: 'GB/T (DC/AC)', emoji: '🔋' },
  { id: ConnectorType.CHADEMO, label: 'CHAdeMO (DC)', emoji: '⚡' },
  { id: ConnectorType.OTHER, label: '3-Pin 16A (AC)', emoji: '🔌' },
];

export const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({ navigation }) => {
  const { addVehicle, isGuest } = useAuth();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const { t } = useLanguage();

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header
          title={t('addVehicle.pageTitle') || 'Add EV'}
          subtitle="Connect a new electric vehicle to ChargeMesh"
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

  const brandsList: CatalogBrand[] = useMemo(() => {
    return (evCatalogJson as any).brands || [];
  }, []);

  // Form State
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandsList[0]?.id || 'tata');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');

  const [selectedModelName, setSelectedModelName] = useState<string>('Nexon EV');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');

  const [selectedVariantName, setSelectedVariantName] = useState<string>('Empowered+ Long Range');
  const [batteryKwh, setBatteryKwh] = useState<string>('45.0');
  const [maxDcKw, setMaxDcKw] = useState<string>('60');
  const [maxAcKw, setMaxAcKw] = useState<string>('7.2');
  const [rangeKm, setRangeKm] = useState<string>('489');
  const [selectedPorts, setSelectedPorts] = useState<ConnectorType[]>([
    ConnectorType.CCS2,
    ConnectorType.TYPE2,
  ]);
  const [nickname, setNickname] = useState<string>('');
  const [registrationPlate, setRegistrationPlate] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState<boolean>(true);

  // Status & Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected Brand Models
  const activeBrandObj = useMemo(() => {
    return brandsList.find((b) => b.id === selectedBrandId) || brandsList[0];
  }, [brandsList, selectedBrandId]);

  const activeModelObj = useMemo(() => {
    return activeBrandObj?.models.find((m) => m.name === selectedModelName) || activeBrandObj?.models[0];
  }, [activeBrandObj, selectedModelName]);

  // Handle Brand Selection
  const handleSelectBrand = (brandId: string) => {
    if (brandId === 'custom') {
      setIsCustomBrand(true);
      setIsCustomModel(true);
      setSelectedBrandId('custom');
      return;
    }

    setIsCustomBrand(false);
    setSelectedBrandId(brandId);
    const targetBrand = brandsList.find((b) => b.id === brandId);
    if (targetBrand && targetBrand.models.length > 0) {
      const firstModel = targetBrand.models[0];
      setSelectedModelName(firstModel.name);
      setIsCustomModel(false);

      if (firstModel.variants.length > 0) {
        applyVariantDetails(firstModel.variants[0]);
      }
    }
  };

  // Handle Model Selection
  const handleSelectModel = (modelName: string) => {
    if (modelName === 'custom') {
      setIsCustomModel(true);
      return;
    }
    setIsCustomModel(false);
    setSelectedModelName(modelName);
    const targetModel = activeBrandObj?.models.find((m) => m.name === modelName);
    if (targetModel && targetModel.variants.length > 0) {
      applyVariantDetails(targetModel.variants[0]);
    }
  };

  // Handle Variant Selection
  const handleSelectVariant = (variant: CatalogVariant) => {
    applyVariantDetails(variant);
  };

  const applyVariantDetails = (variant: CatalogVariant) => {
    setSelectedVariantName(variant.name);
    setBatteryKwh(variant.batteryCapacityKwh.toString());
    setMaxDcKw(variant.maxDcPowerKw.toString());
    setMaxAcKw(variant.maxAcPowerKw.toString());
    setRangeKm(variant.rangeKm.toString());

    // Map strings to ConnectorType enum safely
    const ports = variant.connectorTypes
      .map((p) => {
        if (p === 'CCS2') return ConnectorType.CCS2;
        if (p === 'TYPE2') return ConnectorType.TYPE2;
        if (p === 'GBT') return ConnectorType.GBT;
        if (p === 'CHADEMO') return ConnectorType.CHADEMO;
        return ConnectorType.CCS2;
      })
      .filter(Boolean);

    setSelectedPorts(ports.length > 0 ? ports : [ConnectorType.CCS2, ConnectorType.TYPE2]);
  };

  // Toggle Connector Port
  const handleTogglePort = (port: ConnectorType) => {
    if (selectedPorts.includes(port)) {
      if (selectedPorts.length === 1) {
        setErrorMessage(t('addVehicle.portsRequired'));
        setShowErrorModal(true);
        return;
      }
      setSelectedPorts(selectedPorts.filter((p) => p !== port));
    } else {
      setSelectedPorts([...selectedPorts, port]);
    }
  };

  // Form Submission
  const handleSubmit = () => {
    const finalMake = isCustomBrand ? customBrandName.trim() : activeBrandObj?.name || 'EV';
    const finalModel = isCustomModel ? customModelName.trim() : selectedModelName.trim();
    const finalVariant = selectedVariantName.trim() || 'Standard';
    const parsedBattery = parseFloat(batteryKwh);
    const parsedDc = parseFloat(maxDcKw);
    const parsedAc = parseFloat(maxAcKw);

    if (!finalMake) {
      setErrorMessage(t('addVehicle.brandRequired'));
      setShowErrorModal(true);
      return;
    }
    if (!finalModel) {
      setErrorMessage(t('addVehicle.modelRequired'));
      setShowErrorModal(true);
      return;
    }
    if (isNaN(parsedBattery) || parsedBattery <= 0) {
      setErrorMessage(t('addVehicle.batteryRequired'));
      setShowErrorModal(true);
      return;
    }
    if (selectedPorts.length === 0) {
      setErrorMessage(t('addVehicle.portsRequired'));
      setShowErrorModal(true);
      return;
    }

    // Add Vehicle to Context and Storage
    addVehicle({
      make: finalMake,
      model: finalModel,
      variant: finalVariant,
      batteryCapacityKwh: parsedBattery,
      maxDcPowerKw: isNaN(parsedDc) ? 50 : parsedDc,
      maxAcPowerKw: isNaN(parsedAc) ? 7.2 : parsedAc,
      connectorTypes: selectedPorts,
      registrationPlate: registrationPlate.trim().toUpperCase() || undefined,
      isDefault: isPrimary,
    });

    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={t('addVehicle.pageTitle')}
        subtitle={t('addVehicle.pageSubtitle')}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* =========================================================================
              1. VEHICLE BRAND SELECTION
          ========================================================================= */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
              {t('addVehicle.stepBrand')}
            </Text>
            <Text style={[styles.cardHeaderSub, { color: theme.textSecondary }]}>
              {t('addVehicle.brandLabel')}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandRow}
            >
              {brandsList.map((brand) => {
                const isSelected = !isCustomBrand && selectedBrandId === brand.id;
                return (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.brandChip,
                      { borderColor: theme.border },
                      isSelected && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => handleSelectBrand(brand.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.brandEmoji}>{brand.logoEmoji}</Text>
                    <Text
                      style={[
                        styles.brandChipText,
                        { color: theme.textPrimary },
                        isSelected && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.brandChip,
                  { borderColor: theme.border },
                  isCustomBrand && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => handleSelectBrand('custom')}
                activeOpacity={0.8}
              >
                <Text style={styles.brandEmoji}>✨</Text>
                <Text
                  style={[
                    styles.brandChipText,
                    { color: theme.textPrimary },
                    isCustomBrand && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  Other Brand
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {isCustomBrand && (
              <View style={styles.customInputWrapper}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  ENTER VEHICLE BRAND / MAKE
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="e.g. Lotus, Tesla, VinFast, Pravaig"
                  placeholderTextColor={theme.textMuted}
                  value={customBrandName}
                  onChangeText={setCustomBrandName}
                />
              </View>
            )}
          </View>

          {/* =========================================================================
              2. MODEL & VARIANT SELECTION
          ========================================================================= */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
              {t('addVehicle.stepModel')}
            </Text>

            {!isCustomBrand ? (
              <>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.modelLabel')}
                </Text>
                <View style={styles.chipsWrap}>
                  {activeBrandObj?.models.map((model) => {
                    const isSelected = !isCustomModel && selectedModelName === model.name;
                    return (
                      <TouchableOpacity
                        key={model.id}
                        style={[
                          styles.modelChip,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => handleSelectModel(model.name)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modelChipText,
                            { color: theme.textPrimary },
                            isSelected && { color: '#FFFFFF', fontWeight: '800' },
                          ]}
                        >
                          {model.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={[
                      styles.modelChip,
                      { borderColor: theme.border },
                      isCustomModel && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => handleSelectModel('custom')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modelChipText,
                        { color: theme.textPrimary },
                        isCustomModel && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      + Other Model
                    </Text>
                  </TouchableOpacity>
                </View>

                {isCustomModel && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      ENTER MODEL NAME
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: theme.background,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="e.g. Concept EV, Special Edition"
                      placeholderTextColor={theme.textMuted}
                      value={customModelName}
                      onChangeText={setCustomModelName}
                    />
                  </View>
                )}

                {/* Variants List */}
                {!isCustomModel && activeModelObj && activeModelObj.variants.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      {t('addVehicle.variantLabel')}
                    </Text>
                    <View style={styles.variantsColumn}>
                      {activeModelObj.variants.map((variant) => {
                        const isSelected = selectedVariantName === variant.name;
                        return (
                          <TouchableOpacity
                            key={variant.name}
                            style={[
                              styles.variantItem,
                              { borderColor: theme.border, backgroundColor: theme.background },
                              isSelected && {
                                borderColor: theme.primary,
                                backgroundColor: 'rgba(0, 208, 132, 0.08)',
                              },
                            ]}
                            onPress={() => handleSelectVariant(variant)}
                            activeOpacity={0.8}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.variantTitle,
                                  { color: theme.textPrimary },
                                  isSelected && { color: theme.primary, fontWeight: '800' },
                                ]}
                              >
                                {variant.name}
                              </Text>
                              <Text style={[styles.variantSpecs, { color: theme.textSecondary }]}>
                                {variant.batteryCapacityKwh} kWh • Max {variant.maxDcPowerKw} kW DC • {variant.rangeKm} km
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.variantRadio,
                                { borderColor: isSelected ? theme.primary : theme.border },
                              ]}
                            >
                              {isSelected && (
                                <View
                                  style={[styles.variantRadioInner, { backgroundColor: theme.primary }]}
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={{ marginTop: 6 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.modelLabel')}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Enter model name"
                  placeholderTextColor={theme.textMuted}
                  value={customModelName}
                  onChangeText={setCustomModelName}
                />
              </View>
            )}
          </View>

          {/* =========================================================================
              3. TECHNICAL SPECIFICATIONS & PORTS (AUTO-FILLED & EDITABLE)
          ========================================================================= */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
              {t('addVehicle.stepSpecs')}
            </Text>
            <Text style={[styles.cardHeaderSub, { color: theme.textSecondary, marginBottom: 12 }]}>
              Calibrated for charging duration curves & station filtering
            </Text>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.batteryLabel')}
                </Text>
                <View style={styles.unitInputRow}>
                  <TextInput
                    style={[
                      styles.unitInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    value={batteryKwh}
                    onChangeText={setBatteryKwh}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>kWh</Text>
                </View>
              </View>

              <View style={styles.gridCol}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.maxDcLabel')}
                </Text>
                <View style={styles.unitInputRow}>
                  <TextInput
                    style={[
                      styles.unitInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    value={maxDcKw}
                    onChangeText={setMaxDcKw}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>kW</Text>
                </View>
              </View>
            </View>

            <View style={[styles.gridRow, { marginTop: 12 }]}>
              <View style={styles.gridCol}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.maxAcLabel')}
                </Text>
                <View style={styles.unitInputRow}>
                  <TextInput
                    style={[
                      styles.unitInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    value={maxAcKw}
                    onChangeText={setMaxAcKw}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>kW</Text>
                </View>
              </View>

              <View style={styles.gridCol}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {t('addVehicle.rangeLabel')}
                </Text>
                <View style={styles.unitInputRow}>
                  <TextInput
                    style={[
                      styles.unitInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    value={rangeKm}
                    onChangeText={setRangeKm}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.unitBadge, { color: theme.textSecondary }]}>km</Text>
                </View>
              </View>
            </View>

            {/* Connector Ports Multi-Select */}
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                {t('addVehicle.portsLabel')}
              </Text>
              <View style={styles.portsWrap}>
                {AVAILABLE_CONNECTORS.map((connector) => {
                  const isChecked = selectedPorts.includes(connector.id);
                  return (
                    <TouchableOpacity
                      key={connector.id}
                      style={[
                        styles.portChip,
                        { borderColor: theme.border },
                        isChecked && {
                          backgroundColor: 'rgba(0, 208, 132, 0.14)',
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => handleTogglePort(connector.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.portEmoji}>{connector.emoji}</Text>
                      <Text
                        style={[
                          styles.portChipText,
                          { color: theme.textPrimary },
                          isChecked && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        {connector.label}
                      </Text>
                      <Text style={[styles.portCheck, { color: isChecked ? theme.primary : theme.textMuted }]}>
                        {isChecked ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* =========================================================================
              4. NICKNAME, REGISTRATION & PRIMARY SELECTION
          ========================================================================= */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
              {t('addVehicle.stepNick')}
            </Text>

            <View style={{ marginTop: 6 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                {t('addVehicle.nicknameLabel')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder={t('addVehicle.nicknamePlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={nickname}
                onChangeText={setNickname}
              />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                {t('addVehicle.plateLabel')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    textTransform: 'uppercase',
                  },
                ]}
                placeholder={t('addVehicle.platePlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={registrationPlate}
                onChangeText={setRegistrationPlate}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            {/* Set as Primary Switch */}
            <View style={styles.primarySwitchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.primarySwitchTitle, { color: theme.textPrimary }]}>
                  {t('addVehicle.setPrimaryLabel')}
                </Text>
                <Text style={[styles.primarySwitchDesc, { color: theme.textSecondary }]}>
                  {t('addVehicle.setPrimaryDesc')}
                </Text>
              </View>
              <Switch
                value={isPrimary}
                onValueChange={setIsPrimary}
                trackColor={{ false: '#CBD5E1', true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* =========================================================================
              5. PRIMARY CTA BUTTON
          ========================================================================= */}
          <TouchableOpacity
            style={[styles.primaryCtaBtn, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryCtaText}>{t('addVehicle.submitBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================================================================
          6. CONFIRMATION SUCCESS MODAL
      ========================================================================= */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <View style={styles.successIconWrapper}>
              <Text style={styles.successIconEmoji}>🎉</Text>
            </View>

            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              {t('addVehicle.successTitle')}
            </Text>

            <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
              {isCustomBrand ? customBrandName : activeBrandObj?.name}{' '}
              {isCustomModel ? customModelName : selectedModelName} ({selectedVariantName})
              {' is now active in your ChargeMesh garage.'}
            </Text>

            <View style={[styles.successSummaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: theme.textPrimary }]}>{batteryKwh} kWh</Text>
                <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Battery Pack</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: theme.textPrimary }]}>{maxDcKw} kW</Text>
                <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Max DC Fast</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: theme.textPrimary }]}>{rangeKm} km</Text>
                <Text style={[styles.summaryLbl, { color: theme.textSecondary }]}>Est. Range</Text>
              </View>
            </View>

            {isPrimary && (
              <View style={styles.primaryBadgeSuccess}>
                <Text style={styles.primaryBadgeSuccessText}>🟢 Set as Primary Vehicle</Text>
              </View>
            )}

            <View style={styles.modalButtonsStack}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.replace('MyVehicles');
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalPrimaryBtnText}>{t('addVehicle.viewVehiclesBtn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { borderColor: theme.border }]}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Vehicle');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: theme.textPrimary }]}>
                  {t('addVehicle.goToGarageBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Validation Error Modal */}
      <StatusModal
        visible={showErrorModal}
        title="Vehicle Incomplete"
        message={errorMessage}
        type="error"
        badge="Input Required"
        iconEmoji="⚠️"
        onClose={() => setShowErrorModal(false)}
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
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardHeaderSub: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
  },
  brandEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  customInputWrapper: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  modelChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  variantsColumn: {
    gap: 8,
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  variantSpecs: {
    fontSize: 12,
    fontWeight: '500',
  },
  variantRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  variantRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  unitInputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  unitInput: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingRight: 48,
    fontSize: 15,
    fontWeight: '700',
  },
  unitBadge: {
    position: 'absolute',
    right: 12,
    fontSize: 12,
    fontWeight: '800',
  },
  portsWrap: {
    gap: 8,
  },
  portChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  portEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  portChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  portCheck: {
    fontSize: 14,
    fontWeight: '900',
  },
  infoDivider: {
    height: 1,
    marginVertical: 14,
  },
  primarySwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primarySwitchTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  primarySwitchDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  primaryCtaBtn: {
    height: 54,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadows.elevated,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 16, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.elevated,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIconEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  successSummaryCard: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryLbl: {
    fontSize: 10,
    fontWeight: '600',
  },
  primaryBadgeSuccess: {
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: 16,
  },
  primaryBadgeSuccessText: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '800',
  },
  modalButtonsStack: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalSecondaryBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
