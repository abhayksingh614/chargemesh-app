import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { mockStations } from '../services/mockData';
import { Header, ConnectorCard, PrimaryButton } from '../components';
import { colors, typography, borderRadius } from '../theme';
import { Connector, ConnectorStatus } from '@chargemesh/shared-types';

interface StationDetailScreenProps {
  route: any;
  navigation: any;
}

export const StationDetailScreen: React.FC<StationDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const stationId = route?.params?.stationId || mockStations[0].id;
  const station = mockStations.find(s => s.id === stationId) || mockStations[0];

  const [selectedConnector, setSelectedConnector] = useState<Connector>(
    station.connectors.find(c => c.status === ConnectorStatus.AVAILABLE) || station.connectors[0]
  );

  const isUsable = selectedConnector.status === ConnectorStatus.AVAILABLE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={station.name}
        subtitle={station.cpo.name}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareIcon}>↗</Text>
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
          title={isUsable ? "Continue to Pre-Charge" : "Select Available Connector"}
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
  shareBtn: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  decisionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
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
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  metaSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  openingText: {
    ...typography.bodySecondary,
    marginBottom: 6,
  },
  directionsText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  facilityPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  facilityChip: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  facilityText: {
    ...typography.captionBold,
    color: colors.darkGreen,
    fontSize: 11,
  },
  connectorsSection: {
    marginBottom: 20,
  },
  connectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  freshnessNotice: {
    ...typography.caption,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
    marginRight: 14,
  },
  bottomSelectedLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  bottomTariff: {
    ...typography.subtitle,
    color: colors.primary,
  },
  chargeCta: {
    flex: 1.4,
  },
});
