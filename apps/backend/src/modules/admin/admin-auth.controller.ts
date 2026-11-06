import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password?: string }) {
    return this.adminAuthService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.adminAuthService.getProfile(req.user.sub || req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  async getAdminUsers() {
    return this.adminAuthService.getAdminList();
  }
}
