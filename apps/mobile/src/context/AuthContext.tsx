import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Vehicle,
  ConnectorType,
  UserProfile,
  UserGender,
  ChargingPreferences,
  NotificationPreferences,
} from '@chargemesh/shared-types';
import { mockVehicles } from '../services/mockData';
import { WELCOME_BONUS_AMOUNT_PAISE } from '../constants/appConstants';

export { UserProfile, UserGender, ChargingPreferences, NotificationPreferences };

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  user: UserProfile;
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicleId: (id: string) => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  topUpWallet: (
    amountPaise: number,
    referenceId?: string
  ) => { success: boolean; isDuplicate: boolean; newBalancePaise: number };
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  sendPhoneOtp: (phoneNumber: string) => Promise<boolean>;
  loginWithPhoneOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    phoneNumber: string,
    password?: string,
    vehicleModel?: string
  ) => Promise<boolean>;
  loginWithGoogle: (profile?: { name?: string; email?: string; avatarUrl?: string }) => Promise<boolean>;
  loginAsGuest: () => void | Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

// Build Version Identifier for Automatic Fresh-Launch Reset
export const CURRENT_BUILD_ID = 'cm_build_2026_08_26_v126_unifiedmock';

const STORAGE_KEYS = {
  USER_PROFILE: `@chargemesh:user_profile_${CURRENT_BUILD_ID}`,
  AUTH_TOKEN: `@chargemesh:auth_token_${CURRENT_BUILD_ID}`,
  ONBOARDING: `@chargemesh:onboarding_${CURRENT_BUILD_ID}`,
  VEHICLES: `@chargemesh:vehicles_${CURRENT_BUILD_ID}`,
  ACTIVE_VEHICLE: `@chargemesh:active_vehicle_${CURRENT_BUILD_ID}`,
  LAST_BUILD: '@chargemesh:last_installed_build',
};

export interface DemoUserCredentials {
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  otp: string;
  dob: string;
  gender: UserGender;
  state: string;
  district: string;
  city: string;
  pincode: string;
  address: string;
  userCode: string;
  membershipTier: string;
  memberSince: string;
  walletBalancePaise: number;
  totalKwhCharged: number;
  co2SavedKg: number;
  totalSessions: number;
  vehicleModel: string;
  vehiclePlate: string;
}

export const DEMO_USER_DATABASE: DemoUserCredentials[] = [
  {
    name: 'Abhay',
    firstName: 'Abhay',
    lastName: 'Singh',
    phoneNumber: '9876543210',
    email: 'abhay@gmail.com',
    password: 'Hello@123',
    otp: '123456',
    dob: '1993-11-22',
    gender: UserGender.MALE,
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    city: 'Noida',
    pincode: '201301',
    address: 'Tower 4, Sector 62, Electronic City',
    userCode: 'CM-DRV-6399',
    membershipTier: 'ChargeMesh Elite Member',
    memberSince: 'November 2023',
    walletBalancePaise: 204000, // ₹2,040.00 (Authoritative reconciled balance)
    totalKwhCharged: 428.5,
    co2SavedKg: 351.4,
    totalSessions: 18,
    vehicleModel: 'Tata Nexon EV Max Empowered+',
    vehiclePlate: 'DL 8C BC 2026',
  },
  {
    name: 'Rahul',
    firstName: 'Rahul',
    lastName: 'Sharma',
    phoneNumber: '9412602135',
    email: 'rahul@gmail.com',
    password: 'Hello@123',
    otp: '123456',
    dob: '1995-06-14',
    gender: UserGender.MALE,
    state: 'Nct of Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    pincode: '110001',
    address: 'A-42, Barakhamba Road, Connaught Place',
    userCode: 'CM-DRV-9412',
    membershipTier: 'ChargeMesh Pro Driver',
    memberSince: 'January 2024',
    walletBalancePaise: 204000,
    totalKwhCharged: 428.5,
    co2SavedKg: 351.4,
    totalSessions: 18,
    vehicleModel: 'Tata Nexon EV Max Empowered+',
    vehiclePlate: 'DL 8C BC 2026',
  },
];

