/**
 * 账户相关类型定义
 * 第六七周技能任务：定义账户的类型
 */

/**
 * 货币枚举
 */
export enum Currency {
  CNY = "CNY", // 人民币
  USD = "USD", // 美元
  EUR = "EUR", // 欧元
  HKD = "HKD", // 港元
}

/**
 * 账户类型枚举
 */
export enum AccountType {
  CHECKING = "CHECKING",   // 活期账户
  SAVINGS = "SAVINGS",     // 储蓄账户
  BUSINESS = "BUSINESS",   // 企业账户
}

/**
 * 账户状态枚举
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",     // 正常
  FROZEN = "FROZEN",     // 冻结
  CLOSED = "CLOSED",     // 注销
}

/**
 * 账户接口 - 描述账户的基本信息
 */
export interface Account {
  /** 账户唯一标识 */
  id: string;
  /** 账户号码（对外展示） */
  accountNumber: string;
  /** 账户持有人姓名 */
  owner: string;
  /** 账户余额（单位：分，避免浮点精度问题） */
  balance: number;
  /** 货币类型 */
  currency: Currency;
  /** 账户类型 */
  type: AccountType;
  /** 账户状态 */
  status: AccountStatus;
  /** 账户创建时间 */
  readonly createdAt: Date;
  /** 最近更新时间 */
  updatedAt: Date;
}

/**
 * 创建账户的请求参数（不含系统自动生成的字段）
 */
export interface CreateAccountRequest {
  owner: string;
  currency: Currency;
  type: AccountType;
  initialBalance?: number;
}

/**
 * 账户余额信息（对外展示时转换为元）
 */
export interface AccountBalance {
  accountId: string;
  accountNumber: string;
  owner: string;
  /** 余额（元，保留两位小数） */
  balanceInYuan: string;
  currency: Currency;
}
