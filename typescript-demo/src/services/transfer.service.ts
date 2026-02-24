/**
 * 转账服务实现
 * 第六七周技能任务：实现一个转账服务，返回转账的结果
 */

import { AccountStatus } from "../types/account.types";
import {
  ITransferService,
  TransferErrorCode,
  TransferRecord,
  TransferRequest,
  TransferResult,
  TransferStatus,
  TransferType,
} from "../types/transfer.types";
import { generateId, generateTransactionId } from "../utils/id.utils";
import { isValidAmount } from "../utils/money.utils";
import { AccountService } from "./account.service";

/** 单笔转账日限额（单位：分），默认 10万元 */
const DAILY_TRANSFER_LIMIT = 10_000_000;

/** 手续费率（行内转账免费，跨行0.1%，最低1分钱） */
const EXTERNAL_FEE_RATE = 0.001;

export class TransferService implements ITransferService {
  private records: Map<string, TransferRecord> = new Map();
  // 记录每个账户今日已转出总额（key: accountId-yyyyMMdd）
  private dailyStats: Map<string, number> = new Map();

  constructor(private readonly accountService: AccountService) {}

  /**
   * 执行转账
   */
  async transfer(request: TransferRequest): Promise<TransferResult> {
    const timestamp = new Date();

    // 1. 验证请求
    const validationError = this.validateRequest(request);
    if (validationError) {
      return this.buildFailResult(validationError.code, validationError.message, timestamp);
    }

    // 2. 查询账户
    const fromAccount = this.accountService.findById(request.fromAccountId);
    const toAccount = this.accountService.findById(request.toAccountId);

    if (!fromAccount) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_NOT_FOUND,
        `转出账户不存在：${request.fromAccountId}`,
        timestamp
      );
    }
    if (!toAccount) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_NOT_FOUND,
        `转入账户不存在：${request.toAccountId}`,
        timestamp
      );
    }

    // 3. 验证账户状态
    if (fromAccount.status === AccountStatus.FROZEN) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_FROZEN,
        "转出账户已冻结",
        timestamp
      );
    }
    if (fromAccount.status === AccountStatus.CLOSED) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_CLOSED,
        "转出账户已注销",
        timestamp
      );
    }
    if (toAccount.status === AccountStatus.FROZEN) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_FROZEN,
        "转入账户已冻结",
        timestamp
      );
    }
    if (toAccount.status === AccountStatus.CLOSED) {
      return this.buildFailResult(
        TransferErrorCode.ACCOUNT_CLOSED,
        "转入账户已注销",
        timestamp
      );
    }

    // 4. 验证货币类型
    if (fromAccount.currency !== request.currency || toAccount.currency !== request.currency) {
      return this.buildFailResult(
        TransferErrorCode.CURRENCY_MISMATCH,
        `货币不匹配：账户货币为 ${fromAccount.currency}，请求货币为 ${request.currency}`,
        timestamp
      );
    }

    // 5. 计算手续费
    const transferType = request.type ?? TransferType.INTERNAL;
    const fee = this.calculateFee(request.amount, transferType);
    const totalDeduct = request.amount + fee;

    // 6. 检查余额
    if (fromAccount.balance < totalDeduct) {
      return this.buildFailResult(
        TransferErrorCode.INSUFFICIENT_BALANCE,
        `余额不足：当前余额 ${fromAccount.balance} 分，需要扣除 ${totalDeduct} 分（含手续费 ${fee} 分）`,
        timestamp
      );
    }

    // 7. 检查日限额
    const todayKey = this.getDailyKey(request.fromAccountId);
    const todayTotal = this.dailyStats.get(todayKey) ?? 0;
    if (todayTotal + request.amount > DAILY_TRANSFER_LIMIT) {
      return this.buildFailResult(
        TransferErrorCode.DAILY_LIMIT_EXCEEDED,
        `超出日转账限额：今日已转出 ${todayTotal} 分，限额 ${DAILY_TRANSFER_LIMIT} 分`,
        timestamp
      );
    }

    // 8. 执行转账（更新余额）
    const newFromBalance = fromAccount.balance - totalDeduct;
    const newToBalance = toAccount.balance + request.amount;

    this.accountService.updateBalance(request.fromAccountId, newFromBalance);
    this.accountService.updateBalance(request.toAccountId, newToBalance);

    // 9. 更新日统计
    this.dailyStats.set(todayKey, todayTotal + request.amount);

    // 10. 生成交易记录
    const transactionId = generateTransactionId();
    const record: TransferRecord = {
      id: generateId("rec"),
      transactionId,
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
      amount: request.amount,
      currency: request.currency,
      fee,
      status: TransferStatus.SUCCESS,
      remark: request.remark,
      createdAt: timestamp,
      completedAt: new Date(),
    };
    this.records.set(record.id, record);

    return {
      success: true,
      transactionId,
      status: TransferStatus.SUCCESS,
      timestamp,
      fromBalance: newFromBalance,
      toBalance: newToBalance,
    };
  }

  /**
   * 查询账户转账历史
   */
  async getTransferHistory(accountId: string, limit: number = 10): Promise<TransferRecord[]> {
    return Array.from(this.records.values())
      .filter(
        (r) => r.fromAccountId === accountId || r.toAccountId === accountId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * 查询交易详情
   */
  async getTransaction(transactionId: string): Promise<TransferRecord | undefined> {
    return Array.from(this.records.values()).find(
      (r) => r.transactionId === transactionId
    );
  }

  /**
   * 验证转账请求
   */
  private validateRequest(
    request: TransferRequest
  ): { code: TransferErrorCode; message: string } | null {
    if (request.fromAccountId === request.toAccountId) {
      return {
        code: TransferErrorCode.SAME_ACCOUNT,
        message: "转入和转出账户不能相同",
      };
    }
    if (!isValidAmount(request.amount)) {
      return {
        code: TransferErrorCode.INVALID_AMOUNT,
        message: `无效金额：${request.amount}，金额必须是正整数（单位：分）`,
      };
    }
    return null;
  }

  /**
   * 计算手续费
   */
  private calculateFee(amount: number, type: TransferType): number {
    if (type === TransferType.INTERNAL) return 0;
    // 跨行手续费：0.1%，最低 1 分
    return Math.max(1, Math.floor(amount * EXTERNAL_FEE_RATE));
  }

  /**
   * 构建失败结果
   */
  private buildFailResult(
    errorCode: TransferErrorCode,
    errorMessage: string,
    timestamp: Date
  ): TransferResult {
    return {
      success: false,
      status: TransferStatus.FAILED,
      errorCode,
      errorMessage,
      timestamp,
    };
  }

  /**
   * 获取日限额统计 key
   */
  private getDailyKey(accountId: string): string {
    const today = new Date().toISOString().split("T")[0];
    return `${accountId}-${today}`;
  }
}
