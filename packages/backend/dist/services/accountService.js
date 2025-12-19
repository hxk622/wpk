"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = exports.AccountService = void 0;
const postgreSQLUserDAO_1 = require("../dao/impl/postgreSQLUserDAO");
const postgreSQLPaymentDAO_1 = require("../dao/impl/postgreSQLPaymentDAO");
const redisCache_1 = require("./redisCache");
// 筹码与真实货币的兑换比例（例如：100筹码 = 1元）
const CHIPS_TO_MONEY_RATIO = 100;
class AccountService {
    constructor() { }
    static getInstance() {
        if (!AccountService.instance) {
            AccountService.instance = new AccountService();
        }
        return AccountService.instance;
    }
    // 支付方式相关功能
    async createPaymentMethod(userId, input) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 创建支付方式
        return postgreSQLPaymentDAO_1.postgreSQLPaymentMethodDAO.create({
            userId,
            methodType: input.methodType,
            accountInfo: input.accountInfo,
            nickname: input.nickname,
            isDefault: input.isDefault || false
        });
    }
    async getPaymentMethods(userId) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 获取用户的支付方式列表
        return postgreSQLPaymentDAO_1.postgreSQLPaymentMethodDAO.getByUserId(userId);
    }
    async getPaymentMethodById(userId, methodId) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 获取支付方式
        const method = await postgreSQLPaymentDAO_1.postgreSQLPaymentMethodDAO.getById(methodId);
        if (!method || method.userId !== userId) {
            return null;
        }
        return method;
    }
    async updatePaymentMethod(userId, methodId, updates) {
        // 验证支付方式是否属于该用户
        const existingMethod = await this.getPaymentMethodById(userId, methodId);
        if (!existingMethod) {
            return null;
        }
        // 更新支付方式
        return postgreSQLPaymentDAO_1.postgreSQLPaymentMethodDAO.update(methodId, updates);
    }
    async deletePaymentMethod(userId, methodId) {
        // 验证支付方式是否属于该用户
        const existingMethod = await this.getPaymentMethodById(userId, methodId);
        if (!existingMethod) {
            return false;
        }
        // 删除支付方式
        return postgreSQLPaymentDAO_1.postgreSQLPaymentMethodDAO.delete(methodId);
    }
    // 交易相关功能
    async deposit(userId, input) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
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
        const transaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.create({
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
            await postgreSQLUserDAO_1.postgreSQLUserDAO.updateChips(userId, user.chips + chipsChange);
            // 更新交易状态为已完成
            const completedTransaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.updateStatus(transaction.id, 'completed');
            if (!completedTransaction) {
                throw new Error('更新交易状态失败');
            }
            // 清除用户缓存
            await redisCache_1.RedisCache.delete(`user:${userId}`);
            return completedTransaction;
        }
        catch (error) {
            // 更新交易状态为失败
            await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.updateStatus(transaction.id, 'failed');
            throw error;
        }
    }
    async withdraw(userId, input) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
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
        const transaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.create({
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
            await postgreSQLUserDAO_1.postgreSQLUserDAO.updateChips(userId, user.chips + chipsChange);
            // 更新交易状态为已完成
            const completedTransaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.updateStatus(transaction.id, 'completed');
            if (!completedTransaction) {
                throw new Error('更新交易状态失败');
            }
            // 清除用户缓存
            await redisCache_1.RedisCache.delete(`user:${userId}`);
            return completedTransaction;
        }
        catch (error) {
            // 更新交易状态为失败
            await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.updateStatus(transaction.id, 'failed');
            throw error;
        }
    }
    async getTransactions(userId, limit = 50, offset = 0) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 获取用户的交易记录
        return postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.getByUserId(userId, limit, offset);
    }
    async getTransactionById(userId, transactionId) {
        // 获取交易记录
        const transaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.getById(transactionId);
        if (!transaction || transaction.userId !== userId) {
            return null;
        }
        return transaction;
    }
    // 游戏相关交易（由游戏逻辑调用）
    async recordGameTransaction(userId, sessionId, type, amount) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 创建游戏交易记录
        const transaction = await postgreSQLPaymentDAO_1.postgreSQLTransactionDAO.create({
            userId,
            type,
            amount: Math.abs(amount) / CHIPS_TO_MONEY_RATIO, // 转换为真实货币金额
            chipsChange: amount,
            status: 'completed',
            gameSessionId: sessionId,
            description: type === 'game_win' ? '游戏获胜' : '游戏失败'
        });
        // 更新用户筹码
        await postgreSQLUserDAO_1.postgreSQLUserDAO.updateChips(userId, user.chips + amount);
        // 清除用户缓存
        await redisCache_1.RedisCache.delete(`user:${userId}`);
        return transaction;
    }
    // 获取账户余额
    async getAccountBalance(userId) {
        // 验证用户是否存在
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
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
exports.AccountService = AccountService;
exports.accountService = AccountService.getInstance();
//# sourceMappingURL=accountService.js.map