import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AdminFinanceService } from './admin-finance.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminWalletAdjustmentRequest } from '@chargemesh/shared-types';

@Controller('api/v1/admin/finance')
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Post('wallet/adjust')
  async adjustWalletBalance(@Body() body: AdminWalletAdjustmentRequest, @Request() req: any) {
    const actor = {
      id: req.user.sub || req.user.id,
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
