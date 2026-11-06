'use client';

import React from 'react';
import { KpiCard } from '@/components/KpiCard';
import { TelemetryLineChart } from '@/components/TelemetryLineChart';

const STATE_ESG_DATA = [
  { state: 'NCT Of Delhi', kwh: 124500, co2Kg: 88395, trees: 4420 },
  { state: 'Haryana (Gurugram/Sonipat)', kwh: 98200, co2Kg: 69722, trees: 3486 },
  { state: 'Uttar Pradesh (Noida/Ghaziabad)', kwh: 84300, co2Kg: 59853, trees: 2992 },
  { state: 'Maharashtra (Mumbai/Pune)', kwh: 112000, co2Kg: 79520, trees: 3976 },
  { state: 'Karnataka (Bengaluru Hub)', kwh: 145000, co2Kg: 102950, trees: 5147 },
];

const CO2_SAVINGS_TIMELINE = [
  { time: 'Apr', value: 18.2 },
  { time: 'May', value: 24.5 },
  { time: 'Jun', value: 31.0 },
  { time: 'Jul', value: 38.6 },
  { time: 'Aug', value: 45.2 },
];

export default function SustainabilityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ESG Sustainability & CO₂ Impact
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Clean energy delivery metrics, avoided tailpipe emissions, and environmental compliance
          </p>
        </div>

        <button
          onClick={() => alert('Downloading ChargeMesh ESG Sustainability Audit Report (PDF)...')}
          className="btn btn-primary"
        >
          📄 Download ESG Compliance Report
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard
          title="Network CO₂ Offset"
          value="400.4 Tons"
          change="Indian Grid Factor 0.71"
          isPositive={true}
          icon="🌱"
        />
        <KpiCard
          title="Total Clean Energy"
          value="564.0 MWh"
          subtitle="Delivered to EV Drivers"
          icon="⚡"
        />
        <KpiCard
          title="Trees Equivalent"
          value="20,020 Trees"
          subtitle="Annual Carbon Absorption"
          icon="🌳"
        />
        <KpiCard
          title="Fossil Fuel Displaced"
          value="152,400 Litres"
          subtitle="Petrol / Diesel Saved"
          icon="⛽"
        />
      </div>

      {/* ESG Timeline Chart & Methodology */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <TelemetryLineChart
          title="Cumulative CO₂ Offset Velocity (Tons)"
          data={CO2_SAVINGS_TIMELINE}
          unit="Tons"
          color="var(--brand-primary)"
        />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Authoritative Calculation Standard
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ChargeMesh computes environmental impact using the Central Electricity Authority (CEA) India grid emission baseline:
          </p>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: 'var(--bg-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--brand-primary)',
            }}
          >
            CO₂ Saved (kg) = Energy (kWh) × 0.71 kg/kWh
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Tree equivalent is based on US EPA metric of 20 kg CO₂ absorption per mature tree annually.
          </p>
        </div>
      </div>

      {/* State-wise Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          State-Wise Clean Energy & Environmental Distribution
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>State / Region</th>
                <th>Clean Energy Delivered</th>
                <th>Tailpipe CO₂ Offset</th>
                <th>Mature Trees Equivalent</th>
                <th>Green Share</th>
              </tr>
            </thead>
            <tbody>
              {STATE_ESG_DATA.map((st, idx) => (
                <tr key={idx}>
                  <td><strong>{st.state}</strong></td>
                  <td>{(st.kwh / 1000).toFixed(1)} MWh</td>
                  <td><strong style={{ color: 'var(--brand-primary)' }}>{(st.co2Kg / 1000).toFixed(1)} Tons</strong></td>
                  <td>🌳 {st.trees.toLocaleString()} Trees</td>
                  <td>
                    <div style={{ width: 120, height: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(st.kwh / 150000) * 100}%`, height: '100%', backgroundColor: 'var(--brand-primary)' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
