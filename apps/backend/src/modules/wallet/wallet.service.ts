import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity, FinanceLedgerEntity } from '../../database/entities';
import { RazorpayService, RazorpayOrderResult } from './razorpay.service';

export interface WalletBalanceSummary {
  userId: string;
  walletBalancePaise: number;
  walletHeldPaise: number;
  availableBalancePaise: number;
  balanceRupees: number;
  availableRupees: number;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FinanceLedgerEntity)
    private readonly financeRepo: Repository<FinanceLedgerEntity>,
    private readonly razorpayService: RazorpayService,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async getBalance(userId: string): Promise<WalletBalanceSummary> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Driver profile ${userId} not found`);
    }

    const totalPaise = Number(user.walletBalancePaise || 0);
    const heldPaise = Number(user.walletHeldPaise || 0);
    const availablePaise = Math.max(0, totalPaise - heldPaise);

    return {
      userId: user.id,
      walletBalancePaise: totalPaise,
      walletHeldPaise: heldPaise,
      availableBalancePaise: availablePaise,
      balanceRupees: totalPaise / 100,
      availableRupees: availablePaise / 100,
    };
  }

  async getTransactions(userId: string, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, Math.min(100, pageSize));

    const [entries, total] = await this.financeRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    return {
      success: true,
      data: entries.map((e) => ({
        id: e.id,
        referenceId: e.referenceId,
        type: e.type,
        title: e.title,
        amountRupees: Number(e.amountRupees),
        isCredit: e.isCredit,
        status: e.status,
        dateStr: e.dateStr,
        timeStr: e.timeStr,
        paymentMethodName: e.paymentMethodName,
        balanceBeforeRupees: Number(e.balanceBeforeRupees),
        balanceAfterRupees: Number(e.balanceAfterRupees),
        remarks: e.remarks,
      })),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.ceil(total / safePageSize),
      },
    };
  }

  async createTopupOrder(userId: string, amountRupees: number): Promise<RazorpayOrderResult> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Driver profile ${userId} not found`);
    }
    return this.razorpayService.createOrder(userId, amountRupees);
  }

  async verifyAndCreditTopup(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    amountRupees: number,
  ) {
    // 1. Verify cryptographic signature if razorpay is configured
    if (this.razorpayService.isConfigured()) {
      const isValid = this.razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
      if (!isValid) {
        throw new BadRequestException('Payment signature verification failed. Untrusted callback.');
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Payment gateway signature required in production');
    }

    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise <= 0) {
      throw new BadRequestException('Invalid top-up credit amount');
    }

    // 2. Execute idempotent atomic balance credit
    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource.transaction(async (manager) => {
        // Idempotency: verify this paymentId has not already been credited
        const existingTx = await manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId: paymentId });
        if (existingTx) {
          this.logger.warn(`Duplicate payment credit attempt for reference ${paymentId}. Returning existing ledger.`);
          return {
            success: true,
            duplicate: true,
            ledger: existingTx,
          };
        }

        const user = await manager
          .getRepository(UserEntity)
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user) {
          throw new NotFoundException(`User ${userId} not found`);
        }

        const currentPaise = Number(user.walletBalancePaise || 0);
        const newPaise = currentPaise + amountPaise;

        await manager.getRepository(UserEntity).update(user.id, {
          walletBalancePaise: newPaise,
          updatedAt: new Date(),
        });

        const now = new Date();
        const tx = manager.getRepository(FinanceLedgerEntity).create({
          id: `tx-topup-${paymentId}`,
          referenceId: paymentId,
          userId: user.id,
          userName: user.name,
          type: 'WALLET_TOPUP_UPI',
          title: `₹${amountRupees.toFixed(2)} Added via UPI / Razorpay`,
          amountRupees,
          isCredit: true,
          status: 'SUCCESS',
          dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: Date.now(),
          paymentMethodName: 'Razorpay UPI / Fast Wallet',
          balanceBeforeRupees: currentPaise / 100,
          balanceAfterRupees: newPaise / 100,
          remarks: `Order ID: ${orderId}`,
          reconciled: true,
        });

        const saved = await manager.getRepository(FinanceLedgerEntity).save(tx);
        this.logger.log(`Successfully credited ₹${amountRupees} to user ${userId} (Ref: ${paymentId})`);

        return {
          success: true,
          newBalanceRupees: newPaise / 100,
          ledger: saved,
        };
      });
    }

    // Fallback for non-transactional mock test environments
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    user.walletBalancePaise = Number(user.walletBalancePaise || 0) + amountPaise;
    await this.userRepo.save(user);
    return { success: true, newBalanceRupees: user.walletBalancePaise / 100 };
  }

  async creditFromWebhook(
    userId: string,
    orderId: string,
    paymentId: string,
    amountRupees: number,
  ) {
    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise <= 0) {
      throw new BadRequestException('Invalid webhook credit amount');
    }

    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource.transaction(async (manager) => {
        const existingTx = await manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId: paymentId });
        if (existingTx) {
          this.logger.warn(`Duplicate webhook credit for reference ${paymentId}. Skipping.`);
          return {
            success: true,
            duplicate: true,
            ledger: existingTx,
          };
        }

        const user = await manager
          .getRepository(UserEntity)
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user) {
          throw new NotFoundException(`User ${userId} not found for webhook credit`);
        }

        const currentPaise = Number(user.walletBalancePaise || 0);
        const newPaise = currentPaise + amountPaise;

        await manager.getRepository(UserEntity).update(user.id, {
          walletBalancePaise: newPaise,
          updatedAt: new Date(),
        });

        const now = new Date();
        const tx = manager.getRepository(FinanceLedgerEntity).create({
          id: `tx-topup-${paymentId}`,
          referenceId: paymentId,
          userId: user.id,
          userName: user.name,
          type: 'WALLET_TOPUP_UPI',
          title: `₹${amountRupees.toFixed(2)} Added via Razorpay Webhook`,
          amountRupees,
          isCredit: true,
          status: 'SUCCESS',
          dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: Date.now(),
          paymentMethodName: 'Razorpay Webhook',
          balanceBeforeRupees: currentPaise / 100,
          balanceAfterRupees: newPaise / 100,
          remarks: `Order ID: ${orderId}`,
          reconciled: true,
        });

        const saved = await manager.getRepository(FinanceLedgerEntity).save(tx);
        return {
          success: true,
          newBalanceRupees: newPaise / 100,
          ledger: saved,
        };
      });
    }

    return { success: true, newBalanceRupees: amountRupees };
  }

  async reserveFunds(userId: string, amountPaise: number, sessionId: string): Promise<boolean> {
    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource.transaction(async (manager) => {
        const resRef = `CM-RES-${sessionId}`;
        const existingRes = await manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId: resRef });
        if (existingRes) {
          this.logger.warn(`Reservation for session ${sessionId} already exists. Returning idempotent true.`);
          return true;
        }

        const user = await manager
          .getRepository(UserEntity)
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user) {
          throw new NotFoundException(`Driver profile ${userId} not found`);
        }

        const balance = Number(user.walletBalancePaise || 0);
        const held = Number(user.walletHeldPaise || 0);
        const available = balance - held;

        if (available < amountPaise) {
          throw new BadRequestException(
            `Insufficient available balance (₹${(available / 100).toFixed(2)}). Pre-authorization hold of ₹${(amountPaise / 100).toFixed(2)} required.`,
          );
        }

        await manager.getRepository(UserEntity).update(user.id, {
          walletHeldPaise: held + amountPaise,
          updatedAt: new Date(),
        });

        const now = new Date();
        const resEntry = manager.getRepository(FinanceLedgerEntity).create({
          id: `tx-res-${sessionId}`,
          referenceId: resRef,
          userId: user.id,
          userName: user.name,
          type: 'WALLET_HOLD',
          title: `₹${(amountPaise / 100).toFixed(2)} Reserved for Charging`,
          amountRupees: amountPaise / 100,
          isCredit: false,
          status: 'PENDING',
          dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: Date.now(),
          paymentMethodName: 'ChargeMesh Fast Wallet Hold',
          balanceBeforeRupees: balance / 100,
          balanceAfterRupees: (balance - amountPaise) / 100,
          remarks: `Pre-authorization hold for session ${sessionId}`,
          reconciled: true,
        });
        await manager.getRepository(FinanceLedgerEntity).save(resEntry);

        this.logger.log(`Reserved ₹${(amountPaise / 100).toFixed(2)} for session ${sessionId} (Driver: ${userId})`);
        return true;
      });
    }
    return true;
  }

  async releaseReservation(userId: string, sessionId: string, amountPaise = 20000): Promise<boolean> {
    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource.transaction(async (manager) => {
        const relRef = `CM-REL-${sessionId}`;
        const sessRef = `CM-SESS-${sessionId}`;

        const [existingRel, existingSess] = await Promise.all([
          manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId: relRef }),
          manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId: sessRef }),
        ]);

        if (existingRel || existingSess) {
          this.logger.warn(`Reservation for session ${sessionId} already released or settled. Idempotent skip.`);
          return true;
        }

        const user = await manager
          .getRepository(UserEntity)
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user) {
          throw new NotFoundException(`Driver profile ${userId} not found`);
        }

        const currentHeld = Number(user.walletHeldPaise || 0);
        const newHeld = Math.max(0, currentHeld - amountPaise);

        await manager.getRepository(UserEntity).update(user.id, {
          walletHeldPaise: newHeld,
          updatedAt: new Date(),
        });

        const now = new Date();
        const balance = Number(user.walletBalancePaise || 0);
        const relEntry = manager.getRepository(FinanceLedgerEntity).create({
          id: `tx-rel-${sessionId}`,
          referenceId: relRef,
          userId: user.id,
          userName: user.name,
          type: 'WALLET_RELEASE',
          title: `₹${(amountPaise / 100).toFixed(2)} Reservation Released`,
          amountRupees: amountPaise / 100,
          isCredit: true,
          status: 'SUCCESS',
          dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: Date.now(),
          paymentMethodName: 'ChargeMesh Fast Wallet Release',
          balanceBeforeRupees: (balance - currentHeld) / 100,
          balanceAfterRupees: (balance - newHeld) / 100,
          remarks: `Cancelled or unstarted session ${sessionId} hold released`,
          reconciled: true,
        });
        await manager.getRepository(FinanceLedgerEntity).save(relEntry);

        this.logger.log(`Released hold ₹${(amountPaise / 100).toFixed(2)} for session ${sessionId} (Driver: ${userId})`);
        return true;
      });
    }
    return true;
  }

  async settleSession(
    userId: string,
    sessionId: string,
    costRupees: number,
    reservedPaise: number,
    energyKwh: number,
  ) {
    const costPaise = Math.round(costRupees * 100);

    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource.transaction(async (manager) => {
        const referenceId = `CM-SESS-${sessionId}`;

        // CRITICAL CHECK FIRST: Idempotency check before ANY balance mutations!
        const existingTx = await manager.getRepository(FinanceLedgerEntity).findOneBy({ referenceId });
        if (existingTx) {
          this.logger.warn(`Duplicate settlement attempt for session ${sessionId}. Returning existing settled record.`);
          return {
            settled: true,
            duplicate: true,
            costRupees,
            newBalanceRupees: Number(existingTx.balanceAfterRupees),
          };
        }

        const user = await manager
          .getRepository(UserEntity)
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!user) {
          this.logger.error(`Driver ${userId} not found during session ${sessionId} settlement.`);
          return null;
        }

        // 1. Release reserved hold
        const currentHeld = Number(user.walletHeldPaise || 0);
        const newHeld = Math.max(0, currentHeld - reservedPaise);

        // 2. Debit actual charging cost (atomic)
        const currentBalance = Number(user.walletBalancePaise || 0);
        const newBalance = currentBalance - costPaise;

        await manager.getRepository(UserEntity).update(user.id, {
          walletHeldPaise: newHeld,
          walletBalancePaise: newBalance,
          totalSessions: (user.totalSessions || 0) + 1,
          totalKwhCharged: (user.totalKwhCharged || 0) + energyKwh,
          co2SavedKg: (user.co2SavedKg || 0) + parseFloat((energyKwh * 0.82).toFixed(2)),
          updatedAt: new Date(),
        });

        // 3. Create immutable ledger debit record in the SAME transaction
        const now = new Date();
        const ledgerEntry = manager.getRepository(FinanceLedgerEntity).create({
          id: `tx-settle-${sessionId}`,
          referenceId,
          userId: user.id,
          userName: user.name,
          type: 'WALLET_DEBIT',
          title: `₹${costRupees.toFixed(2)} Debited`,
          amountRupees: costRupees,
          isCredit: false,
          status: 'SUCCESS',
          dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          rawTimestamp: Date.now(),
          paymentMethodName: 'ChargeMesh Fast Wallet',
          balanceBeforeRupees: currentBalance / 100,
          balanceAfterRupees: newBalance / 100,
          remarks: `Charging Session ${sessionId}: ${energyKwh.toFixed(2)} kWh billed`,
          reconciled: true,
        });
        await manager.getRepository(FinanceLedgerEntity).save(ledgerEntry);

        this.logger.log(
          `Settled session ${sessionId}: cost ₹${costRupees}, released hold ₹${reservedPaise / 100}, new balance ₹${newBalance / 100}`,
        );

        return {
          settled: true,
          costRupees,
          newBalanceRupees: newBalance / 100,
        };
      });
    }

    return { settled: true, costRupees };
  }
}
