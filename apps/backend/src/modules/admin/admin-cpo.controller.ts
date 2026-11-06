import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AdminCpoService } from './admin-cpo.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/admin/cpos')
export class AdminCpoController {
  constructor(private readonly cpoService: AdminCpoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getCpos() {
    return this.cpoService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getCpoById(@Param('id') id: string) {
    return this.cpoService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/trigger-sync')
  async triggerSync(@Param('id') id: string, @Request() req: any) {
    const actor = {
      id: req.user.sub || req.user.id,
      name: req.user.name || 'Ops Admin',
      role: req.user.role || 'OPERATIONS_ADMIN',
    };
    return this.cpoService.triggerSync(id, actor);
  }
}
