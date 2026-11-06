'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_STATIONS } from '@/lib/dataService';
import { ConnectorStatus, FreshnessState } from '@chargemesh/shared-types';

interface FlatCharger {
  id: string;
  stationId: string;
  stationName: string;
  cpoName: string;
  connectorNumber: number;
  type: string;
  powerKw: number;
  status: ConnectorStatus;
  freshnessState: FreshnessState;
  lastUpdated: string;
}

export default function ChargersPage() {
  const initialChargers: FlatCharger[] = INITIAL_STATIONS.flatMap((st) =>
    st.connectors.map((c) => ({
      id: c.id,
      stationId: st.id,
      stationName: st.name,
      cpoName: st.cpoName,
      connectorNumber: c.connectorNumber,
      type: c.type,
      powerKw: c.powerKw,
      status: c.status,
      freshnessState: c.freshnessState,
      lastUpdated: c.lastUpdated,
    })),
  );

  const [chargers, setChargers] = useState<FlatCharger[]>(initialChargers);
  const [remoteCommandModal, setRemoteCommandModal] = useState<{

    charger: FlatCharger;
    command: 'RemoteStopTransaction' | 'Reset' | 'UnlockConnector';
  } | null>(null);
  const [commandSuccess, setCommandSuccess] = useState<string | null>(null);

  const handleExecuteRemoteCommand = () => {
    if (!remoteCommandModal) return;
    const cmd = remoteCommandModal.command;
    const chId = remoteCommandModal.charger.id;

    if (cmd === 'RemoteStopTransaction') {
      setChargers((prev) =>
        prev.map((c) => (c.id === chId ? { ...c, status: ConnectorStatus.AVAILABLE } : c)),
      );
    } else if (cmd === 'Reset') {
      setChargers((prev) =>
        prev.map((c) => (c.id === chId ? { ...c, status: ConnectorStatus.AVAILABLE } : c)),
      );
    }

    setCommandSuccess(`OCPP Command ${cmd} accepted by hardware EVSE controller.`);
    setTimeout(() => {
      setCommandSuccess(null);
      setRemoteCommandModal(null);
    }, 1800);
  };

  const columns: Column<FlatCharger>[] = [
    {
      header: 'Gun / Connector ID',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Gun #{row.connectorNumber} ({row.type})</strong>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {row.id}</div>
        </div>
      ),
    },
    {
      header: 'Station & CPO',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{row.stationName}</div>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>{row.cpoName}</div>
        </div>
      ),
    },
    {
      header: 'Max Output',
      accessor: (row) => (
        <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
          ⚡ {row.powerKw} kW
        </span>
      ),
    },
    {
      header: 'Operational Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Data Freshness',
      accessor: (row) => (
        <span
          className="badge"
          style={{
            backgroundColor: row.freshnessState === 'LIVE' ? 'var(--brand-primary-light)' : 'var(--accent-amber-light)',
            color: row.freshnessState === 'LIVE' ? 'var(--brand-primary)' : 'var(--accent-amber)',
            fontSize: 11,
          }}
        >
          {row.freshnessState === 'LIVE' ? '● Live (WSS)' : '⚠️ Stale (>300s)'}
        </span>
      ),
    },
    {
      header: 'OCPP Remote Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          {row.status === ConnectorStatus.IN_USE && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRemoteCommandModal({ charger: row, command: 'RemoteStopTransaction' });
              }}
              className="btn btn-danger"
              style={{ padding: '4px 8px', fontSize: 11.5 }}
            >
              🛑 Remote Stop
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRemoteCommandModal({ charger: row, command: 'Reset' });
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11.5 }}
          >
            🔄 Reset
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRemoteCommandModal({ charger: row, command: 'UnlockConnector' });
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11.5 }}
          >
            🔓 Unlock
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Live Chargers & EVSE Diagnostics
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time connector statuses, OCPI status telemetry, and Remote OCPP command RPC interface
          </p>
        </div>
      </div>

      {/* Chargers DataTable */}
      <DataTable
        columns={columns}
        data={chargers}
        searchPlaceholder="Search by Connector ID, Station, or Type (CCS2, Type 2)..."
        searchKey={(row) => `${row.id} ${row.stationName} ${row.type} ${row.cpoName}`}
      />

      {/* Remote Command Confirmation Modal */}
      {remoteCommandModal && (
        <Modal
          isOpen={!!remoteCommandModal}
          onClose={() => setRemoteCommandModal(null)}
          title={`Execute OCPP RPC: ${remoteCommandModal.command}`}
          subtitle={`Target EVSE: ${remoteCommandModal.charger.id} at ${remoteCommandModal.charger.stationName}`}
          footer={
            <>
              <button onClick={() => setRemoteCommandModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleExecuteRemoteCommand} className="btn btn-primary">
                Dispatch OCPP Command
              </button>
            </>
          }
        >
          <div>
            {commandSuccess ? (
              <div style={{ padding: 14, borderRadius: 8, backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                {commandSuccess}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                This will dispatch a live OCPP 1.6-J JSON-RPC call (<code>{remoteCommandModal.command}</code>) over the WebSocket bridge to the charge point hardware.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
