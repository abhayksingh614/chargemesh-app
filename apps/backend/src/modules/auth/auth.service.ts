import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface UserEntity {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  vehicle?: {
    make: string;
    model: string;
    connectorType: string;
    batteryCapacity?: number;
  };
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, UserEntity>();

  constructor(private readonly jwtService: JwtService) {
    // Seed test driver profile
    const defaultUser: UserEntity = {
      id: 'usr-default-01',
      phoneNumber: '+919876543210',
      name: 'Rahul',
      email: 'rahul@gmail.com',
      vehicle: {
        make: 'Tata',
        model: 'Nexon EV Max',
        connectorType: 'CCS2',
        batteryCapacity: 40.5,
      },
      createdAt: new Date(),
    };
    this.users.set(defaultUser.phoneNumber, defaultUser);
  }

  async register(dto: RegisterDto) {
    if (this.users.has(dto.phoneNumber)) {
      throw new ConflictException('User with this phone number already exists');
    }

    const newUser: UserEntity = {
      id: `usr-${Date.now()}`,
      phoneNumber: dto.phoneNumber,
      name: dto.name,
      email: dto.email,
      vehicle: dto.vehicle,
      createdAt: new Date(),
    };

    this.users.set(dto.phoneNumber, newUser);

    const token = this.generateToken(newUser);
    return {
      user: newUser,
      token,
    };
  }

  async login(dto: LoginDto) {
    let user = this.users.get(dto.phoneNumber);

    // Auto-create user if in testing/dev mode with OTP
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        phoneNumber: dto.phoneNumber,
        name: 'New Driver',
        createdAt: new Date(),
      };
      this.users.set(dto.phoneNumber, user);
    }

    // OTP validation simulation (accepts valid 6-digit or default '123456')
    if (dto.otp && dto.otp !== '123456' && dto.otp.length !== 6) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const token = this.generateToken(user);
    return {
      user,
      token,
    };
  }

  async getProfile(userId: string): Promise<UserEntity> {
    for (const u of this.users.values()) {
      if (u.id === userId) {
        return u;
      }
    }
    throw new UnauthorizedException('User not found');
  }

  private generateToken(user: UserEntity): string {
    return this.jwtService.sign({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
    });
  }
}
