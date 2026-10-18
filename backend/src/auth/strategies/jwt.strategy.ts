
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type?: 'admin' | 'customer';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_ACCESS_SECRET must be configured with at least 32 characters',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type ?? (payload.role === 'CUSTOMER' ? 'customer' : 'admin'),
    };
  }
}
