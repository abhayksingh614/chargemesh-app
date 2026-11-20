'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole, AdminStatus } from '@chargemesh/shared-types';
import { adminApiClient } from './adminApiClient';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordOrRole?: string | AdminRole, roleOverride?: AdminRole) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'adm-001',
  email: 'admin@chargemesh.com',
  name: 'Abhay Singh (Super Admin)',
  role: AdminRole.SUPER_ADMIN,
  status: AdminStatus.ACTIVE,
  department: 'Platform Engineering & Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_SUPER_ADMIN,
  token: 'mock-admin-token-2026',
  isAuthenticated: true,
  isLoading: false,
  login: async () => true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(DEFAULT_SUPER_ADMIN);
  const [token, setToken] = useState<string | null>('mock-admin-token-2026');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('chargemesh_admin_user');
      const savedToken = localStorage.getItem('chargemesh_admin_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch {
      // LocalStorage is unavailable or corrupted during initial hydrate
    }
  }, []);

  const login = async (
    email: string,
    passwordOrRole?: string | AdminRole,
    roleOverride?: AdminRole,
  ): Promise<boolean> => {
    setIsLoading(true);
    const isRole =
      typeof passwordOrRole === 'string' &&
      (passwordOrRole.startsWith('SUPER_ADMIN') || passwordOrRole.endsWith('_ADMIN'));
    const password =
      typeof passwordOrRole === 'string' && !isRole ? passwordOrRole : undefined;
    let role = isRole
      ? (passwordOrRole as AdminRole)
      : roleOverride || AdminRole.SUPER_ADMIN;

    try {
      // 1. Attempt real API login if password provided or configured
      if (password) {
        const res = await adminApiClient.login(email, password);
        if (res.success && res.data?.token) {
          const rawAdmin = (res.data as any).admin || (res.data as any).user;
          const adminUser: AdminUser = rawAdmin
            ? {
                id: rawAdmin.id || 'adm-001',
                email: rawAdmin.email || email,
                name: rawAdmin.name || email.split('@')[0],
                role: rawAdmin.role || role,
                status: rawAdmin.status || AdminStatus.ACTIVE,
                department: rawAdmin.department || 'Platform Engineering',
                avatarUrl: rawAdmin.avatarUrl,
                createdAt: rawAdmin.createdAt || new Date().toISOString(),
                updatedAt: rawAdmin.updatedAt || new Date().toISOString(),
              }
            : {
                id: 'adm-001',
                email,
                name: email.split('@')[0],
                role,
                status: AdminStatus.ACTIVE,
                department: 'Platform Engineering',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

          setUser(adminUser);
          setToken(res.data.token);
          localStorage.setItem('chargemesh_admin_user', JSON.stringify(adminUser));
          localStorage.setItem('chargemesh_admin_token', res.data.token);
          setIsLoading(false);
          return true;
        } else if (process.env.NODE_ENV === 'production') {
          setIsLoading(false);
          return false;
        }
      }

      // In production, fallback without valid password/token is strictly disallowed
      if (process.env.NODE_ENV === 'production') {
        setIsLoading(false);
        return false;
      }

      // Development / Test Environment Fallback
      let name = 'Abhay Singh';
      let dept = 'Platform Engineering';

      if (role === AdminRole.OPERATIONS_ADMIN || email.includes('ops')) {
        name = 'Rohan Verma';
        dept = 'CPO & Station Operations';
        role = AdminRole.OPERATIONS_ADMIN;
      } else if (role === AdminRole.FINANCE_ADMIN || email.includes('finance')) {
        name = 'Priya Sharma';
        dept = 'Finance & Reconciliation';
        role = AdminRole.FINANCE_ADMIN;
      } else if (role === AdminRole.SUPPORT_ADMIN || email.includes('support')) {
        name = 'Ananya Gupta';
        dept = 'Driver Support & KYC';
        role = AdminRole.SUPPORT_ADMIN;
      }

      const adminUser: AdminUser = {
        id: `adm-${Date.now().toString().slice(-4)}`,
        email,
        name: `${name} (${role.replace('_ADMIN', '')})`,
        role,
        status: AdminStatus.ACTIVE,
        department: dept,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };

      const mockToken = `jwt-admin-${Date.now()}`;
      setUser(adminUser);
      setToken(mockToken);
      adminApiClient.setAuthToken(mockToken);
      localStorage.setItem('chargemesh_admin_user', JSON.stringify(adminUser));
      localStorage.setItem('chargemesh_admin_token', mockToken);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    adminApiClient.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('chargemesh_admin_user');
    localStorage.removeItem('chargemesh_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);
