import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    findAll: jest.fn().mockReturnValue({
      items: [mockUser],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
    findOne: jest.fn().mockReturnValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    update: jest.fn().mockReturnValue({ ...mockUser, name: 'Updated' }),
    remove: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll 调用 service.findAll 并返回结果', () => {
    const result = controller.findAll(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
    expect(result.items).toHaveLength(1);
  });

  it('findOne 调用 service.findOne 并返回用户', () => {
    const result = controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result.name).toBe('Alice');
  });

  it('create 调用 service.create 并返回新用户', () => {
    const dto = {
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    };
    const result = controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.email).toBe('alice@example.com');
  });

  it('update 调用 service.update 并返回更新后用户', () => {
    const result = controller.update('1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('remove 调用 service.remove', () => {
    controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
