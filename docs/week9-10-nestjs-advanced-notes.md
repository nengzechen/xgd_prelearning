# 第九、十周学习笔记 - NestJS架构和模块化 + 工程实现

## 一、NestJS架构和模块化（知识任务）

### 1. RESTful API 设计原则与最佳实践

RESTful API 设计核心原则：
- **资源导向**：URL 代表资源（名词），HTTP 方法代表操作（动词）
- **统一接口**：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- **无状态**：每次请求包含所有必要信息，服务端不保存客户端状态
- **分层系统**：客户端无需知道是直连服务端还是通过中间层

最佳实践：
```
GET    /api/users          # 获取用户列表
GET    /api/users/:id      # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/:id      # 更新用户
DELETE /api/users/:id      # 删除用户
```

- 使用复数名词（`/users` 而非 `/user`）
- 支持分页查询（`?page=1&limit=10`）
- 返回统一的响应格式
- 使用合适的 HTTP 状态码

### 2. HTTP 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 请求成功 | GET/PUT 成功 |
| 201 Created | 已创建 | POST 创建资源成功 |
| 204 No Content | 无内容 | DELETE 成功 |
| 400 Bad Request | 请求错误 | 参数验证失败 |
| 401 Unauthorized | 未认证 | 未登录或Token过期 |
| 403 Forbidden | 权限不足 | 已认证但权限不够 |
| 404 Not Found | 资源不存在 | ID对应的资源不存在 |
| 409 Conflict | 冲突 | 唯一约束冲突 |
| 429 Too Many Requests | 请求过多 | 超出限流阈值 |
| 500 Internal Server Error | 服务器错误 | 未知异常 |

### 3. 请求处理流程、参数验证与异常处理

NestJS 请求处理流程（管道模型）：
```
Client Request
  → Middleware
    → Guards（认证/授权）
      → Interceptors（前置拦截）
        → Pipes（参数验证/转换）
          → Controller Handler
            → Service
          → Controller 返回
        → Interceptors（后置拦截）
      → Response
    → Exception Filters（异常过滤）
  → Client Response
```

参数验证使用 `class-validator` 装饰器：

```typescript
export class CreateUserDto {
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(2, { message: '用户名至少2个字符' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}
```

全局 ValidationPipe 配置：
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // 过滤未声明属性
    forbidNonWhitelisted: true, // 有未声明属性时抛异常
    transform: true,            // 自动转换类型
  }),
);
```

### 4. JSON 数据处理

NestJS 基于 Express，默认支持 JSON 请求和响应：
- `@Body()` 自动解析 JSON 请求体
- Controller 返回对象自动序列化为 JSON
- 使用 `class-transformer` 进行对象转换

### 5. 异常处理机制

NestJS 内置异常类：
- `HttpException` - 所有 HTTP 异常基类
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)

全局异常过滤器实现：

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      code: status,
      message: exception.message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 6. 过滤器（Filter）与拦截器（Interceptor）

**Exception Filter（异常过滤器）**：
- 捕获并处理异常，统一错误响应格式
- `@Catch()` 装饰器指定捕获的异常类型
- `HttpExceptionFilter`：处理 HTTP 异常
- `AllExceptionsFilter`：兜底处理未知异常

**Interceptor（拦截器）**：
- 基于 AOP（面向切面编程）
- 可在方法执行前后添加逻辑
- `LoggingInterceptor`：记录请求日志和耗时
- `TransformInterceptor`：统一包装响应格式

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: response.statusCode,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 7. API 安全性设计（认证/授权/限流）

#### JWT 认证

使用 `@nestjs/jwt` + `@nestjs/passport` 实现 JWT 认证：

1. 用户登录 → 验证凭证 → 签发 JWT Token
2. 后续请求携带 Token → JWT Strategy 验证 → 提取用户信息
3. 使用 `JwtAuthGuard` 守卫保护路由

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret-key',
    });
  }

  validate(payload: JwtPayload) {
    return this.usersService.findOne(payload.sub);
  }
}
```

#### RBAC 角色权限控制

使用自定义 Guard + Decorator 实现：

```typescript
// 自定义角色装饰器
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### 接口限流

使用 `@nestjs/throttler` 实现：

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,  // 60秒
  limit: 30,   // 最多30次请求
}])
```

### 8. 使用 Module 对功能进行划分和组合

