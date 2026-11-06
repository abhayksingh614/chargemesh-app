'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_SESSIONS, AdminSession } from '@/lib/dataService';

export default function SessionsPage() {
  const [sessions] = useState<AdminSession[]>(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<AdminSession | null>(null);


  const activeSessions = sessions.filter((s) => s.status === 'CHARGING');

  const columns: Column<AdminSession>[] = [
    {
      header: 'Session ID',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.id}</strong>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(row.startTime).toLocaleDateString('en-IN')}</div>
        </div>
      ),
    },
    {
      header: 'Driver',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.userPhone}</div>
        </div>
      ),
    },
    {
      header: 'Station & Gun',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{row.stationName}</div>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>
            {row.cpoName} · {row.connectorType}
          </div>
        </div>
      ),
    },
    {
      header: 'Energy Delivered',
      accessor: (row) => `${row.energyKwh} kWh`,
    },
    {
      header: 'Duration',
      accessor: (row) => `${row.durationMinutes} mins`,
    },
    {
      header: 'Billed Amount',
      accessor: (row) => (
        <strong style={{ color: 'var(--text-primary)' }}>
          ₹{row.totalCostInr.toFixed(2)}
        </strong>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Action',
      align: 'right',
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSession(row);
          }}
          className="btn btn-secondary"
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          🔍 Inspect CDR
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Charging Sessions & CDR Logs
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time telemetry stream, active charging sessions, and Charge Detail Records (CDR)
          </p>
        </div>

        <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
          <span className="live-dot" /> WSS Telemetry Live
        </span>
      </div>

      {/* Live Active Sessions Card Banner */}
      {activeSessions.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot" />
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Live Active Charging Stream ({activeSessions.length})</strong>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-refreshing via TelemetryService</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{sess.userName}</strong>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {sess.socPercent}% SoC
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {sess.stationName} ({sess.cpoName})
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
                  <span>⚡ {sess.powerKw} kW ({sess.voltage}V / {sess.current}A)</span>
                  <span>{sess.energyKwh} kWh · ₹{sess.totalCostInr.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical CDR DataTable */}
      <DataTable
        columns={columns}
        data={sessions}
        searchPlaceholder="Search by Session ID, Driver, Station, or CPO..."
        searchKey={(row) => `${row.id} ${row.userName} ${row.stationName} ${row.cpoName}`}
        onRowClick={(row) => setSelectedSession(row)}
      />

      {/* CDR Detail Modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title={`Charge Detail Record (CDR): ${selectedSession.id}`}
          subtitle={`Driver: ${selectedSession.userName} · Status: ${selectedSession.status}`}
          maxWidth="620px"
          footer={
            <button onClick={() => setSelectedSession(null)} className="btn btn-secondary">
              Close CDR
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div><strong>Driver Name:</strong> {selectedSession.userName}</div>
              <div><strong>Driver Mobile:</strong> {selectedSession.userPhone}</div>
              <div><strong>Station Hub:</strong> {selectedSession.stationName}</div>
              <div><strong>CPO Operator:</strong> {selectedSession.cpoName}</div>
              <div><strong>Connector / Gun:</strong> {selectedSession.connectorType}</div>
              <div><strong>Peak Power Output:</strong> {selectedSession.powerKw} kW</div>
              <div><strong>Energy Delivered:</strong> {selectedSession.energyKwh} kWh</div>
              <div><strong>Total Duration:</strong> {selectedSession.durationMinutes} Minutes</div>
              <div><strong>Total Billed Amount:</strong> ₹{selectedSession.totalCostInr.toFixed(2)}</div>
              <div><strong>Payment Status:</strong> {selectedSession.paymentStatus}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Electrical Diagnostics
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                <div style={{ padding: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Voltage</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedSession.voltage} V</strong>
                </div>
                <div style={{ padding: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedSession.current} A</strong>
                </div>
                <div style={{ padding: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>End SoC</div>
                  <strong style={{ color: 'var(--brand-primary)' }}>{selectedSession.socPercent}%</strong>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
