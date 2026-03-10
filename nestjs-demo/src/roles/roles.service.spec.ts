import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('应该返回分页角色列表', () => {
      const result = service.findAll(1, 10);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
      expect(result.items.length).toBe(3); // 3个种子角色
    });

    it('应该正确处理分页', () => {
      const result = service.findAll(1, 2);

      expect(result.items.length).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('findOne', () => {
    it('应该返回指定角色', () => {
      const role = service.findOne('1');

      expect(role).toBeDefined();
      expect(role.name).toBe('admin');
    });

    it('应该在角色不存在时抛出 NotFoundException', () => {
      expect(() => service.findOne('999')).toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('应该根据名称返回角色', () => {
      const role = service.findByName('admin');

      expect(role).toBeDefined();
      expect(role!.name).toBe('admin');
    });

    it('应该在名称不存在时返回 undefined', () => {
      const role = service.findByName('nonexistent');

      expect(role).toBeUndefined();
    });
  });

  describe('create', () => {
    it('应该成功创建角色', () => {
      const dto = {
        name: 'moderator',
        description: '版主',
        permissions: ['user:read', 'user:update'],
      };
      const role = service.create(dto);

      expect(role).toBeDefined();
      expect(role.name).toBe('moderator');
      expect(role.permissions).toEqual(['user:read', 'user:update']);
    });

    it('应该在角色名重复时抛出 ConflictException', () => {
      expect(() =>
        service.create({
          name: 'admin',
          permissions: ['user:read'],
        }),
      ).toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('应该成功更新角色', () => {
      const updated = service.update('1', { description: '超级管理员' });

      expect(updated.description).toBe('超级管理员');
      expect(updated.name).toBe('admin');
    });

    it('应该在角色不存在时抛出 NotFoundException', () => {
      expect(() => service.update('999', { description: 'test' })).toThrow(
        NotFoundException,
      );
    });

    it('应该在名称冲突时抛出 ConflictException', () => {
      expect(() => service.update('1', { name: 'user' })).toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除角色', () => {
      service.remove('1');

      expect(() => service.findOne('1')).toThrow(NotFoundException);
    });

    it('应该在角色不存在时抛出 NotFoundException', () => {
      expect(() => service.remove('999')).toThrow(NotFoundException);
    });
  });
});
