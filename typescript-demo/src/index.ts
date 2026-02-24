/**
 * 转账服务演示入口
 * 第六七周技能任务：实现转账服务并展示结果
 */

import { Currency } from "./types/account.types";
import { TransferType } from "./types/transfer.types";
import { formatAmount } from "./utils/money.utils";
import { AccountService } from "./services/account.service";
import { TransferService } from "./services/transfer.service";

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("       TypeScript 转账服务演示");
  console.log("=".repeat(60));

  // 初始化服务
  const accountService = new AccountService();
  const transferService = new TransferService(accountService);

  // 初始化示例账户
  const { alice, bob, charlie } = accountService.initSampleData();

  console.log("\n📋 初始账户信息：");
  console.log(`  Alice:   ${alice.accountNumber}  余额：${formatAmount(alice.balance, alice.currency)}`);
  console.log(`  Bob:     ${bob.accountNumber}  余额：${formatAmount(bob.balance, bob.currency)}`);
  console.log(`  Charlie: ${charlie.accountNumber}  余额：${formatAmount(charlie.balance, charlie.currency)}`);

  // --- 场景1：正常转账 ---
  console.log("\n\n【场景1】Alice 向 Bob 转账 ¥100（行内）");
  const result1 = await transferService.transfer({
    fromAccountId: alice.id,
    toAccountId: bob.id,
    amount: 10_000, // 100元 = 10000分
    currency: Currency.CNY,
    remark: "还饭钱",
    type: TransferType.INTERNAL,
  });
  printResult(result1);
  printBalances(accountService, [alice.id, bob.id]);

  // --- 场景2：余额不足 ---
  console.log("\n\n【场景2】Charlie 向 Alice 转账 ¥5000（超出余额）");
  const result2 = await transferService.transfer({
    fromAccountId: charlie.id,
    toAccountId: alice.id,
    amount: 500_000, // 5000元 = 500000分
    currency: Currency.CNY,
    type: TransferType.INTERNAL,
  });
  printResult(result2);

  // --- 场景3：跨行转账（含手续费）---
  console.log("\n\n【场景3】Bob 向 Charlie 跨行转账 ¥200（手续费0.1%）");
  const result3 = await transferService.transfer({
    fromAccountId: bob.id,
    toAccountId: charlie.id,
    amount: 20_000, // 200元 = 20000分
    currency: Currency.CNY,
    remark: "报销",
    type: TransferType.EXTERNAL,
  });
  printResult(result3);
  printBalances(accountService, [bob.id, charlie.id]);

  // --- 场景4：账户冻结 ---
  console.log("\n\n【场景4】冻结 Alice 账户后尝试转账");
  accountService.freezeAccount(alice.id);
  const result4 = await transferService.transfer({
    fromAccountId: alice.id,
    toAccountId: bob.id,
    amount: 5_000,
    currency: Currency.CNY,
  });
  printResult(result4);

  // --- 场景5：相同账户转账 ---
  console.log("\n\n【场景5】转入转出账户相同（非法操作）");
  const result5 = await transferService.transfer({
    fromAccountId: bob.id,
    toAccountId: bob.id,
    amount: 1_000,
    currency: Currency.CNY,
  });
  printResult(result5);

  // --- 查询转账历史 ---
  console.log("\n\n【查询】Bob 的转账历史（最近 5 条）");
  const history = await transferService.getTransferHistory(bob.id, 5);
  if (history.length === 0) {
    console.log("  暂无转账记录");
  } else {
    history.forEach((rec, i) => {
      const direction = rec.fromAccountId === bob.id ? "转出" : "转入";
      console.log(
        `  ${i + 1}. [${direction}] ${formatAmount(rec.amount, rec.currency)}` +
        ` | 流水号：${rec.transactionId}` +
        ` | ${rec.createdAt.toLocaleTimeString()}`
      );
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("演示完成！");
  console.log("=".repeat(60) + "\n");
}

function printResult(result: ReturnType<typeof Object.create>): void {
  if (result.success) {
    console.log(`  ✅ 转账成功`);
    console.log(`     流水号：${result.transactionId}`);
    if (result.fromBalance !== undefined) {
      console.log(`     转出账户剩余：${formatAmount(result.fromBalance, "CNY")}`);
    }
  } else {
    console.log(`  ❌ 转账失败`);
    console.log(`     错误码：${result.errorCode}`);
    console.log(`     原因：${result.errorMessage}`);
  }
}

function printBalances(accountService: AccountService, ids: string[]): void {
  ids.forEach((id) => {
    const acc = accountService.findById(id);
    if (acc) {
      console.log(`  💰 ${acc.owner} 当前余额：${formatAmount(acc.balance, acc.currency)}`);
    }
  });
}

main().catch(console.error);
