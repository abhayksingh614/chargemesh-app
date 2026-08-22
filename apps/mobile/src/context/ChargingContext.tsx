import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChargeTarget, Connector, SessionStatus } from '@chargemesh/shared-types';
import { StationWithDetails } from '../services/mockData';
import { useAuth } from './AuthContext';

export interface ActiveSessionDetails {
  sessionId: string;
  station: StationWithDetails;
  connector: Connector;
  targetType: ChargeTarget;
  targetValue: number;
  initialSoc: number;
  currentSoc: number;
  currentPowerKw: number;
  energyDeliveredKwh: number;
  elapsedSeconds: number;
  estimatedRemainingMinutes: number;
  accruedCostPaise: number;
  tariffPerKwh: number;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  carbonSavedKg: number;
}

interface ChargingContextType {
  activeSession: ActiveSessionDetails | null;
  lastCompletedSession: ActiveSessionDetails | null;
  isCharging: boolean;
  startSession: (
    station: StationWithDetails,
    connector: Connector,
    targetType: ChargeTarget,
    targetValue: number,
    initialSoc?: number
  ) => Promise<boolean>;
  stopSession: () => Promise<boolean>;
  clearCompletedSession: () => void;
}

const ChargingContext = createContext<ChargingContextType | undefined>(undefined);

export const ChargingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateUserProfile, activeVehicle } = useAuth();
  const [activeSession, setActiveSession] = useState<ActiveSessionDetails | null>(null);
  const [lastCompletedSession, setLastCompletedSession] = useState<ActiveSessionDetails | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isCharging = activeSession?.status === SessionStatus.CHARGING;

  // Real-time telemetry simulation engine
  useEffect(() => {
    if (activeSession && activeSession.status === SessionStatus.CHARGING) {
      intervalRef.current = setInterval(() => {
        setActiveSession((prev) => {
          if (!prev || prev.status !== SessionStatus.CHARGING) return prev;

          const maxStationPower = prev.connector.maxPower || 60;
          const maxVehiclePower = activeVehicle?.maxDcPowerKw || maxStationPower;
          const nominalPower = Math.min(maxStationPower, maxVehiclePower);

          // Battery charging curve physics simulation
          // Fast charging tapers down above 80% SoC
          let powerFactor = 1.0;
          if (prev.currentSoc > 80) {
            powerFactor = Math.max(0.25, 1.0 - (prev.currentSoc - 80) * 0.035);
          }
          // Slight realistic power jitter (± 1.2 kW)
          const jitter = (Math.random() - 0.5) * 2.4;
          const currentPowerKw = Math.max(5, Math.round((nominalPower * powerFactor + jitter) * 10) / 10);

          // Delivered energy per tick: (power in kW * (1 hr / 3600s))
          // For a good mobile demo experience, we accelerate tick progression slightly (1s real = 10s charging)
          const simulationSpeedMultiplier = 10;
          const energyIncrement = (currentPowerKw * simulationSpeedMultiplier) / 3600;
          const energyDeliveredKwh = Math.round((prev.energyDeliveredKwh + energyIncrement) * 100) / 100;

          // Battery capacity
          const batteryCap = activeVehicle?.batteryCapacityKwh || 40.5;
          const socIncrement = (energyIncrement / batteryCap) * 100;
          const currentSoc = Math.min(100, Math.round((prev.currentSoc + socIncrement) * 10) / 10);

          const elapsedSeconds = prev.elapsedSeconds + 1;
          const accruedCostPaise = Math.round(energyDeliveredKwh * prev.tariffPerKwh * 100);
          const carbonSavedKg = Math.round(energyDeliveredKwh * 0.82 * 100) / 100; // 0.82 kg CO2 saved per kWh vs fossil fuel

          // Time remaining estimation
          const remainingSocPct = Math.max(0, 100 - currentSoc);
          const remainingKwh = (remainingSocPct / 100) * batteryCap;
          const estimatedRemainingMinutes = Math.max(1, Math.round((remainingKwh / currentPowerKw) * 60));

          // Check if Target Reached
          let targetReached = false;
          if (prev.targetType === ChargeTarget.BATTERY && currentSoc >= prev.targetValue) {
            targetReached = true;
          } else if (prev.targetType === ChargeTarget.ENERGY && energyDeliveredKwh >= prev.targetValue) {
            targetReached = true;
          } else if (prev.targetType === ChargeTarget.AMOUNT && accruedCostPaise >= prev.targetValue * 100) {
            targetReached = true;
          } else if (prev.targetType === ChargeTarget.TIME && elapsedSeconds * simulationSpeedMultiplier >= prev.targetValue * 60) {
            targetReached = true;
          } else if (currentSoc >= 100) {
            targetReached = true;
          }

          if (targetReached) {
            // Auto complete session
            const completed: ActiveSessionDetails = {
              ...prev,
              currentSoc,
              currentPowerKw: 0,
              energyDeliveredKwh,
              elapsedSeconds,
              accruedCostPaise,
              carbonSavedKg,
              status: SessionStatus.COMPLETED,
              endTime: new Date().toISOString(),
            };
            setLastCompletedSession(completed);
            updateUserProfile({
              totalKwhCharged: (prev.energyDeliveredKwh || 0) + energyDeliveredKwh,
              co2SavedKg: carbonSavedKg,
            });
            return completed;
          }

          return {
            ...prev,
            currentSoc,
            currentPowerKw,
            energyDeliveredKwh,
            elapsedSeconds,
            accruedCostPaise,
            carbonSavedKg,
            estimatedRemainingMinutes,
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSession?.status, activeVehicle]);

  const startSession = async (
    station: StationWithDetails,
    connector: Connector,
    targetType: ChargeTarget,
    targetValue: number,
    initialSoc = 28
  ): Promise<boolean> => {
    const sessionId = `ses-${Date.now()}`;
    const newSession: ActiveSessionDetails = {
      sessionId,
      station,
      connector,
      targetType,
      targetValue,
      initialSoc,
      currentSoc: initialSoc,
      currentPowerKw: connector.maxPower || 50,
      energyDeliveredKwh: 0,
      elapsedSeconds: 0,
      estimatedRemainingMinutes: 35,
      accruedCostPaise: 0,
      tariffPerKwh: station.tariffPerKwh || 18.5,
      startTime: new Date().toISOString(),
      status: SessionStatus.CHARGING,
      carbonSavedKg: 0,
    };

    setActiveSession(newSession);
    return true;
  };

  const stopSession = async (): Promise<boolean> => {
    if (!activeSession) return false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const completed: ActiveSessionDetails = {
      ...activeSession,
      currentPowerKw: 0,
      status: SessionStatus.COMPLETED,
      endTime: new Date().toISOString(),
    };

    setActiveSession(null);
    setLastCompletedSession(completed);
    return true;
  };

  const clearCompletedSession = () => {
    setLastCompletedSession(null);
  };

  return (
    <ChargingContext.Provider
      value={{
        activeSession,
        lastCompletedSession,
        isCharging,
        startSession,
        stopSession,
        clearCompletedSession,
      }}
    >
      {children}
    </ChargingContext.Provider>
  );
};

export const useCharging = (): ChargingContextType => {
  const context = useContext(ChargingContext);
  if (!context) {
    throw new Error('useCharging must be used within a ChargingProvider');
  }
  return context;
};
