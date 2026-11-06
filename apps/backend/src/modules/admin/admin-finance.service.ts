import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditActionType, AdminRole } from '@chargemesh/shared-types';
import { AdminAuditService } from './admin-audit.service';
import { AdminUsersService } from './admin-users.service';

export interface FinanceLedgerEntry {
  id: string;
  referenceId: string;
  userId: string;
  userName: string;
  type: string;
  title: string;
  amountRupees: number;
  isCredit: boolean;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  dateStr: string;
  timeStr: string;
  rawTimestamp: number;
  paymentMethodName: string;
  balanceBeforeRupees: number;
  balanceAfterRupees: number;
  remarks?: string;
  reconciled: boolean;
}

@Injectable()
export class AdminFinanceService {
  private readonly transactions: FinanceLedgerEntry[] = [
    {
      id: 'tx-001',
      referenceId: 'CM202608251042001',
      userId: 'usr-abhay-01',
      userName: 'Abhay Singh',
      type: 'WALLET_TOPUP_UPI',
      title: '₹1,000 Added',
      amountRupees: 1000.0,
      isCredit: true,
      status: 'SUCCESS',
      dateStr: '25 Aug 2026',
      timeStr: '10:42 AM',
      rawTimestamp: Date.now() - 1000 * 60 * 45,
      paymentMethodName: 'UPI (Google Pay)',
      balanceBeforeRupees: 1040.0,
      balanceAfterRupees: 2040.0,
      remarks: 'Auto-credited instantly via NPCI UPI Gateway',
      reconciled: true,
    },
    {
      id: 'tx-002',
      referenceId: 'CM202608241130089',
      userId: 'usr-abhay-01',
      userName: 'Abhay Singh',
      type: 'WALLET_DEBIT',
      title: '₹1,200.00 Debited',
      amountRupees: 1200.0,
      isCredit: false,
      status: 'SUCCESS',
      dateStr: '24 Aug 2026',
      timeStr: '11:30 AM',
      rawTimestamp: Date.now() - 1000 * 60 * 60 * 24,
      paymentMethodName: 'ChargeMesh Fast Wallet',
      balanceBeforeRupees: 2240.0,
      balanceAfterRupees: 1040.0,
      remarks: 'Session completed: 58.5 kWh billed @ ₹20.50/kWh',
      reconciled: true,
    },
    {
      id: 'tx-003',
      referenceId: 'CM202608231315042',
      userId: 'usr-abhay-01',
      userName: 'Abhay Singh',
      type: 'WALLET_REFUND',
      title: '₹100.00 Refunded',
      amountRupees: 100.0,
      isCredit: true,
      status: 'SUCCESS',
      dateStr: '23 Aug 2026',
      timeStr: '01:15 PM',
      rawTimestamp: Date.now() - 1000 * 60 * 60 * 48,
      paymentMethodName: 'ChargeMesh Reconciler',
      balanceBeforeRupees: 2140.0,
      balanceAfterRupees: 2240.0,
      remarks: 'Automatic release of unconsumed pre-authorization hold',
      reconciled: true,
    },
    {
      id: 'tx-004',
      referenceId: 'CM202608211745012',
      userId: 'usr-abhay-01',
      userName: 'Abhay Singh',
      type: 'WALLET_DEBIT',
      title: '₹500.00 Debited',
      amountRupees: 500.0,
      isCredit: false,
      status: 'SUCCESS',
      dateStr: '21 Aug 2026',
      timeStr: '05:45 PM',
      rawTimestamp: Date.now() - 1000 * 60 * 60 * 90,
      paymentMethodName: 'ChargeMesh Fast Wallet',
      balanceBeforeRupees: 2640.0,
      balanceAfterRupees: 2140.0,
      remarks: 'Session completed: 25.0 kWh billed @ ₹20.00/kWh',
      reconciled: true,
    },
    {
      id: 'tx-005',
      referenceId: 'CM202608211524089',
      userId: 'usr-abhay-01',
      userName: 'Abhay Singh',
      type: 'WALLET_TOPUP_CARD',
      title: '₹2,000 Added',
      amountRupees: 2000.0,
      isCredit: true,
      status: 'SUCCESS',
      dateStr: '21 Aug 2026',
      timeStr: '03:24 PM',
      rawTimestamp: Date.now() - 1000 * 60 * 60 * 92,
      paymentMethodName: 'HDFC Visa Debit Card (•••• 4821)',
      balanceBeforeRupees: 640.0,
      balanceAfterRupees: 2640.0,
      remarks: 'Prepaid top-up with 2% green energy rewards applied',
      reconciled: true,
    },
  ];

  constructor(
    private readonly auditService: AdminAuditService,
    private readonly usersService: AdminUsersService,
  ) {}

  async getTransactions(query?: { search?: string; userId?: string; type?: string; page?: number; pageSize?: number }) {
    let result = [...this.transactions];

    if (query?.userId) {
      result = result.filter((t) => t.userId === query.userId);
    }
    if (query?.type) {
      result = result.filter((t) => t.type === query.type);
    }
    if (query?.search) {
      const s = query.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.referenceId.toLowerCase().includes(s) ||
          t.title.toLowerCase().includes(s) ||
          t.userName.toLowerCase().includes(s) ||
          (t.remarks && t.remarks.toLowerCase().includes(s)),
      );
    }

    const page = Number(query?.page) || 1;
    const pageSize = Number(query?.pageSize) || 20;
    const total = result.length;
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: paginated,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async adjustWalletBalance(
    userId: string,
    amountRupees: number,
    isCredit: boolean,
    reason: string,
    referenceTicketId: string | undefined,
    adminActor: { id: string; name: string; role: AdminRole },
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`Driver ${userId} not found`);
    }

    const currentBalanceRupees = user.walletBalancePaise / 100;
    const newBalanceRupees = isCredit
      ? currentBalanceRupees + amountRupees
      : Math.max(0, currentBalanceRupees - amountRupees);

    user.walletBalancePaise = Math.round(newBalanceRupees * 100);

    const newTx: FinanceLedgerEntry = {
      id: `tx-${Date.now()}`,
      referenceId: `CM-ADJ-${Date.now().toString().slice(-8)}`,
      userId: user.id,
      userName: user.name,
      type: isCredit ? 'WALLET_CREDIT_ADJUSTMENT' : 'WALLET_DEBIT_ADJUSTMENT',
      title: `₹${amountRupees.toFixed(2)} ${isCredit ? 'Credit Adjustment' : 'Debit Adjustment'}`,
      amountRupees,
      isCredit,
      status: 'SUCCESS',
      dateStr: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      rawTimestamp: Date.now(),
      paymentMethodName: 'ChargeMesh Admin Adjuster',
      balanceBeforeRupees: currentBalanceRupees,
      balanceAfterRupees: newBalanceRupees,
      remarks: `${reason}${referenceTicketId ? ` (Ref: ${referenceTicketId})` : ''}`,
      reconciled: true,
    };

    this.transactions.unshift(newTx);

    await this.auditService.record({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: AuditActionType.WALLET_ADJUSTMENT,
      targetEntity: 'WALLET',
      targetId: user.id,
      previousValue: { walletBalancePaise: Math.round(currentBalanceRupees * 100) },
      newValue: { walletBalancePaise: user.walletBalancePaise },
      reason: `${reason} [Adjustment: ₹${amountRupees}, ${isCredit ? 'Credit' : 'Debit'}]`,
      ipAddress: '127.0.0.1',
    });

    return {
      success: true,
      transaction: newTx,
      updatedBalanceRupees: newBalanceRupees,
    };
  }
}
