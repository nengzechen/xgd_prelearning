# NestJS 接口测试文档

## 项目信息

- **框架**：NestJS 11.x
- **运行端口**：3000
- **API 前缀**：`/api`
- **测试工具**：Postman / curl

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
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "错误描述",
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

## 接口列表

### 1. 根路由

#### GET /api - 欢迎信息

**请求：**
```bash
curl http://localhost:3000/api
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": "Hello World!",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

#### POST /api/echo - 回显接口

**请求：**
```bash
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello NestJS!"}'
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "echo": "Hello NestJS!",
    "receivedAt": "2026-02-24T03:09:08.145Z"
  },
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

### 2. 健康检查

#### GET /api/health - 健康状态

**请求：**
```bash
curl http://localhost:3000/api/health
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "ok",
    "uptime": 15,
    "environment": "development"
  },
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

#### GET /api/health/info - 应用信息

**请求：**
```bash
curl http://localhost:3000/api/health/info
```

**响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "name": "nestjs-demo",
    "version": "1.0.0",
    "description": "NestJS 第八周实践项目",
    "author": "陈能泽",
    "framework": "NestJS",
    "runtime": "Node.js v20.x.x",
    "startedAt": "2026-02-24T03:09:05.490Z"
  },
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

### 3. 用户管理

#### GET /api/users - 获取用户列表（分页）

**请求：**
```bash
# 默认分页（第1页，每页10条）
curl http://localhost:3000/api/users

# 自定义分页
curl "http://localhost:3000/api/users?page=1&limit=2"
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
        "createdAt": "2026-02-24T03:09:05.490Z",
        "updatedAt": "2026-02-24T03:09:05.490Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

#### GET /api/users/:id - 获取单个用户

**请求：**
```bash
curl http://localhost:3000/api/users/1
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
    "role": "admin",
    "createdAt": "2026-02-24T03:09:05.490Z",
    "updatedAt": "2026-02-24T03:09:05.490Z"
  },
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

**失败响应（404）：**
```json
{
  "code": 404,
  "message": "用户 [9999] 不存在",
  "path": "/api/users/9999",
  "method": "GET",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

#### POST /api/users - 创建用户

**请求：**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David",
    "email": "david@example.com",
    "password": "123456",
    "role": "user"
  }'
```

**成功响应（201）：**
```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": "4",
    "name": "David",
    "email": "david@example.com",
    "role": "user",
    "createdAt": "2026-02-24T03:09:08.181Z",
    "updatedAt": "2026-02-24T03:09:08.181Z"
  },
  "timestamp": "2026-02-24T03:09:08.181Z"
}
```

**验证失败（400）：**
```bash
# 缺少必填字段
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "X"}'
```
```json
{
  "code": 400,
  "message": "邮箱格式不正确; 密码必须是字符串; 密码至少6个字符",
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

**邮箱冲突（409）：**
```json
{
  "code": 409,
  "message": "邮箱 alice@example.com 已被注册",
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

#### PUT /api/users/:id - 更新用户

**请求：**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Updated"}'
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1",
    "name": "Alice Updated",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2026-02-24T03:09:05.490Z",
    "updatedAt": "2026-02-24T03:09:10.000Z"
  },
  "timestamp": "2026-02-24T03:09:10.000Z"
}
```

---

#### DELETE /api/users/:id - 删除用户

**请求：**
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

**成功响应（204 No Content）：** 无响应体

**失败响应（404）：**
```json
{
  "code": 404,
  "message": "用户 [1] 不存在",
  "path": "/api/users/1",
  "method": "DELETE",
  "timestamp": "2026-02-24T03:09:08.145Z"
}
```

---

## 接口汇总

| 方法 | 路径 | 描述 | 状态码 |
|------|------|------|--------|
| GET | `/api` | 欢迎信息 | 200 |
| POST | `/api/echo` | 回显消息 | 200 |
| GET | `/api/health` | 健康检查 | 200 |
| GET | `/api/health/info` | 应用信息 | 200 |
| GET | `/api/users` | 用户列表（分页） | 200 |
| GET | `/api/users/:id` | 获取单个用户 | 200/404 |
| POST | `/api/users` | 创建用户 | 201/400/409 |
| PUT | `/api/users/:id` | 更新用户 | 200/400/404/409 |
| DELETE | `/api/users/:id` | 删除用户 | 204/404 |

---

## 测试覆盖

```
Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
```

运行测试：
```bash
npm test           # 单元测试
npm run test:cov   # 带覆盖率
```
