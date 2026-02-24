# 第六七周学习笔记 - TypeScript 基础

## 学习目标
- 掌握 TypeScript 基础类型系统
- 理解接口与函数类型接口
- 掌握类与接口的关系
- 理解泛型的作用与使用
- 掌握异步编程模式

---

## 一、对类型的理解

### 1.1 基础类型

TypeScript 是 JavaScript 的超集，最核心的特性就是**静态类型系统**。类型在编译阶段进行检查，有效避免运行时类型错误。

```typescript
// 基础类型
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let value: null = null;
let nothing: undefined = undefined;

// 数组类型
let ids: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// 元组类型（固定长度和类型的数组）
let point: [number, number] = [10, 20];
let entry: [string, number] = ["score", 100];

// 联合类型（或）
let id: string | number = "abc";
id = 123; // 也合法

// 交叉类型（且）
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;
const person: Person = { name: "Alice", age: 25 };

// 字面量类型
type Direction = "left" | "right" | "up" | "down";
let dir: Direction = "left"; // 只能是这四个值之一

// any / unknown / never / void
let anyVal: any = 42;         // 跳过类型检查（慎用）
let unknownVal: unknown = 42; // 比 any 更安全，使用前需类型断言
function throwError(): never { throw new Error("fatal"); }
function log(): void { console.log("hello"); }
```

### 1.2 类型推断与断言

TypeScript 能根据赋值自动推断类型，无需显式标注：

```typescript
let x = 10;        // 推断为 number
let greeting = "hi"; // 推断为 string

// 类型断言：告诉编译器"我确定这是什么类型"
const input = document.getElementById("myInput") as HTMLInputElement;
const len = (someValue as string).length;
```

### 1.3 类型别名 vs 接口

| 特性 | `type` | `interface` |
|------|--------|-------------|
| 描述对象结构 | ✅ | ✅ |
| 扩展（继承） | 用 `&` 交叉 | 用 `extends` |
| 实现（类） | ✅ | ✅ |
| 联合/交叉类型 | ✅ | ❌ |
| 声明合并 | ❌ | ✅ |
| **推荐场景** | 复杂类型组合 | 描述数据结构/API契约 |

> **核心理解**：类型系统的本质是"约束"，它让代码的意图更清晰，让工具（IDE、编译器）能在开发阶段发现问题，而不是等到运行时。

---

## 二、对函数和接口的理解

### 2.1 函数类型

TypeScript 中函数的类型包括**参数类型**和**返回值类型**：

```typescript
// 基本函数类型标注
function add(a: number, b: number): number {
  return a + b;
}

// 函数类型别名
type MathOperation = (a: number, b: number) => number;
const multiply: MathOperation = (a, b) => a * b;

// 可选参数（必须在必选参数后面）
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// 默认参数
function createUser(name: string, role: string = "user"): string {
  return `${name}(${role})`;
}

// 剩余参数
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}

// 函数重载：同名函数，不同参数类型的调用
function formatId(id: string): string;
function formatId(id: number): string;
function formatId(id: string | number): string {
  return `ID-${id}`;
}
```

### 2.2 对象类型接口

接口（`interface`）描述对象的"形状"，是 TypeScript 中定义数据契约的主要方式：

```typescript
// 对象类型接口
interface Account {
  id: string;
  owner: string;
  balance: number;
  currency: string;
  readonly createdAt: Date;  // 只读属性
  email?: string;            // 可选属性
}

// 使用接口
const account: Account = {
  id: "acc-001",
  owner: "Alice",
  balance: 1000,
  currency: "CNY",
  createdAt: new Date(),
};

// 接口继承：扩展已有接口
interface SavingsAccount extends Account {
  interestRate: number;
  maturityDate: Date;
}

// 接口合并：同名接口自动合并（声明合并）
interface Config {
  host: string;
}
interface Config {
  port: number;
}
// 等价于 { host: string; port: number }
```

### 2.3 函数类型接口

接口不仅能描述对象，还能描述函数的签名：

```typescript
// 函数类型接口
interface TransferHandler {
  (from: string, to: string, amount: number): Promise<boolean>;
}

// 可调用 + 属性的混合接口
interface TransferService {
  execute(request: TransferRequest): Promise<TransferResult>;
  getHistory(accountId: string): Promise<TransferRecord[]>;
  readonly serviceId: string;
}
```

