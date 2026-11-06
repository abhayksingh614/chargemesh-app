'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/themeContext';
import { useAdminAuth } from '@/lib/authContext';
import { AdminRole } from '@chargemesh/shared-types';
import { Modal } from '@/components/Modal';

export function Topbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout } = useAdminAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSwitchRole = (role: AdminRole) => {
    login(`admin.${role.toLowerCase()}@chargemesh.com`, role);
    setShowRoleMenu(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace('/login');
  };

  return (
    <header className="admin-topbar">
      {/* Omni Search & Network Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 340 }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search Drivers, CPOs, Stations, Sessions, TxID..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              fontSize: 13,
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          <span className="live-dot" />
          OCPP 1.6-J CSMS Gateway: Live
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Role Switcher Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12.5 }}
          >
            🎭 Role: <strong style={{ color: 'var(--brand-primary)' }}>{user?.role?.replace('_ADMIN', '') || 'SUPER'}</strong> ▼
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 220,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                boxShadow: 'var(--shadow-lg)',
                padding: 6,
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '6px 8px' }}>
                SWITCH ACTIVE ADMIN ROLE
              </div>
              {Object.values(AdminRole).map((r) => (
                <button
                  key={r}
                  onClick={() => handleSwitchRole(r)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    fontSize: 12.5,
                    fontWeight: user?.role === r ? 700 : 500,
                    color: user?.role === r ? 'var(--brand-primary)' : 'var(--text-primary)',
                    backgroundColor: user?.role === r ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {r.replace('_', ' ')}
                  {user?.role === r && '✓'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{ width: 36, height: 36, padding: 0, fontSize: 16 }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="btn btn-secondary"
            style={{ width: 36, height: 36, padding: 0, fontSize: 16, position: 'relative' }}
          >
            🔔
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-amber)',
              }}
            />
          </button>

          {showAlerts && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 320,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                boxShadow: 'var(--shadow-lg)',
                padding: 12,
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Live Network Alerts (3)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: 8, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)', fontSize: 12 }}>
                  <strong style={{ color: 'var(--accent-amber)' }}>⚠️ CP-DELHI-001 Heartbeat Delay</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Connaught Place charger 45s latency.</p>
                </div>
                <div style={{ padding: 8, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)', fontSize: 12 }}>
                  <strong style={{ color: 'var(--brand-primary)' }}>✓ Wallet Reconciled</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Transaction #CM202608251042001 verified.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 12.5 }}
          title="Sign out of Admin Portal"
        >
          🚪 Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Sign Out of Admin Portal"
          subtitle="Are you sure you want to sign out?"
          maxWidth="420px"
          footer={
            <>
              <button onClick={() => setShowLogoutModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmLogout} className="btn btn-danger">
                Logout
              </button>
            </>
          }
        >
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            You will need to re-authenticate with your administrator credentials to access the ChargeMesh operations portal.
          </p>
        </Modal>
      )}
    </header>
  );
}
