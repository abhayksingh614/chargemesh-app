import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
  Linking,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { mockStations, StationWithDetails } from '../services/mockData';
import { ALL_STATES, ALL_DISTRICTS_WITH_STATE, getDistrictsForState } from '../data/stateDistrictData';
import { StationCard, ActiveSessionBanner } from '../components';
import { borderRadius } from '../theme';
import { useCharging, useTheme, useLanguage } from '../context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.88);
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SHEET_COLLAPSED_HEIGHT = 295;
const SHEET_EXPANDED_HEIGHT = Math.round(SCREEN_HEIGHT * 0.70);
const DEFAULT_COORDINATE: [number, number] = [77.2650, 28.5355];

// Ensure MapLibre is initialized
try {
  MapLibreGL.setAccessToken(null);
} catch {
  // Ignore if already set
}

// Clean Minimalist Map Styles (Light & Dark)
const getCleanMapStyle = (isDark: boolean) => {
  const tileUrl = isDark
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

  return JSON.stringify({
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '© CARTO, © OpenStreetMap',
      },
    },
    layers: [
      {
        id: 'carto-tiles',
        type: 'raster',
        source: 'carto',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  });
};

// Filter Option Types
interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
}

const RADIUS_OPTIONS: DropdownOption[] = [
  { id: '50', label: 'Within 50 km (Metro & Suburbs)', sublabel: 'Standard metro coverage & connecting hubs', icon: '🚗' },
  { id: '10', label: 'Within 10 km (Immediate)', sublabel: 'Closest charging hubs in your neighborhood', icon: '📍' },
  { id: '25', label: 'Within 25 km (City Wide)', sublabel: 'Stations across the city area', icon: '🏙️' },
  { id: '100', label: 'Within 100 km (Intercity Corridors)', sublabel: 'Highway & intercity fast charging stations', icon: '🛣️' },
  { id: 'all', label: 'All India (No Radius Limit)', sublabel: 'Show all matching stations nationwide', icon: '🇮🇳' },
];

const CPO_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All CPO Networks', sublabel: 'Show stations from all operators', icon: '🌐' },
  { id: 'tata', label: 'Tata Power EZ Charge', sublabel: 'Pan-India fast charging network', icon: '🏢' },
  { id: 'jio', label: 'Jio-bp pulse', sublabel: 'High-speed highway & city hubs', icon: '🔵' },
  { id: 'statiq', label: 'Statiq Grid', sublabel: 'Commercial & mall charging hubs', icon: '⚡' },
  { id: 'chargezone', label: 'ChargeZone', sublabel: 'Dedicated inter-city EV corridors', icon: '🔋' },
  { id: 'ather', label: 'Ather Grid', sublabel: 'Fast 2W & public stations', icon: '🏍️' },
  { id: 'zeon', label: 'Zeon Charging', sublabel: 'Ultra-fast highway charging', icon: '⚡' },
];

const POWER_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Power Levels', sublabel: 'Any output capacity', icon: '⚡' },
  { id: 'ultra', label: '120+ kW (Ultra-Fast DC)', sublabel: '10-80% in under 25 mins', icon: '🚀' },
  { id: 'fast', label: '50 - 120 kW (DC Fast)', sublabel: 'Standard highway DC chargers', icon: '⚡' },
  { id: 'ac_fast', label: '22 kW (AC Fast)', sublabel: 'Destination & mall AC chargers', icon: '🔌' },
  { id: 'ac_normal', label: '3.3 - 7.4 kW (AC Normal)', sublabel: 'Overnight & slow chargers', icon: '🔌' },
];

const AVAILABILITY_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Availability Status', sublabel: 'Available, busy and in-use bays', icon: '🌐' },
  { id: 'available', label: 'Available Now Only', sublabel: 'At least 1 bay free right now', icon: '🟢' },
  { id: 'occupied', label: 'Currently In-Use / Busy', sublabel: 'All bays currently occupied', icon: '🔴' },
];

const CONNECTOR_OPTIONS: DropdownOption[] = [
  { id: 'all', label: 'All Connector Plugs', sublabel: 'CCS2, Type 2, CHAdeMO, GB/T', icon: '🔌' },
  { id: 'ccs2', label: 'CCS Type 2 (DC Fast)', sublabel: 'Tata, MG, Hyundai, Kia, BYD', icon: '⚡' },
  { id: 'type2', label: 'Type 2 AC (Mennekes)', sublabel: 'Standard Indian 4W AC socket', icon: '🔌' },
  { id: 'chademo', label: 'CHAdeMO (DC)', sublabel: 'Nissan, legacy Japanese EVs', icon: '⚡' },
  { id: 'gbt', label: 'GB/T (DC / AC)', sublabel: 'Fleet & commercial vehicles', icon: '🔌' },
];

