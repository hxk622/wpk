"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgreSQLUserDAO = exports.PostgreSQLUserDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const redisCache_1 = require("../../services/redisCache");
class PostgreSQLUserDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLUserDAO.TABLE_NAME} (username, password_hash, email, phone, avatar, balance, role, chips)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [entity.username, entity.password_hash, entity.email, entity.phone, entity.avatar, entity.balance || 0, entity.role || 'player', entity.chips]);
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        if (user.email) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        }
        if (user.phone) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        }
        return user;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedUser = await redisCache_1.RedisCache.get(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedUser) {
            return cachedUser;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLUserDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        if (user.email) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        }
        if (user.phone) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        }
        return user;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key === 'password' ? 'password_hash' : key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLUserDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        if (user.email) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        }
        if (user.phone) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        }
        return user;
    }
    async delete(id) {
        const user = await this.getById(id);
        if (!user) {
            return false;
        }
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLUserDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除所有相关缓存
        await redisCache_1.RedisCache.deleteBatch([
            `${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${id}`,
            `${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`,
            ...(user.email ? [`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`] : []),
            ...(user.phone ? [`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`] : [])
        ]);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLUserDAO.TABLE_NAME}`);
        return result.rows.map(row => ({
            ...row,
            password_hash: row.password_hash,
            balance: row.balance || 0,
            role: row.role || 'player',
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
    async getByUsername(username) {
        // 先从缓存获取
        const cachedUser = await redisCache_1.RedisCache.get(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${username}`);
        if (cachedUser) {
            return cachedUser;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLUserDAO.TABLE_NAME} WHERE username = $1`, [username]);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        return user;
    }
    async getByEmail(email) {
        // 先从缓存获取
        const cachedUser = await redisCache_1.RedisCache.get(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${email}`);
        if (cachedUser) {
            return cachedUser;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLUserDAO.TABLE_NAME} WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        return user;
    }
    async getByPhone(phone) {
        // 先从缓存获取
        const cachedUser = await redisCache_1.RedisCache.get(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${phone}`);
        if (cachedUser) {
            return cachedUser;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLUserDAO.TABLE_NAME} WHERE phone = $1`, [phone]);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        return user;
    }
    async register(input) {
        const { username, password, email, phone } = input;
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLUserDAO.TABLE_NAME} (username, password_hash, email, phone, balance, role, chips)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [username, password, email, phone, 0, 'player', 10000] // 默认初始余额为0，角色为player，筹码为10000
        );
        const userRow = result.rows[0];
        // 映射字段名：password_hash -> password
        const user = {
            ...userRow,
            password: userRow.password_hash
        };
        // 缓存用户信息
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        if (user.email) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        }
        if (user.phone) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        }
        return user;
    }
    async updateChips(userId, chips) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLUserDAO.TABLE_NAME} SET chips = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`, [chips, userId]);
        if (result.rows.length === 0) {
            return null;
        }
        const userRow = result.rows[0];
        // 映射字段名：数据库字段（下划线）-> 接口字段（驼峰）
        const user = {
            ...userRow,
            password_hash: userRow.password_hash,
            balance: userRow.balance || 0,
            role: userRow.role || 'player',
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at
        };
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}${user.id}`, user, 3600);
        await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}username:${user.username}`, user, 3600);
        if (user.email) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}email:${user.email}`, user, 3600);
        }
        if (user.phone) {
            await redisCache_1.RedisCache.set(`${PostgreSQLUserDAO.CACHE_KEY_PREFIX}phone:${user.phone}`, user, 3600);
        }
        return user;
    }
}
exports.PostgreSQLUserDAO = PostgreSQLUserDAO;
PostgreSQLUserDAO.TABLE_NAME = 'users';
PostgreSQLUserDAO.CACHE_KEY_PREFIX = 'user:';
// 创建单例实例
exports.postgreSQLUserDAO = new PostgreSQLUserDAO();
//# sourceMappingURL=postgreSQLUserDAO.js.map