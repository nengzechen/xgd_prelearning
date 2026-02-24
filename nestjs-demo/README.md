# NestJS Demo - 第八周技能任务

基于 **NestJS** 构建的 RESTful API 服务，展示 NestJS 核心特性的实践应用。

## 技术栈

- **框架**：NestJS 11.x
- **语言**：TypeScript
- **运行时**：Node.js
- **验证**：class-validator + class-transformer
- **测试**：Jest

---

## 目录结构

```
nestjs-demo/
├── src/
│   ├── app.module.ts           # 根模块（聚合所有子模块）
│   ├── app.controller.ts       # 根路由（GET / + POST /echo）
│   ├── app.service.ts          # 根服务
│   ├── main.ts                 # 应用入口（全局配置）
│   ├── users/                  # 用户管理功能模块
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts    # 创建用户 DTO（含验证）
│   │   │   └── update-user.dto.ts    # 更新用户 DTO
│   │   ├── users.controller.ts       # 用户 Controller（CRUD）
│   │   ├── users.service.ts          # 用户 Service（业务逻辑）
│   │   ├── users.module.ts           # 用户模块定义
│   │   ├── users.controller.spec.ts  # Controller 单元测试
│   │   └── users.service.spec.ts     # Service 单元测试
│   ├── health/                 # 健康检查模块
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── common/                 # 通用组件
│       ├── filters/
│       │   └── http-exception.filter.ts  # 全局异常过滤器
│       └── interceptors/
│           ├── transform.interceptor.ts  # 统一响应格式
│           └── logging.interceptor.ts    # 请求日志
├── docs/
│   └── api-test-guide.md       # 接口测试文档
├── test/                       # E2E 测试
├── package.json
└── tsconfig.json
```

---

## 快速开始

```bash
cd nestjs-demo
npm install

# 开发模式
npm run start:dev

# 生产模式
npm run build && node dist/main.js
```

访问：`http://localhost:3000/api`

---

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api` | 欢迎信息 |
| POST | `/api/echo` | 回显接口（演示 POST） |
| GET | `/api/health` | 健康检查 |
| GET | `/api/health/info` | 应用信息 |
| GET | `/api/users?page=1&limit=10` | 用户列表（分页） |
| GET | `/api/users/:id` | 获取单个用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |

详细接口文档见 [docs/api-test-guide.md](./docs/api-test-guide.md)

---

## 运行测试

```bash
npm test           # 单元测试
npm run test:cov   # 带覆盖率报告
```

**测试结果：**
```
Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
```

---

## 核心 NestJS 特性展示

| 特性 | 实现位置 |
|------|---------|
| Module | `users.module.ts`, `health.module.ts`, `app.module.ts` |
| Controller | `users.controller.ts`, `health.controller.ts` |
| Service + DI | `users.service.ts` |
| Pipe（参数验证） | `CreateUserDto` + `ValidationPipe` (main.ts) |
| Exception Filter | `common/filters/http-exception.filter.ts` |
| Interceptor | `transform.interceptor.ts`, `logging.interceptor.ts` |
| DTO 验证 | `dto/create-user.dto.ts` (class-validator) |
| 单元测试 | `*.spec.ts` |
