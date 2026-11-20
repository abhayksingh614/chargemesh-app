import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  OcppAction,
  OcppCallFrame,
  OcppCallResultFrame,
  OcppCallErrorFrame,
  OcppErrorCode,
  OcppMessageType,
  BootNotificationRequest,
  BootNotificationResponse,
  HeartbeatResponse,
  StatusNotificationRequest,
  AuthorizeRequest,
  AuthorizeResponse,
  StartTransactionRequest,
  StartTransactionResponse,
  StopTransactionRequest,
  StopTransactionResponse,
  MeterValuesRequest,
  RemoteStartTransactionResponse,
  RemoteStopTransactionResponse,
} from './types/ocpp.types';
import { TelemetryService } from '../telemetry/telemetry.service';
import {
  UserEntity,
  ChargingStationEntity,
  ChargingSessionEntity,
} from '../../database/entities';

export interface ChargePointSession {
  chargePointId: string;
  ws: WebSocket;
  protocol: string;
  connectedAt: Date;
  lastHeartbeat?: Date;
  status: Record<number, string>;
  vendor?: string;
  model?: string;
}

export interface ActiveTransaction {
  transactionId: number;
  chargePointId: string;
  connectorId: number;
  idTag: string;
  meterStart: number;
  startTime: Date;
  currentSoC?: number;
  currentPowerKw?: number;
  energyKwh?: number;
  costInr?: number;
  pricePerKwh: number;
}

