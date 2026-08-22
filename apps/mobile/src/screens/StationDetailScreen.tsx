import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { mockStations } from '../services/mockData';
import {
  Header,
  ConnectorCard,
  PrimaryButton,
  BookingModal,
  FormInputModal,
  StatusModal,
  AuthGateModal,
} from '../components';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Connector, ConnectorStatus } from '@chargemesh/shared-types';
import { useAuth } from '../context';

interface StationDetailScreenProps {
  route: any;
  navigation: any;
}

export const StationDetailScreen: React.FC<StationDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { isGuest } = useAuth();
  const stationId = route?.params?.stationId || mockStations[0].id;
  const station = mockStations.find((s) => s.id === stationId) || mockStations[0];

  const [selectedConnector, setSelectedConnector] = useState<Connector>(
    station.connectors.find((c) => c.status === ConnectorStatus.AVAILABLE) || station.connectors[0]
  );

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalContent, setStatusModalContent] = useState({
    title: '',
    message: '',
    type: 'success' as any,
  });

  const isUsable = selectedConnector.status === ConnectorStatus.AVAILABLE;

  const handleBooking = () => {
    if (isGuest) {
      setShowAuthGate(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (_connectorId: string, durationMinutes: number) => {
    setStatusModalContent({
      title: 'Slot Reserved Successfully! ⚡',
      message: `Bay ${selectedConnector.type} has been held exclusively for ${durationMinutes} minutes at ${station.name}. Navigate now to plug in.`,
      type: 'success',
    });
    setShowStatusModal(true);
  };

  const handleReportIssue = (_values: Record<string, string>) => {
    setStatusModalContent({
      title: 'Feedback Received',
      message: 'Thank you for helping maintain charging network reliability. Ticket dispatched to CPO operations.',
      type: 'success',
    });
    setShowStatusModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={station.name}
        subtitle={station.cpo.name}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => setShowReportModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.reportBtnText}>⚠️ Report</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Decision Summary Card */}
        <View style={styles.decisionCard}>
          <View style={styles.decisionRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {station.availableCount}/{station.totalConnectors}
              </Text>
              <Text style={styles.summaryLabel}>Available</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>⚡ {station.maxPowerKw} kW</Text>
              <Text style={styles.summaryLabel}>Max Power</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₹{station.tariffPerKwh}/kWh</Text>
              <Text style={styles.summaryLabel}>Tariff</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Row */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.reserveBtn}
            onPress={handleBooking}
            activeOpacity={0.85}
          >
            <Text style={styles.reserveBtnIcon}>📅</Text>
            <Text style={styles.reserveBtnText}>Reserve Slot (15m Hold)</Text>
          </TouchableOpacity>
        </View>

        {/* Station Metadata & Amenities */}
        <View style={styles.metaSection}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <Text style={styles.addressText}>📍 {station.address}</Text>
          <Text style={styles.openingText}>🕒 {station.openingTimes}</Text>
          {station.directions && (
            <Text style={styles.directionsText}>ℹ️ {station.directions}</Text>
          )}

          {station.facilities && (
            <View style={styles.facilityPills}>
              {station.facilities.map((fac, i) => (
                <View key={i} style={styles.facilityChip}>
                  <Text style={styles.facilityText}>{fac}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Connectors List */}
        <View style={styles.connectorsSection}>
          <View style={styles.connectorHeaderRow}>
            <Text style={styles.sectionTitle}>Select Connector</Text>
            <Text style={styles.freshnessNotice}>Updated in real-time</Text>
          </View>

          {station.connectors.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              tariffPerKwh={station.tariffPerKwh}
              selected={selectedConnector?.id === connector.id}
              onSelect={() => setSelectedConnector(connector)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomSelectedLabel}>
            {selectedConnector.type} ({selectedConnector.maxPower} kW)
          </Text>
          <Text style={styles.bottomTariff}>₹{station.tariffPerKwh}/kWh</Text>
        </View>

        <PrimaryButton
          title={isUsable ? 'Continue to Pre-Charge' : 'Select Available Connector'}
          disabled={!isUsable}
          onPress={() => {
            navigation.navigate('PreCharge', {
              stationId: station.id,
              connectorId: selectedConnector.id,
            });
          }}
          style={styles.chargeCta}
        />
      </View>

      {/* Unified Modals */}
      <BookingModal
        visible={showBookingModal}
        stationName={station.name}
        connectors={station.connectors.filter((c) => c.status === ConnectorStatus.AVAILABLE)}
        onClose={() => setShowBookingModal(false)}
        onConfirmBooking={handleConfirmBooking}
      />

      <FormInputModal
        visible={showReportModal}
        badge="Quality & Support"
        iconEmoji="⚠️"
        title="Report Station Issue"
        subtitle={`Notify ChargeMesh and ${station.cpo.name} about hardware, parking or payment issues.`}
        submitLabel="Send Report"
        fields={[
          { key: 'issueType', label: 'Issue Category', placeholder: 'e.g. Gun damaged, Blocked bay, Offline', required: true },
          { key: 'details', label: 'Description', placeholder: 'Provide additional details for our field crew...', multiline: true },
        ]}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportIssue}
      />

      <AuthGateModal
        visible={showAuthGate}
        featureName="Slot Reservation"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      <StatusModal
        visible={showStatusModal}
        type={statusModalContent.type}
        title={statusModalContent.title}
        message={statusModalContent.message}
        buttonLabel="Got It"
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
    paddingBottom: 110,
  },
  reportBtn: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  decisionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.darkGreen,
    fontWeight: '800',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  quickActionRow: {
    marginBottom: spacing.md,
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ecoLight,
    borderRadius: borderRadius.xl,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...shadows.card,
  },
  reserveBtnIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  reserveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  metaSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  openingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  directionsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  facilityPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  facilityChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  facilityText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  connectorsSection: {
    marginBottom: spacing.lg,
  },
  connectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  freshnessNotice: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.elevated,
  },
  bottomPriceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  bottomSelectedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomTariff: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 1,
  },
  chargeCta: {
    flex: 1.4,
  },
});