NestJS 模块化架构：

```
AppModule（根模块）
├── AuthModule        # 认证模块
│   └── imports: [UsersModule, PassportModule, JwtModule]
├── UsersModule       # 用户模块
│   └── exports: [UsersService]
├── RolesModule       # 角色模块
├── HealthModule      # 健康检查模块
└── ThrottlerModule   # 限流模块
```

模块化设计原则：
- **单一职责**：每个模块只负责一个功能领域
- **封装性**：通过 `exports` 控制对外暴露的服务
- **可组合**：通过 `imports` 引入其他模块的功能
- **可测试**：模块化便于单元测试和集成测试

---

## 二、NestJS 工程实现（技能任务）

### 1. 用户和权限管理 RESTful API 设计

设计了两套管理 API：

**用户管理 API（/api/users）**：
- 用户 CRUD 操作
- 分页查询
- JWT 认证保护
- 角色权限控制（admin 可管理，其他角色只读）

**角色权限 API（/api/roles）**：
- 角色 CRUD 操作
- 每个角色包含权限列表（如 `user:read`, `user:create`）
- 仅 admin 可以管理角色

**认证 API（/api/auth）**：
- 注册：创建用户并返回 JWT Token
- 登录：验证凭证并返回 JWT Token
- Profile：获取当前登录用户信息

### 2. CRUD 完整操作

以用户模块为例：

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get()                              // 列表查询
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
  findAll(@Query('page') page, @Query('limit') limit) { ... }

  @Get(':id')                         // 详情查询
  findOne(@Param('id') id: string) { ... }

  @Post()                             // 创建
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) { ... }

  @Put(':id')                         // 更新
  @Roles(UserRole.ADMIN)
  update(@Param('id') id, @Body() dto: UpdateUserDto) { ... }

  @Delete(':id')                      // 删除
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { ... }
}
```

### 3. 请求参数验证

使用 `class-validator` 装饰器实现声明式验证：
- `@IsString()` / `@IsEmail()` - 类型验证
- `@MinLength()` / `@MaxLength()` - 长度限制
- `@IsEnum()` - 枚举验证
- `@IsOptional()` - 可选字段
- `@IsArray()` / `@ArrayMinSize()` - 数组验证

### 4. 统一异常处理

两层异常过滤器：
- `HttpExceptionFilter`：处理所有 HTTP 异常，返回统一格式
- `AllExceptionsFilter`：捕获未知异常，返回 500 错误

### 5. 分页查询 + 日志记录

分页实现：
```typescript
findAll(page = 1, limit = 10): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedItems = items.slice((page - 1) * limit, page * limit);
  return { items: paginatedItems, total, page, limit, totalPages };
}
```

请求日志拦截器记录每个请求的方法、路径和耗时：
```
→ POST /api/auth/login
← POST /api/auth/login [15ms]
```

### 6. 单元测试

测试覆盖了所有模块的 Controller 和 Service：

```
Test Suites: 7 passed, 7 total
Tests:       54 passed, 54 total
```

测试内容包括：
- UsersService：CRUD、分页、findByEmail、异常场景
- UsersController：路由映射、参数传递
- AuthService：注册、登录、密码验证、JWT 签发
- AuthController：接口调用
- RolesService：CRUD、权限管理、异常场景
- RolesController：路由映射

测试使用 Jest + @nestjs/testing，通过 mock 隔离依赖：
```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: UsersService, useValue: mockUsersService },
    { provide: JwtService, useValue: mockJwtService },
  ],
}).compile();
```

---

## 三、新增功能总结

| 功能 | 实现方式 | 文件 |
|------|----------|------|
| JWT 认证 | @nestjs/jwt + passport | auth/ |
| 角色权限 | 自定义 Guard + Decorator | auth/guards/, auth/decorators/ |
| 接口限流 | @nestjs/throttler | app.module.ts |
| 密码加密 | bcryptjs | auth/auth.service.ts |
| 角色管理 | 独立模块 CRUD | roles/ |
| 统一异常 | 双层 Exception Filter | common/filters/ |
| 请求日志 | LoggingInterceptor | common/interceptors/ |
| 响应格式 | TransformInterceptor | common/interceptors/ |
| 参数验证 | class-validator + ValidationPipe | dto/ |
| 单元测试 | Jest + @nestjs/testing | *.spec.ts |
