/**
 * 账户服务 - 内存存储实现
 */

import {
  Account,
  AccountStatus,
  AccountType,
  CreateAccountRequest,
  Currency,
} from "../types/account.types";
import { generateAccountNumber, generateId } from "../utils/id.utils";

export class AccountService {
  // 内存存储（模拟数据库）
  private accounts: Map<string, Account> = new Map();

  /**
   * 创建账户
   */
  createAccount(request: CreateAccountRequest): Account {
    const now = new Date();
    const account: Account = {
      id: generateId("acc"),
      accountNumber: generateAccountNumber(),
      owner: request.owner,
      balance: request.initialBalance ?? 0,
      currency: request.currency,
      type: request.type,
      status: AccountStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    this.accounts.set(account.id, account);
    return account;
  }

  /**
   * 根据 ID 查找账户
   */
  findById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  /**
   * 获取所有账户
   */
  findAll(): Account[] {
    return Array.from(this.accounts.values());
  }

  /**
   * 更新账户余额（内部使用，单位：分）
   */
  updateBalance(id: string, newBalance: number): Account {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账户不存在：${id}`);
    }
    account.balance = newBalance;
    account.updatedAt = new Date();
    return account;
  }

  /**
   * 冻结账户
   */
  freezeAccount(id: string): void {
    const account = this.accounts.get(id);
    if (!account) throw new Error(`账户不存在：${id}`);
    account.status = AccountStatus.FROZEN;
    account.updatedAt = new Date();
  }

  /**
   * 解冻账户
   */
  unfreezeAccount(id: string): void {
    const account = this.accounts.get(id);
    if (!account) throw new Error(`账户不存在：${id}`);
    account.status = AccountStatus.ACTIVE;
    account.updatedAt = new Date();
  }

  /**
   * 初始化示例数据
   */
  initSampleData(): { alice: Account; bob: Account; charlie: Account } {
    const alice = this.createAccount({
      owner: "Alice（爱丽丝）",
      currency: Currency.CNY,
      type: AccountType.CHECKING,
      initialBalance: 1_000_000, // 1万元（单位：分）
    });

    const bob = this.createAccount({
      owner: "Bob（鲍勃）",
      currency: Currency.CNY,
      type: AccountType.SAVINGS,
      initialBalance: 500_000, // 5千元（单位：分）
    });

    const charlie = this.createAccount({
      owner: "Charlie（查理）",
      currency: Currency.CNY,
      type: AccountType.CHECKING,
      initialBalance: 200_000, // 2千元（单位：分）
    });

    return { alice, bob, charlie };
  }
}