@Injectable()
export class OcppService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(OcppService.name);
  private readonly chargePoints = new Map<string, ChargePointSession>();
  private readonly pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }
  >();

  private transactionCounter = 1000;
  private readonly activeTransactions = new Map<number, ActiveTransaction>();

  private redis: Redis | null = null;
  private isRedisConnected = false;

  constructor(
    private readonly telemetryService: TelemetryService,
    @Optional()
    @InjectRepository(UserEntity)
    private readonly userRepo?: Repository<UserEntity>,
    @Optional()
    @InjectRepository(ChargingStationEntity)
    private readonly stationRepo?: Repository<ChargingStationEntity>,
    @Optional()
    @InjectRepository(ChargingSessionEntity)
    private readonly sessionRepo?: Repository<ChargingSessionEntity>,
    @Optional()
    private readonly configService?: ConfigService,
  ) {
    this.initRedis();
  }

  async onModuleInit() {
    await this.restoreActiveTransactions();
  }

  private async restoreActiveTransactions() {
    await this.restoreActiveTransactionsFromRedis();

    // Reconstruct transactions from PostgreSQL charging_sessions if available
    if (this.sessionRepo) {
      try {
        const activeDb = await this.sessionRepo.find({ where: { status: 'CHARGING' } });
        let recovered = 0;
        for (const s of activeDb) {
          if (s.transactionId && !this.activeTransactions.has(s.transactionId)) {
            const tx: ActiveTransaction = {
              transactionId: s.transactionId,
              chargePointId: s.chargePointId,
              connectorId: parseInt(s.connectorId, 10) || 1,
              idTag: s.userId,
              meterStart: 0,
              startTime: new Date(s.startTime),
              currentSoC: s.currentSoC || 20,
              currentPowerKw: s.powerKw || 0,
              energyKwh: s.energyKwh || 0,
              costInr: s.totalCostInr || 0,
              pricePerKwh: s.pricePerKwh || 18.5,
            };
            this.activeTransactions.set(s.transactionId, tx);
            if (s.transactionId > this.transactionCounter) {
              this.transactionCounter = s.transactionId;
            }
            recovered++;
          }
        }
        if (recovered > 0) {
          this.logger.log(`Restored ${recovered} active OCPP transactions from PostgreSQL`);
        }
      } catch (err: any) {
        this.logger.warn(`Could not restore active transactions from PostgreSQL: ${err.message}`);
      }
    }
  }

  private initRedis() {
    const redisHost =
      this.configService?.get<string>('app.redis.host') ||
      process.env.REDIS_HOST ||
      'localhost';
    if (redisHost === 'disabled' || redisHost === 'disabled-for-memory-test') {
      return;
    }
    const redisPort =
      this.configService?.get<number>('app.redis.port') ||
      parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword =
      this.configService?.get<string>('app.redis.password') ||
      process.env.REDIS_PASSWORD ||
      undefined;

    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (process.env.NODE_ENV === 'test' || times > 1) {
            return null;
          }
          return Math.min(times * 200, 1000);
        },
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        this.logger.log('Redis connected for OCPP transaction persistence');
        this.restoreActiveTransactionsFromRedis();
      });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });

      this.redis.connect().catch(() => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  private async restoreActiveTransactionsFromRedis() {
    if (!this.redis || !this.isRedisConnected) return;
    try {
      const keys = await this.redis.keys('chargemesh:ocpp:tx:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const tx: ActiveTransaction = JSON.parse(data);
          tx.startTime = new Date(tx.startTime);
          this.activeTransactions.set(tx.transactionId, tx);
          if (tx.transactionId > this.transactionCounter) {
            this.transactionCounter = tx.transactionId;
          }
        }
      }
      if (keys.length > 0) {
        this.logger.log(`Restored ${keys.length} active OCPP transactions from Redis`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not restore active transactions from Redis: ${err.message}`);
    }
  }

  async authenticateChargePoint(
    chargePointId: string,
    authHeader?: string,
  ): Promise<{ authorized: boolean; reason?: string }> {
    if (!this.stationRepo) {
      return { authorized: true };
    }

    try {
      const station = await this.stationRepo.findOneBy({ chargePointId });
      if (!station) {
        if (process.env.NODE_ENV === 'production') {
          return { authorized: false, reason: 'Station not registered in production' };
        }
        return { authorized: true };
      }

      if (station.status === 'INACTIVE' || station.status === 'DECOMMISSIONED') {
        return { authorized: false, reason: 'Station is marked inactive' };
      }

      if (station.chargePointPassword) {
        if (!authHeader) {
          return { authorized: false, reason: 'Missing Basic authorization header' };
        }
        const match = authHeader.match(/^Basic\s+(.*)$/i);
        if (!match) {
          return { authorized: false, reason: 'Invalid authorization format. Basic auth required.' };
        }
        const decoded = Buffer.from(match[1], 'base64').toString('utf8');
        const colonIdx = decoded.indexOf(':');
        const password = colonIdx !== -1 ? decoded.slice(colonIdx + 1) : decoded;

        // SEC-011: Constant-time & Bcrypt comparison to prevent timing side-channel attacks
        let isAuthorized = false;
        if (
          station.chargePointPassword.startsWith('$2b$') ||
          station.chargePointPassword.startsWith('$2a$')
        ) {
          isAuthorized = await bcrypt.compare(password, station.chargePointPassword);
        } else {
          const storedBuf = Buffer.from(station.chargePointPassword);
          const providedBuf = Buffer.from(password);
          isAuthorized =
            storedBuf.length === providedBuf.length &&
            crypto.timingSafeEqual(storedBuf, providedBuf);
        }

        if (!isAuthorized) {
          this.logger.warn(`OCPP authentication failed for [${chargePointId}]. Invalid credentials.`);
          return { authorized: false, reason: 'Invalid charge point credentials' };
        }
      }

      return { authorized: true };
    } catch (err: any) {
      this.logger.error(`Database error during station authentication: ${err.message}`);
      return { authorized: true };
    }
  }

  registerChargePoint(chargePointId: string, ws: WebSocket, protocol: string) {
    this.chargePoints.set(chargePointId, {
      chargePointId,
      ws,
      protocol,
      connectedAt: new Date(),
      status: {},
    });
    this.logger.log(`Charge Point [${chargePointId}] registered via ${protocol}`);
  }

  unregisterChargePoint(chargePointId: string) {
    this.chargePoints.delete(chargePointId);
    this.logger.log(`Charge Point [${chargePointId}] disconnected`);
  }

  getConnectedChargePoints(): string[] {
    return Array.from(this.chargePoints.keys());
  }

  getChargePointSession(chargePointId: string): ChargePointSession | undefined {
    return this.chargePoints.get(chargePointId);
  }

  getActiveTransaction(transactionId: number): ActiveTransaction | undefined {
    return this.activeTransactions.get(transactionId);
  }

  getTransactionByConnector(chargePointId: string, connectorId: number): ActiveTransaction | undefined {
    return Array.from(this.activeTransactions.values()).find(
      (tx) => tx.chargePointId === chargePointId && tx.connectorId === connectorId,
    );
  }

  async handleIncomingMessage(chargePointId: string, rawMessage: string): Promise<string | null> {
    let parsed: any[];
    try {
      parsed = JSON.parse(rawMessage);
    } catch {
      this.logger.error(`Invalid JSON received from [${chargePointId}]: ${rawMessage}`);
      const errFrame: OcppCallErrorFrame = [
        OcppMessageType.CALLERROR,
        '',
        OcppErrorCode.FORMATION_VIOLATION,
        'Invalid JSON format',
        {},
      ];
      return JSON.stringify(errFrame);
    }

    if (!Array.isArray(parsed) || parsed.length < 3) {
      const errFrame: OcppCallErrorFrame = [
        OcppMessageType.CALLERROR,
        parsed?.[1] || '',
        OcppErrorCode.PROTOCOL_ERROR,
        'Malformed OCPP frame structure',
        {},
      ];
      return JSON.stringify(errFrame);
    }

    const [messageTypeId, messageId] = parsed;

    if (messageTypeId === OcppMessageType.CALLRESULT) {
      this.handleCallResult(messageId, parsed[2]);
      return null;
    }

    if (messageTypeId === OcppMessageType.CALLERROR) {
      this.handleCallError(messageId, parsed[2], parsed[3], parsed[4]);
      return null;
    }

    if (messageTypeId !== OcppMessageType.CALL) {
      const errFrame: OcppCallErrorFrame = [
        OcppMessageType.CALLERROR,
        messageId,
        OcppErrorCode.NOT_SUPPORTED,
        `MessageTypeId ${messageTypeId} is not supported`,
        {},
      ];
      return JSON.stringify(errFrame);
    }

    const action = parsed[2] as OcppAction;
    const payload = parsed[3] || {};

    try {
      let resultPayload: any = {};

      switch (action) {
        case OcppAction.BOOT_NOTIFICATION:
          resultPayload = this.handleBootNotification(chargePointId, payload);
          break;

        case OcppAction.HEARTBEAT:
          resultPayload = this.handleHeartbeat(chargePointId);
          break;

        case OcppAction.STATUS_NOTIFICATION:
          resultPayload = this.handleStatusNotification(chargePointId, payload);
          break;

        case OcppAction.AUTHORIZE:
          resultPayload = await this.handleAuthorize(chargePointId, payload);
          break;

        case OcppAction.START_TRANSACTION:
          resultPayload = await this.handleStartTransaction(chargePointId, payload);
          break;

        case OcppAction.STOP_TRANSACTION:
          resultPayload = await this.handleStopTransaction(chargePointId, payload);
          break;

        case OcppAction.METER_VALUES:
          resultPayload = this.handleMeterValues(chargePointId, payload);
          break;

        default: {
          const errFrame: OcppCallErrorFrame = [
            OcppMessageType.CALLERROR,
            messageId,
            OcppErrorCode.NOT_IMPLEMENTED,
            `Action ${action} is not implemented`,
            {},
          ];
          return JSON.stringify(errFrame);
        }
      }

      const resFrame: OcppCallResultFrame = [
        OcppMessageType.CALLRESULT,
        messageId,
        resultPayload,
      ];
      return JSON.stringify(resFrame);
    } catch (err: any) {
      this.logger.error(`Error handling action ${action} for [${chargePointId}]: ${err.message}`);
      const errFrame: OcppCallErrorFrame = [
        OcppMessageType.CALLERROR,
        messageId,
        OcppErrorCode.INTERNAL_ERROR,
        err.message || 'Internal processing error',
        {},
      ];
      return JSON.stringify(errFrame);
    }
  }

  private handleBootNotification(
    chargePointId: string,
    payload: BootNotificationRequest,
  ): BootNotificationResponse {
    const cp = this.chargePoints.get(chargePointId);
    if (cp) {
      cp.vendor = payload.chargePointVendor;
      cp.model = payload.chargePointModel;
    }
    this.logger.log(
      `BootNotification accepted for ${chargePointId} (${payload.chargePointVendor} ${payload.chargePointModel})`,
    );
    return {
      status: 'Accepted',
      currentTime: new Date().toISOString(),
      interval: 300,
    };
  }

  private handleHeartbeat(chargePointId: string): HeartbeatResponse {
    const cp = this.chargePoints.get(chargePointId);
    if (cp) {
      cp.lastHeartbeat = new Date();
    }
    return {
      currentTime: new Date().toISOString(),
    };
  }

  private handleStatusNotification(
    chargePointId: string,
    payload: StatusNotificationRequest,
  ): Record<string, never> {
    const cp = this.chargePoints.get(chargePointId);
    if (cp) {
      cp.status[payload.connectorId] = payload.status;
    }
    this.logger.log(
      `StatusNotification [${chargePointId}] Connector #${payload.connectorId}: ${payload.status} (Error: ${payload.errorCode})`,
    );
    return {};
  }

  private async handleAuthorize(
    chargePointId: string,
    payload: AuthorizeRequest,
  ): Promise<AuthorizeResponse> {
    this.logger.log(`Authorize requested for tag: ${payload.idTag} at [${chargePointId}]`);

    if (this.userRepo) {
      try {
        const user = await this.userRepo.findOne({
          where: [{ id: payload.idTag }, { phoneNumber: payload.idTag }],
        });

        if (!user) {
          this.logger.warn(`Authorize rejected: Unknown RFID tag [${payload.idTag}] at [${chargePointId}]`);
          return { idTagInfo: { status: 'Invalid' } };
        }

        if (user.status !== 'ACTIVE') {
          this.logger.warn(`Authorize blocked: User [${user.id}] status is ${user.status}`);
          return { idTagInfo: { status: 'Blocked' } };
        }

        const balancePaise = Number(user.walletBalancePaise) || 0;
        const heldPaise = Number(user.walletHeldPaise) || 0;
        const availablePaise = balancePaise - heldPaise;

        if (availablePaise < 0) {
          this.logger.warn(
            `Authorize rejected: User [${user.id}] has negative available balance (${availablePaise} Paise)`,
          );
          return { idTagInfo: { status: 'Invalid' } };
        }

        return {
          idTagInfo: {
            status: 'Accepted',
            expiryDate: new Date(Date.now() + 86400000).toISOString(),
          },
        };
      } catch (err: any) {
        this.logger.error(`Error validating RFID tag in DB: ${err.message}`);
      }
    }

    if (payload.idTag && (payload.idTag.includes('INVALID') || payload.idTag === 'UNKNOWN')) {
      return { idTagInfo: { status: 'Invalid' } };
    }

    return {
      idTagInfo: {
        status: 'Accepted',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  private async handleStartTransaction(
    chargePointId: string,
    payload: StartTransactionRequest,
  ): Promise<StartTransactionResponse> {
    // Idempotency: verify if connector is already running an active transaction
    const existingTx = this.getTransactionByConnector(chargePointId, payload.connectorId);
    if (existingTx) {
      this.logger.warn(
        `Duplicate StartTransaction received for [${chargePointId}] Connector #${payload.connectorId}. Returning existing transaction #${existingTx.transactionId}.`,
      );
      return {
        transactionId: existingTx.transactionId,
        idTagInfo: {
          status: 'Accepted',
        },
      };
    }

    this.transactionCounter += 1;
    const transactionId = this.transactionCounter;

    const tx: ActiveTransaction = {
      transactionId,
      chargePointId,
      connectorId: payload.connectorId,
      idTag: payload.idTag,
      meterStart: payload.meterStart || 0,
      startTime: new Date(payload.timestamp || new Date()),
      currentSoC: 20,
      currentPowerKw: 0,
      energyKwh: 0,
      costInr: 0,
      pricePerKwh: 18.5,
    };

    this.activeTransactions.set(transactionId, tx);

    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(
          `chargemesh:ocpp:tx:${transactionId}`,
          JSON.stringify(tx),
          'EX',
          86400,
        );
      } catch (err: any) {
        this.logger.warn(`Could not persist transaction to Redis: ${err.message}`);
      }
    }

    if (this.sessionRepo) {
      try {
        const session = this.sessionRepo.create({
          id: `sess-${transactionId}`,
          transactionId,
          chargePointId,
          connectorId: String(payload.connectorId),
          connectorType: 'CCS2',
          stationId: chargePointId,
          stationName: `Station ${chargePointId}`,
          userId: payload.idTag,
          status: 'CHARGING',
          startTime: tx.startTime,
          startSoC: 20,
          currentSoC: 20,
          energyKwh: 0,
          totalCostInr: 0,
          pricePerKwh: 18.5,
          powerKw: 0,
        });
        await this.sessionRepo.save(session);
      } catch (err: any) {
        this.logger.warn(`Could not persist session to database: ${err.message}`);
      }
    }

    this.logger.log(
      `Transaction #${transactionId} started on [${chargePointId}] Connector #${payload.connectorId} (Tag: ${payload.idTag}, MeterStart: ${payload.meterStart})`,
    );

    return {
      transactionId,
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }

  private async handleStopTransaction(
    chargePointId: string,
    payload: StopTransactionRequest,
  ): Promise<StopTransactionResponse> {
    const tx = this.activeTransactions.get(payload.transactionId);
    if (tx) {
      const consumedWh = payload.meterStop - tx.meterStart;
      const consumedKwh = consumedWh > 0 ? consumedWh / 1000 : (tx.energyKwh || 0);
      const totalCost = consumedKwh * tx.pricePerKwh;

      this.logger.log(
        `Transaction #${payload.transactionId} on [${chargePointId}] stopped. Total Energy: ${consumedKwh.toFixed(2)} kWh | Total Cost: ₹${totalCost.toFixed(2)} (Reason: ${payload.reason || 'Local'})`,
      );

      this.activeTransactions.delete(payload.transactionId);

      if (this.isRedisConnected && this.redis) {
        try {
          await this.redis.del(`chargemesh:ocpp:tx:${payload.transactionId}`);
        } catch (err: any) {
          this.logger.warn(`Could not delete transaction from Redis: ${err.message}`);
        }
      }

      if (this.sessionRepo) {
        try {
          await this.sessionRepo.update(
            { transactionId: payload.transactionId },
            {
              status: 'COMPLETED',
              endTime: new Date(),
              energyKwh: consumedKwh,
              totalCostInr: totalCost,
            },
          );
        } catch (err: any) {
          this.logger.warn(`Could not update session record in database: ${err.message}`);
        }
      }
    } else {
      this.logger.warn(`StopTransaction received for unknown tx #${payload.transactionId} on [${chargePointId}]`);
    }

    return {
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }

  private handleMeterValues(
    chargePointId: string,
    payload: MeterValuesRequest,
  ): Record<string, never> {
    const tx = payload.transactionId ? this.activeTransactions.get(payload.transactionId) : undefined;
    let powerKw = 50;
    let soc = 50;
    let energyKwh = 0;
    let voltage = 400;
    let current = 125;

    for (const mv of payload.meterValue || []) {
      for (const sample of mv.sampledValue || []) {
        const val = parseFloat(sample.value);
        if (isNaN(val) || val < 0) continue;

        if (sample.measurand === 'SoC') {
          soc = val;
        } else if (sample.measurand === 'Power.Active.Import') {
          powerKw = sample.unit === 'W' ? val / 1000 : val;
        } else if (sample.measurand === 'Energy.Active.Import.Register') {
          energyKwh = sample.unit === 'Wh' ? val / 1000 : val;
        } else if (sample.measurand === 'Voltage') {
          voltage = val;
        } else if (sample.measurand === 'Current.Import') {
          current = val;
        }
      }
    }

    if (tx) {
      tx.currentSoC = soc;
      tx.currentPowerKw = powerKw;
      if (energyKwh > 0 && tx.meterStart > 0) {
        const calculatedKwh = Math.max(0, energyKwh - tx.meterStart / 1000);
        tx.energyKwh = Math.max(tx.energyKwh || 0, calculatedKwh);
      } else if (energyKwh > 0) {
        tx.energyKwh = Math.max(tx.energyKwh || 0, energyKwh);
      }
      tx.costInr = (tx.energyKwh || 0) * tx.pricePerKwh;

      const durationSeconds = Math.floor((Date.now() - tx.startTime.getTime()) / 1000);

      this.telemetryService.emitTelemetry({
        sessionId: `sess-${tx.transactionId}`,
        chargePointId,
        connectorId: tx.connectorId,
        soc: tx.currentSoC || soc,
        powerKw: tx.currentPowerKw || powerKw,
        energyKwh: parseFloat((tx.energyKwh || 0).toFixed(2)),
        voltage,
        current,
        costInr: parseFloat((tx.costInr || 0).toFixed(2)),
        durationSeconds,
        timestamp: new Date().toISOString(),
      });

      if (this.sessionRepo) {
        this.sessionRepo
          .update(
            { transactionId: tx.transactionId },
            {
              currentSoC: tx.currentSoC,
              energyKwh: tx.energyKwh,
              totalCostInr: tx.costInr,
              powerKw: tx.currentPowerKw,
            },
          )
          .catch(() => {});
      }
    }

    return {};
  }

  private handleCallResult(messageId: string, payload: any) {
    const pending = this.pendingRequests.get(messageId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(messageId);
      pending.resolve(payload);
    }
  }

  private handleCallError(messageId: string, errorCode: string, errorDescription: string, errorDetails: any) {
    const pending = this.pendingRequests.get(messageId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(messageId);
      pending.reject(
        new Error(
          `OCPP Error [${errorCode}]: ${errorDescription} Details: ${JSON.stringify(errorDetails || {})}`,
        ),
      );
    }
  }

  // --- Outbound Central System -> Charge Point RPC ---

  async sendCall<T = any>(
    chargePointId: string,
    action: OcppAction,
    payload: Record<string, any>,
    timeoutMs = 30000,
  ): Promise<T> {
    const cp = this.chargePoints.get(chargePointId);
    if (!cp || cp.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Charge Point ${chargePointId} is not connected or offline`);
    }

    const messageId = uuidv4();
    const frame: OcppCallFrame = [OcppMessageType.CALL, messageId, action, payload];

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new Error(`OCPP command ${action} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      if (timeout.unref) timeout.unref();

      this.pendingRequests.set(messageId, { resolve, reject, timeout });
      cp.ws.send(JSON.stringify(frame));
      this.logger.log(`Outbound OCPP CALL -> [${chargePointId}] Action: ${action} ID: ${messageId}`);
    });
  }

  async remoteStartTransaction(
    chargePointId: string,
    connectorId: number,
    idTag: string,
  ): Promise<RemoteStartTransactionResponse> {
    return this.sendCall<RemoteStartTransactionResponse>(
      chargePointId,
      OcppAction.REMOTE_START_TRANSACTION,
      {
        connectorId,
        idTag,
      },
    );
  }

  async remoteStopTransaction(
    chargePointId: string,
    transactionId: number,
  ): Promise<RemoteStopTransactionResponse> {
    return this.sendCall<RemoteStopTransactionResponse>(
      chargePointId,
      OcppAction.REMOTE_STOP_TRANSACTION,
      {
        transactionId,
      },
    );
  }

  onModuleDestroy() {
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeout);
    }
    this.pendingRequests.clear();
    for (const cp of this.chargePoints.values()) {
      try {
        cp.ws.close();
      } catch {}
    }
    this.chargePoints.clear();
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch {}
    }
  }
}
