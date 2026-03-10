import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('应该返回分页用户列表（不含密码）', () => {
      const result = service.findAll(1, 10);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total', 3);
      expect(result).toHaveProperty('page', 1);
      expect(result.items.length).toBe(3);
      result.items.forEach((item) => {
        expect(item).not.toHaveProperty('password');
      });
    });

    it('应该正确处理分页', () => {
      const result = service.findAll(1, 2);

      expect(result.items.length).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('应该处理超出范围的页码', () => {
      const result = service.findAll(100, 10);

      expect(result.items.length).toBe(0);
    });
  });

  describe('findOne', () => {
    it('应该返回指定用户', () => {
      const user = service.findOne('1');

      expect(user).toBeDefined();
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
    });

    it('应该在用户不存在时抛出 NotFoundException', () => {
      expect(() => service.findOne('999')).toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('应该根据邮箱返回用户', () => {
      const user = service.findByEmail('alice@example.com');

      expect(user).toBeDefined();
      expect(user!.name).toBe('Alice');
    });

    it('应该在邮箱不存在时返回 undefined', () => {
      const user = service.findByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    it('应该成功创建用户', () => {
      const user = service.create({
        name: 'David',
        email: 'david@example.com',
        password: 'password123',
        role: UserRole.USER,
      });

      expect(user).toBeDefined();
      expect(user.name).toBe('David');
      expect(user.email).toBe('david@example.com');
      expect(user.role).toBe(UserRole.USER);
    });

    it('应该在邮箱已存在时抛出 ConflictException', () => {
      expect(() =>
        service.create({
          name: 'Duplicate',
          email: 'alice@example.com',
          password: '123456',
        }),
      ).toThrow(ConflictException);
    });

    it('应该默认设置角色为 USER', () => {
      const user = service.create({
        name: 'NoRole',
        email: 'norole@example.com',
        password: '123456',
      });

      expect(user.role).toBe(UserRole.USER);
    });
  });

  describe('update', () => {
    it('应该成功更新用户', () => {
      const updated = service.update('1', { name: 'Alice Updated' });

      expect(updated.name).toBe('Alice Updated');
      expect(updated).not.toHaveProperty('password');
    });

    it('应该在用户不存在时抛出 NotFoundException', () => {
      expect(() => service.update('999', { name: 'test' })).toThrow(NotFoundException);
    });

    it('应该在邮箱冲突时抛出 ConflictException', () => {
      expect(() =>
        service.update('1', { email: 'bob@example.com' }),
      ).toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', () => {
      service.remove('1');

      expect(() => service.findOne('1')).toThrow(NotFoundException);
    });

    it('应该在用户不存在时抛出 NotFoundException', () => {
      expect(() => service.remove('999')).toThrow(NotFoundException);
    });
  });
});
