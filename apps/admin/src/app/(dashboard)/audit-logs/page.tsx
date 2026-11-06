'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { JsonDiffViewer } from '@/components/JsonDiffViewer';
import { INITIAL_AUDIT_LOGS } from '@/lib/dataService';
import { AuditLogEntry } from '@chargemesh/shared-types';

export default function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);


  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{new Date(row.timestamp).toLocaleDateString('en-IN')}</strong>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(row.timestamp).toLocaleTimeString('en-IN')}</div>
        </div>
      ),
    },
    {
      header: 'Admin Actor',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.actorName}</div>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 700 }}>
            {row.actorRole.replace('_ADMIN', '')}
          </div>
        </div>
      ),
    },
    {
      header: 'Action Type',
      accessor: (row) => (
        <span
          className="badge"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: 11,
          }}
        >
          🛡️ {row.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {row.targetEntity}: <code style={{ fontSize: 11 }}>{row.targetId}</code>
        </span>
      ),
    },
    {
      header: 'Reason / Justification',
      accessor: 'reason',
    },
    {
      header: 'IP Address',
      accessor: (row) => <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.ipAddress}</code>,
    },
    {
      header: 'Inspection',
      align: 'right',
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(row);
          }}
          className="btn btn-secondary"
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          🔍 Inspect Diff
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
            System Audit Trail & Security Logs
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Immutable chronological record of administrative actions, payload diffs, and security modifications
          </p>
        </div>

        <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
          🔒 Tamper-Evident Ledger
        </span>
      </div>

      {/* Audit Log DataTable */}
      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search by Actor, Target ID, Action, or Reason..."
        searchKey={(row) => `${row.actorName} ${row.targetId} ${row.action} ${row.reason}`}
        onRowClick={(row) => setSelectedLog(row)}
      />

      {/* Audit Detail Modal with Diff Viewer */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Record: ${selectedLog.id}`}
          subtitle={`Actor: ${selectedLog.actorName} (${selectedLog.actorRole}) · Action: ${selectedLog.action}`}
          maxWidth="700px"
          footer={
            <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
              Close Audit Inspector
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div><strong>Target Entity:</strong> {selectedLog.targetEntity}</div>
              <div><strong>Target ID:</strong> <code>{selectedLog.targetId}</code></div>
              <div><strong>IP Address:</strong> <code>{selectedLog.ipAddress}</code></div>
              <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString('en-IN')}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Administrative Reason:</strong> {selectedLog.reason}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Before & After State Modification Diff
              </h4>
              <JsonDiffViewer
                previousValue={selectedLog.previousValue}
                newValue={selectedLog.newValue}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
