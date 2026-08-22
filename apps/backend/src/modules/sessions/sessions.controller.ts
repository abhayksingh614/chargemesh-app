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

@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startSession(@Request() req: any, @Body() dto: StartSessionDto) {
    return this.sessionsService.startSession(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/stop')
  async stopSession(
    @Request() req: any,
    @Param('id') sessionId: string,
    @Body() dto: StopSessionDto,
  ) {
    return this.sessionsService.stopSession(sessionId, req.user.userId, dto.reason);
  }

  @Get(':id')
  async getSession(@Param('id') sessionId: string) {
    return this.sessionsService.getSession(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/history')
  async getUserHistory(@Request() req: any) {
    return this.sessionsService.getUserSessions(req.user.userId);
  }
}
