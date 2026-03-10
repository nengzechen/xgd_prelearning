import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  const mockUser = {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashed',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
    items: [{ id: '1', name: 'Alice', email: 'alice@example.com', role: UserRole.ADMIN, createdAt: new Date(), updatedAt: new Date() }],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn().mockReturnValue(mockPaginatedResult),
      findOne: jest.fn().mockReturnValue(mockUser),
      create: jest.fn().mockReturnValue(mockUser),
      update: jest.fn().mockReturnValue({ id: '1', name: 'Alice', email: 'alice@example.com', role: UserRole.ADMIN }),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('应该返回分页用户列表', () => {
      const result = controller.findAll(1, 10);

      expect(usersService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findOne', () => {
    it('应该返回单个用户（不含密码）', () => {
      const result = controller.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('name', 'Alice');
    });
  });

  describe('create', () => {
    it('应该创建并返回用户（不含密码）', () => {
      const dto = { name: 'New', email: 'new@example.com', password: '123456' };
      const result = controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('应该更新并返回用户', () => {
      const dto = { name: 'Updated' };
      const result = controller.update('1', dto);

      expect(usersService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('应该删除用户', () => {
      controller.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
