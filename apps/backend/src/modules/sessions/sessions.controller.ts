import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { StartSessionDto, StopSessionDto } from './dto/start-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startSession(@Request() req: any, @Body() dto: StartSessionDto) {
    return this.sessionsService.startSession(req.user.userId, dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post(':id/stop')
  async stopSession(
    @Request() req: any,
    @Param('id') sessionId: string,
    @Body() dto: StopSessionDto,
  ) {
    return this.sessionsService.stopSession(sessionId, req.user.userId, dto.reason);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSession(@Request() req: any, @Param('id') sessionId: string) {
    const caller = {
      userId: req.user.userId || req.user.id || req.user.sub,
      role: req.user.role,
    };
    return this.sessionsService.getSession(sessionId, caller);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Get('user/history')
  async getUserHistory(@Request() req: any) {
    return this.sessionsService.getUserSessions(req.user.userId);
  }
}
