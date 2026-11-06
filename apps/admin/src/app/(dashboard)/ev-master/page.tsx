'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { INITIAL_EV_CATALOG } from '@/lib/dataService';
import { OemBrandMaster, ConnectorType } from '@chargemesh/shared-types';

export default function EvMasterPage() {
  const [brands, setBrands] = useState<OemBrandMaster[]>(INITIAL_EV_CATALOG);
  const [selectedBrand, setSelectedBrand] = useState<OemBrandMaster>(INITIAL_EV_CATALOG[0]);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [variantName, setVariantName] = useState('');
  const [batteryKwh, setBatteryKwh] = useState(50.0);
  const [maxDcKw, setMaxDcKw] = useState(60);
  const [rangeKm, setRangeKm] = useState(450);

  const handleAddVariant = () => {
    if (!variantName.trim()) return;
    const newVariant = {
      id: `var-${Date.now()}`,
      modelId: selectedBrand.models[0]?.id || 'mod-1',
      name: variantName,
      batteryCapacityKwh: batteryKwh,
      maxDcPowerKw: maxDcKw,
      maxAcPowerKw: 7.2,
      rangeKm,
      connectorTypes: [ConnectorType.CCS2, ConnectorType.TYPE2],
      isVerified: true,
    };

    setBrands((prev) =>
      prev.map((b) =>
        b.id === selectedBrand.id
          ? {
              ...b,
              models: b.models.map((m, idx) =>
                idx === 0 ? { ...m, variants: [...m.variants, newVariant] } : m,
              ),
            }
          : b,
      ),
    );

    setSelectedBrand((prev) => ({
      ...prev,
      models: prev.models.map((m, idx) =>
        idx === 0 ? { ...m, variants: [...m.variants, newVariant] } : m,
      ),
    }));

    setShowAddVariantModal(false);
    setVariantName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            EV Master Database & Compatibility
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Centralized OEM vehicle catalog, battery capacities, connector standards, and charging curves
          </p>
        </div>

        <button onClick={() => setShowAddVariantModal(true)} className="btn btn-primary">
          ➕ Add Model / Variant
        </button>
      </div>

      {/* Brand Tabs & Master Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Brand Sidebar List */}
        <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '6px 8px' }}>
            OEM MANUFACTURERS
          </div>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: selectedBrand.id === b.id ? 700 : 500,
                color: selectedBrand.id === b.id ? '#FFFFFF' : 'var(--text-primary)',
                backgroundColor: selectedBrand.id === b.id ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{b.logoEmoji}</span>
                <span>{b.name}</span>
              </div>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{b.models.length} Models</span>
            </button>
          ))}
        </div>

        {/* Selected Brand Models & Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedBrand.models.map((model) => (
            <div key={model.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedBrand.name} {model.name}
                  </h3>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {model.bodyType}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {model.variants.length} Variants Configured
                </span>
              </div>

              {/* Variants Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {model.variants.map((v) => (
                  <div
                    key={v.id}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>{v.name}</strong>
                      <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 11 }}>
                        ✓ Verified
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <div>🔋 Battery: <strong>{v.batteryCapacityKwh} kWh</strong></div>
                      <div>⚡ Max DC: <strong>{v.maxDcPowerKw} kW</strong></div>
                      <div>🔌 Ports: <strong>{v.connectorTypes.join(', ')}</strong></div>
                      <div>🚗 Range: <strong>{v.rangeKm} km</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Variant Modal */}
      {showAddVariantModal && (
        <Modal
          isOpen={showAddVariantModal}
          onClose={() => setShowAddVariantModal(false)}
          title={`Add Model Variant to ${selectedBrand.name}`}
          subtitle="Define electrical specifications, connector compatibility, and battery sizing"
          footer={
            <>
              <button onClick={() => setShowAddVariantModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddVariant} className="btn btn-primary">
                Save EV Variant
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Variant Name
              </label>
              <input
                type="text"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. Long Range Empowered+"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Battery (kWh)
                </label>
                <input
                  type="number"
                  value={batteryKwh}
                  onChange={(e) => setBatteryKwh(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Max DC (kW)
                </label>
                <input
                  type="number"
                  value={maxDcKw}
                  onChange={(e) => setMaxDcKw(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Range (km)
                </label>
                <input
                  type="number"
                  value={rangeKm}
                  onChange={(e) => setRangeKm(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
