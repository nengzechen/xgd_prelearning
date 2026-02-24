# TypeScript 转账服务 - 第六七周技能任务

## 项目概述

本项目是第六七周的技能实践任务，使用 **TypeScript** 实现了一个完整的银行转账服务，涵盖了 TypeScript 的核心特性：

- **类型定义**：账户类型（Account）和转账类型（Transfer）
- **接口**：对象类型接口和函数类型接口
- **泛型**：通用数据结构
- **枚举**：状态和类型枚举
- **异步编程**：async/await 转账流程
- **类**：账户服务和转账服务的面向对象实现

---

## 目录结构

```
typescript-demo/
├── src/
│   ├── types/
│   │   ├── account.types.ts    # 账户类型定义（账户、货币、状态枚举）
│   │   └── transfer.types.ts   # 转账类型定义（请求、结果、记录、错误码）
│   ├── services/
│   │   ├── account.service.ts  # 账户服务（内存存储 CRUD）
│   │   └── transfer.service.ts # 转账服务（核心业务逻辑）
│   ├── utils/
│   │   ├── id.utils.ts         # ID/流水号生成工具
│   │   └── money.utils.ts      # 金额处理工具（元/分转换）
│   └── index.ts                # 演示入口
├── tests/
│   └── transfer.service.test.ts # 单元测试（17个测试用例）
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
cd typescript-demo
npm install
```

### 运行演示
```bash
npm start
```

### 运行测试
```bash
npm test
```

---

## 核心功能

### 账户类型（account.types.ts）

```typescript
// 货币枚举
enum Currency { CNY, USD, EUR, HKD }

// 账户接口
interface Account {
  id: string;
  accountNumber: string;  // 16位账户号
  owner: string;
  balance: number;        // 单位：分（避免浮点精度问题）
  currency: Currency;
  status: AccountStatus;
  readonly createdAt: Date;
}
```

### 转账类型（transfer.types.ts）

```typescript
// 转账请求接口
interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;         // 单位：分
  currency: Currency;
  remark?: string;
  type?: TransferType;    // 行内/跨行
}

// 转账结果接口
interface TransferResult {
  success: boolean;
  transactionId?: string; // 成功时的流水号
  status: TransferStatus;
  errorCode?: TransferErrorCode;
  errorMessage?: string;
  fromBalance?: number;
  toBalance?: number;
}
```

### 转账服务（transfer.service.ts）

转账服务实现了 `ITransferService` 接口，包含以下验证逻辑：

| 验证项 | 错误码 |
|--------|--------|
| 账户存在性 | `ACCOUNT_NOT_FOUND` |
| 账户状态（冻结/注销） | `ACCOUNT_FROZEN / ACCOUNT_CLOSED` |
| 货币类型匹配 | `CURRENCY_MISMATCH` |
| 余额充足性 | `INSUFFICIENT_BALANCE` |
| 日转账限额（10万） | `DAILY_LIMIT_EXCEEDED` |
| 金额合法性 | `INVALID_AMOUNT` |
| 转入转出相同账户 | `SAME_ACCOUNT` |

---

## 演示输出示例

```
============================================================
       TypeScript 转账服务演示
============================================================

📋 初始账户信息：
  Alice:   6228xxxxxxxxxxxxxx  余额：¥10000.00
  Bob:     6228xxxxxxxxxxxxxx  余额：¥5000.00
  Charlie: 6228xxxxxxxxxxxxxx  余额：¥2000.00

【场景1】Alice 向 Bob 转账 ¥100（行内）
  ✅ 转账成功
     流水号：TXN-20260224-XXXXXXXX
     转出账户剩余：¥9900.00

【场景2】Charlie 向 Alice 转账 ¥5000（超出余额）
  ❌ 转账失败
     错误码：INSUFFICIENT_BALANCE
     原因：余额不足：...

【场景3】Bob 向 Charlie 跨行转账 ¥200（手续费0.1%）
  ✅ 转账成功
     流水号：TXN-20260224-XXXXXXXX
     转出账户剩余：¥5080.00（扣除手续费¥0.20）
```

---

## 测试覆盖

| 测试模块 | 测试数量 | 覆盖场景 |
|----------|---------|---------|
| 正常转账 | 4 | 行内/跨行/历史记录/流水查询 |
| 失败场景 | 8 | 账户不存在/余额不足/冻结/相同账户/金额无效/货币不匹配 |
| 账户服务 | 2 | 创建账户/冻结解冻 |

运行 `npm test` 可查看完整测试报告和覆盖率。
