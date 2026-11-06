'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminRole, AdminStatus, AdminUser } from '@chargemesh/shared-types';

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-001',
    email: 'admin@chargemesh.com',
    name: 'Abhay Singh',
    role: AdminRole.SUPER_ADMIN,
    status: AdminStatus.ACTIVE,
    department: 'Platform Engineering & Architecture',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adm-002',
    email: 'ops@chargemesh.com',
    name: 'Rohan Verma',
    role: AdminRole.OPERATIONS_ADMIN,
    status: AdminStatus.ACTIVE,
    department: 'CPO & Station Operations',
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adm-003',
    email: 'finance@chargemesh.com',
    name: 'Priya Sharma',
    role: AdminRole.FINANCE_ADMIN,
    status: AdminStatus.ACTIVE,
    department: 'Finance & Ledger Reconciliation',
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adm-004',
    email: 'support@chargemesh.com',
    name: 'Ananya Gupta',
    role: AdminRole.SUPPORT_ADMIN,
    status: AdminStatus.ACTIVE,
    department: 'Driver Success & KYC',
    createdAt: '2024-04-10T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

export default function SettingsPage() {
  const [adminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [flags, setFlags] = useState({
    ECO_IMPACT: true,
    WALLET: true,
    RESERVATIONS: true,
    SMART_CHARGING: false,
    BATTERY_TARGET: true,
  });

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Platform Settings & RBAC Administration
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
          Manage administrative user accounts, role permissions, and global platform feature flags
        </p>
      </div>

      {/* Admin Users Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Administrative Users & RBAC Roles ({adminUsers.length})
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                      {u.role.replace('_ADMIN', '')}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td><StatusBadge status={u.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Feature Flags */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Global Platform Feature Flags
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {Object.entries(flags).map(([key, enabled]) => (
            <div
              key={key}
              style={{
                padding: 14,
                borderRadius: 8,
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{key}</strong>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {enabled ? 'Active across ecosystem' : 'Disabled / Dark launch'}
                </div>
              </div>

              <button
                onClick={() => toggleFlag(key as any)}
                className={`btn ${enabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration Reference */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Protocol & Integration Environment Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 13 }}>
          <div style={{ padding: 12, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>OCPI Version</div>
            <strong style={{ color: 'var(--text-primary)' }}>2.3.0 Standard</strong>
          </div>
          <div style={{ padding: 12, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>OCPP CSMS Subprotocol</div>
            <strong style={{ color: 'var(--brand-primary)' }}>ocpp1.6 JSON</strong>
          </div>
          <div style={{ padding: 12, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>OCPI Country & Party ID</div>
            <strong style={{ color: 'var(--text-primary)' }}>IN · CM</strong>
          </div>
          <div style={{ padding: 12, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Backend Port</div>
            <strong style={{ color: 'var(--text-primary)' }}>http://localhost:3000</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