> **核心理解**：接口是 TypeScript 实现"面向契约编程"的核心工具。接口定义了"做什么"（what），实现定义了"怎么做"（how）。通过接口可以将调用方与实现方解耦，便于单元测试（Mock）和模块替换。

---

## 三、类与接口的关系

### 3.1 类的基本特性

```typescript
class BankAccount {
  // 访问修饰符
  private id: string;
  protected owner: string;
  public balance: number;
  readonly currency: string;

  constructor(id: string, owner: string, initialBalance: number, currency: string = "CNY") {
    this.id = id;
    this.owner = owner;
    this.balance = initialBalance;
    this.currency = currency;
  }

  // getter / setter
  get accountId(): string {
    return this.id;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("存款金额必须大于0");
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("余额不足");
    this.balance -= amount;
  }
}
```

### 3.2 类实现接口（implements）

```typescript
interface Auditable {
  getAuditLog(): string[];
}

interface Freezable {
  freeze(): void;
  unfreeze(): void;
  isFrozen: boolean;
}

// 一个类可以实现多个接口
class SecureBankAccount extends BankAccount implements Auditable, Freezable {
  private auditLog: string[] = [];
  isFrozen: boolean = false;

  constructor(id: string, owner: string, balance: number) {
    super(id, owner, balance);
  }

  override deposit(amount: number): void {
    if (this.isFrozen) throw new Error("账户已冻结");
    super.deposit(amount);
    this.auditLog.push(`存款 ${amount} 元，时间：${new Date().toISOString()}`);
  }

  override withdraw(amount: number): void {
    if (this.isFrozen) throw new Error("账户已冻结");
    super.withdraw(amount);
    this.auditLog.push(`取款 ${amount} 元，时间：${new Date().toISOString()}`);
  }

  getAuditLog(): string[] {
    return [...this.auditLog];
  }

  freeze(): void { this.isFrozen = true; }
  unfreeze(): void { this.isFrozen = false; }
}
```

### 3.3 抽象类

抽象类是"部分实现"的类，不能被直接实例化，子类必须实现抽象方法：

```typescript
abstract class BaseTransferService {
  // 模板方法（已实现）
  async transfer(request: TransferRequest): Promise<TransferResult> {
    await this.validateRequest(request);
    return this.executeTransfer(request);
  }

  // 抽象方法（子类必须实现）
  protected abstract validateRequest(request: TransferRequest): Promise<void>;
  protected abstract executeTransfer(request: TransferRequest): Promise<TransferResult>;
}
```

> **核心理解**：
> - `extends`（继承）= 复用代码，IS-A 关系（是一种）
> - `implements`（实现接口）= 履行契约，CAN-DO 关系（能做某事）
> - 优先使用**组合**而非继承，接口比抽象类更灵活

---

## 四、泛型

泛型让类型成为"参数"，实现代码复用的同时保持类型安全：

```typescript
// 泛型函数
function identity<T>(value: T): T {
  return value;
}
identity<string>("hello"); // 显式指定
identity(42);              // 自动推断 T = number

// 泛型约束：限制 T 必须有 id 属性
interface HasId {
  id: string;
}
function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// 泛型接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 泛型类
class Repository<T extends HasId> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  findById(id: string): T | undefined {
    return this.items.find(item => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }
}

// 实际应用：泛型 ApiResponse
const userResponse: ApiResponse<Account[]> = {
  code: 200,
  message: "success",
  data: [],
};
```

---

## 五、类型检查机制

TypeScript 的类型检查是**结构性类型系统**（Structural Typing），又称"鸭子类型"：只要结构匹配，类型就兼容。

```typescript
// 结构兼容性：只要有必要属性就算兼容
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

const p3: Point3D = { x: 1, y: 2, z: 3 };
const p2: Point2D = p3; // ✅ Point3D 包含 Point2D 所有属性，兼容

// 类型收窄（Type Narrowing）
function processId(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase(); // 这里 id 被收窄为 string
  }
  return id.toFixed(2);     // 这里 id 被收窄为 number
}

// 自定义类型守卫
function isAccount(obj: unknown): obj is Account {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "balance" in obj
  );
}
```

