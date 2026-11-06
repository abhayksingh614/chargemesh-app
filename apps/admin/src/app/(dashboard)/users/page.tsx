'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_DRIVERS } from '@/lib/dataService';
import { Vehicle } from '@chargemesh/shared-types';


type DriverRecord = typeof INITIAL_DRIVERS[0];

export default function UsersPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(INITIAL_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [statusActionDriver, setStatusActionDriver] = useState<DriverRecord | null>(null);
  const [actionReason, setActionReason] = useState('');

  const handleToggleStatus = (driver: DriverRecord) => {
    setStatusActionDriver(driver);
    setActionReason('');
  };

  const confirmStatusChange = () => {
    if (!statusActionDriver || !actionReason.trim()) return;
    const newStatus = statusActionDriver.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setDrivers((prev) =>
      prev.map((d) => (d.id === statusActionDriver.id ? { ...d, status: newStatus } : d)),
    );
    if (selectedDriver?.id === statusActionDriver.id) {
      setSelectedDriver((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setStatusActionDriver(null);
  };

  const columns: Column<DriverRecord>[] = [
    {
      header: 'Driver Name',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {row.firstName ? row.firstName[0] : row.name[0]}
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>{row.name}</strong>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.userCode || 'CM-DRV-xxxx'}</div>
          </div>
        </div>
      ),
    },
    { header: 'Mobile Number', accessor: 'phoneNumber' },
    { header: 'Email Address', accessor: 'email' },
    {
      header: 'Membership Tier',
      accessor: (row) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>
          {row.membershipTier || 'Driver'}
        </span>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: (row) => (
        <strong style={{ color: 'var(--text-primary)' }}>
          ₹{(row.walletBalancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      header: 'Lifetime Charged',
      accessor: (row) => `${row.totalKwhCharged} kWh`,
    },
    {
      header: 'Account Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDriver(row);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            🔍 Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={`btn ${row.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            {row.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Users & Driver Management
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage registered driver accounts, KYC statuses, verified vehicles, and wallet balances
          </p>
        </div>
      </div>

      {/* Driver DataTable */}
      <DataTable
        columns={columns}
        data={drivers}
        searchPlaceholder="Search by Name, Mobile (+91), Email, or User Code..."
        searchKey={(row) => `${row.name} ${row.phoneNumber} ${row.email} ${row.userCode}`}
        onRowClick={(row) => setSelectedDriver(row)}
      />

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`Driver Profile: ${selectedDriver.name}`}
          subtitle={`User Code: ${selectedDriver.userCode || 'N/A'} · Member Since ${selectedDriver.memberSince || '2024'}`}
          maxWidth="640px"
          footer={
            <button onClick={() => setSelectedDriver(null)} className="btn btn-secondary">
              Close Profile
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Overview Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wallet Balance</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 2 }}>
                  ₹{(selectedDriver.walletBalancePaise / 100).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Sessions</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {selectedDriver.totalSessions} Sessions
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 2 }}>
                  {selectedDriver.co2SavedKg} kg
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Location & KYC Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                <div><strong>Phone:</strong> {selectedDriver.phoneNumber}</div>
                <div><strong>Email:</strong> {selectedDriver.email}</div>
                <div><strong>City / State:</strong> {selectedDriver.city}, {selectedDriver.state}</div>
                <div><strong>Pincode:</strong> {selectedDriver.pincode}</div>
                <div><strong>Address:</strong> {selectedDriver.address}</div>
                <div><strong>Status:</strong> <StatusBadge status={selectedDriver.status} size="sm" /></div>
              </div>
            </div>

            {/* Registered Vehicles */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Verified Vehicles ({selectedDriver.vehicles?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedDriver.vehicles?.map((veh: Vehicle) => (
                  <div
                    key={veh.id}
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                    }}
                  >
                    <div>
                      <strong>🚗 {veh.make} {veh.model}</strong> ({veh.variant})
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Connectors: {veh.connectorTypes.join(', ')} · Max DC: {veh.maxDcPowerKw} kW
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 11 }}>
                      {veh.batteryCapacityKwh} kWh
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Confirmation Modal */}
      {statusActionDriver && (
        <Modal
          isOpen={!!statusActionDriver}
          onClose={() => setStatusActionDriver(null)}
          title={`Confirm Account Status: ${statusActionDriver.name}`}
          subtitle={`Current Status: ${statusActionDriver.status}`}
          footer={
            <>
              <button onClick={() => setStatusActionDriver(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={!actionReason.trim()}
                className={`btn ${statusActionDriver.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
              >
                Confirm {statusActionDriver.status === 'ACTIVE' ? 'Suspension' : 'Reactivation'}
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Are you sure you want to change the status of <strong>{statusActionDriver.name}</strong> to{' '}
              <strong style={{ color: statusActionDriver.status === 'ACTIVE' ? 'var(--accent-red)' : 'var(--brand-primary)' }}>
                {statusActionDriver.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}
              </strong>?
            </p>

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Mandatory Administrative Justification / Ticket Reference:
            </label>
            <textarea
              rows={3}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="e.g. Investigation regarding dispute #TKT-8841..."
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 13,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
