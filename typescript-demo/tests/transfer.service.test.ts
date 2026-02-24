/**
 * 转账服务单元测试
 */

import {
  AccountStatus,
  AccountType,
  Currency,
} from "../src/types/account.types";
import {
  TransferErrorCode,
  TransferStatus,
  TransferType,
} from "../src/types/transfer.types";
import { AccountService } from "../src/services/account.service";
import { TransferService } from "../src/services/transfer.service";

describe("TransferService", () => {
  let accountService: AccountService;
  let transferService: TransferService;
  let aliceId: string;
  let bobId: string;
  beforeEach(() => {
    accountService = new AccountService();
    transferService = new TransferService(accountService);

    const { alice, bob } = accountService.initSampleData();
    aliceId = alice.id;
    bobId = bob.id;
  });

  // ── 正常转账 ─────────────────────────────────────────────

  describe("正常转账场景", () => {
    it("行内转账成功，余额正确更新", async () => {
      const aliceBefore = accountService.findById(aliceId)!.balance;
      const bobBefore = accountService.findById(bobId)!.balance;
      const amount = 10_000; // 100元

      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount,
        currency: Currency.CNY,
        type: TransferType.INTERNAL,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(TransferStatus.SUCCESS);
      expect(result.transactionId).toBeDefined();
      expect(result.fromBalance).toBe(aliceBefore - amount); // 行内无手续费
      expect(result.toBalance).toBe(bobBefore + amount);
    });

    it("跨行转账成功，手续费正确扣除", async () => {
      const aliceBefore = accountService.findById(aliceId)!.balance;
      const bobBefore = accountService.findById(bobId)!.balance;
      const amount = 10_000; // 100元
      const expectedFee = Math.max(1, Math.floor(amount * 0.001)); // 10分

      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount,
        currency: Currency.CNY,
        type: TransferType.EXTERNAL,
      });

      expect(result.success).toBe(true);
      // 转出：本金 + 手续费
      expect(result.fromBalance).toBe(aliceBefore - amount - expectedFee);
      // 转入：只收本金
      expect(result.toBalance).toBe(bobBefore + amount);
    });

    it("转账记录正确保存，可查询历史", async () => {
      await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: 5_000,
        currency: Currency.CNY,
        remark: "测试备注",
      });

      const history = await transferService.getTransferHistory(aliceId);
      expect(history).toHaveLength(1);
      expect(history[0].fromAccountId).toBe(aliceId);
      expect(history[0].toAccountId).toBe(bobId);
      expect(history[0].amount).toBe(5_000);
      expect(history[0].remark).toBe("测试备注");
    });

    it("可通过流水号查询交易详情", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: 1_000,
        currency: Currency.CNY,
      });

      const record = await transferService.getTransaction(result.transactionId!);
      expect(record).toBeDefined();
      expect(record!.transactionId).toBe(result.transactionId);
    });
  });

  // ── 失败场景 ─────────────────────────────────────────────

  describe("转账失败场景", () => {
    it("转出账户不存在时返回错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: "non-existent-id",
        toAccountId: bobId,
        amount: 1_000,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.ACCOUNT_NOT_FOUND);
    });

    it("转入账户不存在时返回错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: "non-existent-id",
        amount: 1_000,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.ACCOUNT_NOT_FOUND);
    });

    it("余额不足时返回错误，账户余额不变", async () => {
      const aliceBefore = accountService.findById(aliceId)!.balance;

      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: aliceBefore + 1, // 比余额多1分
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.INSUFFICIENT_BALANCE);
      // 余额不变
      expect(accountService.findById(aliceId)!.balance).toBe(aliceBefore);
    });

    it("账户冻结时转账失败", async () => {
      accountService.freezeAccount(aliceId);

      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: 1_000,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.ACCOUNT_FROZEN);
    });

    it("转入和转出账户相同时返回错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: aliceId,
        amount: 1_000,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.SAME_ACCOUNT);
    });

    it("金额为 0 时返回无效金额错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: 0,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.INVALID_AMOUNT);
    });

    it("金额为负数时返回无效金额错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: -100,
        currency: Currency.CNY,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.INVALID_AMOUNT);
    });

    it("货币不匹配时返回错误", async () => {
      const result = await transferService.transfer({
        fromAccountId: aliceId,
        toAccountId: bobId,
        amount: 1_000,
        currency: Currency.USD, // 账户是 CNY，但请求 USD
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(TransferErrorCode.CURRENCY_MISMATCH);
    });
  });

  // ── 账户服务 ─────────────────────────────────────────────

  describe("AccountService", () => {
    it("创建账户时初始余额正确", () => {
      const account = accountService.createAccount({
        owner: "测试用户",
        currency: Currency.CNY,
        type: AccountType.CHECKING,
        initialBalance: 50_000,
      });

      expect(account.id).toBeDefined();
      expect(account.accountNumber).toHaveLength(16);
      expect(account.balance).toBe(50_000);
      expect(account.status).toBe(AccountStatus.ACTIVE);
    });

    it("冻结和解冻账户状态正确", () => {
      accountService.freezeAccount(aliceId);
      expect(accountService.findById(aliceId)!.status).toBe(AccountStatus.FROZEN);

      accountService.unfreezeAccount(aliceId);
      expect(accountService.findById(aliceId)!.status).toBe(AccountStatus.ACTIVE);
    });
  });
});
