# 远程培养计划 - 多框架 Web 开发实践

本仓库是远程培养计划（第1-8周）的完整学习成果，包含 Java 和 TypeScript 两大技术栈，覆盖 Play Framework、Spring Boot、TypeScript 和 NestJS 框架。

## 📚 项目简介

### 🔹 [Spring Boot 实现](./spring-boot-demo/)（第1-3周）
- **框架：** Spring Boot 3.2.1
- **构建工具：** Maven
- **特点：**
  - 基于Spring生态的完整CRUD实现
  - Spring Security + JWT认证
  - JPA/Hibernate ORM
  - RESTful API设计
  - H2内存数据库 + MySQL支持

### 🔹 [Play Framework 实现](./play-framework-demo/)（第2-5周）
- **框架：** Play Framework 2.9.x + Akka
- **构建工具：** SBT
- **特点：**
  - 异步非阻塞架构
  - Akka Actor模型实现
  - Akka Cluster集群支持
  - 过滤器（Filters）+ 拦截器（Interceptors）
  - WebSocket实时通信
  - Ebean + Hibernate JPA双ORM支持
  - 完整的单元测试套件（44个测试）

### 🔹 [TypeScript 转账服务](./typescript-demo/)（第6-7周）
- **语言：** TypeScript 5.x
- **构建工具：** npm + ts-node
- **特点：**
  - 完整的 TypeScript 类型系统实践
  - 账户类型（Account）和转账类型（Transfer）定义
  - 异步转账服务实现（async/await）
  - 14个单元测试（覆盖率 90%+）

### 🔹 [NestJS RESTful API](./nestjs-demo/)（第8周）
- **框架：** NestJS 11.x
- **语言：** TypeScript
- **特点：**
  - 模块化架构（UsersModule / HealthModule）
  - Controller / Service / Module 完整实践
  - 全局 ValidationPipe（DTO 参数验证）
  - 全局异常过滤器（统一错误响应）
  - 全局 Interceptor（统一响应格式 + 请求日志）
  - 18个单元测试全部通过

---

## 🆚 框架对比

| 特性 | Spring Boot | Play Framework |
|------|-------------|----------------|
| **编程模型** | 同步阻塞（传统Servlet） | 异步非阻塞（Reactive） |
| **依赖注入** | Spring IoC | Guice |
| **ORM** | Hibernate JPA | Ebean + Hibernate JPA |
| **模板引擎** | Thymeleaf（可选） | Twirl（Scala模板） |
| **并发模型** | 线程池 | Actor模型（Akka） |
| **集群支持** | Spring Cloud | Akka Cluster |
| **适用场景** | 企业级CRUD应用 | 高并发实时系统 |
| **学习曲线** | 平缓 | 陡峭 |

---

## 🏗️ 目录结构

```
.
├── spring-boot-demo/           # Spring Boot项目
│   ├── README.md               # 详细文档
│   ├── pom.xml                 # Maven配置
│   └── src/                    # 源代码
│       ├── main/
│       │   ├── java/           # Java源码（34个文件）
│       │   └── resources/      # 配置文件
│       └── test/               # 单元测试
│
└── play-framework-demo/        # Play Framework项目
    ├── README.md               # 详细文档
    ├── README_UPDATES.md       # 最新功能更新
    ├── build.sbt               # SBT配置
    ├── app/                    # 应用代码
    │   ├── actors/             # Akka Actor（11个）
    │   ├── controllers/        # 控制器（7个）
    │   ├── services/           # 业务逻辑
    │   ├── models/             # 实体模型（12个）
    │   ├── filters/            # 请求过滤器（3个）
    │   └── interceptors/       # 动作拦截器（6个）
    ├── conf/                   # 配置文件
    │   ├── application.conf    # 主配置
    │   ├── routes              # 路由配置
    │   └── evolutions/         # 数据库迁移
    ├── docs/                   # 技术文档（5篇）
    │   ├── 01-Actor模型核心基础.md
    │   ├── 02-Akka框架使用文档.md
    │   ├── 03-Akka Cluster集群搭建文档.md
    │   └── 第四五周-Actor与Cluster实现总结.md
    ├── test/                   # 测试代码（44个测试）
    └── postman/                # Postman测试集合
```

---

## 🚀 快速开始

### Spring Boot 项目

```bash
cd spring-boot-demo
mvn clean install
mvn spring-boot:run
# 访问 http://localhost:8080
```

详细说明请查看 [Spring Boot README](./spring-boot-demo/README.md)

### Play Framework 项目

```bash
cd play-framework-demo
sbt run
# 访问 http://localhost:9000
```

详细说明请查看 [Play Framework README](./play-framework-demo/README.md)

---

## 📖 核心功能

两个项目都实现了完整的**用户-角色-权限（RBAC）**管理系统：

### 用户管理
- ✅ 用户注册/登录
- ✅ 用户信息CRUD
- ✅ 角色分配
- ✅ 密码加密（BCrypt）

### 角色管理
- ✅ 角色CRUD
- ✅ 权限关联
- ✅ 层级管理

### 权限管理
- ✅ 权限CRUD
- ✅ 资源-动作模型
- ✅ 细粒度控制

---

## 🧪 测试覆盖

### Spring Boot
- JUnit 5 + Mockito
- 单元测试 + 集成测试

### Play Framework
- JUnit 4 + Mockito + Akka TestKit
- **44个单元测试，100%通过**
- 覆盖率：67%+（Actor系统70%+）
- 详细测试报告：[TEST_REPORT.md](./play-framework-demo/docs/TEST_REPORT.md)

---

## 📚 学习文档

### Spring Boot
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Spring Security参考](https://spring.io/projects/spring-security)

### Play Framework
- [Play Framework官方文档](https://www.playframework.com/documentation)
- [Akka官方文档](https://doc.akka.io/docs/akka/current/)
- **本仓库提供的深度文档：**
  - [Actor模型核心基础](./play-framework-demo/docs/01-Actor模型核心基础.md)
  - [Akka框架使用文档](./play-framework-demo/docs/02-Akka框架使用文档.md)
  - [Akka Cluster集群搭建](./play-framework-demo/docs/03-Akka%20Cluster集群搭建文档.md)
  - [Actor与Cluster实现总结](./play-framework-demo/docs/第四五周-Actor与Cluster实现总结.md)

---

## 🔧 技术栈总览

### Spring Boot 技术栈
- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- Spring Security
- Hibernate
- H2 / MySQL
- Maven

### Play Framework 技术栈
- Java 8/17
- Play Framework 2.9.x
- Akka 2.6.20
- Akka Cluster
- Guice（依赖注入）
- Ebean + Hibernate JPA
- MySQL
- SBT

---

## 📊 项目统计

| 项目 | Java文件 | 代码行数 | 测试数量 | 文档页数 |
|------|---------|---------|---------|---------|
| Spring Boot | 34 | ~3,500 | 待补充 | 1篇README |
| Play Framework | 47 | ~5,200 | 44个 | 5篇深度文档 |

---

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这些示例项目。

## 📄 许可证

MIT License

---

## 🎯 学习建议

### 建议顺序：
1. **先学Spring Boot** - 更容易上手，了解基础Web开发概念
2. **再学Play Framework** - 理解响应式编程和Actor模型
3. **对比两者差异** - 深入理解不同架构的优缺点

### 适用人群：
- ✅ Java Web开发初学者
- ✅ 想学习多种框架的开发者
- ✅ 准备技术选型的架构师
- ✅ 对Actor模型和响应式编程感兴趣的开发者

---

**最后更新：** 2026-02-01
**维护者：** [@nengzechen](https://github.com/nengzechen)
