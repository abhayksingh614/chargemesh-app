import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StationsModule } from '../stations/stations.module';
import { SessionsModule } from '../sessions/sessions.module';
import { OcppModule } from '../ocpp/ocpp.module';

import { AdminAuditService } from './admin-audit.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersService } from './admin-users.service';
import { AdminFinanceService } from './admin-finance.service';
import { AdminCpoService } from './admin-cpo.service';
import { RolesGuard } from './guards/roles.guard';

import { AdminAuthController } from './admin-auth.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminFinanceController } from './admin-finance.controller';
import { AdminCpoController } from './admin-cpo.controller';
import { AdminAuditController } from './admin-audit.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('app.jwtSecret') ||
          'chargemesh-super-secret-jwt-key-2026',
        signOptions: {
          expiresIn: '8h',
        },
      }),
      inject: [ConfigService],
    }),
    StationsModule,
    SessionsModule,
    OcppModule,
  ],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminUsersController,
    AdminFinanceController,
    AdminCpoController,
    AdminAuditController,
  ],
  providers: [
    AdminAuditService,
    AdminAuthService,
    AdminDashboardService,
    AdminUsersService,
    AdminFinanceService,
    AdminCpoService,
    RolesGuard,
  ],
  exports: [
    AdminAuthService,
    AdminDashboardService,
    AdminUsersService,
    AdminFinanceService,
    AdminCpoService,
    AdminAuditService,
  ],
})
export class AdminModule {}
