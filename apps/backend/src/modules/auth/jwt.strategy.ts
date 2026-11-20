import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Optional() private readonly blacklistService?: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('app.jwtSecret'),
      passReqToCallback: true,
    });
  }

  async validate(reqOrPayload: any, maybePayload?: any) {
    let req: any;
    let payload: any;
    if (maybePayload !== undefined) {
      req = reqOrPayload;
      payload = maybePayload;
    } else {
      payload = reqOrPayload;
    }

    if (this.blacklistService && req) {
      try {
        const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (rawToken && (await this.blacklistService.isTokenBlacklisted(rawToken))) {
          throw new UnauthorizedException('Token has been revoked');
        }
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
      }
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      sub: payload.sub,
      userId: payload.sub,
      phoneNumber: payload.phoneNumber,
      name: payload.name,
      role: payload.role || 'driver',
      type: payload.type || (payload.role && payload.role.includes('ADMIN') ? 'ADMIN' : 'DRIVER'),
    };
  }
}
