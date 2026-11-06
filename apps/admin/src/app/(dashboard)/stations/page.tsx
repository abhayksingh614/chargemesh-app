'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_STATIONS, AdminStation } from '@/lib/dataService';

// Dynamically import MapLibre Map to avoid SSR errors
const AdminMapLibreMap = dynamic(
  () => import('@/components/AdminMapLibreMap').then((mod) => mod.AdminMapLibreMap),
  { ssr: false, loading: () => <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)' }}>Loading MapLibre GL JS Map...</div> }
);

export default function StationsPage() {
  const [stations, setStations] = useState<AdminStation[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<AdminStation | null>(null);
  const [editTariffStation, setEditTariffStation] = useState<AdminStation | null>(null);
  const [newTariff, setNewTariff] = useState<number>(18.5);

  const handleUpdateTariff = () => {
    if (!editTariffStation) return;
    setStations((prev) =>
      prev.map((s) => (s.id === editTariffStation.id ? { ...s, tariffPerKwh: newTariff } : s)),
    );
    if (selectedStation?.id === editTariffStation.id) {
      setSelectedStation((prev) => (prev ? { ...prev, tariffPerKwh: newTariff } : null));
    }
    setEditTariffStation(null);
  };

  const columns: Column<AdminStation>[] = [
    {
      header: 'Station & Hub Name',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.name}</strong>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>{row.cpoName}</div>
        </div>
      ),
    },
    {
      header: 'Location / Address',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{row.district}, {row.city}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.address}</div>
        </div>
      ),
    },
    {
      header: 'Max Power',
      accessor: (row) => (
        <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
          ⚡ {row.maxPowerKw} kW DC
        </span>
      ),
    },
    {
      header: 'Live Guns',
      accessor: (row) => `${row.availableConnectors} / ${row.totalConnectors} Available`,
    },
    {
      header: 'Tariff Rate',
      accessor: (row) => `₹${row.tariffPerKwh.toFixed(2)} / kWh`,
    },
    {
      header: 'Status',
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
              setSelectedStation(row);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            🔍 Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditTariffStation(row);
              setNewTariff(row.tariffPerKwh);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            🏷️ Tariff
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
            Charging Stations & Fast Hubs
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage {stations.length} charging hubs across Delhi NCR, Haryana, Uttar Pradesh, and nationwide
          </p>
        </div>
      </div>

      {/* MapLibre GL JS Interactive Map */}
      <AdminMapLibreMap
        stations={stations}
        onSelectStation={(st) => setSelectedStation(st)}
      />

      {/* Stations DataTable */}
      <DataTable
        columns={columns}
        data={stations}
        searchPlaceholder="Search by Hub Name, District, City, or CPO..."
        searchKey={(row) => `${row.name} ${row.district} ${row.city} ${row.cpoName}`}
        onRowClick={(row) => setSelectedStation(row)}
      />

      {/* Station Detail Modal */}
      {selectedStation && (
        <Modal
          isOpen={!!selectedStation}
          onClose={() => setSelectedStation(null)}
          title={selectedStation.name}
          subtitle={`Operator: ${selectedStation.cpoName} · Status: ${selectedStation.status}`}
          maxWidth="640px"
          footer={
            <button onClick={() => setSelectedStation(null)} className="btn btn-secondary">
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div><strong>Address:</strong> {selectedStation.address}</div>
              <div><strong>District / State:</strong> {selectedStation.district}, {selectedStation.state}</div>
              <div><strong>Coordinates:</strong> {selectedStation.coordinates.latitude}, {selectedStation.coordinates.longitude}</div>
              <div><strong>Operating Hours:</strong> {selectedStation.openingTimes}</div>
              <div><strong>Tariff Rate:</strong> ₹{selectedStation.tariffPerKwh.toFixed(2)} / kWh</div>
              <div><strong>Facilities:</strong> {selectedStation.facilities.join(', ')}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                Installed Connectors & Guns ({selectedStation.connectors.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedStation.connectors.map((conn) => (
                  <div
                    key={conn.id}
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
                      <strong>Gun #{conn.connectorNumber}: {conn.type}</strong> ({conn.powerKw} kW)
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {conn.id}</div>
                    </div>
                    <StatusBadge status={conn.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Tariff Modal */}
      {editTariffStation && (
        <Modal
          isOpen={!!editTariffStation}
          onClose={() => setEditTariffStation(null)}
          title={`Edit Tariff: ${editTariffStation.name}`}
          subtitle={`Current Rate: ₹${editTariffStation.tariffPerKwh.toFixed(2)} / kWh`}
          footer={
            <>
              <button onClick={() => setEditTariffStation(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateTariff} className="btn btn-primary">
                Save Revised Tariff
              </button>
            </>
          }
        >
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              New Tariff Rate (INR per kWh):
            </label>
            <input
              type="number"
              step="0.50"
              value={newTariff}
              onChange={(e) => setNewTariff(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 14,
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
