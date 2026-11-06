'use client';

import React from 'react';

interface TelemetryLineChartProps {
  title: string;
  data: { time: string; value: number }[];
  unit?: string;
  color?: string;
}

export function TelemetryLineChart({
  title,
  data,
  unit = 'kW',
  color = 'var(--brand-primary)',
}: TelemetryLineChartProps) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 500;
    const y = 140 - (d.value / maxValue) * 110;
    return `${x},${y}`;
  });

  const pathString = `M 0,${140 - (data[0].value / maxValue) * 110} ` + points.map((p) => `L ${p}`).join(' ');
  const areaString = `${pathString} L 500,150 L 0,150 Z`;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h4>
        <span style={{ fontSize: 12, fontWeight: 700, color: color }}>
          Peak: {maxValue.toLocaleString()} {unit}
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
        <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border-subtle)" strokeDasharray="4 4" />
          <line x1="0" y1="85" x2="500" y2="85" stroke="var(--border-subtle)" strokeDasharray="4 4" />
          <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-color)" />

          {/* Fill Area */}
          <path d={areaString} fill="url(#chartGrad)" />

          {/* Stroke Line */}
          <path d={pathString} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 500;
            const y = 140 - (d.value / maxValue) * 110;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="var(--bg-card)"
                stroke={color}
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      {/* Time labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
          padding: '0 4px',
        }}
      >
        {data.map((d, i) => (
          <span key={i}>{d.time}</span>
        ))}
      </div>
    </div>
  );
}
