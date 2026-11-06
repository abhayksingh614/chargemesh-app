import React from 'react';

interface JsonDiffViewerProps {
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

export function JsonDiffViewer({ previousValue, newValue }: JsonDiffViewerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
      {/* Previous Value */}
      <div
        style={{
          backgroundColor: 'var(--accent-red-light)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: 8,
          padding: 12,
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: 6 }}>Previous Value:</div>
        {previousValue ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {JSON.stringify(previousValue, null, 2)}
          </pre>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>[Null / Initial State]</span>
        )}
      </div>

      {/* New Value */}
      <div
        style={{
          backgroundColor: 'var(--brand-primary-light)',
          border: '1px solid rgba(22, 163, 74, 0.2)',
          borderRadius: 8,
          padding: 12,
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 6 }}>New Updated Value:</div>
        {newValue ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {JSON.stringify(newValue, null, 2)}
          </pre>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>[Deleted / Cleared]</span>
        )}
      </div>
    </div>
  );
}
