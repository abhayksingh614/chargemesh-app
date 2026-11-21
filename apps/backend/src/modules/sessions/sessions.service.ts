import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { StartSessionDto } from './dto/start-session.dto';
import { StationsService } from '../stations/stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { WalletService } from '../wallet/wallet.service';
import { ChargingSessionEntity, MeterValueEntity, UserEntity } from '../../database/entities';

export interface SessionRecord {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  connectorId: string;
  connectorType: string;
  chargePointId: string;
  transactionId?: number;
  status: 'REQUESTED' | 'STARTING' | 'CHARGING' | 'STOPPING' | 'COMPLETED' | 'FAILED';
  target?: {
    type: string;
    value: number;
  };
  startTime: Date;
  endTime?: Date;
  energyKwh: number;
  totalCostInr: number;
  pricePerKwh: number;
  startSoC: number;
  currentSoC: number;
  powerKw: number;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly inMemorySessions = new Map<string, SessionRecord>();

  constructor(
    @InjectRepository(ChargingSessionEntity)
    private readonly sessionRepo: Repository<ChargingSessionEntity>,
    @InjectRepository(MeterValueEntity)
    private readonly meterRepo: Repository<MeterValueEntity>,
    private readonly stationsService: StationsService,
    private readonly ocppService: OcppService,
    private readonly telemetryService: TelemetryService,
    @Optional()
    @InjectRepository(UserEntity)
    private readonly userRepo?: Repository<UserEntity>,
    @Optional()
    private readonly walletService?: WalletService,
  ) {}

