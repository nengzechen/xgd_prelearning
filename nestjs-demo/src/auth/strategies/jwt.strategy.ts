import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'xgd-nestjs-demo-secret-key',
    });
  }

  validate(payload: JwtPayload) {
    try {
      const user = this.usersService.findOne(payload.sub);
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch {
      throw new UnauthorizedException('用户不存在或已被删除');
    }
  }
}
