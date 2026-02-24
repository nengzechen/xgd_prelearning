/**
 * 金额处理工具（避免浮点精度问题，内部以"分"为单位存储）
 */

/**
 * 将元转换为分（输入单位：元，输出单位：分）
 */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

/**
 * 将分转换为元（输入单位：分，输出单位：元）
 */
export function fenToYuan(fen: number): number {
  return fen / 100;
}

/**
 * 格式化金额为带货币符号的字符串
 */
export function formatAmount(fen: number, currency: string): string {
  const yuan = fenToYuan(fen);
  const symbols: Record<string, string> = {
    CNY: "¥",
    USD: "$",
    EUR: "€",
    HKD: "HK$",
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${yuan.toFixed(2)}`;
}

/**
 * 验证金额是否合法（必须是正整数，单位：分）
 */
export function isValidAmount(fen: number): boolean {
  return Number.isInteger(fen) && fen > 0;
}
