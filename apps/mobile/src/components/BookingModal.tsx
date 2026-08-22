import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AppModal } from './AppModal';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { Connector } from '@chargemesh/shared-types';

interface BookingModalProps {
  visible: boolean;
  stationName: string;
  connectors: Connector[];
  onClose: () => void;
  onConfirmBooking: (connectorId: string, durationMinutes: number) => void;
}

const HOLD_DURATIONS = [15, 30, 45];

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  stationName,
  connectors,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>(
    connectors[0]?.id || ''
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmBooking(selectedConnectorId, selectedDuration);
      onClose();
    }, 800);
  };

  return (
    <AppModal
      visible={visible}
      type="booking"
      badge="Slot Reservation"
      title={`Reserve Bay at ${stationName}`}
      subtitle="The connector will be held exclusively for you with GPS ETA routing."
      onClose={onClose}
      primaryAction={{
        label: `Confirm ${selectedDuration} min Hold`,
        onPress: handleConfirm,
        loading: isSubmitting,
      }}
      dismissLabel="Cancel"
    >
      {/* Connector Choice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SELECT CONNECTOR BAY</Text>
        <View style={styles.connectorsGrid}>
          {connectors.map((c) => {
            const isSelected = selectedConnectorId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.connectorCard, isSelected && styles.connectorCardActive]}
                onPress={() => setSelectedConnectorId(c.id)}
                activeOpacity={0.8}
              >
                <View style={styles.connectorHeader}>
                  <Text style={styles.connectorType}>{c.type}</Text>
                  <Text style={styles.connectorPower}>{c.maxPower || 50} kW</Text>
                </View>
                <Text style={styles.connectorTariff}>⚡ High Speed DC</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hold Duration Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ARRIVAL HOLD DURATION</Text>
        <View style={styles.durationRow}>
          {HOLD_DURATIONS.map((mins) => {
            const isSelected = selectedDuration === mins;
            return (
              <TouchableOpacity
                key={mins}
                style={[styles.durationBtn, isSelected && styles.durationBtnActive]}
                onPress={() => setSelectedDuration(mins)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.durationText, isSelected && styles.durationTextActive]}
                >
                  {mins} Minutes
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Reservation Fee Callout */}
      <View style={styles.feeCallout}>
        <Text style={styles.feeCalloutIcon}>💡</Text>
        <Text style={styles.feeCalloutText}>
          Hold fee of ₹50 is 100% refundable and automatically applied towards your charging bill.
        </Text>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  connectorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  connectorCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  connectorCardActive: {
    backgroundColor: colors.ecoLight,
    borderColor: colors.primary,
    ...shadows.card,
  },
  connectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  connectorType: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  connectorPower: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  connectorTariff: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  durationBtnActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    ...shadows.card,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  feeCallout: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feeCalloutIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  feeCalloutText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
});
