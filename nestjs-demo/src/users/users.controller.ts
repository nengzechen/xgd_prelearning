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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './dto/create-user.dto';

/**
 * 用户管理 Controller
 * 集成 JWT 认证和角色权限控制
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users?page=1&limit=10
   * 获取用户列表（分页）- 所有已认证用户可访问
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  /**
   * GET /api/users/:id
   * 获取单个用户 - 所有已认证用户可访问
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
  findOne(@Param('id') id: string) {
    const { password, ...user } = this.usersService.findOne(id);
    return user;
  }

  /**
   * POST /api/users
   * 创建用户 - 仅管理员可操作
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    const { password, ...user } = this.usersService.create(createUserDto);
    return user;
  }

  /**
   * PUT /api/users/:id
   * 更新用户 - 仅管理员可操作
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /api/users/:id
   * 删除用户 - 仅管理员可操作
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.usersService.remove(id);
  }
}
