'use client';

import React from 'react';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { TelemetryLineChart } from '@/components/TelemetryLineChart';
import { INITIAL_CPOS, INITIAL_SESSIONS } from '@/lib/dataService';


const POWER_LOAD_DATA = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 30 },
  { time: '08:00', value: 180 },
  { time: '12:00', value: 360 },
  { time: '16:00', value: 490 },
  { time: '20:00', value: 410 },
  { time: '23:59', value: 160 },
];

const REVENUE_DATA = [
  { time: 'Mon', value: 34200 },
  { time: 'Tue', value: 38900 },
  { time: 'Wed', value: 42100 },
  { time: 'Thu', value: 45600 },
  { time: 'Fri', value: 52400 },
  { time: 'Sat', value: 61800 },
  { time: 'Sun', value: 48920 },
];

export default function ExecutiveDashboard() {
  const activeSessions = INITIAL_SESSIONS.filter((s) => s.status === 'CHARGING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Real-time telemetry, CPO health, and network financial KPIs across India
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
            <span className="live-dot" /> Live Telemetry
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Updated: {new Date().toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard
          title="Today's Revenue"
          value="₹48,920.00"
          change="14.2% vs yesterday"
          isPositive={true}
          icon="💳"
          badge="INR"
        />
        <KpiCard
          title="Total Energy Delivered"
          value="2,450.8 kWh"
          change="8.6% increase"
          isPositive={true}
          icon="⚡"
        />
        <KpiCard
          title="CO₂ Avoided"
          value="1,740.1 kg"
          change="Grid factor 0.71"
          isPositive={true}
          icon="🌱"
        />
        <KpiCard
          title="Active Live Sessions"
          value="42 Sessions"
          subtitle="Peak concurrent load"
          icon="⏱️"
          badge="Live"
        />
        <KpiCard
          title="Online Fast Chargers"
          value="1,242 / 1,280"
          change="97.0% Availability"
          isPositive={true}
          icon="🔌"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <TelemetryLineChart
          title="24-Hour Network Charging Load Curve"
          data={POWER_LOAD_DATA}
          unit="kW"
          color="var(--brand-primary)"
        />
        <TelemetryLineChart
          title="7-Day Revenue Velocity (₹)"
          data={REVENUE_DATA}
          unit="₹"
          color="var(--accent-blue)"
        />
      </div>

      {/* Bottom Grid: Live Sessions & CPO Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Live Charging Sessions Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Live Active Sessions</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Instantaneous telemetry packet stream</p>
            </div>
            <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              {activeSessions.length} Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INITIAL_SESSIONS.map((sess) => (
              <div
                key={sess.id}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{sess.userName}</strong>
                    <StatusBadge status={sess.status} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                    {sess.stationName} · {sess.connectorType}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {sess.socPercent}% SoC · {sess.powerKw} kW
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {sess.energyKwh} kWh · ₹{sess.totalCostInr.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CPO Partner Uptime Health Matrix */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>CPO Interoperability Health</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>OCPI 2.3.0 synchronization status</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)' }}>12/12 Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INITIAL_CPOS.slice(0, 5).map((cpo) => (
              <div
                key={cpo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cpo.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Party: {cpo.partyId} · {cpo.totalStationCount} Hubs · {cpo.totalOnlineChargers} Guns
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 11 }}>
                    {cpo.uptimePercent30d}% Up
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
