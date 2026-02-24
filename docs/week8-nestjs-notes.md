# 第八周学习笔记 - NestJS 核心概念

## 学习目标
- 理解 NestJS 架构（Controller/Service/Module）
- 掌握 IoC 与依赖注入
- 理解 Pipe/Guard/Interceptor 的作用
- 掌握异常处理机制
- 了解生命周期事件与定时器
- 了解单元测试方式

---

## 一、对架构的理解：NestJS vs Play Framework

### 1.1 总体架构对比

| 维度 | NestJS | Play Framework |
|------|--------|----------------|
| **语言** | TypeScript / JavaScript | Scala / Java |
| **运行时** | Node.js（单线程事件循环） | JVM（多线程） |
| **并发模型** | 异步非阻塞（事件驱动） | Actor 模型（Akka） |
| **依赖注入** | 内置 IoC 容器（类似 Spring） | Guice |
| **架构风格** | 模块化（Module 为核心单元） | MVC（路由为核心） |
| **路由定义** | 装饰器（`@Controller`/`@Get`） | 集中式 routes 文件 |
| **请求管道** | Middleware → Guard → Interceptor → Pipe → Handler | Filter → Action |
| **ORM 集成** | TypeORM / Prisma / Mongoose | Ebean / Hibernate |
| **适用场景** | RESTful API、微服务、企业级 | 高并发实时系统、游戏后端 |

### 1.2 核心设计思想对比

**NestJS 的思想：**
> "Angular on the server side"
- 受 Angular 启发，大量使用**装饰器（Decorator）**元编程
- **强约定**：目录结构、命名规范有明确要求
- **模块系统**：功能按 Module 组织，高内聚低耦合
- **依赖注入**：所有依赖通过构造函数注入，易于测试

**Play Framework 的思想：**
> "The high velocity web framework for Java and Scala"
- **无状态**：基于函数式编程理念，鼓励无副作用
- **响应式**：所有请求处理都是异步的（`Future`/`CompletionStage`）
- **Actor 模型**：通过 Akka 实现高并发，消息传递而非共享内存

### 1.3 请求处理流程对比

**NestJS 请求流程：**
```
HTTP 请求
  ↓
Middleware（中间件，如日志、CORS）
  ↓
Guard（守卫，如权限验证）
  ↓
Interceptor（拦截器 pre，如统一响应格式）
  ↓
Pipe（管道，参数验证/转换）
  ↓
Controller Handler（业务逻辑调用 Service）
  ↓
Interceptor（拦截器 post，如响应时间统计）
  ↓
Exception Filter（异常处理，转换为 HTTP 错误）
  ↓
HTTP 响应
```

**Play Framework 请求流程：**
```
HTTP 请求
  ↓
Filter（过滤器，类似 Middleware）
  ↓
Router（路由匹配）
  ↓
Action Interceptor（动作拦截器）
  ↓
Controller Action（调用 Service）
  ↓
HTTP 响应
```

### 1.4 关键区别总结

1. **语言生态**：NestJS 在 TypeScript 生态，复用前端知识；Play 在 JVM 生态，性能更强
2. **路由方式**：NestJS 用装饰器（代码即文档），Play 用集中路由文件（清晰全览）
3. **并发处理**：NestJS 依赖 Node.js 事件循环（I/O 密集场景好）；Play 依赖 Actor（CPU 密集/实时系统好）
4. **学习曲线**：NestJS 对前端开发者友好；Play 需要掌握 Akka 概念
5. **类型系统**：NestJS 用 TypeScript；Play 用 Scala（更强大但更复杂）

---

## 二、各个不同组件的用法

### 2.1 Module（模块）

Module 是 NestJS 的核心组织单元，将相关功能封装在一起：

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 导入其他模块
  controllers: [UsersController],              // 该模块的 Controller
  providers: [UsersService],                   // 该模块的 Provider（Service 等）
  exports: [UsersService],                     // 导出给其他模块使用
})
export class UsersModule {}
```

**Module 类型：**
- **根模块（AppModule）**：应用入口，聚合所有子模块
- **功能模块（Feature Module）**：按功能划分（如 UsersModule、OrdersModule）
- **共享模块（Shared Module）**：多个模块共用的功能（如 DatabaseModule）
- **全局模块（Global Module）**：`@Global()` 装饰，无需导入可直接使用

### 2.2 Controller（控制器）

Controller 负责处理 HTTP 请求，调用 Service 返回响应：

```typescript
import {
  Controller, Get, Post, Body, Param,
  Query, HttpCode, HttpStatus, Delete, Put
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')           // 路由前缀 /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users?page=1&limit=10
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll({ page, limit });
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // POST /users
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // PUT /users/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

### 2.3 Service（服务）

Service 包含业务逻辑，通过 `@Injectable()` 标注为可注入的 Provider：

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(options: { page: number; limit: number }): Promise<User[]> {
    const { page, limit } = options;
    return this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
}
```

### 2.4 IoC 与依赖注入（DI）

NestJS 内置 IoC（控制反转）容器，自动管理对象的创建和依赖关系：

```typescript
// 不使用 DI（依赖硬编码，难以测试）
class OrderService {
  private userService = new UserService();  // ❌
}

// 使用 DI（依赖外部注入，易于 Mock 测试）
@Injectable()
class OrderService {
  constructor(
    private readonly userService: UserService,    // ✅ 自动注入
    private readonly paymentService: PaymentService,
  ) {}
}

// 自定义 Provider（工厂模式）
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('API_KEY'),
      }),
      inject: [ConfigService],
    },
  ],
})
```

**DI 的优势：**
1. **解耦**：调用方不关心依赖的具体实现
2. **可测试**：单元测试时可以注入 Mock 对象
3. **生命周期管理**：NestJS 自动管理 Provider 的单例/请求级生命周期

### 2.5 Pipe（管道）

Pipe 在 Handler 执行前对参数进行**验证**或**转换**：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// 内置 Pipe
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {  // 自动将字符串转为整数
  return this.service.findOne(id);
}

// 自定义验证 Pipe（基于 class-validator）
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype) return value;

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('参数验证失败');
    }
    return object;
  }
}

// DTO 定义（配合 class-validator）
import { IsString, IsEmail, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}
```

