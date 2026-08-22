import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, ConnectorType } from '@chargemesh/shared-types';
import { mockVehicles } from '../services/mockData';

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  walletBalancePaise: number;
  totalKwhCharged: number;
  co2SavedKg: number;
  totalSessions: number;
  authProvider?: 'phone' | 'email' | 'google' | 'guest';
}

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
  topUpWallet: (amountPaise: number) => void;
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
export const CURRENT_BUILD_ID = 'cm_build_2026_08_22_147';

const STORAGE_KEYS = {
  USER_PROFILE: `@chargemesh:user_profile_${CURRENT_BUILD_ID}`,
  AUTH_TOKEN: `@chargemesh:auth_token_${CURRENT_BUILD_ID}`,
  ONBOARDING: `@chargemesh:onboarding_${CURRENT_BUILD_ID}`,
  LAST_BUILD: '@chargemesh:last_installed_build',
};

export interface DemoUserCredentials {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  otp: string;
  walletBalancePaise: number;
  totalKwhCharged: number;
  co2SavedKg: number;
  totalSessions: number;
  vehicleModel: string;
  vehiclePlate: string;
}

export const DEMO_USER_DATABASE: DemoUserCredentials[] = [
  {
    name: 'Rahul Sharma',
    phoneNumber: '9412602135',
    email: 'rahul123@gmail.com',
    password: 'Hello@123',
    otp: '123456',
    walletBalancePaise: 154000, // ₹1,540.00
    totalKwhCharged: 428.5,
    co2SavedKg: 351.4,
    totalSessions: 18,
    vehicleModel: 'Tata Nexon EV Max',
    vehiclePlate: 'DL 8C BC 2026',
  },
  {
    name: 'Abhay Kumar Singh',
    phoneNumber: '6399414330',
    email: 'abhay123@gmail.com',
    password: 'Hello@123',
    otp: '123456',
    walletBalancePaise: 210000, // ₹2,100.00
    totalKwhCharged: 612.0,
    co2SavedKg: 501.8,
    totalSessions: 26,
    vehicleModel: 'MG ZS EV Exclusive Pro',
    vehiclePlate: 'UP 16 DX 9941',
  },
];

const guestUser: UserProfile = {
  id: 'usr-guest',
  name: 'Guest Driver',
  phoneNumber: '',
  email: '',
  walletBalancePaise: 0,
  totalKwhCharged: 0,
  co2SavedKg: 0,
  totalSessions: 0,
  authProvider: 'guest',
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

        const [savedUser, savedToken, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        ]);

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
            phoneNumber: formattedPhone,
            email: demoUser.email,
            walletBalancePaise: demoUser.walletBalancePaise,
            totalKwhCharged: demoUser.totalKwhCharged,
            co2SavedKg: demoUser.co2SavedKg,
            totalSessions: demoUser.totalSessions,
            authProvider: 'phone',
          }
        : {
            id: `usr-ph-${Date.now()}`,
            name: 'EV Driver',
            phoneNumber: formattedPhone,
            email: `${rawPhone || 'user'}@chargemesh.in`,
            walletBalancePaise: 154000,
            totalKwhCharged: 428.5,
            co2SavedKg: 351.4,
            totalSessions: 18,
            authProvider: 'phone',
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
          email: demoUser.email,
          phoneNumber: formattedPhone,
          walletBalancePaise: demoUser.walletBalancePaise,
          totalKwhCharged: demoUser.totalKwhCharged,
          co2SavedKg: demoUser.co2SavedKg,
          totalSessions: demoUser.totalSessions,
          authProvider: input.includes('@') ? 'email' : 'phone',
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
        ? '+91 94126 02135'
        : emailOrPhone.startsWith('+91')
        ? emailOrPhone
        : `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`;

      const loggedUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: isEmail ? emailOrPhone : 'rahul123@gmail.com',
        phoneNumber: formattedPhone,
        name: isEmail ? emailOrPhone.split('@')[0].toUpperCase() : 'Rahul Sharma',
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
        walletBalancePaise: 10000, // ₹100 welcome joining bonus credits
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
        name: profile?.name || 'Alex Sharma',
        email: profile?.email || 'alex.sharma@gmail.com',
        phoneNumber: '+91 98765 43210',
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

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }))
    );
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
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVehicles((prev) => [...prev, created]);
    if (newVeh.isDefault) {
      setActiveVehicleIdState(created.id);
    }
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated, updatedAt: new Date().toISOString() } : v))
    );
  };

  const topUpWallet = (amountPaise: number) => {
    setUser((prev) => {
      const next = { ...prev, walletBalancePaise: prev.walletBalancePaise + amountPaise };
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(next)).catch(() => {});
      return next;
    });
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
        activeVehicle: vehicles.find((v) => v.id === activeVehicleId) || null,
        setActiveVehicleId,
        updateUserProfile,
        addVehicle,
        updateVehicle,
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
