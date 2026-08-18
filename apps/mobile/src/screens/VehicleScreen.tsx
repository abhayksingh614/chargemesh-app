import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { mockDefaultVehicle } from '../services/mockData';
import { Header, PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface VehicleScreenProps {
  navigation: any;
}

export const VehicleScreen: React.FC<VehicleScreenProps> = ({ navigation }) => {
  const [make, setMake] = useState(mockDefaultVehicle.make);
  const [model, setModel] = useState(mockDefaultVehicle.model);
  const [variant, setVariant] = useState(mockDefaultVehicle.variant || '');
  const [batteryKwh, setBatteryKwh] = useState(mockDefaultVehicle.batteryCapacityKwh?.toString() || '40.5');

  const handleSave = () => {
    Alert.alert('Vehicle Updated', 'Your vehicle compatibility profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My EV Profile 🚗"
        subtitle="Enables smart compatibility filtering"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Vehicle Card */}
        <View style={styles.activeCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.carIcon}>⚡</Text>
          </View>
          <Text style={styles.carName}>{make} {model}</Text>
          <Text style={styles.carVariant}>{variant}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔌 CCS2 (DC Fast)</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔋 {batteryKwh} kWh</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Edit Vehicle Details</Text>

        {/* Input Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Manufacturer (Make)</Text>
          <TextInput
            style={styles.input}
            value={make}
            onChangeText={setMake}
            placeholder="e.g. Tata, Mahindra, Hyundai"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vehicle Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="e.g. Nexon EV, XUV400, Ioniq 5"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Variant</Text>
          <TextInput
            style={styles.input}
            value={variant}
            onChangeText={setVariant}
            placeholder="e.g. Max Empowered+"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Battery Capacity (kWh)</Text>
          <TextInput
            style={styles.input}
            value={batteryKwh}
            onChangeText={setBatteryKwh}
            keyboardType="decimal-pad"
            placeholder="e.g. 40.5"
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton title="Save Vehicle Profile" onPress={handleSave} />
      </View>
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
    paddingBottom: 100,
  },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.ecoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carIcon: {
    fontSize: 28,
  },
  carName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  carVariant: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.captionBold,
    color: colors.darkGreen,
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 48,
    paddingHorizontal: 14,
    ...typography.body,
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 20,
  },
});
