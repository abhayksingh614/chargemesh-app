import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