  async startSession(userId: string, dto: StartSessionDto): Promise<SessionRecord> {
    const minPreauthPaise = parseInt(process.env.WALLET_MIN_PREAUTH_PAISE || '20000', 10); // default ₹200.00
    // SEC-002: Use cryptographically unguessable UUID for session identifiers
    const sessionId = `sess-${crypto.randomUUID()}`;

    // POL-002 / REM-A05: Atomic wallet pre-authorization hold
    if (this.walletService) {
      await this.walletService.reserveFunds(userId, minPreauthPaise, sessionId);
    } else if (this.userRepo) {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`Driver profile ${userId} not found`);
      }
      const available = Number(user.walletBalancePaise || 0) - Number(user.walletHeldPaise || 0);
      if (available < minPreauthPaise) {
        const currentRupees = (available / 100).toFixed(2);
        const requiredRupees = (minPreauthPaise / 100).toFixed(2);
        throw new BadRequestException(
          `Insufficient available balance (₹${currentRupees}). Minimum balance of ₹${requiredRupees} is required to initiate charging.`,
        );
      }
    }

    try {
      const station = await this.stationsService.findById(dto.stationId);
      const connector = station.connectors.find(
        (c) => c.id === dto.connectorId || c.connectorNumber.toString() === dto.connectorId,
      );

      if (!connector) {
        throw new NotFoundException(`Connector ${dto.connectorId} not found on station ${dto.stationId}`);
      }

      if (connector.status !== 'AVAILABLE') {
        throw new BadRequestException(`Connector is currently ${connector.status}`);
      }

      // Owner Decision: Reject simulated or offline chargers in production
      const isProduction = process.env.NODE_ENV === 'production';
      const cpSession = this.ocppService.getChargePointSession(station.chargePointId);
      if (!cpSession && isProduction) {
        throw new BadRequestException(
          `Charging point ${station.chargePointId} is currently offline. Sessions on offline chargers are disabled in production.`,
        );
      }
      const sessionData: SessionRecord = {
        id: sessionId,
        userId,
        stationId: station.id,
        stationName: station.name,
        connectorId: connector.id,
        connectorType: connector.type,
        chargePointId: station.chargePointId,
        status: 'STARTING',
        target: dto.target,
        startTime: new Date(),
        energyKwh: 0,
        totalCostInr: 0,
        pricePerKwh: connector.pricePerKwh || 18.5,
        startSoC: 22,
        currentSoC: 22,
        powerKw: connector.powerKw || 60,
      };

      // Store in-memory cache
      this.inMemorySessions.set(sessionId, sessionData);

      // Persist to PostgreSQL database
      try {
        const entity = this.sessionRepo.create({
          id: sessionData.id,
          userId: sessionData.userId,
          stationId: sessionData.stationId,
          stationName: sessionData.stationName,
          connectorId: sessionData.connectorId,
          connectorType: sessionData.connectorType,
          chargePointId: sessionData.chargePointId,
          status: sessionData.status,
          target: sessionData.target,
          startTime: sessionData.startTime,
          energyKwh: sessionData.energyKwh,
          totalCostInr: sessionData.totalCostInr,
          pricePerKwh: sessionData.pricePerKwh,
          startSoC: sessionData.startSoC,
          currentSoC: sessionData.currentSoC,
          powerKw: sessionData.powerKw,
        });
        await this.sessionRepo.save(entity);
        this.logger.log(`Persisted new charging session ${sessionId} to PostgreSQL`);
      } catch (err: any) {
        this.logger.warn(`Failed to persist session ${sessionId} to database: ${err.message}. Retaining in-memory.`);
      }

      // If charge point is connected via OCPP, dispatch RemoteStartTransaction
      if (cpSession) {
        try {
          const ocppRes = await this.ocppService.remoteStartTransaction(
            station.chargePointId,
            connector.connectorNumber,
            userId,
          );
          if (ocppRes.status === 'Accepted') {
            sessionData.status = 'CHARGING';
          } else {
            sessionData.status = 'FAILED';
            throw new BadRequestException(`Charge point rejected start command: ${ocppRes.status}`);
          }
        } catch (err: any) {
          if (isProduction) {
            throw err;
          }
          this.logger.warn(
            `OCPP remoteStartTransaction failed or offline for ${station.chargePointId}: ${err.message}. Defaulting to active simulation session.`,
          );
          sessionData.status = 'CHARGING';
        }
      } else {
        sessionData.status = 'CHARGING';
      }

      // Update persisted status
      try {
        await this.sessionRepo.update(sessionId, { status: sessionData.status });
      } catch {}

      // Publish initial telemetry packet
      this.telemetryService.emitTelemetry({
        sessionId,
        chargePointId: station.chargePointId,
        connectorId: connector.connectorNumber,
        soc: sessionData.currentSoC,
        powerKw: sessionData.powerKw,
        energyKwh: sessionData.energyKwh,
        voltage: 400,
        current: 125,
        costInr: sessionData.totalCostInr,
        durationSeconds: 0,
        timestamp: new Date().toISOString(),
      });

      return sessionData;
    } catch (err) {
      if (this.walletService) {
        await this.walletService.releaseReservation(userId, sessionId, minPreauthPaise).catch(() => {});
      }
      throw err;
    }
  }

  async stopSession(sessionId: string, userId: string, _reason?: string): Promise<SessionRecord> {
    let session = this.inMemorySessions.get(sessionId);

    if (!session) {
      try {
        const dbSession = await this.sessionRepo.findOneBy({ id: sessionId });
        if (dbSession) {
          session = {
            id: dbSession.id,
            userId: dbSession.userId,
            stationId: dbSession.stationId,
            stationName: dbSession.stationName,
            connectorId: dbSession.connectorId,
            connectorType: dbSession.connectorType,
            chargePointId: dbSession.chargePointId,
            transactionId: dbSession.transactionId,
            status: dbSession.status as any,
            target: dbSession.target,
            startTime: dbSession.startTime,
            endTime: dbSession.endTime,
            energyKwh: dbSession.energyKwh,
            totalCostInr: dbSession.totalCostInr,
            pricePerKwh: dbSession.pricePerKwh,
            startSoC: dbSession.startSoC,
            currentSoC: dbSession.currentSoC,
            powerKw: dbSession.powerKw,
          };
        }
      } catch {}
    }

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      this.logger.warn(`User ${userId} requested stop for session owned by ${session.userId}`);
      throw new ForbiddenException('You are not authorized to stop another driver\'s charging session');
    }

    // Idempotent completion check
    if (session.status === 'COMPLETED' || session.status === 'FAILED') {
      return session;
    }

    session.status = 'COMPLETED';
    session.endTime = new Date();
    if (!session.energyKwh || session.energyKwh === 0) {
      session.energyKwh = 18.4;
      session.totalCostInr = parseFloat((session.energyKwh * session.pricePerKwh).toFixed(2));
      session.currentSoC = 80;
    }

    this.inMemorySessions.set(sessionId, session);

    // Persist final session state to database
    try {
      await this.sessionRepo.update(sessionId, {
        status: 'COMPLETED',
        endTime: session.endTime,
        energyKwh: session.energyKwh,
        totalCostInr: session.totalCostInr,
        currentSoC: session.currentSoC,
      });
      this.logger.log(`Persisted completed session ${sessionId} to PostgreSQL`);
    } catch {}

    // FIN-001: Atomic Financial Settlement — Debit driver wallet and record in ledger
    const minPreauthPaise = parseInt(process.env.WALLET_MIN_PREAUTH_PAISE || '20000', 10);
    if (this.walletService) {
      try {
        await this.walletService.settleSession(
          userId,
          sessionId,
          session.totalCostInr,
          minPreauthPaise,
          session.energyKwh,
        );
      } catch (err: any) {
        this.logger.error(`Financial settlement error for session ${sessionId}: ${err.message}`);
      }
    }

    // If active transaction in OCPP, send RemoteStopTransaction
    if (session.transactionId) {
      try {
        await this.ocppService.remoteStopTransaction(session.chargePointId, session.transactionId);
      } catch (err: any) {
        this.logger.warn(`OCPP remoteStopTransaction failed: ${err.message}`);
      }
    }

    return session;
  }

  async getSession(
    sessionId: string,
    caller?: { userId: string; role?: string },
  ): Promise<SessionRecord> {
    let session: SessionRecord | undefined = this.inMemorySessions.get(sessionId);

    if (!session) {
      try {
        const dbSession = await this.sessionRepo.findOne({
          where: { id: sessionId },
          relations: ['meterValues'],
        });
        if (dbSession) {
          session = {
            id: dbSession.id,
            userId: dbSession.userId,
            stationId: dbSession.stationId,
            stationName: dbSession.stationName,
            connectorId: dbSession.connectorId,
            connectorType: dbSession.connectorType,
            chargePointId: dbSession.chargePointId,
            transactionId: dbSession.transactionId,
            status: dbSession.status as any,
            target: dbSession.target,
            startTime: dbSession.startTime,
            endTime: dbSession.endTime,
            energyKwh: dbSession.energyKwh,
            totalCostInr: dbSession.totalCostInr,
            pricePerKwh: dbSession.pricePerKwh,
            startSoC: dbSession.startSoC,
            currentSoC: dbSession.currentSoC,
            powerKw: dbSession.powerKw,
          };
        }
      } catch {}
    }

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // SEC-002: Object-level authorization guard (BOLA / IDOR protection)
    if (caller) {
      const isOwner = session.userId === caller.userId;
      const isPrivileged = caller.role && caller.role.includes('ADMIN');
      if (!isOwner && !isPrivileged) {
        this.logger.warn(
          `Unauthorized session query attempt: Caller ${caller.userId} attempted to access session ${sessionId} owned by ${session.userId}`,
        );
        throw new ForbiddenException('You are not authorized to view this charging session');
      }
    }

    return session;
  }

  async getUserSessions(userId: string): Promise<SessionRecord[]> {
    try {
      const dbSessions = await this.sessionRepo.find({
        where: { userId },
        order: { startTime: 'DESC' },
      });
      if (dbSessions.length > 0) {
        return dbSessions.map((s) => ({
          id: s.id,
          userId: s.userId,
          stationId: s.stationId,
          stationName: s.stationName,
          connectorId: s.connectorId,
          connectorType: s.connectorType,
          chargePointId: s.chargePointId,
          transactionId: s.transactionId,
          status: s.status as any,
          target: s.target,
          startTime: s.startTime,
          endTime: s.endTime,
          energyKwh: s.energyKwh,
          totalCostInr: s.totalCostInr,
          pricePerKwh: s.pricePerKwh,
          startSoC: s.startSoC,
          currentSoC: s.currentSoC,
          powerKw: s.powerKw,
        }));
      }
    } catch {}

    return Array.from(this.inMemorySessions.values()).filter((s) => s.userId === userId);
  }

  async addMeterValue(sessionId: string, meterValue: Partial<MeterValueEntity>): Promise<void> {
    try {
      await this.meterRepo.save(this.meterRepo.create({
        sessionId,
        chargePointId: meterValue.chargePointId || 'CP-DELHI-001',
        connectorNumber: meterValue.connectorNumber || 1,
        timestamp: meterValue.timestamp || new Date(),
        powerKw: meterValue.powerKw || 0,
        energyKwh: meterValue.energyKwh || 0,
        socPercent: meterValue.socPercent,
        voltage: meterValue.voltage,
        current: meterValue.current,
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to persist meter value for session ${sessionId}: ${err.message}`);
    }
  }
}
