'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/authContext';

const NAV_ITEMS = [
  { label: 'Executive Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Users & Drivers', path: '/users', icon: '👥', badge: '1,420' },
  { label: 'CPO Networks', path: '/cpos', icon: '🔌', badge: '12' },
  { label: 'Stations & Hubs', path: '/stations', icon: '📍', badge: '480' },
  { label: 'Live Chargers', path: '/chargers', icon: '⚡', live: true },
  { label: 'Bookings & Slots', path: '/bookings', icon: '📅' },
  { label: 'Charging Sessions', path: '/sessions', icon: '⏱️', live: true },
  { label: 'Finance & Ledger', path: '/finance', icon: '💳' },
  { label: 'Fast Wallet', path: '/wallet', icon: '💰' },
  { label: 'EV Master Catalog', path: '/ev-master', icon: '🚗' },
  { label: 'ESG Sustainability', path: '/sustainability', icon: '🌱' },
  { label: 'Broadcast Alerts', path: '/broadcasts', icon: '📢' },
  { label: 'Audit Trail', path: '/audit-logs', icon: '🛡️' },
  { label: 'Settings & Roles', path: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)',
          }}
        >
          ⚡
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Charge<span style={{ color: 'var(--brand-primary)' }}>Mesh</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            OPS & CPO PORTAL
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.live && (
                <span className="live-dot" style={{ backgroundColor: isActive ? '#FFFFFF' : 'var(--brand-primary)' }} />
              )}
              {item.badge && !item.live && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {user?.name ? user.name[0] : 'A'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.name || 'Administrator'}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--brand-primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {user?.role?.replace('_ADMIN', '') || 'SUPER ADMIN'}
          </div>
        </div>
      </div>
    </aside>
  );
}
