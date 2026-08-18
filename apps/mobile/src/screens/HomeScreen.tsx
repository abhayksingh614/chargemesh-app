import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { mockStations, mockDefaultVehicle } from '../services/mockData';
import { StationCard, FilterChip } from '../components';
import { colors, typography, borderRadius } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredStations = mockStations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.cpo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'available') {
      return station.availableCount > 0;
    }
    if (selectedFilter === 'fast') {
      return station.maxPowerKw >= 50;
    }
    if (selectedFilter === 'my_ev') {
      return station.connectors.some(c => mockDefaultVehicle.connectorTypes.includes(c.type));
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Brand Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>ChargeMesh ⚡</Text>
          <Text style={styles.tagline}>Charge Green. Drive Smart.</Text>
        </View>
        <TouchableOpacity
          style={styles.vehiclePill}
          onPress={() => navigation.navigate('Vehicle')}
        >
          <Text style={styles.vehicleText}>🚗 {mockDefaultVehicle.make} {mockDefaultVehicle.model}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location, station, or CPO network..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        <FilterChip
          label="All Chargers"
          selected={selectedFilter === 'all'}
          onPress={() => setSelectedFilter('all')}
        />
        <FilterChip
          label="Available Now"
          icon="🟢"
          selected={selectedFilter === 'available'}
          onPress={() => setSelectedFilter(selectedFilter === 'available' ? 'all' : 'available')}
        />
        <FilterChip
          label="Fast DC (50+ kW)"
          icon="⚡"
          selected={selectedFilter === 'fast'}
          onPress={() => setSelectedFilter(selectedFilter === 'fast' ? 'all' : 'fast')}
        />
        <FilterChip
          label="My EV Compatible"
          icon="✓"
          selected={selectedFilter === 'my_ev'}
          onPress={() => setSelectedFilter(selectedFilter === 'my_ev' ? 'all' : 'my_ev')}
        />
      </ScrollView>

      {/* Nearby Stations List */}
      <ScrollView
        contentContainerStyle={styles.stationList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Charging Hubs</Text>
          <Text style={styles.stationCount}>{filteredStations.length} found</Text>
        </View>

        {filteredStations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            onPress={() => navigation.navigate('StationDetail', { stationId: station.id })}
          />
        ))}

        {filteredStations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔌</Text>
            <Text style={styles.emptyTitle}>No chargers match your filter</Text>
            <Text style={styles.emptySubtitle}>
              Try expanding your search radius or clearing filter criteria.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.darkGreen,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vehiclePill: {
    backgroundColor: colors.ecoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  vehicleText: {
    ...typography.captionBold,
    color: colors.darkGreen,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 4,
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  stationList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  stationCount: {
    ...typography.captionBold,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
