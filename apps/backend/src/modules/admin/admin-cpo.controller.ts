import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AdminCpoService } from './admin-cpo.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';
import { AdminRole } from '@chargemesh/shared-types';

@Controller('api/v1/admin/cpos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN)
export class AdminCpoController {
  constructor(private readonly cpoService: AdminCpoService) {}

  @Get()
  async getCpos() {
    return this.cpoService.findAll();
  }

  @Get(':id')
  async getCpoById(@Param('id') id: string) {
    return this.cpoService.findById(id);
  }

  @Post(':id/trigger-sync')
  async triggerSync(@Param('id') id: string, @Request() req: any) {
    const actor = {
      id: req.user.sub || req.user.id || req.user.userId,
      name: req.user.name || 'Ops Admin',
      role: req.user.role || 'OPERATIONS_ADMIN',
    };
    return this.cpoService.triggerSync(id, actor);
  }
}
