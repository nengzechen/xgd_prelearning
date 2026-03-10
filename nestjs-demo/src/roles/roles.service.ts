import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationResult } from '../users/users.service';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  private roles: Map<string, Role> = new Map();
  private idCounter = 1;

  constructor() {
    this.seedData();
  }

  /**
   * 获取角色列表（支持分页）
   */
  findAll(page = 1, limit = 10): PaginationResult<Role> {
    const allRoles = Array.from(this.roles.values());
    const total = allRoles.length;
    const totalPages = Math.ceil(total / limit);
    const items = allRoles.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit, totalPages };
  }

  /**
   * 根据 ID 查找角色
   */
  findOne(id: string): Role {
    const role = this.roles.get(id);
    if (!role) {
      throw new NotFoundException(`角色 [${id}] 不存在`);
    }
    return role;
  }

  /**
   * 根据名称查找角色
   */
  findByName(name: string): Role | undefined {
    return Array.from(this.roles.values()).find((r) => r.name === name);
  }

  /**
   * 创建角色
   */
  create(dto: CreateRoleDto): Role {
    const existing = this.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`角色名称 ${dto.name} 已存在`);
    }

    const now = new Date();
    const role: Role = {
      id: String(this.idCounter++),
      name: dto.name,
      description: dto.description ?? '',
      permissions: dto.permissions,
      createdAt: now,
      updatedAt: now,
    };
    this.roles.set(role.id, role);
    this.logger.log(`创建角色：${role.name}`);
    return role;
  }

  /**
   * 更新角色
   */
  update(id: string, dto: UpdateRoleDto): Role {
    const role = this.findOne(id);

    if (dto.name && dto.name !== role.name) {
      const conflict = this.findByName(dto.name);
      if (conflict) {
        throw new ConflictException(`角色名称 ${dto.name} 已存在`);
      }
    }

    const updated: Role = {
      ...role,
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.permissions !== undefined && { permissions: dto.permissions }),
      updatedAt: new Date(),
    };
    this.roles.set(id, updated);
    return updated;
  }

  /**
   * 删除角色
   */
  remove(id: string): void {
    this.findOne(id);
    this.roles.delete(id);
    this.logger.log(`删除角色：${id}`);
  }

  /**
   * 初始化默认角色
   */
  private seedData(): void {
    const seeds: CreateRoleDto[] = [
      {
        name: 'admin',
        description: '系统管理员，拥有所有权限',
        permissions: ['user:read', 'user:create', 'user:update', 'user:delete', 'role:read', 'role:create', 'role:update', 'role:delete'],
      },
      {
        name: 'user',
        description: '普通用户，拥有基本读写权限',
        permissions: ['user:read', 'user:update'],
      },
      {
        name: 'viewer',
        description: '只读用户，仅可查看',
        permissions: ['user:read', 'role:read'],
      },
    ];
    seeds.forEach((s) => this.create(s));
  }
}
