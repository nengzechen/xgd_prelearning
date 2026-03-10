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
  password: string;
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
    this.seedData();
  }

  /**
   * 获取用户列表（支持分页，不返回密码）
   */
  findAll(page = 1, limit = 10): PaginationResult<Omit<User, 'password'>> {
    const allUsers = Array.from(this.users.values()).map(({ password, ...rest }) => rest);
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
   * 根据邮箱查找用户（用于登录验证）
   */
  findByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  /**
   * 创建用户
   */
  create(dto: CreateUserDto): User {
    const existing = this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`邮箱 ${dto.email} 已被注册`);
    }

    const now = new Date();
    const user: User = {
      id: String(this.idCounter++),
      name: dto.name,
      email: dto.email,
      password: dto.password,
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
  update(id: string, dto: UpdateUserDto): Omit<User, 'password'> {
    const user = this.findOne(id);

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
      ...(dto.password !== undefined && { password: dto.password }),
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    const { password, ...result } = updated;
    return result;
  }

  /**
   * 删除用户
   */
  remove(id: string): void {
    this.findOne(id);
    this.users.delete(id);
    this.logger.log(`删除用户：${id}`);
  }

  /**
   * 初始化示例数据（使用 bcryptjs 哈希后的密码 "123456"）
   */
  private seedData(): void {
    // 预计算的 bcrypt hash for "123456"
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const seeds = [
      { name: 'Alice', email: 'alice@example.com', password: hashedPassword, role: UserRole.ADMIN },
      { name: 'Bob', email: 'bob@example.com', password: hashedPassword, role: UserRole.USER },
      { name: 'Charlie', email: 'charlie@example.com', password: hashedPassword, role: UserRole.VIEWER },
    ];
    seeds.forEach((s) => {
      const now = new Date();
      const user: User = {
        id: String(this.idCounter++),
        name: s.name,
        email: s.email,
        password: s.password,
        role: s.role,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(user.id, user);
    });
  }
}
