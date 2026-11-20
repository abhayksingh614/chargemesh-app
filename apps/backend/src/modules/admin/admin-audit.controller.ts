import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { AdminRole } from '@chargemesh/shared-types';

@Controller('api/v1/admin/audit-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN, AdminRole.FINANCE_ADMIN)
export class AdminAuditController {
  constructor(private readonly auditService: AdminAuditService) {}

  @Get()
  async getAuditLogs(
    @Query('targetEntity') targetEntity?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.auditService.findAll({ targetEntity, actorId });
  }
}