type ActiveDropdownType = 'radius' | 'state' | 'district' | 'cpo' | 'power' | 'availability' | 'connector' | null;

// Haversine Distance Calculation in Kilometers
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate Geographic Bounding Box & Optimal Viewport Zoom
const calculateBoundsForStations = (stations: (StationWithDetails & { calculatedDistanceKm?: number })[]) => {
  if (!stations || stations.length === 0) return null;
  if (stations.length === 1) {
    return {
      center: [stations[0].coordinates.longitude, stations[0].coordinates.latitude] as [number, number],
      zoom: 14.8,
    };
  }

  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;

  for (const s of stations) {
    if (s.coordinates) {
      if (s.coordinates.longitude < minLng) minLng = s.coordinates.longitude;
      if (s.coordinates.longitude > maxLng) maxLng = s.coordinates.longitude;
      if (s.coordinates.latitude < minLat) minLat = s.coordinates.latitude;
      if (s.coordinates.latitude > maxLat) maxLat = s.coordinates.latitude;
    }
  }

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const deltaLng = Math.abs(maxLng - minLng);
  const deltaLat = Math.abs(maxLat - minLat);
  const maxSpan = Math.max(deltaLng, deltaLat);

  let zoom = 14.0;
  if (maxSpan > 8.0) zoom = 5.2;
  else if (maxSpan > 4.0) zoom = 6.6;
  else if (maxSpan > 2.0) zoom = 8.2;
  else if (maxSpan > 1.0) zoom = 9.8;
  else if (maxSpan > 0.5) zoom = 11.2;
  else if (maxSpan > 0.2) zoom = 12.6;
  else if (maxSpan > 0.08) zoom = 13.6;
  else zoom = 14.6;

  return {
    center: [centerLng, centerLat] as [number, number],
    zoom,
    bounds: {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
    },
  };
};

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { isCharging } = useCharging();
  const { mode, theme } = useTheme();
  const { t } = useLanguage();
  const isDark = mode === 'dark';

  const [selectedRadius, setSelectedRadius] = useState<string>('50'); // Default 50 km
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCpo, setSelectedCpo] = useState<string>('all');
  const [selectedPower, setSelectedPower] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownType>(null);
  const [dropdownSearchText, setDropdownSearchText] = useState('');

  const cameraRef = useRef<any>(null);
  const horizontalListRef = useRef<FlatList>(null);
  const verticalListRef = useRef<FlatList>(null);
  const sheetHeightAnim = useRef(new Animated.Value(SHEET_COLLAPSED_HEIGHT)).current;

  // Master State & District Data directly from Master DB (36 States, 719 Districts)
  const allStates = ALL_STATES || [];
  const allDistricts = ALL_DISTRICTS_WITH_STATE || [];

  // Filtered districts list: strictly dependent on selectedState
  const districtsForSelectedState = useMemo(() => {
    if (!selectedState || selectedState === 'all') {
      return allDistricts;
    }
    const dists = getDistrictsForState(selectedState);
    if (!dists || dists.length === 0) return [];
    return dists.map((d) => ({
      district: d,
      state: selectedState,
    }));
  }, [selectedState, allDistricts]);

  // Count active stations per state for helpful UI badges
  const stateStationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of mockStations) {
      if (s && s.state) {
        const key = String(s.state).toLowerCase().trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Count active stations per district for helpful UI badges
  const districtStationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of mockStations) {
      if (s && s.district) {
        const key = String(s.district).toLowerCase().trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Filtered stations based on Radius, CPO, Connector, Power, Availability, State, District, and Search
  const filteredStations = useMemo(() => {
    const refLat = userLocation ? userLocation[1] : DEFAULT_COORDINATE[1];
    const refLon = userLocation ? userLocation[0] : DEFAULT_COORDINATE[0];
    const maxRadiusKm = selectedRadius === 'all' ? Infinity : parseFloat(selectedRadius);

    return mockStations
      .map((s) => {
        const dist = calculateDistanceKm(
          refLat,
          refLon,
          s.coordinates.latitude,
          s.coordinates.longitude
        );
        return {
          ...s,
          calculatedDistanceKm: dist,
        };
      })
      .filter((s) => {
        // 1. Radius Filter (relative to user or active center location)
        if (s.calculatedDistanceKm > maxRadiusKm) return false;

        // 2. Search Query (Station Name, CPO, City, District, State, Address)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.cpo?.name && s.cpo.name.toLowerCase().includes(q)) ||
            (s.city && s.city.toLowerCase().includes(q)) ||
            (s.district && s.district.toLowerCase().includes(q)) ||
            (s.state && s.state.toLowerCase().includes(q)) ||
            (s.address && s.address.toLowerCase().includes(q));
          if (!match) return false;
        }

        // 3. State Filter
        if (selectedState !== 'all') {
          const stateMatch =
            s.state && s.state.toLowerCase().trim() === selectedState.toLowerCase().trim();
          if (!stateMatch) return false;
        }

        // 4. District Filter (bound to state)
        if (selectedDistrict !== 'all') {
          const districtMatch =
            s.district && s.district.toLowerCase().trim() === selectedDistrict.toLowerCase().trim();
          if (!districtMatch) return false;
        }

        // 5. CPO Dropdown Filter
        if (selectedCpo !== 'all') {
          const cpoLower = s.cpo?.name?.toLowerCase() || '';
          if (selectedCpo === 'tata' && !cpoLower.includes('tata')) return false;
          if (selectedCpo === 'jio' && !cpoLower.includes('jio')) return false;
          if (selectedCpo === 'statiq' && !cpoLower.includes('statiq')) return false;
          if (selectedCpo === 'chargezone' && !cpoLower.includes('chargezone')) return false;
          if (selectedCpo === 'ather' && !cpoLower.includes('ather')) return false;
          if (selectedCpo === 'zeon' && !cpoLower.includes('zeon')) return false;
        }

        // 6. Power Dropdown Filter
        if (selectedPower === 'ultra' && s.maxPowerKw < 120) return false;
        if (selectedPower === 'fast' && (s.maxPowerKw < 50 || s.maxPowerKw >= 120)) return false;
        if (selectedPower === 'ac_fast' && (s.maxPowerKw < 15 || s.maxPowerKw > 30)) return false;
        if (selectedPower === 'ac_normal' && s.maxPowerKw > 15) return false;

        // 7. Availability Dropdown Filter
        if (selectedAvailability === 'available' && s.availableCount === 0) return false;
        if (selectedAvailability === 'occupied' && s.availableCount > 0) return false;

        // 8. Connector Dropdown Filter
        if (selectedConnector === 'ccs2' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('CCS'))) return false;
        if (selectedConnector === 'type2' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('TYPE2'))) return false;
        if (selectedConnector === 'chademo' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('CHADEMO'))) return false;
        if (selectedConnector === 'gbt' && !s.connectors?.some((c) => c.type?.toUpperCase().includes('GB/T') || c.type?.toUpperCase().includes('GBT'))) return false;

        return true;
      })
      .sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm);
  }, [
    searchQuery,
    selectedRadius,
    selectedState,
    selectedDistrict,
    selectedCpo,
    selectedPower,
    selectedAvailability,
    selectedConnector,
    userLocation,
  ]);

  const [selectedStation, setSelectedStation] = useState<
    (StationWithDetails & { calculatedDistanceKm?: number }) | null
  >(filteredStations.length > 0 ? filteredStations[0] : null);

  // Dynamic Camera Bounds and Auto-Zoom on Filter Modification
  useEffect(() => {
    if (!cameraRef.current) return;

    if (filteredStations.length === 0) {
      setSelectedStation(null);
      return;
    }

    const boundsInfo = calculateBoundsForStations(filteredStations);
    if (boundsInfo) {
      cameraRef.current.setCamera({
        centerCoordinate: boundsInfo.center,
        zoomLevel: boundsInfo.zoom,
        animationDuration: 850,
        animationMode: 'flyTo',
      });
    }

    // Ensure selected station matches current filtered array
    if (!filteredStations.some((s) => s.id === selectedStation?.id)) {
      setSelectedStation(filteredStations[0]);
    }
  }, [
    selectedRadius,
    selectedCpo,
    selectedPower,
    selectedAvailability,
    selectedConnector,
    selectedState,
    selectedDistrict,
  ]);

  // Two-Way Sync Handler: When Map Marker or Card is Selected
  const handleSelectStation = useCallback(
    (station: StationWithDetails & { calculatedDistanceKm?: number }, index?: number) => {
      if (!station) return;
      setSelectedStation(station);

      // Pan & Zoom Map Camera to the selected station
      if (cameraRef.current && station.coordinates) {
        cameraRef.current.setCamera({
          centerCoordinate: [station.coordinates.longitude, station.coordinates.latitude],
          zoomLevel: 15.0,
          animationDuration: 650,
          animationMode: 'flyTo',
        });
      }

      // Scroll bottom horizontal card list to the selected station
      const targetIndex =
        typeof index === 'number'
          ? index
          : filteredStations.findIndex((s) => s.id === station.id);

      if (targetIndex >= 0 && horizontalListRef.current) {
        try {
          horizontalListRef.current.scrollToIndex({
            index: targetIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch {
          // Ignore if layout not ready
        }
      }
    },
    [filteredStations]
  );

  // Open external maps navigation
  const handleOpenNavigation = useCallback((station: StationWithDetails) => {
    if (!station || !station.coordinates) return;
    const { latitude: lat, longitude: lng } = station.coordinates;
    const label = encodeURIComponent(station.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    }
  }, []);

  // Animate sheet expand/collapse
  const toggleSheet = (expand?: boolean) => {
    const target = typeof expand === 'boolean' ? expand : !isExpanded;
    setIsExpanded(target);
    Animated.spring(sheetHeightAnim, {
      toValue: target ? SHEET_EXPANDED_HEIGHT : SHEET_COLLAPSED_HEIGHT,
      damping: 20,
      stiffness: 200,
      useNativeDriver: false,
    }).start();
  };

  // Pan Responder for smooth sliding bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -35) {
          toggleSheet(true);
        } else if (gestureState.dy > 35) {
          toggleSheet(false);
        }
      },
    })
  ).current;

  // Do not prompt location on mount; permission setup is owned by PermissionSetupScreen
  useEffect(() => {
    // Map mounted
  }, []);

  const handleRecenterUserLocation = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 14.8,
        animationDuration: 900,
        animationMode: 'flyTo',
      });
    } else if (filteredStations.length > 0) {
      handleSelectStation(filteredStations[0], 0);
    }
  };

  const resetAllFilters = () => {
    setSelectedRadius('50');
    setSelectedState('all');
    setSelectedDistrict('all');
    setSelectedCpo('all');
    setSelectedPower('all');
    setSelectedAvailability('all');
    setSelectedConnector('all');
    setSearchQuery('');

    // Reset camera to reference coordinate
    if (cameraRef.current) {
      const refCoord = userLocation || DEFAULT_COORDINATE;
      cameraRef.current.setCamera({
        centerCoordinate: refCoord,
        zoomLevel: 13.5,
        animationDuration: 800,
      });
    }
  };

  const hasActiveFilters =
    selectedRadius !== '50' ||
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedCpo !== 'all' ||
    selectedPower !== 'all' ||
    selectedAvailability !== 'all' ||
    selectedConnector !== 'all' ||
    searchQuery.trim().length > 0;

  // Helper label getters for dropdown headers
  const getRadiusLabel = () => {
    if (selectedRadius === 'all') return 'All India';
    return `${selectedRadius} km`;
  };

  const getStateLabel = () => {
    return selectedState === 'all' ? 'All States' : selectedState;
  };

  const getDistrictLabel = () => {
    return selectedDistrict === 'all' ? 'All Districts' : selectedDistrict;
  };

  const getCpoLabel = () => {
    const item = CPO_OPTIONS.find((c) => c.id === selectedCpo);
    return selectedCpo === 'all' ? 'All CPOs' : item ? item.label.split(' ')[0] : 'CPO';
  };

  const getPowerLabel = () => {
    if (selectedPower === 'ultra') return '120kW+';
    if (selectedPower === 'fast') return '50-120kW';
    if (selectedPower === 'ac_fast') return '22kW AC';
    if (selectedPower === 'ac_normal') return '3.3-7.4kW';
    return 'All Speeds';
  };

  const getAvailabilityLabel = () => {
    if (selectedAvailability === 'available') return '🟢 Available';
    if (selectedAvailability === 'occupied') return '🔴 In-Use';
    return 'Availability';
  };

  const getConnectorLabel = () => {
    if (selectedConnector === 'ccs2') return '⚡ CCS2';
    if (selectedConnector === 'type2') return '🔌 Type 2';
    if (selectedConnector === 'chademo') return '⚡ CHAdeMO';
    if (selectedConnector === 'gbt') return '🔌 GB/T';
    return 'Connector';
  };

  // Search filtered states list (Alphabetically sorted)
  const filteredStatesList = useMemo(() => {
    if (!dropdownSearchText.trim()) return allStates;
    const q = dropdownSearchText.toLowerCase().trim();
    return allStates.filter((st) => st && st.toLowerCase().includes(q));
  }, [allStates, dropdownSearchText]);

  // Search filtered districts list (Alphabetically sorted)
  const filteredDistrictsList = useMemo(() => {
    if (!dropdownSearchText.trim()) return districtsForSelectedState;
    const q = dropdownSearchText.toLowerCase().trim();
    return districtsForSelectedState.filter(
      (item) =>
        item &&
        item.district &&
        (item.district.toLowerCase().includes(q) || (item.state && item.state.toLowerCase().includes(q)))
    );
  }, [districtsForSelectedState, dropdownSearchText]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Floating Active Charging Session Banner */}
      {isCharging && <ActiveSessionBanner />}

      {/* Top Floating Search & Dropdown Filter Bars */}
      <View
        style={[
          styles.topFloatingSection,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* Search Input Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('map.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Dropdown Filter Chips Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* 1. Radius Filter Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedRadius !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('radius')}
          >
            <Text style={styles.dropdownIcon}>📍</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedRadius !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {getRadiusLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedRadius !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 2. CPO Operator Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedCpo !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('cpo')}
          >
            <Text style={styles.dropdownIcon}>🏢</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedCpo !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getCpoLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedCpo !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 3. Connector Type Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedConnector !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('connector')}
          >
            <Text style={styles.dropdownIcon}>🔌</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedConnector !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getConnectorLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedConnector !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 4. Power Speed Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedPower !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('power')}
          >
            <Text style={styles.dropdownIcon}>⚡</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedPower !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getPowerLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedPower !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 5. Availability Status Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedAvailability !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => setActiveDropdown('availability')}
          >
            <Text style={styles.dropdownIcon}>🟢</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedAvailability !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
            >
              {getAvailabilityLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedAvailability !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 6. State Dropdown (Master 36 States & UTs) */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedState !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => {
              setDropdownSearchText('');
              setActiveDropdown('state');
            }}
          >
            <Text style={styles.dropdownIcon}>🏛️</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedState !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {getStateLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedState !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* 7. District Dropdown (Strictly Dependent on Selected State) */}
          <TouchableOpacity
            style={[
              styles.dropdownPill,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              selectedDistrict !== 'all' && {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => {
              setDropdownSearchText('');
              setActiveDropdown('district');
            }}
          >
            <Text style={styles.dropdownIcon}>📍</Text>
            <Text
              style={[
                styles.dropdownPillText,
                { color: theme.textSecondary },
                selectedDistrict !== 'all' && { color: theme.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {getDistrictLabel()}
            </Text>
            <Text
              style={[
                styles.dropdownChevron,
                { color: selectedDistrict !== 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              ▾
            </Text>
          </TouchableOpacity>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={[
                styles.resetPill,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              activeOpacity={0.8}
              onPress={resetAllFilters}
            >
              <Text style={[styles.resetPillText, { color: theme.textSecondary }]}>✕ Reset</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Clean Simple Map Viewport Area */}
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.mapView}
          mapStyle={getCleanMapStyle(isDark)}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={14.0}
            centerCoordinate={
              selectedStation?.coordinates
                ? [selectedStation.coordinates.longitude, selectedStation.coordinates.latitude]
                : DEFAULT_COORDINATE
            }
            animationMode="flyTo"
            animationDuration={750}
          />

          {/* Live User Location */}
          <MapLibreGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            onUpdate={(loc: any) => {
              if (loc?.coords) {
                setUserLocation([loc.coords.longitude, loc.coords.latitude]);
              }
            }}
          />

          {/* Clean Map Pins for Filtered Stations Only */}
          {filteredStations.map((station, index) => {
            const isSelected = selectedStation?.id === station.id;
            const isAvailable = station.availableCount > 0;

            return (
              <MapLibreGL.PointAnnotation
                key={station.id}
                id={station.id}
                coordinate={[station.coordinates.longitude, station.coordinates.latitude]}
                onSelected={() => handleSelectStation(station, index)}
              >
                <View
                  style={[
                    styles.simpleMapPin,
                    {
                      backgroundColor: isAvailable ? '#16A34A' : '#EA580C',
                    },
                    isSelected && styles.simpleMapPinSelected,
                  ]}
                >
                  <Text style={styles.simplePinText}>
                    ⚡ {station.maxPowerKw}kW
                  </Text>
                </View>
              </MapLibreGL.PointAnnotation>
            );
          })}
        </MapLibreGL.MapView>

        {/* Floating Station Counter Tag (Top-Left of Map) */}
        <View
          style={[
            styles.stationCountTag,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.stationCountTagText, { color: theme.textPrimary }]}>
            ⚡ {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stations'} (
            {selectedRadius === 'all' ? 'Pan-India' : `${selectedRadius} km`})
          </Text>
        </View>

        {/* GPS Recenter Button Inside Map Viewport (Top-Right) */}
        <TouchableOpacity
          style={[
            styles.gpsFloatButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.85}
          onPress={handleRecenterUserLocation}
        >
          <Text style={styles.gpsFloatIcon}>🎯</Text>
        </TouchableOpacity>

        {/* Sliding Bottom Sheet for Stations (Synchronized & Expandable) */}
        <Animated.View
          style={[
            styles.slidingBottomSheet,
            {
              height: sheetHeightAnim,
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
            },
          ]}
        >
          {/* Drag Handle Bar & Header */}
          <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
            <View style={[styles.sheetDragBar, { backgroundColor: theme.textMuted }]} />
            <TouchableOpacity
              onPress={() => toggleSheet()}
              style={styles.sheetHeaderToggle}
              activeOpacity={0.8}
            >
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                {filteredStations.length > 0
                  ? isExpanded
                    ? `⚡ Matching Charging Hubs (${filteredStations.length})`
                    : `⚡ ${selectedStation ? selectedStation.name : 'Selected Hub'}`
                  : '🔍 No Matching Charging Hubs'}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.primary }]}>
                {filteredStations.length > 0
                  ? isExpanded
                    ? 'Slide Down to Collapse ▾'
                    : `Slide Up for All ${filteredStations.length} Matching Hubs ▴`
                  : 'Tap to reset active filters'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* List of Stations */}
          {filteredStations.length > 0 ? (
            !isExpanded ? (
              /* Collapsed State: Synchronized Horizontal Card Carousel */
              <View style={styles.horizontalCarouselWrap}>
                <FlatList
                  ref={horizontalListRef}
                  data={filteredStations}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SNAP_INTERVAL}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  contentContainerStyle={styles.horizontalListContent}
                  getItemLayout={(_, index) => ({
                    length: SNAP_INTERVAL,
                    offset: SNAP_INTERVAL * index,
                    index,
                  })}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                    if (filteredStations[index] && filteredStations[index].id !== selectedStation?.id) {
                      handleSelectStation(filteredStations[index], index);
                    }
                  }}
                  renderItem={({ item, index }) => {
                    const isSelected = selectedStation?.id === item.id;
                    return (
                      <View
                        style={[
                          styles.horizontalCardItem,
                          { width: CARD_WIDTH, marginRight: CARD_GAP },
                        ]}
                      >
                        <StationCard
                          station={item}
                          isSelected={isSelected}
                          customDistanceKm={item.calculatedDistanceKm}
                          containerStyle={{ marginHorizontal: 0, marginBottom: 0 }}
                          onPress={() => {
                            handleSelectStation(item, index);
                            navigation.navigate('StationDetail', { stationId: item.id });
                          }}
                          onNavigate={() => handleOpenNavigation(item)}
                        />
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              /* Expanded State: Full Vertical List of Filtered Hubs */
              <FlatList
                ref={verticalListRef}
                data={filteredStations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.verticalListContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <Text style={[styles.expandedSectionHeader, { color: theme.textSecondary }]}>
                    MATCHING CHARGING HUBS WITHIN {selectedRadius === 'all' ? 'INDIA' : `${selectedRadius} KM`} ({filteredStations.length})
                  </Text>
                }
                renderItem={({ item, index }) => {
                  const isSelected = selectedStation?.id === item.id;
                  return (
                    <View key={item.id} style={styles.stationCardWrap}>
                      <StationCard
                        station={item}
                        isSelected={isSelected}
                        customDistanceKm={item.calculatedDistanceKm}
                        onPress={() => {
                          handleSelectStation(item, index);
                          navigation.navigate('StationDetail', { stationId: item.id });
                        }}
                        onNavigate={() => handleOpenNavigation(item)}
                      />
                    </View>
                  );
                }}
              />
            )
          ) : (
            /* Empty Filtered Result State */
            <View style={styles.emptyFilteredBox}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No Charging Stations Found
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                {selectedRadius !== 'all'
                  ? `No charging stations match your active filters within ${selectedRadius} km. Try expanding the radius or resetting filters.`
                  : 'No charging stations match your active filter criteria. Try resetting filters.'}
              </Text>
              <TouchableOpacity
                style={[styles.emptyResetBtn, { backgroundColor: theme.primary }]}
                onPress={resetAllFilters}
              >
                <Text style={styles.emptyResetBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Full-Height Interactive Dropdown Picker Bottom Sheet Modal */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActiveDropdown(null);
          setDropdownSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Tap to Close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => {
              setActiveDropdown(null);
              setDropdownSearchText('');
            }}
          />

          {/* Structured Bottom Sheet Container */}
          <View style={[styles.dropdownModalSheet, { backgroundColor: theme.surface }]}>
            {/* Sheet Handle */}
            <View style={styles.modalSheetHandleBar} />

            {/* Dropdown Header with Item Counter */}
            <View style={styles.dropdownModalHeader}>
              <Text style={[styles.dropdownModalTitle, { color: theme.textPrimary }]}>
                {activeDropdown === 'radius' && '📍 Select Search Radius'}
                {activeDropdown === 'state' && `🏛️ Select State / UT (${allStates.length})`}
                {activeDropdown === 'district' &&
                  (selectedState === 'all'
                    ? `📍 Select District (${allDistricts.length} across India)`
                    : `📍 Select District in ${selectedState} (${districtsForSelectedState.length})`)}
                {activeDropdown === 'cpo' && '🏢 Select CPO Network'}
                {activeDropdown === 'power' && '⚡ Select Charging Speed'}
                {activeDropdown === 'availability' && '🟢 Select Availability Status'}
                {activeDropdown === 'connector' && '🔌 Select Connector Type'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveDropdown(null);
                  setDropdownSearchText('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input for State/District Modals */}
            {(activeDropdown === 'state' || activeDropdown === 'district') && (
              <View
                style={[
                  styles.modalSearchBox,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
              >
                <Text style={{ marginRight: 6 }}>🔍</Text>
                <TextInput
                  style={[styles.modalSearchInput, { color: theme.textPrimary }]}
                  placeholder={
                    activeDropdown === 'state'
                      ? 'Search all 36 States/UTs...'
                      : selectedState === 'all'
                      ? 'Search all 719 districts...'
                      : `Search ${districtsForSelectedState.length} districts in ${selectedState}...`
                  }
                  placeholderTextColor={theme.textMuted}
                  value={dropdownSearchText}
                  onChangeText={setDropdownSearchText}
                />
                {dropdownSearchText.length > 0 && (
                  <TouchableOpacity onPress={() => setDropdownSearchText('')}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13, padding: 4 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 1. Radius Options */}
            {activeDropdown === 'radius' && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.dropdownOptionsScroll}>
                {RADIUS_OPTIONS.map((opt) => {
                  const isSelected = selectedRadius === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.dropdownOptionRow,
                        { borderColor: theme.border },
                        isSelected && {
                          backgroundColor: theme.primaryLight,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedRadius(opt.id);
                        setActiveDropdown(null);
                      }}
                    >
                      <View style={styles.optIconBox}>
                        <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                      </View>
                      <View style={styles.optTextBox}>
                        <Text
                          style={[
                            styles.optLabel,
                            { color: theme.textPrimary },
                            isSelected && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {opt.sublabel && (
                          <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                            {opt.sublabel}
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 18, color: theme.primary }}>
                        {isSelected ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* 2. High-Performance State Picker FlatList */}
            {activeDropdown === 'state' && (
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredStatesList}
                  keyExtractor={(item, index) => `state-${item}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={25}
                  contentContainerStyle={styles.flatListContent}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.dropdownOptionRow,
                        { borderColor: theme.border },
                        selectedState === 'all' && {
                          backgroundColor: theme.primaryLight,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedState('all');
                        setSelectedDistrict('all');
                        setActiveDropdown(null);
                        setDropdownSearchText('');
                      }}
                    >
                      <View style={styles.optIconBox}>
                        <Text style={{ fontSize: 18 }}>🇮🇳</Text>
                      </View>
                      <View style={styles.optTextBox}>
                        <Text
                          style={[
                            styles.optLabel,
                            { color: theme.textPrimary },
                            selectedState === 'all' && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          All States &amp; UTs (Pan-India)
                        </Text>
                        <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                          Show charging hubs across all 36 States &amp; UTs
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, color: theme.primary }}>
                        {selectedState === 'all' ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item: stateName }) => {
                    if (!stateName) return null;
                    const isSelected = selectedState.toLowerCase().trim() === stateName.toLowerCase().trim();
                    const dists = getDistrictsForState(stateName);
                    const distCount = dists ? dists.length : 0;
                    const stationCount = stateStationCounts[stateName.toLowerCase().trim()] || 0;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedState(stateName);
                          setSelectedDistrict('all');
                          setActiveDropdown(null);
                          setDropdownSearchText('');
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>🏛️</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.optLabel,
                                { color: theme.textPrimary },
                                isSelected && { color: theme.primary, fontWeight: '800' },
                              ]}
                            >
                              {stateName}
                            </Text>
                            {stationCount > 0 && (
                              <View style={[styles.activeStationBadge, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.activeStationBadgeText, { color: theme.primary }]}>
                                  ⚡ {stationCount} Hub{stationCount > 1 ? 's' : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                            {distCount} Districts mapped
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {/* 3. High-Performance District Picker FlatList */}
            {activeDropdown === 'district' && (
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredDistrictsList}
                  keyExtractor={(item, index) => `dist-${item?.state}-${item?.district}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={25}
                  contentContainerStyle={styles.flatListContent}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.dropdownOptionRow,
                        { borderColor: theme.border },
                        selectedDistrict === 'all' && {
                          backgroundColor: theme.primaryLight,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedDistrict('all');
                        setActiveDropdown(null);
                        setDropdownSearchText('');
                      }}
                    >
                      <View style={styles.optIconBox}>
                        <Text style={{ fontSize: 18 }}>📍</Text>
                      </View>
                      <View style={styles.optTextBox}>
                        <Text
                          style={[
                            styles.optLabel,
                            { color: theme.textPrimary },
                            selectedDistrict === 'all' && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          {selectedState === 'all'
                            ? 'All Districts across India'
                            : `All Districts in ${selectedState}`}
                        </Text>
                        <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                          {selectedState === 'all'
                            ? 'Show stations from all 719 districts'
                            : `Show all ${districtsForSelectedState.length} districts in ${selectedState}`}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, color: theme.primary }}>
                        {selectedDistrict === 'all' ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => {
                    if (!item || !item.district) return null;
                    const isSelected =
                      selectedDistrict.toLowerCase().trim() === item.district.toLowerCase().trim();
                    const stationCount = districtStationCounts[item.district.toLowerCase().trim()] || 0;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          if (item.state) {
                            setSelectedState(item.state);
                          }
                          setSelectedDistrict(item.district);
                          setActiveDropdown(null);
                          setDropdownSearchText('');
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>⚡</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.optLabel,
                                { color: theme.textPrimary },
                                isSelected && { color: theme.primary, fontWeight: '800' },
                              ]}
                            >
                              {item.district}
                            </Text>
                            {stationCount > 0 && (
                              <View style={[styles.activeStationBadge, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.activeStationBadgeText, { color: theme.primary }]}>
                                  ⚡ {stationCount} Hub{stationCount > 1 ? 's' : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                            {item.state}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {/* Other Filter Dropdowns (CPO, Power, Availability, Connector) */}
            {activeDropdown !== 'radius' && activeDropdown !== 'state' && activeDropdown !== 'district' && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.dropdownOptionsScroll}>
                {/* 4. CPO Options */}
                {activeDropdown === 'cpo' &&
                  CPO_OPTIONS.map((opt) => {
                    const isSelected = selectedCpo === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedCpo(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 5. Power Options */}
                {activeDropdown === 'power' &&
                  POWER_OPTIONS.map((opt) => {
                    const isSelected = selectedPower === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedPower(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 6. Availability Options */}
                {activeDropdown === 'availability' &&
                  AVAILABILITY_OPTIONS.map((opt) => {
                    const isSelected = selectedAvailability === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedAvailability(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                {/* 7. Connector Options */}
                {activeDropdown === 'connector' &&
                  CONNECTOR_OPTIONS.map((opt) => {
                    const isSelected = selectedConnector === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOptionRow,
                          { borderColor: theme.border },
                          isSelected && {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedConnector(opt.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <View style={styles.optIconBox}>
                          <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                        </View>
                        <View style={styles.optTextBox}>
                          <Text
                            style={[
                              styles.optLabel,
                              { color: theme.textPrimary },
                              isSelected && { color: theme.primary, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.sublabel && (
                            <Text style={[styles.optSublabel, { color: theme.textSecondary }]}>
                              {opt.sublabel}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 18, color: theme.primary }}>
                          {isSelected ? '●' : '○'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topFloatingSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 13,
    padding: 4,
  },
  filterScroll: {
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1.2,
    marginRight: 2,
  },
  dropdownIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  dropdownPillText: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 130,
  },
  dropdownChevron: {
    fontSize: 10,
    marginLeft: 5,
    fontWeight: '800',
  },
  resetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  resetPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  // Map Viewport
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapView: {
    flex: 1,
  },
  stationCountTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 15,
  },
  stationCountTagText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  // Simple Clean Map Pin
  simpleMapPin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  simpleMapPinSelected: {
    transform: [{ scale: 1.2 }],
    borderWidth: 2.5,
    borderColor: '#00D084',
    elevation: 10,
  },
  simplePinText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // GPS Button inside Top-Right of Map
  gpsFloatButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 15,
  },
  gpsFloatIcon: {
    fontSize: 18,
  },
  // Sliding Bottom Sheet
  slidingBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 20,
  },
  sheetHandleArea: {
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
  },
  sheetDragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
    opacity: 0.5,
  },
  sheetHeaderToggle: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  horizontalCarouselWrap: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
  },
  horizontalCardItem: {},
  verticalListContent: {
    paddingTop: 6,
    paddingBottom: 28,
  },
  stationCardWrap: {
    marginBottom: 4,
  },
  expandedSectionHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyFilteredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  // Modal Overlay & Structured Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  dropdownModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    height: SCREEN_HEIGHT * 0.76,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  modalSheetHandleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(150, 150, 150, 0.45)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  dropdownModalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    flex: 1,
  },
  modalCloseText: {
    fontSize: 13.5,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 32,
  },
  dropdownOptionsScroll: {
    flex: 1,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  optIconBox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optTextBox: {
    flex: 1,
    marginRight: 10,
  },
  optLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  optSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  activeStationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  activeStationBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});

