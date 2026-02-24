/**
 * 转账相关类型定义
 * 第六七周技能任务：定义转账的类型
 */

import { Currency } from "./account.types";

/**
 * 转账状态枚举
 */
export enum TransferStatus {
  PENDING = "PENDING",     // 待处理
  PROCESSING = "PROCESSING", // 处理中
  SUCCESS = "SUCCESS",     // 成功
  FAILED = "FAILED",       // 失败
  CANCELLED = "CANCELLED", // 已取消
}

/**
 * 转账类型枚举
 */
export enum TransferType {
  INTERNAL = "INTERNAL",   // 行内转账
  EXTERNAL = "EXTERNAL",   // 跨行转账
}

/**
 * 转账错误码枚举
 */
export enum TransferErrorCode {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE", // 余额不足
  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",       // 账户不存在
  ACCOUNT_FROZEN = "ACCOUNT_FROZEN",             // 账户冻结
  ACCOUNT_CLOSED = "ACCOUNT_CLOSED",             // 账户注销
  CURRENCY_MISMATCH = "CURRENCY_MISMATCH",       // 货币不匹配
  INVALID_AMOUNT = "INVALID_AMOUNT",             // 无效金额
  DAILY_LIMIT_EXCEEDED = "DAILY_LIMIT_EXCEEDED", // 超出日限额
  SAME_ACCOUNT = "SAME_ACCOUNT",                 // 转入转出账户相同
  SYSTEM_ERROR = "SYSTEM_ERROR",                 // 系统错误
}

/**
 * 转账请求接口
 */
export interface TransferRequest {
  /** 转出账户 ID */
  fromAccountId: string;
  /** 转入账户 ID */
  toAccountId: string;
  /** 转账金额（单位：分） */
  amount: number;
  /** 货币类型 */
  currency: Currency;
  /** 转账备注（可选） */
  remark?: string;
  /** 转账类型 */
  type?: TransferType;
}

/**
 * 转账结果接口
 */
export interface TransferResult {
  /** 是否成功 */
  success: boolean;
  /** 交易流水号（成功时存在） */
  transactionId?: string;
  /** 转账状态 */
  status: TransferStatus;
  /** 错误码（失败时存在） */
  errorCode?: TransferErrorCode;
  /** 错误信息（失败时存在） */
  errorMessage?: string;
  /** 转账完成时间 */
  timestamp: Date;
  /** 转出账户余额（成功时，单位：分） */
  fromBalance?: number;
  /** 转入账户余额（成功时，单位：分） */
  toBalance?: number;
}

/**
 * 转账记录接口（持久化存储的转账历史）
 */
export interface TransferRecord {
  /** 记录唯一 ID */
  id: string;
  /** 交易流水号 */
  transactionId: string;
  /** 转出账户 ID */
  fromAccountId: string;
  /** 转入账户 ID */
  toAccountId: string;
  /** 转账金额（单位：分） */
  amount: number;
  /** 货币类型 */
  currency: Currency;
  /** 手续费（单位：分） */
  fee: number;
  /** 转账状态 */
  status: TransferStatus;
  /** 转账备注 */
  remark?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 完成时间 */
  completedAt?: Date;
}

/**
 * 转账服务接口 - 函数类型接口示例
 */
export interface ITransferService {
  /**
   * 执行转账
   * @param request 转账请求
   * @returns 转账结果
   */
  transfer(request: TransferRequest): Promise<TransferResult>;

  /**
   * 查询账户转账历史
   * @param accountId 账户 ID
   * @param limit 最大记录数
   */
  getTransferHistory(accountId: string, limit?: number): Promise<TransferRecord[]>;

  /**
   * 查询交易详情
   * @param transactionId 交易流水号
   */
  getTransaction(transactionId: string): Promise<TransferRecord | undefined>;
}
