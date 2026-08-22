import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { OcppService } from './ocpp.service';

@WebSocketGateway({ path: '/ocpp' })
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OcppGateway.name);

  constructor(private readonly ocppService: OcppService) {}

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const url = req.url || '';
    // Extract chargePointId from URL path e.g. /ocpp/CP-DELHI-001 or query ?cp=CP-DELHI-001
    let chargePointId = 'UNKNOWN_CP';

    const urlParts = url.split('/');
    if (urlParts.length >= 3 && urlParts[2]) {
      chargePointId = urlParts[2].split('?')[0];
    } else if (url.includes('?')) {
      const params = new URLSearchParams(url.split('?')[1]);
      chargePointId = params.get('chargePointId') || params.get('cp') || 'UNKNOWN_CP';
    }

    const protocol = (req.headers['sec-websocket-protocol'] as string) || 'ocpp1.6';

    this.logger.log(
      `Charge Point connected: ${chargePointId} [Subprotocol: ${protocol}] (IP: ${req.socket.remoteAddress})`,
    );

    this.ocppService.registerChargePoint(chargePointId, client, protocol);

    client.on('message', async (data: any) => {
      const raw = data.toString();
      const response = await this.ocppService.handleIncomingMessage(chargePointId, raw);
      if (response && client.readyState === WebSocket.OPEN) {
        client.send(response);
      }
    });

    client.on('error', (err) => {
      this.logger.error(`WebSocket error on Charge Point [${chargePointId}]: ${err.message}`);
    });
  }

  handleDisconnect(client: WebSocket) {
    // Find the charge point id matching this client
    for (const cpId of this.ocppService.getConnectedChargePoints()) {
      const session = this.ocppService.getChargePointSession(cpId);
      if (session && session.ws === client) {
        this.ocppService.unregisterChargePoint(cpId);
        break;
      }
    }
  }
}
