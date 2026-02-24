import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('应返回分页用户列表（默认含3条初始数据）', () => {
      const result = service.findAll(1, 10);
      expect(result.items.length).toBe(3);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(1);
    });

    it('分页参数生效', () => {
      const result = service.findAll(1, 2);
      expect(result.items.length).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('create', () => {
    it('成功创建用户', () => {
      const dto: CreateUserDto = {
        name: 'TestUser',
        email: 'test@example.com',
        password: '123456',
      };
      const user = service.create(dto);
      expect(user.name).toBe('TestUser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(UserRole.USER); // 默认角色
    });

    it('邮箱重复时抛出 ConflictException', () => {
      const dto: CreateUserDto = {
        name: 'DupUser',
        email: 'alice@example.com', // 初始数据已存在
        password: '123456',
      };
      expect(() => service.create(dto)).toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('找到存在的用户', () => {
      const user = service.findOne('1');
      expect(user.id).toBe('1');
    });

    it('用户不存在时抛出 NotFoundException', () => {
      expect(() => service.findOne('9999')).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('成功更新用户名', () => {
      const updated = service.update('1', { name: 'NewName' });
      expect(updated.name).toBe('NewName');
    });

    it('更新不存在的用户时抛 NotFoundException', () => {
      expect(() => service.update('9999', { name: 'X' })).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('成功删除用户后查询不到', () => {
      service.remove('1');
      expect(() => service.findOne('1')).toThrow(NotFoundException);
    });

    it('删除不存在的用户时抛 NotFoundException', () => {
      expect(() => service.remove('9999')).toThrow(NotFoundException);
    });
  });
});
