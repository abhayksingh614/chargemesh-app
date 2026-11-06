'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  audience: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  sentAt: string;
  recipientCount: number;
}

const INITIAL_BROADCASTS: Broadcast[] = [
  {
    id: 'bc-001',
    title: '🎉 New 120 kW Fast Hub Open in Aerocity',
    message: 'Jio-bp pulse Aerocity Worldmark Hub is now live with 6 DC Fast charging guns. Enjoy 20% cashback on your next session!',
    audience: 'Delhi NCR Drivers',
    priority: 'NORMAL',
    sentAt: '24 Aug 2026, 10:00 AM',
    recipientCount: 1420,
  },
  {
    id: 'bc-002',
    title: '⚠️ Scheduled Grid Maintenance at Cyber Hub',
    message: 'Statiq DLF Cyber Hub chargers will undergo maintenance from 02:00 AM to 05:00 AM on 27 August.',
    audience: 'Gurugram Active Drivers',
    priority: 'HIGH',
    sentAt: '22 Aug 2026, 04:30 PM',
    recipientCount: 680,
  },
];

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(INITIAL_BROADCASTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const handleSendBroadcast = () => {
    if (!title.trim() || !message.trim()) return;
    const newBc: Broadcast = {
      id: `bc-${Date.now().toString().slice(-4)}`,
      title,
      message,
      audience: audience === 'ALL' ? 'All Registered Drivers' : 'Delhi NCR Region',
      priority,
      sentAt: 'Just now',
      recipientCount: audience === 'ALL' ? 1420 : 750,
    };
    setBroadcasts((prev) => [newBc, ...prev]);
    setShowCreateModal(false);
    setTitle('');
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Push Notifications & Broadcasts
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Dispatch system announcements, maintenance alerts, and promotional push messages to drivers
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          📢 Compose New Broadcast
        </button>
      </div>

      {/* Broadcasts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {broadcasts.map((bc) => (
          <div key={bc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{bc.title}</h3>
                <span
                  className="badge"
                  style={{
                    backgroundColor: bc.priority === 'URGENT' ? 'var(--accent-red-light)' : 'var(--brand-primary-light)',
                    color: bc.priority === 'URGENT' ? 'var(--accent-red)' : 'var(--brand-primary)',
                  }}
                >
                  {bc.priority} Priority
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sent: {bc.sentAt}</span>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {bc.message}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Target Audience: <strong>{bc.audience}</strong></span>
              <span>Delivered to: <strong>{bc.recipientCount.toLocaleString()} devices</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Broadcast Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Compose Driver Broadcast Message"
          subtitle="This will dispatch an instant push notification to mobile applications"
          footer={
            <>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={!title.trim() || !message.trim()}
                className="btn btn-primary"
              >
                Send Push Notification
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ⚡ New Fast Charger Live in Noida..."
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Drivers (1,420)</option>
                  <option value="DELHI_NCR">Delhi NCR Region</option>
                  <option value="TATA_OWNERS">Tata EV Drivers</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Message Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="NORMAL">Normal Announcement</option>
                  <option value="HIGH">High (Alerts / Maintenance)</option>
                  <option value="URGENT">Urgent (Emergency Service Outage)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Push Message Body
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose the full driver notification message..."
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
          </div>
        </Modal>
      )}
    </div>
  );
}
