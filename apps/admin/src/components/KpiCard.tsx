import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: string;
  badge?: string;
}

export function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon,
  badge,
}: KpiCardProps) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
        {icon && (
          <span
            style={{
              fontSize: 18,
              padding: '6px 8px',
              borderRadius: 8,
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {badge && (
          <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        {change && (
          <span
            style={{
              fontWeight: 600,
              color: isPositive ? 'var(--brand-primary)' : 'var(--accent-red)',
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
        {subtitle && (
          <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
