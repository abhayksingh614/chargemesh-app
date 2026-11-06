import React from 'react';


interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  let bg = 'var(--bg-tertiary)';
  let color = 'var(--text-secondary)';
  let displayLabel = label || status;
  let showPulse = false;

  switch (normalized) {
    case 'AVAILABLE':
    case 'ACTIVE':
    case 'OPERATIONAL':
    case 'SUCCESS':
    case 'PAID':
    case 'CONFIRMED':
      bg = 'var(--brand-primary-light)';
      color = 'var(--brand-primary)';
      if (normalized === 'AVAILABLE') showPulse = true;
      break;

    case 'IN_USE':
    case 'CHARGING':
    case 'STARTING':
      bg = 'var(--accent-amber-light)';
      color = 'var(--accent-amber)';
      showPulse = true;
      break;

    case 'UNAVAILABLE':
    case 'OFFLINE':
    case 'FAULTED':
    case 'SUSPENDED':
    case 'FAILED':
    case 'CANCELLED':
    case 'BANNED':
      bg = 'var(--accent-red-light)';
      color = 'var(--accent-red)';
      break;

    case 'STALE':
    case 'DELAYED':
      bg = 'var(--accent-amber-light)';
      color = 'var(--accent-amber)';
      displayLabel = displayLabel || 'Stale (Delayed)';
      break;

    case 'UNKNOWN':
      bg = 'var(--bg-tertiary)';
      color = 'var(--text-muted)';
      displayLabel = 'Status Unknown';
      break;

    case 'RESERVED':
      bg = 'var(--accent-blue-light)';
      color = 'var(--accent-blue)';
      break;

    default:
      break;
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color: color,
        padding,
        fontSize,
      }}
    >
      {showPulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
          }}
        />
      )}
      {displayLabel}
    </span>
  );
}
