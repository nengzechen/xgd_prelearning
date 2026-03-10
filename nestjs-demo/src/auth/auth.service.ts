import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(dto: RegisterDto) {
    const existing = this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`邮箱 ${dto.email} 已被注册`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    this.logger.log(`新用户注册：${user.name} (${user.email})`);

    const token = this.generateToken(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      access_token: token,
    };
  }

  /**
   * 用户登录
   */
  async login(dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    this.logger.log(`用户登录：${user.name} (${user.email})`);

    const token = this.generateToken(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      access_token: token,
    };
  }

  /**
   * 获取当前用户信息
   */
  getProfile(userId: string) {
    const user = this.usersService.findOne(userId);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  private generateToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