---

## 六、异步编程的理解

### 6.1 Promise 基础

JavaScript/TypeScript 的异步编程经历了：回调函数 → Promise → async/await 的演进。

```typescript
// Promise：代表一个"未来的值"
function fetchBalance(accountId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (accountId === "invalid") {
        reject(new Error("账户不存在"));
      } else {
        resolve(1000);
      }
    }, 100);
  });
}

// Promise 链式调用
fetchBalance("acc-001")
  .then(balance => balance * 2)
  .then(doubled => console.log(`翻倍余额：${doubled}`))
  .catch(err => console.error("错误：", err.message));

// Promise.all：并行等待多个 Promise
const [balance1, balance2] = await Promise.all([
  fetchBalance("acc-001"),
  fetchBalance("acc-002"),
]);
```

### 6.2 async/await

`async/await` 是 Promise 的语法糖，让异步代码看起来像同步代码：

```typescript
// async 函数总是返回 Promise
async function transfer(fromId: string, toId: string, amount: number): Promise<TransferResult> {
  try {
    // await 等待 Promise resolve
    const fromAccount = await findAccount(fromId);
    const toAccount = await findAccount(toId);

    if (!fromAccount || !toAccount) {
      throw new Error("账户不存在");
    }

    if (fromAccount.balance < amount) {
      throw new Error("余额不足");
    }

    // 并行执行两个更新（效率更高）
    await Promise.all([
      updateBalance(fromId, fromAccount.balance - amount),
      updateBalance(toId, toAccount.balance + amount),
    ]);

    return {
      success: true,
      transactionId: generateId(),
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      timestamp: new Date(),
    };
  }
}
```

### 6.3 异步模式对比

| 模式 | 优点 | 缺点 |
|------|------|------|
| 回调函数 | 无需额外语法 | 回调地狱，难以维护 |
| Promise | 链式调用，错误处理好 | 嵌套多时仍较复杂 |
| async/await | 代码清晰，类似同步 | 需要 try/catch |

> **核心理解**：
> 1. JavaScript 是**单线程**的，异步不等于多线程，而是通过**事件循环**实现非阻塞
> 2. `async` 函数本质上返回一个 Promise，`await` 暂停当前函数但不阻塞线程
> 3. 并发场景优先使用 `Promise.all`，避免串行等待浪费时间
> 4. 错误处理：`async/await` 配合 `try/catch`，或在 Promise 链末尾加 `.catch()`

---

## 七、TypeScript 编码规范（Google 规范要点）

### 7.1 命名规范
```typescript
// 类、接口、枚举：PascalCase
class TransferService {}
interface AccountRepository {}
enum TransferStatus { Pending, Success, Failed }

// 变量、函数、方法：camelCase
const accountBalance = 1000;
function calculateFee(amount: number): number {}

// 常量：UPPER_SNAKE_CASE
const MAX_TRANSFER_AMOUNT = 1_000_000;

// 私有属性：以下划线开头（可选，推荐用 private 修饰符）
private _internalState: string;
```

### 7.2 类型使用规范
```typescript
// ✅ 优先使用具体类型，避免 any
function process(data: unknown): string {
  if (typeof data === "string") return data;
  return String(data);
}

// ✅ 使用 readonly 标记不可变属性
interface Config {
  readonly apiKey: string;
  readonly timeout: number;
}

// ✅ 使用枚举代替魔法字符串
enum Currency { CNY = "CNY", USD = "USD", EUR = "EUR" }

// ❌ 避免
let result: any = doSomething();
const status = "pending"; // 用枚举代替
```

### 7.3 函数规范
- 单一职责：一个函数只做一件事
- 参数不超过 3 个，超过则用对象
- 优先使用纯函数（无副作用）
- 异步函数统一使用 `async/await`

---

## 总结

TypeScript 的核心价值在于：
1. **类型安全**：在编译阶段发现错误，而非运行时
2. **自文档化**：类型即文档，代码意图一目了然
3. **工具支持**：IDE 自动补全、重构支持更强大
4. **可维护性**：大型项目中协作更安全

学习 TypeScript 的关键不是记住所有语法，而是培养"**用类型表达意图**"的思维方式。
