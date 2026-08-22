import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface TelemetryPacket {
  sessionId: string;
  chargePointId: string;
  connectorId: number;
  soc: number;
  powerKw: number;
  energyKwh: number;
  voltage: number;
  current: number;
  costInr: number;
  durationSeconds: number;
  timestamp: string;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly telemetrySubject = new Subject<TelemetryPacket>();
  private readonly sessionTelemetry = new Map<string, TelemetryPacket>();

  emitTelemetry(packet: TelemetryPacket) {
    this.sessionTelemetry.set(packet.sessionId, packet);
    this.telemetrySubject.next(packet);
    this.logger.debug(
      `Telemetry [Session ${packet.sessionId}]: ${packet.soc}% | ${packet.powerKw} kW | ${packet.energyKwh} kWh`,
    );
  }

  getTelemetryStream(): Observable<TelemetryPacket> {
    return this.telemetrySubject.asObservable();
  }

  getLatestTelemetry(sessionId: string): TelemetryPacket | undefined {
    return this.sessionTelemetry.get(sessionId);
  }
}
