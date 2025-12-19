"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgreSQLCommunityCardsDAO = exports.postgreSQLActionDAO = exports.postgreSQLPlayerSessionDAO = exports.postgreSQLGameSessionDAO = exports.PostgreSQLCommunityCardsDAO = exports.PostgreSQLActionDAO = exports.PostgreSQLPlayerSessionDAO = exports.PostgreSQLGameSessionDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const redisCache_1 = require("../../services/redisCache");
class PostgreSQLGameSessionDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLGameSessionDAO.TABLE_NAME} (room_id, dealer_id, pot, current_round, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [entity.room_id, entity.dealer_id, entity.pot, entity.current_round, entity.status]);
        const session = result.rows[0];
        // 缓存游戏会话
        await redisCache_1.RedisCache.set(`${PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX}${session.id}`, session, 3600);
        return session;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedSession = await redisCache_1.RedisCache.get(`${PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedSession) {
            return cachedSession;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLGameSessionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const session = result.rows[0];
        // 缓存游戏会话
        await redisCache_1.RedisCache.set(`${PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX}${session.id}`, session, 3600);
        return session;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLGameSessionDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const session = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX}${session.id}`, session, 3600);
        return session;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLGameSessionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX}${id}`);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLGameSessionDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getSessionsByRoom(roomId) {
        // 先从缓存获取
        const cachedSessions = await redisCache_1.RedisCache.get(`game_sessions:room:${roomId}`);
        if (cachedSessions) {
            return cachedSessions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLGameSessionDAO.TABLE_NAME} WHERE room_id = $1`, [roomId]);
        // 缓存房间游戏会话列表
        await redisCache_1.RedisCache.set(`game_sessions:room:${roomId}`, result.rows, 300);
        return result.rows;
    }
    async getActiveSessions() {
        // 先从缓存获取
        const cachedSessions = await redisCache_1.RedisCache.get('game_sessions:active');
        if (cachedSessions) {
            return cachedSessions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLGameSessionDAO.TABLE_NAME} WHERE status = $1`, ['in_progress']);
        // 缓存活跃游戏会话列表
        await redisCache_1.RedisCache.set('game_sessions:active', result.rows, 60);
        return result.rows;
    }
    async updateRound(sessionId, round) {
        return this.update(sessionId, { current_round: round });
    }
    async updateStatus(sessionId, status) {
        return this.update(sessionId, { status });
    }
    async updatePot(sessionId, pot) {
        return this.update(sessionId, { pot });
    }
}
exports.PostgreSQLGameSessionDAO = PostgreSQLGameSessionDAO;
PostgreSQLGameSessionDAO.TABLE_NAME = 'game_sessions';
PostgreSQLGameSessionDAO.CACHE_KEY_PREFIX = 'game_session:';
class PostgreSQLPlayerSessionDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLPlayerSessionDAO.TABLE_NAME} (session_id, player_id, hole_cards, chips_in_pot, chips_remaining, status, position, seat_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [entity.session_id, entity.player_id, JSON.stringify(entity.hole_cards), entity.chips_in_pot, entity.chips_remaining, entity.status, entity.position, entity.seat_number]);
        const playerSession = result.rows[0];
        // 缓存玩家会话
        await redisCache_1.RedisCache.set(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${playerSession.id}`, playerSession, 3600);
        return playerSession;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedSession = await redisCache_1.RedisCache.get(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedSession) {
            return cachedSession;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLPlayerSessionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const playerSession = result.rows[0];
        // 缓存玩家会话
        await redisCache_1.RedisCache.set(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${playerSession.id}`, playerSession, 3600);
        return playerSession;
    }
    async update(id, entity) {
        // 处理hole_cards的JSON序列化
        const processedEntity = { ...entity };
        if (processedEntity.hole_cards) {
            processedEntity.hole_cards = JSON.stringify(processedEntity.hole_cards);
        }
        // 构建更新语句
        const updateFields = Object.entries(processedEntity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(processedEntity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLPlayerSessionDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const playerSession = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${playerSession.id}`, playerSession, 3600);
        return playerSession;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLPlayerSessionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${id}`);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLPlayerSessionDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getPlayersBySession(sessionId) {
        // 先从缓存获取
        const cachedPlayers = await redisCache_1.RedisCache.get(`player_sessions:session:${sessionId}`);
        if (cachedPlayers) {
            return cachedPlayers;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLPlayerSessionDAO.TABLE_NAME} WHERE session_id = $1`, [sessionId]);
        // 缓存会话玩家列表
        await redisCache_1.RedisCache.set(`player_sessions:session:${sessionId}`, result.rows, 300);
        return result.rows;
    }
    async getActiveSessionByPlayer(roomId, playerId) {
        const result = await database_1.default.query(`SELECT ps.* FROM ${PostgreSQLPlayerSessionDAO.TABLE_NAME} ps
       JOIN game_sessions gs ON ps.session_id = gs.id
       WHERE gs.room_id = $1 AND ps.player_id = $2 AND gs.status = $3`, [roomId, playerId, 'in_progress']);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    async updateStatus(sessionId, playerId, status) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLPlayerSessionDAO.TABLE_NAME} SET status = $1
       WHERE session_id = $2 AND player_id = $3 RETURNING *`, [status, sessionId, playerId]);
        if (result.rows.length === 0) {
            return null;
        }
        const playerSession = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${playerSession.id}`, playerSession, 3600);
        // 更新会话玩家列表缓存
        await redisCache_1.RedisCache.delete(`player_sessions:session:${sessionId}`);
        return playerSession;
    }
    async updateChips(sessionId, playerId, chipsInPot, chipsRemaining) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLPlayerSessionDAO.TABLE_NAME} SET chips_in_pot = $1, chips_remaining = $2
       WHERE session_id = $3 AND player_id = $4 RETURNING *`, [chipsInPot, chipsRemaining, sessionId, playerId]);
        if (result.rows.length === 0) {
            return null;
        }
        const playerSession = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX}${playerSession.id}`, playerSession, 3600);
        // 更新会话玩家列表缓存
        await redisCache_1.RedisCache.delete(`player_sessions:session:${sessionId}`);
        return playerSession;
    }
}
exports.PostgreSQLPlayerSessionDAO = PostgreSQLPlayerSessionDAO;
PostgreSQLPlayerSessionDAO.TABLE_NAME = 'player_sessions';
PostgreSQLPlayerSessionDAO.CACHE_KEY_PREFIX = 'player_session:';
class PostgreSQLActionDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLActionDAO.TABLE_NAME} (session_id, player_id, action_type, amount, round)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [entity.session_id, entity.player_id, entity.action_type, entity.amount, entity.round]);
        const action = result.rows[0];
        // 缓存动作记录
        await redisCache_1.RedisCache.set(`${PostgreSQLActionDAO.CACHE_KEY_PREFIX}${action.id}`, action, 3600);
        // 清除会话动作列表缓存
        await redisCache_1.RedisCache.delete(`actions:session:${entity.session_id}`);
        await redisCache_1.RedisCache.delete(`actions:session:${entity.session_id}:round:${entity.round}`);
        return action;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedAction = await redisCache_1.RedisCache.get(`${PostgreSQLActionDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedAction) {
            return cachedAction;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLActionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const action = result.rows[0];
        // 缓存动作记录
        await redisCache_1.RedisCache.set(`${PostgreSQLActionDAO.CACHE_KEY_PREFIX}${action.id}`, action, 3600);
        return action;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLActionDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const action = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLActionDAO.CACHE_KEY_PREFIX}${action.id}`, action, 3600);
        // 清除会话动作列表缓存
        await redisCache_1.RedisCache.delete(`actions:session:${action.session_id}`);
        await redisCache_1.RedisCache.delete(`actions:session:${action.session_id}:round:${action.round}`);
        return action;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLActionDAO.TABLE_NAME} WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        const action = result.rows[0];
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLActionDAO.CACHE_KEY_PREFIX}${id}`);
        // 清除会话动作列表缓存
        await redisCache_1.RedisCache.delete(`actions:session:${action.session_id}`);
        await redisCache_1.RedisCache.delete(`actions:session:${action.session_id}:round:${action.round}`);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLActionDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getActionsBySession(sessionId) {
        // 先从缓存获取
        const cachedActions = await redisCache_1.RedisCache.get(`actions:session:${sessionId}`);
        if (cachedActions) {
            return cachedActions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLActionDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at`, [sessionId]);
        // 缓存会话动作列表
        await redisCache_1.RedisCache.set(`actions:session:${sessionId}`, result.rows, 300);
        return result.rows;
    }
    async getActionsByRound(sessionId, round) {
        // 先从缓存获取
        const cachedActions = await redisCache_1.RedisCache.get(`actions:session:${sessionId}:round:${round}`);
        if (cachedActions) {
            return cachedActions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLActionDAO.TABLE_NAME} WHERE session_id = $1 AND round = $2 ORDER BY created_at`, [sessionId, round]);
        // 缓存会话特定回合动作列表
        await redisCache_1.RedisCache.set(`actions:session:${sessionId}:round:${round}`, result.rows, 300);
        return result.rows;
    }
}
exports.PostgreSQLActionDAO = PostgreSQLActionDAO;
PostgreSQLActionDAO.TABLE_NAME = 'actions';
PostgreSQLActionDAO.CACHE_KEY_PREFIX = 'action:';
class PostgreSQLCommunityCardsDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLCommunityCardsDAO.TABLE_NAME} (session_id, flop, turn, river)
       VALUES ($1, $2, $3, $4) RETURNING *`, [entity.session_id, JSON.stringify(entity.flop), JSON.stringify(entity.turn), JSON.stringify(entity.river)]);
        const communityCards = result.rows[0];
        // 缓存公共牌
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${communityCards.session_id}`, communityCards, 3600);
        return communityCards;
    }
    async getById(id) {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLCommunityCardsDAO.TABLE_NAME} WHERE id = $1`, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    async update(id, entity) {
        // 处理牌的JSON序列化
        const processedEntity = { ...entity };
        if (processedEntity.flop) {
            processedEntity.flop = JSON.stringify(processedEntity.flop);
        }
        if (processedEntity.turn) {
            processedEntity.turn = JSON.stringify(processedEntity.turn);
        }
        if (processedEntity.river) {
            processedEntity.river = JSON.stringify(processedEntity.river);
        }
        // 构建更新语句
        const updateFields = Object.entries(processedEntity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(processedEntity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLCommunityCardsDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const communityCards = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${communityCards.session_id}`, communityCards, 3600);
        return communityCards;
    }
    async delete(id) {
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLCommunityCardsDAO.TABLE_NAME} WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        const communityCards = result.rows[0];
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${communityCards.session_id}`);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLCommunityCardsDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getBySession(sessionId) {
        // 先从缓存获取
        const cachedCards = await redisCache_1.RedisCache.get(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${sessionId}`);
        if (cachedCards) {
            return cachedCards;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLCommunityCardsDAO.TABLE_NAME} WHERE session_id = $1`, [sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const communityCards = result.rows[0];
        // 缓存公共牌
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${sessionId}`, communityCards, 3600);
        return communityCards;
    }
    async updateFlop(sessionId, flop) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLCommunityCardsDAO.TABLE_NAME} SET flop = $1
       WHERE session_id = $2 RETURNING *`, [JSON.stringify(flop), sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const communityCards = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${sessionId}`, communityCards, 3600);
        return communityCards;
    }
    async updateTurn(sessionId, turn) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLCommunityCardsDAO.TABLE_NAME} SET turn = $1
       WHERE session_id = $2 RETURNING *`, [JSON.stringify(turn), sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const communityCards = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${sessionId}`, communityCards, 3600);
        return communityCards;
    }
    async updateRiver(sessionId, river) {
        const result = await database_1.default.query(`UPDATE ${PostgreSQLCommunityCardsDAO.TABLE_NAME} SET river = $1
       WHERE session_id = $2 RETURNING *`, [JSON.stringify(river), sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const communityCards = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX}${sessionId}`, communityCards, 3600);
        return communityCards;
    }
}
exports.PostgreSQLCommunityCardsDAO = PostgreSQLCommunityCardsDAO;
PostgreSQLCommunityCardsDAO.TABLE_NAME = 'community_cards';
PostgreSQLCommunityCardsDAO.CACHE_KEY_PREFIX = 'community_cards:';
// 创建单例实例
exports.postgreSQLGameSessionDAO = new PostgreSQLGameSessionDAO();
exports.postgreSQLPlayerSessionDAO = new PostgreSQLPlayerSessionDAO();
exports.postgreSQLActionDAO = new PostgreSQLActionDAO();
exports.postgreSQLCommunityCardsDAO = new PostgreSQLCommunityCardsDAO();
//# sourceMappingURL=postgreSQLGameDAO.js.map