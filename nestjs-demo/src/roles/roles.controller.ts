import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';

/**
 * 角色权限管理 Controller
 * 仅管理员可操作
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /api/roles?page=1&limit=10
   * 获取角色列表（分页）
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.rolesService.findAll(page, limit);
  }

  /**
   * GET /api/roles/:id
   * 获取单个角色
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * POST /api/roles
   * 创建角色（仅管理员）
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * PUT /api/roles/:id
   * 更新角色（仅管理员）
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * DELETE /api/roles/:id
   * 删除角色（仅管理员）
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.rolesService.remove(id);
  }
}
