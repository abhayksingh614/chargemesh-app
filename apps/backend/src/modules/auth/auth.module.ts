import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { OtpService } from './otp/otp.service';
import { RedisOtpStorageService } from './otp/redis-otp-storage.service';
import { MockOtpProvider } from './otp/mock-otp.provider';
import { ProductionSmsProviderStub } from './otp/production-sms.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserEntity } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('app.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwtExpiresIn') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    OtpService,
    RedisOtpStorageService,
    MockOtpProvider,
    ProductionSmsProviderStub,
  ],
  exports: [AuthService, JwtModule, OtpService, RedisOtpStorageService, TokenBlacklistService],
})
export class AuthModule {}
