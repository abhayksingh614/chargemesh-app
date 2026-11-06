'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { INITIAL_BOOKINGS, AdminBooking } from '@/lib/dataService';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(INITIAL_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)),
    );
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
  };

  const columns: Column<AdminBooking>[] = [
    {
      header: 'Booking ID',
      accessor: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.id}</strong>,
    },
    {
      header: 'Driver',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.vehicleName}</div>
        </div>
      ),
    },
    {
      header: 'Station Hub & CPO',
      accessor: (row) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{row.stationName}</div>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>{row.cpoName}</div>
        </div>
      ),
    },
    {
      header: 'Reserved Slot Time',
      accessor: (row) => `${row.slotStartTime} - ${row.slotEndTime.split('·')[1] || row.slotEndTime}`,
    },
    {
      header: 'Connector',
      accessor: (row) => `${row.connectorType} (${row.powerKw} kW)`,
    },
    {
      header: 'Est. Cost',
      accessor: (row) => `₹${row.estimatedCostInr.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBooking(row);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            🔍 View
          </button>
          {row.status === 'CONFIRMED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelBooking(row.id);
              }}
              className="btn btn-danger"
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              Cancel Slot
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Bookings & Reservations
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage upcoming driver reservation schedules, slot allocation, and cancellation processing
          </p>
        </div>
      </div>

      {/* Bookings DataTable */}
      <DataTable
        columns={columns}
        data={bookings}
        searchPlaceholder="Search by Booking ID, Driver, or Station Hub..."
        searchKey={(row) => `${row.id} ${row.userName} ${row.stationName} ${row.cpoName}`}
        onRowClick={(row) => setSelectedBooking(row)}
      />

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details: ${selectedBooking.id}`}
          subtitle={`Driver: ${selectedBooking.userName} · Status: ${selectedBooking.status}`}
          footer={
            <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary">
              Close
            </button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div><strong>Driver:</strong> {selectedBooking.userName}</div>
            <div><strong>Vehicle:</strong> {selectedBooking.vehicleName}</div>
            <div><strong>Station:</strong> {selectedBooking.stationName}</div>
            <div><strong>CPO:</strong> {selectedBooking.cpoName}</div>
            <div><strong>Time Window:</strong> {selectedBooking.slotStartTime} to {selectedBooking.slotEndTime}</div>
            <div><strong>Connector:</strong> {selectedBooking.connectorType}</div>
            <div><strong>Estimated Fee:</strong> ₹{selectedBooking.estimatedCostInr.toFixed(2)}</div>
            <div><strong>Payment Method:</strong> {selectedBooking.paymentMethod}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
