import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StartSessionDto } from './dto/start-session.dto';
import { StationsService } from '../stations/stations.service';
import { OcppService } from '../ocpp/ocpp.service';
import { TelemetryService } from '../telemetry/telemetry.service';

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
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(
    private readonly stationsService: StationsService,
    private readonly ocppService: OcppService,
    private readonly telemetryService: TelemetryService,
  ) {}

  async startSession(userId: string, dto: StartSessionDto): Promise<SessionRecord> {
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

    const sessionId = `sess-${Date.now()}`;
    const session: SessionRecord = {
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

    this.sessions.set(sessionId, session);

    // If charge point is connected via OCPP, dispatch RemoteStartTransaction
    const cpSession = this.ocppService.getChargePointSession(station.chargePointId);
    if (cpSession) {
      try {
        const ocppRes = await this.ocppService.remoteStartTransaction(
          station.chargePointId,
          connector.connectorNumber,
          userId,
        );
        if (ocppRes.status === 'Accepted') {
          session.status = 'CHARGING';
        } else {
          session.status = 'FAILED';
          throw new BadRequestException(`Charge point rejected start command: ${ocppRes.status}`);
        }
      } catch (err: any) {
        this.logger.warn(
          `OCPP remoteStartTransaction failed or offline for ${station.chargePointId}: ${err.message}. Defaulting to active simulation session.`,
        );
        session.status = 'CHARGING';
      }
    } else {
      // Offline/demo fallback for development
      session.status = 'CHARGING';
    }

    // Publish initial telemetry packet
    this.telemetryService.emitTelemetry({
      sessionId,
      chargePointId: station.chargePointId,
      connectorId: connector.connectorNumber,
      soc: session.currentSoC,
      powerKw: session.powerKw,
      energyKwh: session.energyKwh,
      voltage: 400,
      current: 125,
      costInr: session.totalCostInr,
      durationSeconds: 0,
      timestamp: new Date().toISOString(),
    });

    return session;
  }

  async stopSession(sessionId: string, userId: string, reason?: string): Promise<SessionRecord> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      this.logger.warn(`User ${userId} requested stop for session owned by ${session.userId}`);
    }

    session.status = 'STOPPING';
    session.endTime = new Date();

    // If active transaction in OCPP, send RemoteStopTransaction
    if (session.transactionId) {
      try {
        await this.ocppService.remoteStopTransaction(session.chargePointId, session.transactionId);
      } catch (err: any) {
        this.logger.warn(`OCPP remoteStopTransaction error: ${err.message}`);
      }
    }

    // Read latest telemetry to finalize numbers
    const latest = this.telemetryService.getLatestTelemetry(sessionId);
    if (latest) {
      session.energyKwh = latest.energyKwh;
      session.totalCostInr = latest.costInr;
      session.currentSoC = latest.soc;
    } else {
      // Calculate realistic metrics based on duration
      const durationHours = Math.max(
        0.05,
        (session.endTime.getTime() - session.startTime.getTime()) / 3600000,
      );
      session.energyKwh = parseFloat((session.powerKw * durationHours * 0.85).toFixed(2));
      session.totalCostInr = parseFloat((session.energyKwh * session.pricePerKwh).toFixed(2));
      session.currentSoC = Math.min(100, Math.round(session.startSoC + session.energyKwh * 1.5));
    }

    session.status = 'COMPLETED';
    this.logger.log(
      `Session ${sessionId} completed: ${session.energyKwh} kWh | ₹${session.totalCostInr} (Reason: ${reason || 'User Request'})`,
    );

    return session;
  }

  async getSession(sessionId: string): Promise<SessionRecord> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const latest = this.telemetryService.getLatestTelemetry(sessionId);
    if (latest) {
      session.currentSoC = latest.soc;
      session.energyKwh = latest.energyKwh;
      session.totalCostInr = latest.costInr;
      session.powerKw = latest.powerKw;
    }

    return session;
  }

  async getUserSessions(userId: string): Promise<SessionRecord[]> {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
}
