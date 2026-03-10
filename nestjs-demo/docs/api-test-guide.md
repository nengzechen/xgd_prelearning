# NestJS 接口测试文档（第九、十周）

## 项目信息

- **框架**：NestJS 11.x
- **运行端口**：3000
- **API 前缀**：`/api`
- **测试工具**：Postman / curl
- **认证方式**：JWT Bearer Token
- **限流策略**：每60秒最多30次请求

---

## 启动项目

```bash
cd nestjs-demo
npm install
npm run start:dev   # 开发模式（热重载）
# 或
npm run build && node dist/main.js  # 生产模式
```

访问：`http://localhost:3000/api`

---

## 统一响应格式

所有接口均返回以下格式：

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "错误描述",
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

## 接口列表

### 1. 认证模块（Auth）

#### POST /api/auth/register - 用户注册（公开）

**请求：**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NewUser",
    "email": "newuser@example.com",
    "password": "123456"
  }'
```

**成功响应（201）：**
```json
{
  "code": 201,
  "message": "success",
  "data": {
    "user": {
      "id": "4",
      "name": "NewUser",
      "email": "newuser@example.com",
      "role": "user"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

**邮箱已注册（409）：**
```json
{
  "code": 409,
  "message": "邮箱 newuser@example.com 已被注册",
  "path": "/api/auth/register",
  "method": "POST",
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

#### POST /api/auth/login - 用户登录（公开）

**请求：**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "123456"
  }'
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "id": "1",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "admin"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

**认证失败（401）：**
```json
{
  "code": 401,
  "message": "邮箱或密码错误",
  "path": "/api/auth/login",
  "method": "POST",
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

#### GET /api/auth/profile - 获取当前用户信息（需认证）

**请求：**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

### 2. 用户管理（需认证）

> 以下接口需要在 Header 中携带 JWT Token：
> `Authorization: Bearer <token>`

#### GET /api/users - 获取用户列表（分页）

**权限要求：** admin / user / viewer

**请求：**
```bash
curl "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "1",
        "name": "Alice",
        "email": "alice@example.com",
        "role": "admin",
        "createdAt": "2026-03-11T03:09:05.490Z",
        "updatedAt": "2026-03-11T03:09:05.490Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

#### GET /api/users/:id - 获取单个用户

**权限要求：** admin / user / viewer

```bash
curl http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <token>"
```

---

#### POST /api/users - 创建用户

**权限要求：** admin

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "David",
    "email": "david@example.com",
    "password": "123456",
    "role": "user"
  }'
```

**权限不足（403）：**
```json
{
  "code": 403,
  "message": "需要以下角色之一：admin，当前角色：viewer",
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

#### PUT /api/users/:id - 更新用户

**权限要求：** admin

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name": "Alice Updated"}'
```

---

#### DELETE /api/users/:id - 删除用户

**权限要求：** admin

```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <admin_token>"
```

**成功响应（204 No Content）**

---

### 3. 角色权限管理（需认证）

#### GET /api/roles - 获取角色列表（分页）

**权限要求：** admin / user / viewer

```bash
curl "http://localhost:3000/api/roles?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "1",
        "name": "admin",
        "description": "系统管理员，拥有所有权限",
        "permissions": ["user:read", "user:create", "user:update", "user:delete", "role:read", "role:create", "role:update", "role:delete"],
        "createdAt": "2026-03-11T03:09:05.490Z",
        "updatedAt": "2026-03-11T03:09:05.490Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "timestamp": "2026-03-11T03:09:08.145Z"
}
```

---

#### GET /api/roles/:id - 获取单个角色

**权限要求：** admin / user / viewer

```bash
curl http://localhost:3000/api/roles/1 \
  -H "Authorization: Bearer <token>"
```

---

#### POST /api/roles - 创建角色

**权限要求：** admin

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "moderator",
    "description": "版主",
    "permissions": ["user:read", "user:update"]
  }'
```

---

#### PUT /api/roles/:id - 更新角色

**权限要求：** admin

```bash
curl -X PUT http://localhost:3000/api/roles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"description": "超级管理员"}'
```

---

#### DELETE /api/roles/:id - 删除角色

**权限要求：** admin

```bash
curl -X DELETE http://localhost:3000/api/roles/1 \
  -H "Authorization: Bearer <admin_token>"
```

---

### 4. 健康检查（公开）

#### GET /api/health - 健康状态

```bash
curl http://localhost:3000/api/health
```

#### GET /api/health/info - 应用信息

```bash
curl http://localhost:3000/api/health/info
```

---

### 5. 根路由（公开）

#### GET /api - 欢迎信息

```bash
curl http://localhost:3000/api
```

#### POST /api/echo - 回显接口

```bash
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello NestJS!"}'
```

---

## 接口汇总

| 方法 | 路径 | 描述 | 认证 | 权限 | 状态码 |
|------|------|------|------|------|--------|
| POST | `/api/auth/register` | 用户注册 | 否 | - | 201/400/409 |
| POST | `/api/auth/login` | 用户登录 | 否 | - | 200/401 |
| GET | `/api/auth/profile` | 当前用户信息 | 是 | 所有 | 200/401 |
| GET | `/api/users` | 用户列表（分页） | 是 | 所有 | 200 |
| GET | `/api/users/:id` | 获取单个用户 | 是 | 所有 | 200/404 |
| POST | `/api/users` | 创建用户 | 是 | admin | 201/400/409 |
| PUT | `/api/users/:id` | 更新用户 | 是 | admin | 200/400/404/409 |
| DELETE | `/api/users/:id` | 删除用户 | 是 | admin | 204/404 |
| GET | `/api/roles` | 角色列表（分页） | 是 | 所有 | 200 |
| GET | `/api/roles/:id` | 获取单个角色 | 是 | 所有 | 200/404 |
| POST | `/api/roles` | 创建角色 | 是 | admin | 201/400/409 |
| PUT | `/api/roles/:id` | 更新角色 | 是 | admin | 200/400/404/409 |
| DELETE | `/api/roles/:id` | 删除角色 | 是 | admin | 204/404 |
| GET | `/api/health` | 健康检查 | 否 | - | 200 |
| GET | `/api/health/info` | 应用信息 | 否 | - | 200 |
| GET | `/api` | 欢迎信息 | 否 | - | 200 |
| POST | `/api/echo` | 回显消息 | 否 | - | 200 |

---

## HTTP 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | GET/PUT/POST 成功 |
| 201 | 已创建 | POST 创建资源成功 |
| 204 | 无内容 | DELETE 成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未认证 | 未提供 Token 或 Token 失效 |
| 403 | 权限不足 | 角色权限不满足 |
| 404 | 未找到 | 资源不存在 |
| 409 | 冲突 | 唯一约束冲突（如邮箱重复） |
| 429 | 请求过多 | 超出限流阈值 |
| 500 | 服务器错误 | 未知异常 |

---

## 安全特性

### JWT 认证
- 注册/登录后获取 JWT Token
- Token 有效期 24 小时
- 请求头格式：`Authorization: Bearer <token>`

### 角色权限控制（RBAC）
- **admin**：完全权限，可管理所有用户和角色
- **user**：读写权限，可查看用户和角色
- **viewer**：只读权限，仅可查看

### 接口限流
- 全局限流：每60秒最多30次请求
- 超出限制返回 429 状态码

### 密码安全
- 使用 bcryptjs 对密码进行哈希加密
- 接口响应中不返回密码字段

---

## 测试覆盖

```
Test Suites: 7 passed, 7 total
Tests:       54 passed, 54 total
```

运行测试：
```bash
npm test           # 单元测试
npm run test:cov   # 带覆盖率
npm run test:e2e   # E2E 测试
```

---

## 项目架构

```
src/
├── main.ts                          # 应用引导（全局配置）
├── app.module.ts                    # 根模块（集成所有模块）
├── auth/                            # 认证模块
│   ├── auth.module.ts               # 模块定义
│   ├── auth.controller.ts           # 认证控制器
│   ├── auth.service.ts              # 认证服务
│   ├── strategies/jwt.strategy.ts   # JWT 策略
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # JWT 认证守卫
│   │   └── roles.guard.ts          # 角色权限守卫
│   ├── decorators/
│   │   ├── public.decorator.ts     # @Public() 公开接口装饰器
│   │   ├── roles.decorator.ts      # @Roles() 角色装饰器
│   │   └── current-user.decorator.ts # @CurrentUser() 当前用户装饰器
│   └── dto/
│       ├── login.dto.ts            # 登录 DTO
│       └── register.dto.ts         # 注册 DTO
├── users/                           # 用户模块
│   ├── users.module.ts
│   ├── users.controller.ts         # 用户 CRUD（需认证+权限）
│   ├── users.service.ts            # 用户服务（含密码哈希）
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── roles/                           # 角色权限模块
│   ├── roles.module.ts
│   ├── roles.controller.ts         # 角色 CRUD（需认证+管理员权限）
│   ├── roles.service.ts            # 角色服务
│   └── dto/
│       ├── create-role.dto.ts
│       └── update-role.dto.ts
├── health/                          # 健康检查模块
│   ├── health.module.ts
│   └── health.controller.ts
└── common/                          # 公共模块
    ├── filters/
    │   └── http-exception.filter.ts # 全局异常过滤器
    └── interceptors/
        ├── logging.interceptor.ts   # 请求日志拦截器
        └── transform.interceptor.ts # 响应格式转换拦截器
```
