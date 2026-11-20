import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AdminFinanceService } from './admin-finance.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { AdminRole, AdminWalletAdjustmentRequest } from '@chargemesh/shared-types';

@Controller('api/v1/admin/finance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN)
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @Get('transactions')
  async getTransactions(
    @Query('search') search?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.financeService.getTransactions({ search, userId, type, page, pageSize });
  }

  @Post('wallet/adjust')
  async adjustWalletBalance(@Body() body: AdminWalletAdjustmentRequest, @Request() req: any) {
    const actor = {
      id: req.user.sub || req.user.id || req.user.userId,
      name: req.user.name || 'Finance Admin',
      role: req.user.role || 'FINANCE_ADMIN',
    };
    return this.financeService.adjustWalletBalance(
      body.userId,
      body.amountRupees,
      body.isCredit,
      body.reason,
      body.referenceTicketId,
      actor,
    );
  }
}
