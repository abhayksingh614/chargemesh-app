'use client';

import React, { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_CPOS } from '@/lib/dataService';
import { AdminCpoDetail } from '@chargemesh/shared-types';

export default function CposPage() {
  const [cpos, setCpos] = useState<AdminCpoDetail[]>(INITIAL_CPOS);
  const [selectedCpo, setSelectedCpo] = useState<AdminCpoDetail | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessId, setSyncSuccessId] = useState<string | null>(null);

  const handleTriggerSync = (cpoId: string) => {
    setSyncingId(cpoId);
    setTimeout(() => {
      setCpos((prev) =>
        prev.map((c) =>
          c.id === cpoId
            ? {
                ...c,
                lastSyncAt: new Date().toISOString(),
                lastSyncResult: {
                  status: 'SUCCESS',
                  locationsSynced: c.totalStationCount,
                  tariffsSynced: 4,
                  errorCount: 0,
                  timestamp: new Date().toISOString(),
                },
              }
            : c,
        ),
      );
      setSyncingId(null);
      setSyncSuccessId(cpoId);
      setTimeout(() => setSyncSuccessId(null), 3000);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            CPO Interoperability & Networks
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage Charge Point Operator partners, OCPI 2.3.0 synchronization, and network health
          </p>
        </div>

        <button
          onClick={() => {
            cpos.forEach((c) => handleTriggerSync(c.id));
          }}
          className="btn btn-primary"
        >
          🔄 Sync All 12 CPO Networks
        </button>
      </div>

      {/* CPO Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {cpos.map((cpo) => (
          <div key={cpo.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{cpo.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Party ID: <strong style={{ color: 'var(--text-secondary)' }}>{cpo.partyId}</strong> · Country: {cpo.countryCode}
                </div>
              </div>
              <StatusBadge status={cpo.integrationStatus} size="sm" />
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
              <div style={{ padding: '8px 4px', borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stations</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{cpo.totalStationCount}</div>
              </div>
              <div style={{ padding: '8px 4px', borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Chargers</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-primary)' }}>{cpo.totalOnlineChargers}</div>
              </div>
              <div style={{ padding: '8px 4px', borderRadius: 6, backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>30d Uptime</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-primary)' }}>{cpo.uptimePercent30d}%</div>
              </div>
            </div>

            {/* Sync Status */}
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Last Sync: {cpo.lastSyncAt ? new Date(cpo.lastSyncAt).toLocaleTimeString('en-IN') : 'Never'}</span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: 11 }}>
                {cpo.protocol}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setSelectedCpo(cpo)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '7px', fontSize: 12.5 }}
              >
                🔍 Inspect
              </button>
              <button
                onClick={() => handleTriggerSync(cpo.id)}
                disabled={syncingId === cpo.id}
                className="btn btn-primary"
                style={{ flex: 1, padding: '7px', fontSize: 12.5 }}
              >
                {syncingId === cpo.id ? '⏳ Syncing...' : syncSuccessId === cpo.id ? '✓ Synced!' : '🔄 OCPI Sync'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CPO Inspect Modal */}
      {selectedCpo && (
        <Modal
          isOpen={!!selectedCpo}
          onClose={() => setSelectedCpo(null)}
          title={`CPO Integration: ${selectedCpo.name}`}
          subtitle={`OCPI Protocol: ${selectedCpo.protocol} · Party Code: ${selectedCpo.partyId}`}
          footer={
            <button onClick={() => setSelectedCpo(null)} className="btn btn-secondary">
              Close Details
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div><strong>Support Phone:</strong> {selectedCpo.supportPhone || 'N/A'}</div>
              <div><strong>Support Email:</strong> {selectedCpo.supportEmail || 'N/A'}</div>
              <div><strong>Website:</strong> {selectedCpo.website || 'N/A'}</div>
              <div><strong>Revenue Share:</strong> {selectedCpo.revenueSharePercent}% CPO / {100 - selectedCpo.revenueSharePercent}% CM</div>
              <div><strong>Sync Interval:</strong> Every {selectedCpo.syncFrequencySeconds}s</div>
              <div><strong>Integration Status:</strong> <StatusBadge status={selectedCpo.integrationStatus} size="sm" /></div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Last Module Sync Result
              </h4>
              <pre
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                {JSON.stringify(selectedCpo.lastSyncResult || { status: 'PENDING_INIT' }, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