**内置 Pipe：**
- `ParseIntPipe` - 字符串转整数
- `ParseBoolPipe` - 字符串转布尔
- `ParseUUIDPipe` - 验证 UUID 格式
- `ValidationPipe` - 基于装饰器的 DTO 验证

### 2.6 Guard（守卫）

Guard 决定是否允许请求继续处理（用于**认证/鉴权**）：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
      return true;
    } catch {
      return false;
    }
  }
}

// 使用 Guard
@UseGuards(JwtAuthGuard)        // 应用到整个 Controller
@Controller('admin')
export class AdminController {

  @UseGuards(RolesGuard)         // 应用到单个路由
  @Get('users')
  getUsers() { ... }
}
```

**Guard vs Middleware：**
- Middleware：不知道执行上下文（谁在调用），适合通用处理（日志、CORS）
- Guard：有完整执行上下文，知道具体是哪个路由，适合权限验证

### 2.7 Interceptor（拦截器）

Interceptor 可以在 Handler 执行**前后**添加额外逻辑（AOP 切面编程）：

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// 统一响应格式拦截器
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 200,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}

// 日志拦截器（记录请求耗时）
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    console.log(`→ ${req.method} ${req.url}`);

    return next.handle().pipe(
      tap(() => console.log(`← ${Date.now() - start}ms`))
    );
  }
}
```

### 2.8 异常处理机制

NestJS 有内置的**全局异常过滤器**，自动将未捕获异常转为 HTTP 响应：

```typescript
// 内置 HTTP 异常
throw new BadRequestException('参数错误');      // 400
throw new UnauthorizedException('未登录');      // 401
throw new ForbiddenException('权限不足');        // 403
throw new NotFoundException('资源不存在');       // 404
throw new ConflictException('资源冲突');         // 409
throw new InternalServerErrorException('服务器错误'); // 500

// 自定义异常过滤器
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      code: status,
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, string>).message,
      timestamp: new Date().toISOString(),
    });
  }
}

// 全局注册（main.ts）
app.useGlobalFilters(new HttpExceptionFilter());
```

### 2.9 生命周期事件

NestJS 应用和模块有完整的生命周期钩子：

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  // 模块初始化时调用（DI 注入完成后）
  async onModuleInit(): Promise<void> {
    await this.connectToDatabase();
    console.log('数据库连接建立');
  }

  // 应用完全启动后调用
  async onApplicationBootstrap(): Promise<void> {
    await this.warmUpCache();
    console.log('缓存预热完成');
  }

  // 模块销毁前调用（应用关闭时）
  async onModuleDestroy(): Promise<void> {
    await this.disconnectFromDatabase();
    console.log('数据库连接关闭');
  }
}
```

**生命周期顺序：**
```
onModuleInit → onApplicationBootstrap → （运行中） → onModuleDestroy
```

### 2.10 定时器（Scheduler）

使用 `@nestjs/schedule` 模块实现定时任务：

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  // Cron 表达式（每天凌晨0点执行）
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyCleanup(): void {
    console.log('执行每日数据清理...');
  }

  // 每30秒执行一次
  @Interval(30_000)
  handleHealthCheck(): void {
    console.log('健康检查...');
  }

  // 应用启动后5秒执行一次
  @Timeout(5_000)
  handleInitTask(): void {
    console.log('初始化任务执行完毕');
  }
}
```

### 2.11 单元测试

NestJS 内置测试工具，基于 Jest：

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    // 创建测试模块
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          // Mock Service
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('findAll 返回空数组', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne 返回用户', async () => {
    const result = await controller.findOne('1');
    expect(result.name).toBe('Alice');
  });
});
```

---

## 三、总结

### NestJS 的核心优势

1. **类型安全**：TypeScript 全覆盖，开发体验极佳
2. **约定大于配置**：Clear 的目录结构约定，团队协作一致性强
3. **装饰器驱动**：代码即文档，路由、验证、权限一目了然
4. **模块化**：功能高度内聚，便于按领域划分和微服务拆分
5. **完善生态**：官方提供 TypeORM、Config、Schedule、Passport 等集成包

### 与 Play Framework 的选择建议

| 场景 | 推荐 |
|------|------|
| RESTful API 服务 | NestJS |
| 前后端同语言技术栈 | NestJS |
| 微服务架构 | NestJS（内置 Microservices 模块） |
| 高并发实时系统 | Play Framework |
| JVM 生态整合 | Play Framework |
| Actor 模型/消息驱动 | Play Framework |

NestJS 更像是"**后端 Angular**"，适合 TypeScript 全栈开发；
Play Framework 更像是"**高性能响应式框架**"，适合大规模并发场景。
