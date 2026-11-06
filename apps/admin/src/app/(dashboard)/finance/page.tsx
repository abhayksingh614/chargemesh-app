'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { INITIAL_TRANSACTIONS, AdminTransaction } from '@/lib/dataService';


export default function FinancePage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null);
  const [refundTx, setRefundTx] = useState<AdminTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const handleProcessRefund = () => {
    if (!refundTx || !refundReason.trim()) return;
    const newRefund: AdminTransaction = {
      id: `tx-ref-${Date.now()}`,
      referenceId: `REF-${Date.now().toString().slice(-8)}`,
      userId: refundTx.userId,
      userName: refundTx.userName,
      type: 'WALLET_REFUND',
      title: `₹${refundTx.amountInr.toFixed(2)} Refunded`,
      amountInr: refundTx.amountInr,
      isCredit: true,
      status: 'SUCCESS',
      dateStr: 'Today',
      timeStr: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethodName: 'ChargeMesh Reconciler',
      balanceBeforeInr: refundTx.balanceAfterInr,
      balanceAfterInr: refundTx.balanceAfterInr + refundTx.amountInr,
      remarks: `Admin Refund for ${refundTx.referenceId}: ${refundReason}`,
      reconciled: true,
    };
    setTransactions((prev) => [newRefund, ...prev]);
    setRefundTx(null);
  };

  const columns: Column<AdminTransaction>[] = [
    {
      header: 'Reference ID',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{row.referenceId}</strong>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.dateStr} · {row.timeStr}</div>
        </div>
      ),
    },
    {
      header: 'Driver',
      accessor: (row) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.userName}</span>
      ),
    },
    {
      header: 'Transaction Type',
      accessor: (row) => (
        <span
          className="badge"
          style={{
            backgroundColor: row.isCredit ? 'var(--brand-primary-light)' : 'var(--accent-amber-light)',
            color: row.isCredit ? 'var(--brand-primary)' : 'var(--accent-amber)',
            fontSize: 11,
          }}
        >
          {row.isCredit ? '+ Credit Top-up' : '- Debit Session'}
        </span>
      ),
    },
    {
      header: 'Amount (INR)',
      accessor: (row) => (
        <strong style={{ color: row.isCredit ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
          {row.isCredit ? '+' : '-'}₹{row.amountInr.toFixed(2)}
        </strong>
      ),
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethodName',
    },
    {
      header: 'Balance Trace',
      accessor: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          ₹{row.balanceBeforeInr.toFixed(2)} → <strong style={{ color: 'var(--text-primary)' }}>₹{row.balanceAfterInr.toFixed(2)}</strong>
        </span>
      ),
    },
    {
      header: 'Reconciled',
      accessor: (row) => (
        <span style={{ color: row.reconciled ? 'var(--brand-primary)' : 'var(--accent-amber)', fontWeight: 600 }}>
          {row.reconciled ? '✓ Matched' : '⏳ Pending'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTx(row);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            🔍 Details
          </button>
          {!row.isCredit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRefundTx(row);
                setRefundReason('');
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
            >
              ↩️ Refund
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
            Finance & Payment Reconciliation
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Double-entry ledger transactions, payment gateway reference matching, and refund processing
          </p>
        </div>
      </div>

      {/* Transactions DataTable */}
      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search by Reference ID, Driver, Method, or Remarks..."
        searchKey={(row) => `${row.referenceId} ${row.userName} ${row.paymentMethodName} ${row.remarks}`}
        onRowClick={(row) => setSelectedTx(row)}
      />

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Transaction: ${selectedTx.referenceId}`}
          subtitle={`Type: ${selectedTx.type} · Status: ${selectedTx.status}`}
          footer={
            <button onClick={() => setSelectedTx(null)} className="btn btn-secondary">
              Close Details
            </button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div><strong>Driver:</strong> {selectedTx.userName}</div>
            <div><strong>Amount:</strong> ₹{selectedTx.amountInr.toFixed(2)}</div>
            <div><strong>Payment Method:</strong> {selectedTx.paymentMethodName}</div>
            <div><strong>Timestamp:</strong> {selectedTx.dateStr} at {selectedTx.timeStr}</div>
            <div><strong>Balance Before:</strong> ₹{selectedTx.balanceBeforeInr.toFixed(2)}</div>
            <div><strong>Balance After:</strong> ₹{selectedTx.balanceAfterInr.toFixed(2)}</div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Remarks:</strong> {selectedTx.remarks || 'Standard transaction'}
            </div>
          </div>
        </Modal>
      )}

      {/* Refund Processing Modal */}
      {refundTx && (
        <Modal
          isOpen={!!refundTx}
          onClose={() => setRefundTx(null)}
          title={`Process Refund: ${refundTx.referenceId}`}
          subtitle={`Driver: ${refundTx.userName} · Amount to Refund: ₹${refundTx.amountInr.toFixed(2)}`}
          footer={
            <>
              <button onClick={() => setRefundTx(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={!refundReason.trim()}
                className="btn btn-primary"
              >
                Confirm Refund
              </button>
            </>
          }
        >
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              This will issue an audited refund of <strong>₹{refundTx.amountInr.toFixed(2)}</strong> back to{' '}
              <strong>{refundTx.userName}</strong>&apos;s ChargeMesh Fast Wallet.
            </p>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Mandatory Refund Reason & Ticket ID:
            </label>
            <textarea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Session interrupted due to grid outage at Murthal..."
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
        </Modal>
      )}
    </div>
  );
}
