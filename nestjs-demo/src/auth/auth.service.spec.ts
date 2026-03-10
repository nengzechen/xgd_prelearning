import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      (usersService.findByEmail as jest.Mock).mockReturnValue(undefined);
      (usersService.create as jest.Mock).mockReturnValue(mockUser);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('应该在邮箱已注册时抛出 ConflictException', async () => {
      (usersService.findByEmail as jest.Mock).mockReturnValue(mockUser);

      await expect(
        service.register({
          name: 'Test',
          email: 'test@example.com',
          password: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('应该成功登录并返回 token', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const userWithHash = { ...mockUser, password: hashedPassword };
      (usersService.findByEmail as jest.Mock).mockReturnValue(userWithHash);

      const result = await service.login({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('应该在邮箱不存在时抛出 UnauthorizedException', async () => {
      (usersService.findByEmail as jest.Mock).mockReturnValue(undefined);

      await expect(
        service.login({ email: 'wrong@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该在密码错误时抛出 UnauthorizedException', async () => {
      (usersService.findByEmail as jest.Mock).mockReturnValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('应该返回用户信息（不含密码）', () => {
      (usersService.findOne as jest.Mock).mockReturnValue(mockUser);

      const result = service.getProfile('1');

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      });
    });
  });
});
