import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favoriteStationIds: string[];
  alertStationIds: Record<string, boolean>;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (stationId: string) => boolean;
  addFavorite: (stationId: string) => void;
  removeFavorite: (stationId: string) => void;
  isAlertEnabled: (stationId: string) => boolean;
  toggleAlert: (stationId: string) => boolean;
}

import { DEMO_FAVORITE_STATION_IDS } from '../services/demoUserData';

const FAVORITES_STORAGE_KEY = '@chargemesh_favorite_stations_v126';
const ALERTS_STORAGE_KEY = '@chargemesh_favorite_alerts_v126';

// Default initial favorites connected to real station IDs
const DEFAULT_FAVORITES = DEMO_FAVORITE_STATION_IDS;

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteStationIds, setFavoriteStationIds] = useState<string[]>(DEFAULT_FAVORITES);
  const [alertStationIds, setAlertStationIds] = useState<Record<string, boolean>>({
    'tp-del-01': true,
  });

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavs = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavs) {
          const parsed = JSON.parse(storedFavs);
          if (Array.isArray(parsed)) {
            setFavoriteStationIds(parsed);
          }
        }
        const storedAlerts = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
        if (storedAlerts) {
          setAlertStationIds(JSON.parse(storedAlerts));
        }
      } catch {
        // Fallback to defaults
      }
    };
    loadFavorites();
  }, []);

  // Save to AsyncStorage whenever state changes
  const saveFavorites = async (favs: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
    } catch {
      // Ignored
    }
  };

  const saveAlerts = async (alerts: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // Ignored
    }
  };

  const isFavorite = useCallback(
    (stationId: string) => {
      return favoriteStationIds.includes(stationId);
    },
    [favoriteStationIds]
  );

  const addFavorite = useCallback(
    (stationId: string) => {
      setFavoriteStationIds((prev) => {
        if (prev.includes(stationId)) return prev;
        const updated = [...prev, stationId];
        saveFavorites(updated);
        return updated;
      });
    },
    []
  );

  const removeFavorite = useCallback(
    (stationId: string) => {
      setFavoriteStationIds((prev) => {
        const updated = prev.filter((id) => id !== stationId);
        saveFavorites(updated);
        return updated;
      });
    },
    []
  );

  const toggleFavorite = useCallback(
    (stationId: string): boolean => {
      let isNowFav = false;
      setFavoriteStationIds((prev) => {
        let updated: string[];
        if (prev.includes(stationId)) {
          updated = prev.filter((id) => id !== stationId);
          isNowFav = false;
        } else {
          updated = [...prev, stationId];
          isNowFav = true;
        }
        saveFavorites(updated);
        return updated;
      });
      return isNowFav;
    },
    []
  );

  const isAlertEnabled = useCallback(
    (stationId: string) => {
      return !!alertStationIds[stationId];
    },
    [alertStationIds]
  );

  const toggleAlert = useCallback(
    (stationId: string): boolean => {
      let isNowActive = false;
      setAlertStationIds((prev) => {
        isNowActive = !prev[stationId];
        const updated = {
          ...prev,
          [stationId]: isNowActive,
        };
        saveAlerts(updated);
        return updated;
      });
      return isNowActive;
    },
    []
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteStationIds,
        alertStationIds,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        isAlertEnabled,
        toggleAlert,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
