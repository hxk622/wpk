import pool from '../../services/database';
import { PaymentMethod, Transaction } from '../../types';
import { RedisCache } from '../../services/redisCache';

// 支付方式相关DAO
export class PostgreSQLPaymentMethodDAO {
  private static readonly TABLE_NAME = 'payment_methods';
  private static readonly CACHE_KEY_PREFIX = 'payment_method:';

  async create(entity: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    // 如果设置为默认支付方式，先将其他支付方式设为非默认
    if (entity.isDefault) {
      await this.setAllNonDefault(entity.userId);
    }

    const result = await pool.query(
      `INSERT INTO ${PostgreSQLPaymentMethodDAO.TABLE_NAME} (user_id, method_type, account_info, nickname, is_default)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [entity.userId, entity.methodType, entity.accountInfo, entity.nickname, entity.isDefault]
    );

    const paymentMethod = result.rows[0];
    // 缓存支付方式
    await RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
    // 清除用户支付方式列表缓存
    await RedisCache.delete(`payment_methods:user:${entity.userId}`);
    return paymentMethod;
  }

  async getById(id: string): Promise<PaymentMethod | null> {
    // 先从缓存获取
    const cachedMethod = await RedisCache.get<PaymentMethod>(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${id}`);
    if (cachedMethod) {
      return cachedMethod;
    }

    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const paymentMethod = result.rows[0];
    // 缓存支付方式
    await RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
    return paymentMethod;
  }

  async getByUserId(userId: string): Promise<PaymentMethod[]> {
    // 先从缓存获取
    const cachedMethods = await RedisCache.get<PaymentMethod[]>(`payment_methods:user:${userId}`);
    if (cachedMethods) {
      return cachedMethods;
    }

    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    // 缓存用户支付方式列表
    await RedisCache.set(`payment_methods:user:${userId}`, result.rows, 3600);
    return result.rows;
  }

  async update(id: string, entity: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
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

    const result = await pool.query(
      `UPDATE ${PostgreSQLPaymentMethodDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const paymentMethod = result.rows[0];
    // 更新缓存
    await RedisCache.set(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${paymentMethod.id}`, paymentMethod, 3600);
    // 清除用户支付方式列表缓存
    await RedisCache.delete(`payment_methods:user:${paymentMethod.userId}`);
    return paymentMethod;
  }

  async delete(id: string): Promise<boolean> {
    const paymentMethod = await this.getById(id);
    if (!paymentMethod) {
      return false;
    }

    const result = await pool.query(
      `DELETE FROM ${PostgreSQLPaymentMethodDAO.TABLE_NAME} WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return false;
    }

    // 删除缓存
    await RedisCache.delete(`${PostgreSQLPaymentMethodDAO.CACHE_KEY_PREFIX}${id}`);
    // 清除用户支付方式列表缓存
    await RedisCache.delete(`payment_methods:user:${paymentMethod.userId}`);
    return true;
  }

  private async setAllNonDefault(userId: string): Promise<void> {
    await pool.query(
      `UPDATE ${PostgreSQLPaymentMethodDAO.TABLE_NAME} SET is_default = false, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );
  }
}

// 交易记录相关DAO
export class PostgreSQLTransactionDAO {
  private static readonly TABLE_NAME = 'transactions';
  private static readonly CACHE_KEY_PREFIX = 'transaction:';

  async create(entity: Omit<Transaction, 'id' | 'createdAt' | 'completedAt'>): Promise<Transaction> {
    const result = await pool.query(
      `INSERT INTO ${PostgreSQLTransactionDAO.TABLE_NAME} (user_id, type, amount, chips_change, status, payment_method_id, game_session_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        entity.userId,
        entity.type,
        entity.amount,
        entity.chipsChange,
        entity.status,
        entity.paymentMethodId,
        entity.gameSessionId,
        entity.description
      ]
    );

    const transaction = result.rows[0];
    // 缓存交易记录
    await RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
    // 清除用户交易记录列表缓存
    await RedisCache.delete(`transactions:user:${entity.userId}`);
    return transaction;
  }

  async getById(id: string): Promise<Transaction | null> {
    // 先从缓存获取
    const cachedTransaction = await RedisCache.get<Transaction>(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${id}`);
    if (cachedTransaction) {
      return cachedTransaction;
    }

    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const transaction = result.rows[0];
    // 缓存交易记录
    await RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
    return transaction;
  }

  async getByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    // 先从缓存获取
    const cacheKey = `transactions:user:${userId}:${limit}:${offset}`;
    const cachedTransactions = await RedisCache.get<Transaction[]>(cacheKey);
    if (cachedTransactions) {
      return cachedTransactions;
    }

    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // 缓存用户交易记录列表
    await RedisCache.set(cacheKey, result.rows, 3600);
    return result.rows;
  }

  async updateStatus(id: string, status: Transaction['status']): Promise<Transaction | null> {
    const result = await pool.query(
      `UPDATE ${PostgreSQLTransactionDAO.TABLE_NAME} SET status = $1, completed_at = $2 WHERE id = $3 RETURNING *`,
      [status, status === 'completed' ? new Date() : null, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const transaction = result.rows[0];
    // 更新缓存
    await RedisCache.set(`${PostgreSQLTransactionDAO.CACHE_KEY_PREFIX}${transaction.id}`, transaction, 3600);
    // 清除用户交易记录列表缓存
    await RedisCache.delete(`transactions:user:${transaction.userId}`);
    return transaction;
  }

  async getByStatus(status: Transaction['status'], limit: number = 100): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLTransactionDAO.TABLE_NAME} WHERE status = $1 ORDER BY created_at DESC LIMIT $2`,
      [status, limit]
    );

    return result.rows;
  }
}

// 创建单例实例
export const postgreSQLPaymentMethodDAO = new PostgreSQLPaymentMethodDAO();
export const postgreSQLTransactionDAO = new PostgreSQLTransactionDAO();