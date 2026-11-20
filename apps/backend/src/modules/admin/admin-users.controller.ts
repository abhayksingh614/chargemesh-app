import { Controller, Get, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { AdminRole } from '@chargemesh/shared-types';

@Controller('api/v1/admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN, AdminRole.SUPPORT_ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.usersService.findAll({ search, status, page, pageSize });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; reason: string },
    @Request() req: any,
  ) {
    const actor = {
      id: req.user.sub || req.user.id || req.user.userId,
      name: req.user.name || 'Admin',
      role: req.user.role || 'SUPER_ADMIN',
    };
    return this.usersService.updateStatus(id, body.status, body.reason, actor);
  }
}
