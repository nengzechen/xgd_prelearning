import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: Partial<RolesService>;

  const mockRole = {
    id: '1',
    name: 'admin',
    description: '管理员',
    permissions: ['user:read', 'user:create'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
    items: [mockRole],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    rolesService = {
      findAll: jest.fn().mockReturnValue(mockPaginatedResult),
      findOne: jest.fn().mockReturnValue(mockRole),
      create: jest.fn().mockReturnValue(mockRole),
      update: jest.fn().mockReturnValue(mockRole),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: rolesService },
        Reflector,
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('应该返回分页角色列表', () => {
      const result = controller.findAll(1, 10);

      expect(rolesService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findOne', () => {
    it('应该返回单个角色', () => {
      const result = controller.findOne('1');

      expect(rolesService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockRole);
    });
  });

  describe('create', () => {
    it('应该创建并返回角色', () => {
      const dto = { name: 'admin', description: '管理员', permissions: ['user:read'] };
      const result = controller.create(dto);

      expect(rolesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('应该更新并返回角色', () => {
      const dto = { description: '更新后的描述' };
      const result = controller.update('1', dto);

      expect(rolesService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('remove', () => {
    it('应该删除角色', () => {
      controller.remove('1');

      expect(rolesService.remove).toHaveBeenCalledWith('1');
    });
  });
});
