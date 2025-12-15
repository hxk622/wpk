import { User } from '../types';
import { postgreSQLUserDAO } from '../dao/impl/postgreSQLUserDAO';
import { postgreSQLPaymentMethodDAO, postgreSQLTransactionDAO } from '../dao/impl/postgreSQLPaymentDAO';
import { PaymentMethod, Transaction, CreatePaymentMethodInput, DepositInput, WithdrawInput } from '../types';
import { RedisCache } from './redisCache';

// 筹码与真实货币的兑换比例（例如：100筹码 = 1元）
const CHIPS_TO_MONEY_RATIO = 100;

export class AccountService {
  private static instance: AccountService;

  private constructor() {}

  static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  // 支付方式相关功能
  async createPaymentMethod(userId: string, input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 创建支付方式
    return postgreSQLPaymentMethodDAO.create({
      userId,
      methodType: input.methodType,
      accountInfo: input.accountInfo,
      nickname: input.nickname,
      isDefault: input.isDefault || false
    });
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户的支付方式列表
    return postgreSQLPaymentMethodDAO.getByUserId(userId);
  }

  async getPaymentMethodById(userId: string, methodId: string): Promise<PaymentMethod | null> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取支付方式
    const method = await postgreSQLPaymentMethodDAO.getById(methodId);
    if (!method || method.userId !== userId) {
      return null;
    }

    return method;
  }

  async updatePaymentMethod(userId: string, methodId: string, updates: Partial<CreatePaymentMethodInput>): Promise<PaymentMethod | null> {
    // 验证支付方式是否属于该用户
    const existingMethod = await this.getPaymentMethodById(userId, methodId);
    if (!existingMethod) {
      return null;
    }

    // 更新支付方式
    return postgreSQLPaymentMethodDAO.update(methodId, updates);
  }

  async deletePaymentMethod(userId: string, methodId: string): Promise<boolean> {
    // 验证支付方式是否属于该用户
    const existingMethod = await this.getPaymentMethodById(userId, methodId);
    if (!existingMethod) {
      return false;
    }

    // 删除支付方式
    return postgreSQLPaymentMethodDAO.delete(methodId);
  }

  // 交易相关功能
  async deposit(userId: string, input: DepositInput): Promise<Transaction> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证支付方式是否存在且属于该用户
    const paymentMethod = await this.getPaymentMethodById(userId, input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error('支付方式不存在');
    }

    // 计算筹码变化（充值金额 * 兑换比例）
    const chipsChange = input.amount * CHIPS_TO_MONEY_RATIO;

    // 创建交易记录（待处理状态）
    const transaction = await postgreSQLTransactionDAO.create({
      userId,
      type: 'deposit',
      amount: input.amount,
      chipsChange,
      status: 'pending',
      paymentMethodId: input.paymentMethodId,
      description: input.description || `充值 ${input.amount} 元`
    });

    try {
      // 更新用户筹码
      await postgreSQLUserDAO.updateChips(userId, user.chips + chipsChange);

      // 更新交易状态为已完成
      const completedTransaction = await postgreSQLTransactionDAO.updateStatus(transaction.id, 'completed');
      if (!completedTransaction) {
        throw new Error('更新交易状态失败');
      }

      // 清除用户缓存
      await RedisCache.delete(`user:${userId}`);

      return completedTransaction;
    } catch (error) {
      // 更新交易状态为失败
      await postgreSQLTransactionDAO.updateStatus(transaction.id, 'failed');
      throw error;
    }
  }

  async withdraw(userId: string, input: WithdrawInput): Promise<Transaction> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证支付方式是否存在且属于该用户
    const paymentMethod = await this.getPaymentMethodById(userId, input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error('支付方式不存在');
    }

    // 计算需要扣除的筹码（提现金额 * 兑换比例）
    const chipsChange = -input.amount * CHIPS_TO_MONEY_RATIO;

    // 验证用户筹码是否足够
    if (user.chips < Math.abs(chipsChange)) {
      throw new Error('筹码不足');
    }

    // 创建交易记录（待处理状态）
    const transaction = await postgreSQLTransactionDAO.create({
      userId,
      type: 'withdraw',
      amount: input.amount,
      chipsChange,
      status: 'pending',
      paymentMethodId: input.paymentMethodId,
      description: input.description || `提现 ${input.amount} 元`
    });

    try {
      // 更新用户筹码
      await postgreSQLUserDAO.updateChips(userId, user.chips + chipsChange);

      // 更新交易状态为已完成
      const completedTransaction = await postgreSQLTransactionDAO.updateStatus(transaction.id, 'completed');
      if (!completedTransaction) {
        throw new Error('更新交易状态失败');
      }

      // 清除用户缓存
      await RedisCache.delete(`user:${userId}`);

      return completedTransaction;
    } catch (error) {
      // 更新交易状态为失败
      await postgreSQLTransactionDAO.updateStatus(transaction.id, 'failed');
      throw error;
    }
  }

  async getTransactions(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户的交易记录
    return postgreSQLTransactionDAO.getByUserId(userId, limit, offset);
  }

  async getTransactionById(userId: string, transactionId: string): Promise<Transaction | null> {
    // 获取交易记录
    const transaction = await postgreSQLTransactionDAO.getById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      return null;
    }

    return transaction;
  }

  // 游戏相关交易（由游戏逻辑调用）
  async recordGameTransaction(userId: string, sessionId: string, type: 'game_win' | 'game_loss', amount: number): Promise<Transaction> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 创建游戏交易记录
    const transaction = await postgreSQLTransactionDAO.create({
      userId,
      type,
      amount: Math.abs(amount) / CHIPS_TO_MONEY_RATIO, // 转换为真实货币金额
      chipsChange: amount,
      status: 'completed',
      gameSessionId: sessionId,
      description: type === 'game_win' ? '游戏获胜' : '游戏失败'
    });

    // 更新用户筹码
    await postgreSQLUserDAO.updateChips(userId, user.chips + amount);

    // 清除用户缓存
    await RedisCache.delete(`user:${userId}`);

    return transaction;
  }

  // 获取账户余额
  async getAccountBalance(userId: string): Promise<{ chips: number; moneyEquivalent: number }> {
    // 验证用户是否存在
    const user = await postgreSQLUserDAO.getById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 计算账户余额的货币等价物
    const moneyEquivalent = user.chips / CHIPS_TO_MONEY_RATIO;

    return {
      chips: user.chips,
      moneyEquivalent
    };
  }
}

export const accountService = AccountService.getInstance();
