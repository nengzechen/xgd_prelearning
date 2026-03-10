import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  const mockAuthResult = {
    user: { id: '1', name: 'Test', email: 'test@example.com', role: UserRole.USER },
    access_token: 'mock-token',
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockAuthResult),
      login: jest.fn().mockResolvedValue(mockAuthResult),
      getProfile: jest.fn().mockReturnValue(mockAuthResult.user),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('应该调用 authService.register 并返回结果', async () => {
      const dto = { name: 'Test', email: 'test@example.com', password: '123456' };
      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe('login', () => {
    it('应该调用 authService.login 并返回结果', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe('getProfile', () => {
    it('应该返回当前用户信息', () => {
      const result = controller.getProfile('1');

      expect(authService.getProfile).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockAuthResult.user);
    });
  });
});
