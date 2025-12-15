"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLBlindStructureDAO = exports.PostgreSQLTournamentRankingDAO = exports.PostgreSQLTournamentRegistrationDAO = exports.PostgreSQLTournamentDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const redisCache_1 = require("../../services/redisCache");
// 锦标赛DAO实现
class PostgreSQLTournamentDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLTournamentDAO.TABLE_NAME} 
       (name, description, buy_in, prize_pool, max_players, current_players, status, start_time, blind_structure_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            entity.name,
            entity.description,
            entity.buy_in,
            entity.prize_pool,
            entity.max_players,
            entity.current_players,
            entity.status,
            entity.start_time,
            entity.blind_structure_id
        ]);
        const tournament = result.rows[0];
        // 缓存锦标赛信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentDAO.CACHE_KEY_PREFIX}${tournament.id}`, tournament, 3600);
        return tournament;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedTournament = await redisCache_1.RedisCache.get(`${PostgreSQLTournamentDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedTournament) {
            return cachedTournament;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const tournament = result.rows[0];
        // 缓存锦标赛信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentDAO.CACHE_KEY_PREFIX}${tournament.id}`, tournament, 3600);
        return tournament;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLTournamentDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const tournament = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentDAO.CACHE_KEY_PREFIX}${tournament.id}`, tournament, 3600);
        return tournament;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLTournamentDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount !== null && result.rowCount > 0) {
            // 删除缓存
            await redisCache_1.RedisCache.delete(`${PostgreSQLTournamentDAO.CACHE_KEY_PREFIX}${id}`);
            return true;
        }
        return false;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentDAO.TABLE_NAME} ORDER BY created_at DESC`);
        return result.rows;
    }
    async getByStatus(status) {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentDAO.TABLE_NAME} WHERE status = $1 ORDER BY start_time ASC`, [status]);
        return result.rows;
    }
    async getUpcomingTournaments(limit = 10) {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentDAO.TABLE_NAME} 
       WHERE status = 'registration' OR (status = 'in_progress' AND start_time > NOW())
       ORDER BY start_time ASC LIMIT $1`, [limit]);
        return result.rows;
    }
    async getUserTournaments(userId) {
        const result = await database_1.default.query(`SELECT t.* FROM ${PostgreSQLTournamentDAO.TABLE_NAME} t
       JOIN tournament_registrations tr ON t.id = tr.tournament_id
       WHERE tr.user_id = $1 ORDER BY t.start_time DESC`, [userId]);
        return result.rows;
    }
}
exports.PostgreSQLTournamentDAO = PostgreSQLTournamentDAO;
PostgreSQLTournamentDAO.TABLE_NAME = 'tournaments';
PostgreSQLTournamentDAO.CACHE_KEY_PREFIX = 'tournament:';
// 锦标赛注册DAO实现
class PostgreSQLTournamentRegistrationDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} 
       (tournament_id, user_id, registration_time, buy_in_paid, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
            entity.tournament_id,
            entity.user_id,
            entity.registration_time,
            entity.buy_in_paid,
            entity.status
        ]);
        const registration = result.rows[0];
        // 缓存注册信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${registration.id}`, registration, 3600);
        return registration;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedRegistration = await redisCache_1.RedisCache.get(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedRegistration) {
            return cachedRegistration;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const registration = result.rows[0];
        // 缓存注册信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${registration.id}`, registration, 3600);
        return registration;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const registration = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${registration.id}`, registration, 3600);
        return registration;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount !== null && result.rowCount > 0) {
            // 删除缓存
            await redisCache_1.RedisCache.delete(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${id}`);
            return true;
        }
        return false;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} ORDER BY registration_time DESC`);
        return result.rows;
    }
    async getByTournamentId(tournamentId) {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} 
       WHERE tournament_id = $1 ORDER BY registration_time ASC`, [tournamentId]);
        return result.rows;
    }
    async getByTournamentAndUserId(tournamentId, userId) {
        const cacheKey = `${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${tournamentId}:${userId}`;
        // 先从缓存获取
        const cachedRegistration = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedRegistration) {
            return cachedRegistration;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} 
       WHERE tournament_id = $1 AND user_id = $2`, [tournamentId, userId]);
        if (result.rows.length === 0) {
            return null;
        }
        const registration = result.rows[0];
        // 缓存注册信息
        await redisCache_1.RedisCache.set(cacheKey, registration, 3600);
        return registration;
    }
    async updateRegistrationStatus(registrationId, status) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLTournamentRegistrationDAO.TABLE_NAME} SET status = $1
       WHERE id = $2 RETURNING *`, [status, registrationId]);
        if (result.rows.length === 0) {
            return null;
        }
        const registration = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${registration.id}`, registration, 3600);
        // 更新复合缓存键
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX}${registration.tournament_id}:${registration.user_id}`, registration, 3600);
        return registration;
    }
}
exports.PostgreSQLTournamentRegistrationDAO = PostgreSQLTournamentRegistrationDAO;
PostgreSQLTournamentRegistrationDAO.TABLE_NAME = 'tournament_registrations';
PostgreSQLTournamentRegistrationDAO.CACHE_KEY_PREFIX = 'tournament_registration:';
// 锦标赛排名DAO实现
class PostgreSQLTournamentRankingDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLTournamentRankingDAO.TABLE_NAME} 
       (tournament_id, user_id, rank, prize, chips, eliminated_round, eliminated_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [
            entity.tournament_id,
            entity.user_id,
            entity.rank,
            entity.prize,
            entity.chips,
            entity.eliminated_round,
            entity.eliminated_reason
        ]);
        const ranking = result.rows[0];
        // 缓存排名信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${ranking.id}`, ranking, 3600);
        return ranking;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedRanking = await redisCache_1.RedisCache.get(`${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedRanking) {
            return cachedRanking;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRankingDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const ranking = result.rows[0];
        // 缓存排名信息
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${ranking.id}`, ranking, 3600);
        return ranking;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLTournamentRankingDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const ranking = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${ranking.id}`, ranking, 3600);
        return ranking;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLTournamentRankingDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount !== null && result.rowCount > 0) {
            // 删除缓存
            await redisCache_1.RedisCache.delete(`${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${id}`);
            return true;
        }
        return false;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRankingDAO.TABLE_NAME} ORDER BY tournament_id, rank ASC`);
        return result.rows;
    }
    async getByTournamentId(tournamentId) {
        const cacheKey = `${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}tournament:${tournamentId}`;
        // 先从缓存获取
        const cachedRankings = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedRankings) {
            return cachedRankings;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRankingDAO.TABLE_NAME} 
       WHERE tournament_id = $1 ORDER BY rank ASC`, [tournamentId]);
        const rankings = result.rows;
        // 缓存排名信息
        await redisCache_1.RedisCache.set(cacheKey, rankings, 3600);
        return rankings;
    }
    async getByTournamentAndUserId(tournamentId, userId) {
        const cacheKey = `${PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX}${tournamentId}:${userId}`;
        // 先从缓存获取
        const cachedRanking = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedRanking) {
            return cachedRanking;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLTournamentRankingDAO.TABLE_NAME} 
       WHERE tournament_id = $1 AND user_id = $2`, [tournamentId, userId]);
        if (result.rows.length === 0) {
            return null;
        }
        const ranking = result.rows[0];
        // 缓存排名信息
        await redisCache_1.RedisCache.set(cacheKey, ranking, 3600);
        return ranking;
    }
}
exports.PostgreSQLTournamentRankingDAO = PostgreSQLTournamentRankingDAO;
PostgreSQLTournamentRankingDAO.TABLE_NAME = 'tournament_rankings';
PostgreSQLTournamentRankingDAO.CACHE_KEY_PREFIX = 'tournament_ranking:';
// 盲注结构DAO实现
class PostgreSQLBlindStructureDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLBlindStructureDAO.TABLE_NAME} 
       (name, description, levels)
       VALUES ($1, $2, $3) RETURNING *`, [
            entity.name,
            entity.description,
            JSON.stringify(entity.levels)
        ]);
        const structure = result.rows[0];
        // 解析JSON字段
        structure.levels = JSON.parse(structure.levels);
        // 缓存盲注结构
        await redisCache_1.RedisCache.set(`${PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX}${structure.id}`, structure, 3600);
        return structure;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedStructure = await redisCache_1.RedisCache.get(`${PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedStructure) {
            return cachedStructure;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLBlindStructureDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const structure = result.rows[0];
        // 解析JSON字段
        structure.levels = JSON.parse(structure.levels);
        // 缓存盲注结构
        await redisCache_1.RedisCache.set(`${PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX}${structure.id}`, structure, 3600);
        return structure;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => {
            // 特殊处理JSON字段
            if (key === 'levels') {
                return `${key} = $${index + 2}`;
            }
            return `${key} = $${index + 2}`;
        })
            .join(', ');
        // 处理JSON字段值
        const values = Object.entries(entity).map(([key, value]) => {
            if (key === 'levels') {
                return JSON.stringify(value);
            }
            return value;
        });
        values.push(id);
        const result = await database_1.default.query(`UPDATE ${PostgreSQLBlindStructureDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const structure = result.rows[0];
        // 解析JSON字段
        structure.levels = JSON.parse(structure.levels);
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX}${structure.id}`, structure, 3600);
        return structure;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLBlindStructureDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount !== null && result.rowCount > 0) {
            // 删除缓存
            await redisCache_1.RedisCache.delete(`${PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX}${id}`);
            return true;
        }
        return false;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLBlindStructureDAO.TABLE_NAME} ORDER BY name ASC`);
        // 解析所有JSON字段
        return result.rows.map(row => ({
            ...row,
            levels: JSON.parse(row.levels)
        }));
    }
    async getDefaultStructure() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLBlindStructureDAO.TABLE_NAME} 
       WHERE name = 'Default' LIMIT 1`);
        if (result.rows.length === 0) {
            return null;
        }
        const structure = result.rows[0];
        // 解析JSON字段
        structure.levels = JSON.parse(structure.levels);
        return structure;
    }
}
exports.PostgreSQLBlindStructureDAO = PostgreSQLBlindStructureDAO;
PostgreSQLBlindStructureDAO.TABLE_NAME = 'blind_structures';
PostgreSQLBlindStructureDAO.CACHE_KEY_PREFIX = 'blind_structure:';
//# sourceMappingURL=postgreSQLTournamentDAO.js.map