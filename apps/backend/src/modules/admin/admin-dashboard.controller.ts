import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { AdminRole } from '@chargemesh/shared-types';

@Controller('api/v1/admin/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(
  AdminRole.SUPER_ADMIN,
  AdminRole.OPERATIONS_ADMIN,
  AdminRole.FINANCE_ADMIN,
  AdminRole.SUPPORT_ADMIN,
)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('sessions')
  async getSessions(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.dashboardService.getAllSessions({ status, search });
  }
}
