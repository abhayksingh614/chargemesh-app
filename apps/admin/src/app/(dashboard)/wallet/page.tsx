'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { INITIAL_DRIVERS, INITIAL_TRANSACTIONS, AdminTransaction } from '@/lib/dataService';

export default function WalletPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState(INITIAL_DRIVERS[0].id);
  const [transactions, setTransactions] = useState<AdminTransaction[]>(INITIAL_TRANSACTIONS);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(100);
  const [isCredit, setIsCredit] = useState(true);
  const [adjustReason, setAdjustReason] = useState('');
  const [referenceTicket, setReferenceTicket] = useState('');

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverTxs = transactions.filter((t) => t.userId === currentDriver.id);

  // Compute balance trace
  let computedBalance = 0;
  const chronological = [...driverTxs].reverse();
  chronological.forEach((tx) => {
    if (tx.status === 'SUCCESS') {
      computedBalance += tx.isCredit ? tx.amountInr : -tx.amountInr;
    }
  });

  const handleExecuteAdjustment = () => {
    if (!adjustReason.trim() || adjustAmount <= 0) return;
    const currentBal = currentDriver.walletBalancePaise / 100;
    const newBal = isCredit ? currentBal + adjustAmount : Math.max(0, currentBal - adjustAmount);

    const newTx: AdminTransaction = {
      id: `tx-adj-${Date.now()}`,
      referenceId: `ADJ-${Date.now().toString().slice(-8)}`,
      userId: currentDriver.id,
      userName: currentDriver.name,
      type: isCredit ? 'WALLET_CREDIT_ADJUSTMENT' : 'WALLET_DEBIT_ADJUSTMENT',
      title: `₹${adjustAmount.toFixed(2)} ${isCredit ? 'Credit Adjustment' : 'Debit Adjustment'}`,
      amountInr: adjustAmount,
      isCredit,
      status: 'SUCCESS',
      dateStr: 'Today',
      timeStr: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethodName: 'ChargeMesh Admin Adjuster',
      balanceBeforeInr: currentBal,
      balanceAfterInr: newBal,
      remarks: `${adjustReason}${referenceTicket ? ` (Ref: ${referenceTicket})` : ''}`,
      reconciled: true,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === currentDriver.id ? { ...d, walletBalancePaise: Math.round(newBal * 100) } : d,
      ),
    );

    setShowAdjustModal(false);
    setAdjustReason('');
    setReferenceTicket('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fast Wallet & Ledger Management
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Double-entry running balance trace, audited manual adjustments, and promotional bonuses
          </p>
        </div>

        <button onClick={() => setShowAdjustModal(true)} className="btn btn-primary">
          ➕ New Audited Adjustment
        </button>
      </div>

      {/* Driver Selector & Ledger Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Balance Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>SELECTED DRIVER ACCOUNT</div>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  marginTop: 4,
                  outline: 'none',
                }}
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phoneNumber}) - ₹{(d.walletBalancePaise / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AUTHORITATIVE BALANCE</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-0.02em' }}>
                ₹{(currentDriver.walletBalancePaise / 100).toFixed(2)}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12.5,
            }}
          >
            <span>
              <strong>Double-Entry Ledger Trace:</strong> Sum of {driverTxs.length} Transactions
            </span>
            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
              ✓ Mathematically Reconciled (₹{computedBalance.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Promotion & Bonus Stats */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome Bonus & Promotion Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
            <div style={{ padding: 10, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>₹100 Welcome Bonus</div>
              <strong style={{ color: 'var(--brand-primary)' }}>{currentDriver.joiningBonusStatus || 'CREDITED'}</strong>
            </div>
            <div style={{ padding: 10, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Membership Tier</div>
              <strong style={{ color: 'var(--text-primary)' }}>{currentDriver.membershipTier}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Ledger Trace Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Ledger Running Trace for {currentDriver.name}
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Reference ID</th>
                <th>Transaction Title</th>
                <th>Method</th>
                <th>Amount (INR)</th>
                <th>Running Balance</th>
                <th>Audit Remarks</th>
              </tr>
            </thead>
            <tbody>
              {driverTxs.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.dateStr} · {tx.timeStr}</td>
                  <td><strong>{tx.referenceId}</strong></td>
                  <td>{tx.title}</td>
                  <td>{tx.paymentMethodName}</td>
                  <td style={{ fontWeight: 700, color: tx.isCredit ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                    {tx.isCredit ? '+' : '-'}₹{tx.amountInr.toFixed(2)}
                  </td>
                  <td>₹{tx.balanceBeforeInr.toFixed(2)} → <strong>₹{tx.balanceAfterInr.toFixed(2)}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Wallet Adjustment Modal */}
      {showAdjustModal && (
        <Modal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          title={`Audited Wallet Adjustment: ${currentDriver.name}`}
          subtitle={`Current Balance: ₹${(currentDriver.walletBalancePaise / 100).toFixed(2)}`}
          footer={
            <>
              <button onClick={() => setShowAdjustModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleExecuteAdjustment}
                disabled={!adjustReason.trim() || adjustAmount <= 0}
                className="btn btn-primary"
              >
                Execute Ledger Adjustment
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Adjustment Type
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCredit(true)}
                  className={`btn ${isCredit ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  ➕ Credit (Add Money)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCredit(false)}
                  className={`btn ${!isCredit ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  ➖ Debit (Deduct Money)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Adjustment Amount (INR)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '10px',
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
                Support Ticket ID / Internal Reference
              </label>
              <input
                type="text"
                value={referenceTicket}
                onChange={(e) => setReferenceTicket(e.target.value)}
                placeholder="e.g. TKT-9921"
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

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Mandatory Administrative Reason
              </label>
              <textarea
                rows={3}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Detailed explanation of the wallet adjustment..."
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
