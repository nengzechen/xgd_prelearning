import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 用户服务（内存存储，演示 NestJS Service 层用法）
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private users: Map<string, User> = new Map();
  private idCounter = 1;

  constructor() {
    // 初始化示例数据
    this.seedData();
  }

  /**
   * 获取用户列表（支持分页）
   */
  findAll(page = 1, limit = 10): PaginationResult<Omit<User, 'password'>> {
    const allUsers = Array.from(this.users.values());
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    const items = allUsers.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit, totalPages };
  }

  /**
   * 根据 ID 查找用户
   */
  findOne(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`用户 [${id}] 不存在`);
    }
    return user;
  }

  /**
   * 创建用户
   */
  create(dto: CreateUserDto): User {
    // 邮箱唯一性检查
    const existing = Array.from(this.users.values()).find(
      (u) => u.email === dto.email,
    );
    if (existing) {
      throw new ConflictException(`邮箱 ${dto.email} 已被注册`);
    }

    const now = new Date();
    const user: User = {
      id: String(this.idCounter++),
      name: dto.name,
      email: dto.email,
      role: dto.role ?? UserRole.USER,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    this.logger.log(`创建用户：${user.name} (${user.email})`);
    return user;
  }

  /**
   * 更新用户
   */
  update(id: string, dto: UpdateUserDto): User {
    const user = this.findOne(id);

    // 邮箱唯一性检查（排除自身）
    if (dto.email && dto.email !== user.email) {
      const conflict = Array.from(this.users.values()).find(
        (u) => u.email === dto.email && u.id !== id,
      );
      if (conflict) {
        throw new ConflictException(`邮箱 ${dto.email} 已被注册`);
      }
    }

    const updated: User = {
      ...user,
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.role !== undefined && { role: dto.role }),
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  /**
   * 删除用户
   */
  remove(id: string): void {
    this.findOne(id); // 不存在时抛 NotFoundException
    this.users.delete(id);
    this.logger.log(`删除用户：${id}`);
  }

  /**
   * 初始化示例数据
   */
  private seedData(): void {
    const seeds: CreateUserDto[] = [
      { name: 'Alice', email: 'alice@example.com', password: '123456', role: UserRole.ADMIN },
      { name: 'Bob', email: 'bob@example.com', password: '123456', role: UserRole.USER },
      { name: 'Charlie', email: 'charlie@example.com', password: '123456', role: UserRole.VIEWER },
    ];
    seeds.forEach((s) => this.create(s));
  }
}
