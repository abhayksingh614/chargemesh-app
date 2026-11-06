import { Controller, Get, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.usersService.findAll({ search, status, page, pageSize });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; reason: string },
    @Request() req: any,
  ) {
    const actor = {
      id: req.user.sub || req.user.id,
      name: req.user.name || 'Admin',
      role: req.user.role || 'SUPER_ADMIN',
    };
    return this.usersService.updateStatus(id, body.status, body.reason, actor);
  }
}
