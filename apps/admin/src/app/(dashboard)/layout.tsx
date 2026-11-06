'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAdminAuth } from '@/lib/authContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary)' }}>⚡ ChargeMesh Admin</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Authenticating secure admin session...</div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
