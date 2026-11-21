import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp/otp.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserEntity } from '../../database/entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly inMemoryUsers = new Map<string, UserEntity>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    @Optional() private readonly tokenBlacklistService?: TokenBlacklistService,
  ) {}

  async requestOtp(phoneNumber: string) {
    return this.otpService.sendOtp(phoneNumber);
  }

  async register(dto: RegisterDto) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !dto.otp) {
      throw new BadRequestException('OTP verification code is required for registration');
    }

    if (dto.otp) {
      await this.otpService.verifyOtp(dto.phoneNumber, dto.otp);
    }

    let existing: UserEntity | null = null;
    try {
      existing = await this.userRepo.findOneBy({ phoneNumber: dto.phoneNumber });
    } catch {
      existing = this.inMemoryUsers.get(dto.phoneNumber) || null;
    }

    if (existing) {
      throw new ConflictException('User with this phone number already exists');
    }

    const newUser: Partial<UserEntity> = {
      id: `usr-${crypto.randomUUID()}`,
      phoneNumber: dto.phoneNumber,
      name: dto.name,
      email: dto.email,
      vehicle: dto.vehicle,
      status: 'ACTIVE',
      walletBalancePaise: 0,
      totalKwhCharged: 0,
      co2SavedKg: 0,
      totalSessions: 0,
    };

    let savedUser = newUser as UserEntity;
    try {
      savedUser = await this.userRepo.save(newUser as UserEntity);
      this.logger.log(`Persisted registered user ${savedUser.id} (${savedUser.phoneNumber})`);
    } catch (err: any) {
      this.logger.warn(`Failed to persist user to database: ${err.message}. Retaining in-memory.`);
    }

    this.inMemoryUsers.set(dto.phoneNumber, savedUser);

    const token = this.generateToken(savedUser);
    return {
      user: savedUser,
      token,
    };
  }

  async login(dto: LoginDto) {
    if (!dto.otp) {
      throw new BadRequestException('OTP code is required for login');
    }

    // Verify OTP using secure provider with single-use and rate limiting controls
    await this.otpService.verifyOtp(dto.phoneNumber, dto.otp);

    let user: UserEntity | null = null;
    try {
      user = await this.userRepo.findOneBy({ phoneNumber: dto.phoneNumber });
    } catch {
      user = this.inMemoryUsers.get(dto.phoneNumber) || null;
    }

    if (!user) {
      user = this.inMemoryUsers.get(dto.phoneNumber) || null;
    }

    if (!user) {
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('User account not found. Please register first.');
      }
      const newUser: Partial<UserEntity> = {
        id: `usr-${crypto.randomUUID()}`,
        phoneNumber: dto.phoneNumber,
        name: 'New Driver',
        status: 'ACTIVE',
        walletBalancePaise: 0,
        totalKwhCharged: 0,
        co2SavedKg: 0,
        totalSessions: 0,
      };

      try {
        user = await this.userRepo.save(newUser as UserEntity);
      } catch {
        user = newUser as UserEntity;
      }
      this.inMemoryUsers.set(dto.phoneNumber, user);
    }

    const token = this.generateToken(user);
    return {
      user,
      token,
    };
  }

  async getProfile(userId: string): Promise<UserEntity> {
    try {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (user) return user;
    } catch {}

    for (const u of this.inMemoryUsers.values()) {
      if (u.id === userId) {
        return u;
      }
    }
    throw new UnauthorizedException('User not found');
  }

  async logout(token: string) {
    if (this.tokenBlacklistService) {
      await this.tokenBlacklistService.blacklistToken(token);
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async refreshToken(token: string) {
    if (this.tokenBlacklistService && (await this.tokenBlacklistService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token has been revoked');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = payload.sub;
    const user = await this.getProfile(userId);

    if (this.tokenBlacklistService) {
      await this.tokenBlacklistService.blacklistToken(token);
    }

    const newToken = this.generateToken(user);
    return {
      user,
      token: newToken,
    };
  }

  private generateToken(user: UserEntity): string {
    return this.jwtService.sign({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
    });
  }
}