const guestUser: UserProfile = {
  id: 'usr-guest',
  name: 'Guest Driver',
  firstName: 'Guest',
  lastName: 'Driver',
  phoneNumber: '',
  email: '',
  walletBalancePaise: 0,
  totalKwhCharged: 0,
  co2SavedKg: 0,
  totalSessions: 0,
  authProvider: 'guest',
  joiningBonusStatus: 'PENDING',
  joiningBonusAmountPaise: 10000,
  profileCompletionPercentage: 20,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(guestUser);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string>(mockVehicles[0]?.id ?? '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = !isAuthenticated || user.authProvider === 'guest';

  // Auto-clean storage on new build deployment
  useEffect(() => {
    const loadSession = async () => {
      try {
        const lastBuild = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BUILD);
        if (lastBuild !== CURRENT_BUILD_ID) {
          // Fresh build deployment detected -> Reset session for fresh test state
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_PROFILE,
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.ONBOARDING,
          ]);
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_BUILD, CURRENT_BUILD_ID);
          setIsAuthenticated(false);
          setUser(guestUser);
          setHasSeenOnboarding(false);
          setIsLoading(false);
          return;
        }

        const [savedUser, savedToken, savedOnboarding, savedVehicles, savedActiveVeh] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
          AsyncStorage.getItem(STORAGE_KEYS.VEHICLES),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE),
        ]);

        if (savedVehicles) {
          try {
            const parsedVehicles = JSON.parse(savedVehicles);
            if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) {
              setVehicles(parsedVehicles);
              if (savedActiveVeh) {
                setActiveVehicleIdState(savedActiveVeh);
              } else {
                const def = parsedVehicles.find((v: Vehicle) => v.isDefault) || parsedVehicles[0];
                setActiveVehicleIdState(def.id);
              }
            }
          } catch {}
        }

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } else {
          setUser(guestUser);
          setIsAuthenticated(false);
        }

        setHasSeenOnboarding(savedOnboarding === 'true');
      } catch {
        setUser(guestUser);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const completeOnboarding = async () => {
    setHasSeenOnboarding(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true').catch(() => {});
  };

  const resetOnboarding = async () => {
    setHasSeenOnboarding(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING).catch(() => {});
  };

  const sendPhoneOtp = async (phoneNumber: string): Promise<boolean> => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      return false;
    }
    // Simulate sending OTP SMS to India number
    await new Promise((res) => setTimeout(res, 400));
    return true;
  };

  const loginWithPhoneOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const cleanOtp = (otp || '').trim();
      // Validate OTP (allow valid 6-digit or demo '123456')
      if (cleanOtp.length !== 6 && cleanOtp !== '123456') {
        return false;
      }

      const rawPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      const demoUser = DEMO_USER_DATABASE.find(
        (u) => u.phoneNumber.replace(/\D/g, '').slice(-10) === rawPhone
      );

      const formattedPhone = rawPhone.length === 10
        ? `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}`
        : phoneNumber;

      const loggedUser: UserProfile = demoUser
        ? {
            id: `usr-${demoUser.phoneNumber}`,
            name: demoUser.name,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            phoneNumber: formattedPhone,
            email: demoUser.email,
            dob: demoUser.dob,
            gender: demoUser.gender,
            state: demoUser.state,
            district: demoUser.district,
            city: demoUser.city,
            pincode: demoUser.pincode,
            address: demoUser.address,
            userCode: demoUser.userCode,
            membershipTier: demoUser.membershipTier,
            memberSince: demoUser.memberSince,
            isPhoneVerified: true,
            isEmailVerified: true,
            profileCompletionPercentage: 95,
            joiningBonusStatus: 'CREDITED',
            joiningBonusAmountPaise: 10000,
            walletBalancePaise: demoUser.walletBalancePaise,
            totalKwhCharged: demoUser.totalKwhCharged,
            co2SavedKg: demoUser.co2SavedKg,
            totalSessions: demoUser.totalSessions,
            authProvider: 'phone',
            chargingPreferences: {
              autoFilterIncompatible: true,
              preferredSpeed: 'ULTRA_FAST',
              preferredConnector: ConnectorType.CCS2,
              preferredNetworks: ['Tata Power EZ Charge', 'Jio-bp pulse'],
              searchRadiusKm: 25,
            },
            notificationPreferences: {
              sessionAlerts: true,
              completionAlerts: true,
              stationAvailabilityAlerts: true,
              emailInvoices: true,
              promotionalOffers: false,
            },
          }
        : {
            id: `usr-ph-${Date.now()}`,
            name: 'EV Driver',
            firstName: 'EV',
            lastName: 'Driver',
            phoneNumber: formattedPhone,
            email: `${rawPhone || 'user'}@chargemesh.com`,
            state: 'Nct of Delhi',
            district: 'New Delhi',
            city: 'New Delhi',
            pincode: '110001',
            address: 'Connaught Place, New Delhi',
            userCode: `CM-DRV-${rawPhone.slice(-4)}`,
            membershipTier: 'ChargeMesh Driver',
            memberSince: 'August 2026',
            isPhoneVerified: true,
            isEmailVerified: false,
            profileCompletionPercentage: 70,
            joiningBonusStatus: 'CREDITED',
            joiningBonusAmountPaise: 10000,
            walletBalancePaise: 154000,
            totalKwhCharged: 428.5,
            co2SavedKg: 351.4,
            totalSessions: 18,
            authProvider: 'phone',
            chargingPreferences: {
              autoFilterIncompatible: true,
              preferredSpeed: 'ULTRA_FAST',
              preferredConnector: ConnectorType.CCS2,
              preferredNetworks: ['Tata Power EZ Charge'],
              searchRadiusKm: 25,
            },
            notificationPreferences: {
              sessionAlerts: true,
              completionAlerts: true,
              stationAvailabilityAlerts: true,
              emailInvoices: true,
              promotionalOffers: true,
            },
          };

      setUser(loggedUser);
      setIsAuthenticated(true);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(loggedUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `cm-phone-jwt-${Date.now()}`),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrPhone: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const input = (emailOrPhone || '').trim().toLowerCase();
      const rawDigits = emailOrPhone.replace(/\D/g, '').slice(-10);

      // Check against Demo User Database
      const demoUser = DEMO_USER_DATABASE.find(
        (u) =>
          u.email.toLowerCase() === input ||
          u.phoneNumber === rawDigits ||
          u.phoneNumber === input
      );

      if (demoUser) {
        if (password && password !== demoUser.password && password !== 'Hello@123') {
          return false;
        }
        const formattedPhone = `+91 ${demoUser.phoneNumber.slice(0, 5)} ${demoUser.phoneNumber.slice(5)}`;
        const loggedUser: UserProfile = {
          id: `usr-${demoUser.phoneNumber}`,
          name: demoUser.name,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          email: demoUser.email,
          phoneNumber: formattedPhone,
          dob: demoUser.dob,
          gender: demoUser.gender,
          state: demoUser.state,
          district: demoUser.district,
          city: demoUser.city,
          pincode: demoUser.pincode,
          address: demoUser.address,
          userCode: demoUser.userCode,
          membershipTier: demoUser.membershipTier,
          memberSince: demoUser.memberSince,
          isPhoneVerified: true,
          isEmailVerified: true,
          profileCompletionPercentage: 95,
          joiningBonusStatus: 'CREDITED',
          joiningBonusAmountPaise: 10000,
          walletBalancePaise: demoUser.walletBalancePaise,
          totalKwhCharged: demoUser.totalKwhCharged,
          co2SavedKg: demoUser.co2SavedKg,
          totalSessions: demoUser.totalSessions,
          authProvider: input.includes('@') ? 'email' : 'phone',
          chargingPreferences: {
            autoFilterIncompatible: true,
            preferredSpeed: 'ULTRA_FAST',
            preferredConnector: ConnectorType.CCS2,
            preferredNetworks: ['Tata Power EZ Charge', 'Jio-bp pulse'],
            searchRadiusKm: 25,
          },
          notificationPreferences: {
            sessionAlerts: true,
            completionAlerts: true,
            stationAvailabilityAlerts: true,
            emailInvoices: true,
            promotionalOffers: false,
          },
        };

        setUser(loggedUser);
        setIsAuthenticated(true);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(loggedUser)),
          AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `cm-jwt-token-${Date.now()}`),
        ]);
        return true;
      }

      // General Email / Phone login fallback
      const isEmail = input.includes('@');
      const formattedPhone = isEmail
        ? ''
        : emailOrPhone.startsWith('+91')
        ? emailOrPhone
        : `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`;

      const loggedUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: isEmail ? emailOrPhone : (rawDigits ? `${rawDigits}@chargemesh.com` : ''),
        phoneNumber: formattedPhone,
        name: isEmail ? emailOrPhone.split('@')[0].toUpperCase() : 'EV Driver',
        walletBalancePaise: 154000,
        totalKwhCharged: 428.5,
        co2SavedKg: 351.4,
        totalSessions: 18,
        authProvider: isEmail ? 'email' : 'phone',
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(loggedUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `cm-jwt-token-${Date.now()}`),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phoneNumber: string,
    _password?: string,
    vehicleModel?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+91')
        ? phoneNumber
        : `+91 ${phoneNumber.replace(/\D/g, '').slice(-10)}`;

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim() || 'EV Driver',
        email: email.trim(),
        phoneNumber: formattedPhone,
        walletBalancePaise: WELCOME_BONUS_AMOUNT_PAISE, // ₹100 welcome joining bonus credits
        totalKwhCharged: 0,
        co2SavedKg: 0,
        totalSessions: 0,
        authProvider: 'phone',
      };

      if (vehicleModel) {
        const newVehicle: Vehicle = {
          id: `veh-${Date.now()}`,
          userId: newUser.id,
          make: vehicleModel.split(' ')[0] || 'Tata',
          model: vehicleModel.split(' ').slice(1).join(' ') || 'EV',
          variant: 'Standard Range',
          connectorTypes: [ConnectorType.CCS2, ConnectorType.TYPE2],
          maxAcPowerKw: 7.2,
          maxDcPowerKw: 50,
          batteryCapacityKwh: 40.5,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setVehicles([newVehicle]);
        setActiveVehicleIdState(newVehicle.id);
      }

      setUser(newUser);
      setIsAuthenticated(true);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `cm-jwt-token-${Date.now()}`),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (profile?: { name?: string; email?: string; avatarUrl?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const googleUser: UserProfile = {
        id: `usr-g-${Date.now()}`,
        name: profile?.name || 'EV Driver',
        email: profile?.email || 'driver@chargemesh.com',
        phoneNumber: '',
        walletBalancePaise: 154000,
        totalKwhCharged: 428.5,
        co2SavedKg: 351.4,
        totalSessions: 18,
        authProvider: 'google',
      };

      setUser(googleUser);
      setIsAuthenticated(true);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(googleUser)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `cm-google-oauth-token-${Date.now()}`),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setUser(guestUser);
    setIsAuthenticated(true);
    setHasSeenOnboarding(true);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(guestUser)),
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'guest-session-token'),
      AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true'),
    ]).catch(() => {});
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setIsAuthenticated(false);
      setUser(guestUser);
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveVehiclesToStorage = (updatedVehicles: Vehicle[], activeId?: string) => {
    AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedVehicles)).catch(() => {});
    if (activeId) {
      AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, activeId).catch(() => {});
    }
  };

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
    setVehicles((prev) => {
      const updated = prev.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }));
      saveVehiclesToStorage(updated, id);
      return updated;
    });
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addVehicle = (newVeh: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const created: Vehicle = {
      ...newVeh,
      id: `veh-${Date.now()}`,
      userId: user.id || 'usr-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVehicles((prev) => {
      let updated: Vehicle[];
      if (newVeh.isDefault || prev.length === 0) {
        created.isDefault = true;
        updated = [...prev.map((v) => ({ ...v, isDefault: false })), created];
        setActiveVehicleIdState(created.id);
        saveVehiclesToStorage(updated, created.id);
      } else {
        updated = [...prev, created];
        saveVehiclesToStorage(updated, activeVehicleId);
      }
      return updated;
    });
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles((prev) => {
      const updatedList = prev.map((v) =>
        v.id === id
          ? {
              ...v,
              ...updated,
              updatedAt: new Date().toISOString(),
            }
          : updated.isDefault
          ? { ...v, isDefault: false }
          : v
      );
      if (updated.isDefault) {
        setActiveVehicleIdState(id);
        saveVehiclesToStorage(updatedList, id);
      } else {
        saveVehiclesToStorage(updatedList, activeVehicleId);
      }
      return updatedList;
    });
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => {
      const filtered = prev.filter((v) => v.id !== id);
      let newActiveId = activeVehicleId;
      if (activeVehicleId === id) {
        if (filtered.length > 0) {
          filtered[0].isDefault = true;
          newActiveId = filtered[0].id;
        } else {
          newActiveId = '';
        }
        setActiveVehicleIdState(newActiveId);
      }
      saveVehiclesToStorage(filtered, newActiveId);
      return filtered;
    });
  };

  // Set of processed idempotency keys
  const processedRefIds = React.useRef<Set<string>>(new Set());

  const topUpWallet = (
    amountPaise: number,
    referenceId?: string
  ): { success: boolean; isDuplicate: boolean; newBalancePaise: number } => {
    if (referenceId && processedRefIds.current.has(referenceId)) {
      // Intercept duplicate payment callback and prevent double credits
      return { success: true, isDuplicate: true, newBalancePaise: user.walletBalancePaise };
    }

    if (referenceId) {
      processedRefIds.current.add(referenceId);
    }

    const calculatedNewBalance = (user.walletBalancePaise || 0) + amountPaise;
    setUser((prev) => {
      const next = { ...prev, walletBalancePaise: (prev.walletBalancePaise || 0) + amountPaise };
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(next)).catch(() => {});
      return next;
    });

    return { success: true, isDuplicate: false, newBalancePaise: calculatedNewBalance };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        hasSeenOnboarding,
        isLoading,
        user,
        vehicles,
        activeVehicle: vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || null,
        setActiveVehicleId,
        updateUserProfile,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        topUpWallet,
        login,
        sendPhoneOtp,
        loginWithPhoneOtp,
        register,
        loginWithGoogle,
        loginAsGuest,
        logout,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
