import React from 'react';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: 0, color: '#dc2626' }}>500</h1>
      <h2 style={{ fontSize: '1.25rem', margin: '0.5rem 0 1rem' }}>Internal Server Error</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>An error occurred while loading this administrative console view.</p>
      <Link href="/dashboard" style={{ padding: '0.625rem 1.25rem', backgroundColor: '#dc2626', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 500 }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
