import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { mockStations, StationWithDetails } from '../services/mockData';
import { StationCard } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [selectedStation, setSelectedStation] = useState<StationWithDetails>(mockStations[0]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Canvas Simulation */}
      <View style={styles.mapCanvas}>
        <View style={styles.mapGrid}>
          {/* Simulated Map Roads / Grid Lines */}
          <View style={styles.mapRoadH} />
          <View style={styles.mapRoadV} />

          {/* Interactive Simulated Map Markers */}
          {mockStations.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <TouchableOpacity
                key={station.id}
                activeOpacity={0.85}
                onPress={() => setSelectedStation(station)}
                style={[
                  styles.mapMarker,
                  isSelected && styles.mapMarkerSelected,
                  {
                    top: station.id === 'loc-okhla' ? '30%' : station.id === 'loc-cyberhub' ? '50%' : '20%',
                    left: station.id === 'loc-okhla' ? '25%' : station.id === 'loc-cyberhub' ? '65%' : '70%',
                  }
                ]}
              >
                <Text style={styles.markerEmoji}>⚡</Text>
                <View style={styles.markerCallout}>
                  <Text style={styles.markerText}>{station.availableCount} Avail</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Floating Controls */}
        <View style={styles.topControlBar}>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>📍 Delhi NCR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recenterButton}>
            <Text style={styles.recenterIcon}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Station Bottom Sheet Preview */}
        <View style={styles.bottomSheetContainer}>
          <StationCard
            station={selectedStation}
            onPress={() => navigation.navigate('StationDetail', { stationId: selectedStation.id })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadH: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#D1D5DB',
  },
  mapRoadV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#D1D5DB',
  },
  mapMarker: {
    position: 'absolute',
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapMarkerSelected: {
    backgroundColor: colors.darkGreen,
    transform: [{ scale: 1.15 }],
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerCallout: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 2,
  },
  markerText: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.darkGreen,
  },
  topControlBar: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  recenterButton: {
    backgroundColor: colors.surface,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recenterIcon: {
    fontSize: 20,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
  },
});
