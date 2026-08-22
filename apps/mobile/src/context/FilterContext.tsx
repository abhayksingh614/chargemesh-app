import React, { createContext, useContext, useState } from 'react';
import { ConnectorType } from '@chargemesh/shared-types';

interface FilterState {
  searchQuery: string;
  selectedConnectors: ConnectorType[];
  minPowerKw: number;
  selectedCpoId: string | null;
  onlyAvailable: boolean;
  maxDistanceKm: number;
}

interface FilterContextType {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  toggleConnectorFilter: (type: ConnectorType) => void;
  setMinPowerKw: (power: number) => void;
  setSelectedCpoId: (cpoId: string | null) => void;
  setOnlyAvailable: (only: boolean) => void;
  setMaxDistanceKm: (dist: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  selectedConnectors: [],
  minPowerKw: 0,
  selectedCpoId: null,
  onlyAvailable: false,
  maxDistanceKm: 25,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setSearchQuery = (query: string) => setFilters((prev) => ({ ...prev, searchQuery: query }));

  const toggleConnectorFilter = (type: ConnectorType) => {
    setFilters((prev) => {
      const exists = prev.selectedConnectors.includes(type);
      return {
        ...prev,
        selectedConnectors: exists
          ? prev.selectedConnectors.filter((t) => t !== type)
          : [...prev.selectedConnectors, type],
      };
    });
  };

  const setMinPowerKw = (power: number) => setFilters((prev) => ({ ...prev, minPowerKw: power }));
  const setSelectedCpoId = (cpoId: string | null) => setFilters((prev) => ({ ...prev, selectedCpoId: cpoId }));
  const setOnlyAvailable = (only: boolean) => setFilters((prev) => ({ ...prev, onlyAvailable: only }));
  const setMaxDistanceKm = (dist: number) => setFilters((prev) => ({ ...prev, maxDistanceKm: dist }));

  const resetFilters = () => setFilters(defaultFilters);

  const hasActiveFilters =
    filters.selectedConnectors.length > 0 ||
    filters.minPowerKw > 0 ||
    filters.selectedCpoId !== null ||
    filters.onlyAvailable ||
    filters.maxDistanceKm < 25;

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSearchQuery,
        toggleConnectorFilter,
        setMinPowerKw,
        setSelectedCpoId,
        setOnlyAvailable,
        setMaxDistanceKm,
        resetFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
