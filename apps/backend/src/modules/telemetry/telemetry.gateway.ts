import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { TelemetryService, TelemetryPacket } from './telemetry.service';
import { Subscription } from 'rxjs';

@WebSocketGateway({ path: '/ws/telemetry' })
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);
  private clientSubscriptions = new Map<WebSocket, { subscription: Subscription; sessionId?: string }>();

  constructor(private readonly telemetryService: TelemetryService) {}

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected to telemetry stream');

    const subscription = this.telemetryService
      .getTelemetryStream()
      .subscribe((packet: TelemetryPacket) => {
        const clientInfo = this.clientSubscriptions.get(client);
        if (!clientInfo?.sessionId || clientInfo.sessionId === packet.sessionId) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                event: 'telemetry_update',
                data: packet,
              }),
            );
          }
        }
      });

    this.clientSubscriptions.set(client, { subscription });
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('Client disconnected from telemetry stream');
    const sub = this.clientSubscriptions.get(client);
    if (sub) {
      sub.subscription.unsubscribe();
      this.clientSubscriptions.delete(client);
    }
  }

  @SubscribeMessage('subscribe_session')
  handleSubscribeSession(client: WebSocket, payload: { sessionId: string }) {
    const existing = this.clientSubscriptions.get(client);
    if (existing) {
      existing.sessionId = payload.sessionId;
      this.logger.log(`Client subscribed specifically to session ${payload.sessionId}`);

      // Send latest known telemetry immediately if present
      const latest = this.telemetryService.getLatestTelemetry(payload.sessionId);
      if (latest && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            event: 'telemetry_update',
            data: latest,
          }),
        );
      }
    }
  }
}
