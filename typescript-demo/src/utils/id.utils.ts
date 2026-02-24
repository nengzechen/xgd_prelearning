/**
 * ID 生成工具
 */

/**
 * 生成唯一 ID（基于时间戳 + 随机数）
 */
export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * 生成交易流水号
 * 格式：TXN-{yyyyMMdd}-{随机8位}
 */
export function generateTransactionId(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN-${date}-${random}`;
}

/**
 * 生成账户号码
 * 格式：16位数字
 */
export function generateAccountNumber(): string {
  const prefix = "6228"; // 模拟银行卡前缀
  const suffix = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${prefix}${suffix}`;
}
