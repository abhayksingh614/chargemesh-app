import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly auditService: AdminAuditService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAuditLogs(
    @Query('targetEntity') targetEntity?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.auditService.findAll({ targetEntity, actorId });
  }
}
