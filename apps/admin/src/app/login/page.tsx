'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/authContext';
import { AdminRole } from '@chargemesh/shared-types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@chargemesh.com');
  const [password, setPassword] = useState('ChargeMesh@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validEmails = ['admin@chargemesh.com', 'admin@cm.com', 'ops@chargemesh.com', 'finance@chargemesh.com', 'support@chargemesh.com'];
    const validPasswords = ['ChargeMesh@123', 'Hello@123', 'admin123'];

    if (!validEmails.includes(email.toLowerCase()) || !validPasswords.includes(password)) {
      setError('Invalid admin credentials. For demo access use admin@chargemesh.com or admin@cm.com with ChargeMesh@123 / Hello@123');
      return;
    }

    let role = AdminRole.SUPER_ADMIN;
    if (email.includes('ops')) role = AdminRole.OPERATIONS_ADMIN;
    else if (email.includes('finance')) role = AdminRole.FINANCE_ADMIN;
    else if (email.includes('support')) role = AdminRole.SUPPORT_ADMIN;

    const success = await login(email, role);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (role: AdminRole, roleEmail: string) => {
    await login(roleEmail, role);
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: 36,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
              marginBottom: 12,
            }}
          >
            ⚡
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Charge<span style={{ color: 'var(--brand-primary)' }}>Mesh</span> Admin
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
            Sign in to manage the ChargeMesh ecosystem.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'var(--accent-red-light)',
              color: 'var(--accent-red)',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@chargemesh.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--brand-primary)' }}
              />
              Remember Me
            </label>

            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('For prototype access, please use the default demo credentials seeded below.');
              }}
              style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}>
            Sign In
          </button>
        </form>

        {/* Quick Role Switcher for Dev & Testing */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
            DEMO ROLE ONE-CLICK ACCESS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => handleQuickLogin(AdminRole.SUPER_ADMIN, 'admin@chargemesh.com')}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => handleQuickLogin(AdminRole.OPERATIONS_ADMIN, 'ops@chargemesh.com')}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              🔌 Operations Lead
            </button>
            <button
              onClick={() => handleQuickLogin(AdminRole.FINANCE_ADMIN, 'finance@chargemesh.com')}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              💳 Finance Admin
            </button>
            <button
              onClick={() => handleQuickLogin(AdminRole.SUPPORT_ADMIN, 'support@chargemesh.com')}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              🎧 Support Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
