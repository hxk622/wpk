"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgreSQLTransactionDAO = exports.postgreSQLPaymentMethodDAO = exports.PostgreSQLTransactionDAO = exports.PostgreSQLPaymentMethodDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const redisCache_1 = require("../../services/redisCache");
// 支付方式相关DAO
class PostgreSQLPaymentMethodDAO {
    async create(entity) {
        // 如果设置为默认支付方式，先将其他支付方式设为非默认
        if (entity.isDefault) {
            await this.setAllNonDefault(entity.userId);
        }
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLPaymentMethodDAO.TABLE_NAME} (user_id, method_type, account_info, nickname, is_default)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [entity.userId, entity.methodType, entity.accountInfo, entity.nickname, entity.isDefault]);
        const paymentMethod = result.rows[0];
        // 缓存支付方式
        await redisCache_1.RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
        // 清除用户支付方式列表缓存
        await redisCache_1.RedisCache.delete(`payment_methods:user:${entity.userId}`);
        return paymentMethod;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedMethod = await redisCache_1.RedisCache.get(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedMethod) {
            return cachedMethod;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const paymentMethod = result.rows[0];
        // 缓存支付方式
        await redisCache_1.RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
        return paymentMethod;
    }
    async getByUserId(userId) {
        // 先从缓存获取
        const cachedMethods = await redisCache_1.RedisCache.get(`payment_methods:user:${userId}`);
        if (cachedMethods) {
            return cachedMethods;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`, [userId]);
        // 缓存用户支付方式列表
        await redisCache_1.RedisCache.set(`payment_methods:user:${userId}`, result.rows, 3600);
        return result.rows;
    }
    async update(id, entity) {
        // 如果设置为默认支付方式，先将其他支付方式设为非默认
        if (entity.isDefault) {
            const method = await this.getById(id);
            if (method) {
                await this.setAllNonDefault(method.userId);
            }
        }
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key === 'methodType' ? 'method_type' : key === 'accountInfo' ? 'account_info' : key === 'isDefault' ? 'is_default' : key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLPaymentMethodDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const paymentMethod = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
        // 清除用户支付方式列表缓存
        await redisCache_1.RedisCache.delete(`payment_methods:user:${paymentMethod.userId}`);
        return paymentMethod;
    }
    async delete(id) {
        const paymentMethod = await this.getById(id);
        if (!paymentMethod) {
            return false;
        }
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${id}`);
        // 清除用户支付方式列表缓存
        await redisCache_1.RedisCache.delete(`payment_methods:user:${paymentMethod.userId}`);
        return true;
    }
    async setAllNonDefault(userId) {
        await database_1.default.query(`UPDATE ${PostgreSQLPaymentMethodDAO.TABLE_NAME} SET is_default = false, updated_at = NOW() WHERE user_id = $1`, [userId]);
    }
}
exports.PostgreSQLPaymentMethodDAO = PostgreSQLPaymentMethodDAO;
PostgreSQLPaymentMethodDAO.TABLE_NAME = 'payment_methods';
PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX = 'payment_method:';
// 交易记录相关DAO
class PostgreSQLTransactionDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLTransactionDAO.TABLE_NAME} (user_id, type, amount, chips_change, status, payment_method_id, game_session_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
            entity.userId,
            entity.type,
            entity.amount,
            entity.chipsChange,
            entity.status,
            entity.paymentMethodId,
            entity.gameSessionId,
            entity.description
        ]);
        const transaction = result.rows[0];
        // 缓存交易记录
        await redisCache_1.RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
        // 清除用户交易记录列表缓存
        await redisCache_1.RedisCache.delete(`transactions:user:${entity.userId}`);
        return transaction;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedTransaction = await redisCache_1.RedisCache.get(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedTransaction) {
            return cachedTransaction;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const transaction = result.rows[0];
        // 缓存交易记录
        await redisCache_1.RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
        return transaction;
    }
    async getByUserId(userId, limit = 50, offset = 0) {
        // 先从缓存获取
        const cacheKey = `transactions:user:${userId}:${limit}:${offset}`;
        const cachedTransactions = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedTransactions) {
            return cachedTransactions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, offset]);
        // 缓存用户交易记录列表
        await redisCache_1.RedisCache.set(cacheKey, result.rows, 3600);
        return result.rows;
    }
    async updateStatus(id, status) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLTransactionDAO.TABLE_NAME} SET status = $1, completed_at = $2 WHERE id = $3 RETURNING *`, [status, status === 'completed' ? new Date() : null, id]);
        if (result.rows.length === 0) {
            return null;
        }
        const transaction = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
        // 清除用户交易记录列表缓存
        await redisCache_1.RedisCache.delete(`transactions:user:${transaction.userId}`);
        return transaction;
    }
    async getByStatus(status, limit = 100) {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE status = $1 ORDER BY created_at DESC LIMIT $2`, [status, limit]);
        return result.rows;
    }
}
exports.PostgreSQLTransactionDAO = PostgreSQLTransactionDAO;
PostgreSQLTransactionDAO.TABLE_NAME = 'transactions';
PostgreSQLTransactionDAO.CACHE_KEY_PREFIX = 'transaction:';
// 创建单例实例
exports.postgreSQLPaymentMethodDAO = new PostgreSQLPaymentMethodDAO();
exports.postgreSQLTransactionDAO = new PostgreSQLTransactionDAO();
//# sourceMappingURL=postgreSQLPaymentDAO.js.map