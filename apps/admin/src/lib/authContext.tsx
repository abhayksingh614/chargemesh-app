'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole, AdminStatus } from '@chargemesh/shared-types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: AdminRole) => Promise<boolean>;
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
    } catch {}
  }, []);

  const login = async (email: string, role: AdminRole = AdminRole.SUPER_ADMIN): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create authenticated admin persona based on email/role selection
      let name = 'Abhay Singh';
      let dept = 'Platform Engineering';

      if (role === AdminRole.OPERATIONS_ADMIN || email.includes('ops')) {
        name = 'Rohan Verma';
        dept = 'CPO & Station Operations';
      } else if (role === AdminRole.FINANCE_ADMIN || email.includes('finance')) {
        name = 'Priya Sharma';
        dept = 'Finance & Reconciliation';
      } else if (role === AdminRole.SUPPORT_ADMIN || email.includes('support')) {
        name = 'Ananya Gupta';
        dept = 'Driver Support & KYC';
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
      localStorage.setItem('chargemesh_admin_user', JSON.stringify(adminUser));
      localStorage.setItem('chargemesh_admin_token', mockToken);
      setIsLoading(false);
      return true;
    } catch (e) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
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
