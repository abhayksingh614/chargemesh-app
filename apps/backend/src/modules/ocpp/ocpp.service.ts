import { Injectable, Logger } from '@nestjs/common';
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
export class OcppService {
  private readonly logger = new Logger(OcppService.name);
  private readonly chargePoints = new Map<string, ChargePointSession>();
  private readonly pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }
  >();

  private transactionCounter = 1000;
  private readonly activeTransactions = new Map<number, ActiveTransaction>();

  constructor(private readonly telemetryService: TelemetryService) {}

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
    } catch (e) {
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
        'Malformed OCPP-J frame structure',
        {},
      ];
      return JSON.stringify(errFrame);
    }

    const messageType = parsed[0];
    const messageId = parsed[1];

    if (messageType === OcppMessageType.CALL) {
      const action = parsed[2] as OcppAction;
      const payload = parsed[3] || {};
      return this.handleCall(chargePointId, messageId, action, payload);
    } else if (messageType === OcppMessageType.CALLRESULT) {
      const payload = parsed[2] || {};
      this.handleCallResult(messageId, payload);
      return null;
    } else if (messageType === OcppMessageType.CALLERROR) {
      const errorCode = parsed[2];
      const errorDescription = parsed[3];
      const errorDetails = parsed[4];
      this.handleCallError(messageId, errorCode, errorDescription, errorDetails);
      return null;
    }

    return null;
  }

  private async handleCall(
    chargePointId: string,
    messageId: string,
    action: OcppAction,
    payload: any,
  ): Promise<string> {
    this.logger.log(`OCPP CALL from [${chargePointId}] Action: ${action} ID: ${messageId}`);

    try {
      let resultPayload: any;

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
          resultPayload = this.handleAuthorize(chargePointId, payload);
          break;

        case OcppAction.START_TRANSACTION:
          resultPayload = this.handleStartTransaction(chargePointId, payload);
          break;

        case OcppAction.STOP_TRANSACTION:
          resultPayload = this.handleStopTransaction(chargePointId, payload);
          break;

        case OcppAction.METER_VALUES:
          resultPayload = this.handleMeterValues(chargePointId, payload);
          break;

        default:
          const errFrame: OcppCallErrorFrame = [
            OcppMessageType.CALLERROR,
            messageId,
            OcppErrorCode.NOT_IMPLEMENTED,
            `Action ${action} is not implemented`,
            {},
          ];
          return JSON.stringify(errFrame);
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
      interval: 300, // 5 minutes heartbeat
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

  private handleAuthorize(
    chargePointId: string,
    payload: AuthorizeRequest,
  ): AuthorizeResponse {
    this.logger.log(`Authorize requested for tag: ${payload.idTag} at [${chargePointId}]`);
    return {
      idTagInfo: {
        status: 'Accepted',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  private handleStartTransaction(
    chargePointId: string,
    payload: StartTransactionRequest,
  ): StartTransactionResponse {
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

  private handleStopTransaction(
    chargePointId: string,
    payload: StopTransactionRequest,
  ): StopTransactionResponse {
    const tx = this.activeTransactions.get(payload.transactionId);
    if (tx) {
      const consumedWh = payload.meterStop - tx.meterStart;
      const consumedKwh = consumedWh > 0 ? consumedWh / 1000 : (tx.energyKwh || 0);
      const totalCost = consumedKwh * tx.pricePerKwh;

      this.logger.log(
        `Transaction #${payload.transactionId} on [${chargePointId}] stopped. Total Energy: ${consumedKwh.toFixed(2)} kWh | Total Cost: ₹${totalCost.toFixed(2)} (Reason: ${payload.reason || 'Local'})`,
      );

      this.activeTransactions.delete(payload.transactionId);
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
        if (isNaN(val)) continue;

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
        tx.energyKwh = Math.max(0, energyKwh - tx.meterStart / 1000);
      } else if (energyKwh > 0) {
        tx.energyKwh = energyKwh;
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
}
