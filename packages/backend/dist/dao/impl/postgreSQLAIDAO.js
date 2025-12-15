"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgreSQLAITrainingDataDAO = exports.postgreSQLAISuggestionDAO = exports.postgreSQLAIAnalysisDAO = exports.PostgreSQLAITrainingDataDAO = exports.PostgreSQLAISuggestionDAO = exports.PostgreSQLAIAnalysisDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const redisCache_1 = require("../../services/redisCache");
class PostgreSQLAIAnalysisDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLAIAnalysisDAO.TABLE_NAME} (session_id, user_id, hand_strength, pot_odds, recommended_action, confidence)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [entity.session_id, entity.user_id, entity.hand_strength, entity.pot_odds, entity.recommended_action, entity.confidence]);
        const analysis = result.rows[0];
        // 缓存AI分析记录
        await redisCache_1.RedisCache.set(`${PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX}${analysis.id}`, analysis, 3600);
        // 清除会话分析列表缓存
        await redisCache_1.RedisCache.delete(`ai_analyses:session:${entity.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_analyses:user:${entity.user_id}`);
        // 设置最新分析缓存
        await redisCache_1.RedisCache.set(`ai_analyses:session:${entity.session_id}:latest`, analysis, 3600);
        return analysis;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedAnalysis = await redisCache_1.RedisCache.get(`${PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedAnalysis) {
            return cachedAnalysis;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const analysis = result.rows[0];
        // 缓存AI分析记录
        await redisCache_1.RedisCache.set(`${PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX}${analysis.id}`, analysis, 3600);
        return analysis;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLAIAnalysisDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const analysis = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX}${analysis.id}`, analysis, 3600);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_analyses:session:${analysis.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_analyses:user:${analysis.user_id}`);
        // 检查是否需要更新最新分析缓存
        const latestAnalysis = await this.getLatestBySession(analysis.session_id);
        if (latestAnalysis && latestAnalysis.id === analysis.id) {
            await redisCache_1.RedisCache.set(`ai_analyses:session:${analysis.session_id}:latest`, analysis, 3600);
        }
        return analysis;
    }
    async delete(id) {
        const analysis = await this.getById(id);
        if (!analysis) {
            return false;
        }
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX}${id}`);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_analyses:session:${analysis.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_analyses:user:${analysis.user_id}`);
        // 检查是否需要更新最新分析缓存
        const latestAnalysis = await this.getLatestBySession(analysis.session_id);
        if (latestAnalysis) {
            await redisCache_1.RedisCache.set(`ai_analyses:session:${analysis.session_id}:latest`, latestAnalysis, 3600);
        }
        else {
            await redisCache_1.RedisCache.delete(`ai_analyses:session:${analysis.session_id}:latest`);
        }
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getByUser(userId) {
        // 先从缓存获取
        const cachedAnalyses = await redisCache_1.RedisCache.get(`ai_analyses:user:${userId}`);
        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        // 缓存用户分析列表
        await redisCache_1.RedisCache.set(`ai_analyses:user:${userId}`, result.rows, 3600);
        return result.rows;
    }
    async getBySession(sessionId) {
        // 先从缓存获取
        const cachedAnalyses = await redisCache_1.RedisCache.get(`ai_analyses:session:${sessionId}`);
        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC`, [sessionId]);
        // 缓存会话分析列表
        await redisCache_1.RedisCache.set(`ai_analyses:session:${sessionId}`, result.rows, 3600);
        return result.rows;
    }
    async getLatestBySession(sessionId) {
        // 先从缓存获取
        const cachedAnalysis = await redisCache_1.RedisCache.get(`ai_analyses:session:${sessionId}:latest`);
        if (cachedAnalysis) {
            return cachedAnalysis;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAIAnalysisDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`, [sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const analysis = result.rows[0];
        // 缓存最新分析记录
        await redisCache_1.RedisCache.set(`ai_analyses:session:${sessionId}:latest`, analysis, 3600);
        return analysis;
    }
}
exports.PostgreSQLAIAnalysisDAO = PostgreSQLAIAnalysisDAO;
PostgreSQLAIAnalysisDAO.TABLE_NAME = 'ai_analyses';
PostgreSQLAIAnalysisDAO.CACHE_KEY_PREFIX = 'ai_analysis:';
class PostgreSQLAISuggestionDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLAISuggestionDAO.TABLE_NAME} (session_id, user_id, style, recommended_action, recommended_amount, confidence, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [entity.session_id, entity.user_id, entity.style, entity.recommended_action, entity.recommended_amount, entity.confidence, entity.explanation]);
        const suggestion = result.rows[0];
        // 缓存AI建议记录
        await redisCache_1.RedisCache.set(`${PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX}${suggestion.id}`, suggestion, 3600);
        // 清除会话建议列表缓存
        await redisCache_1.RedisCache.delete(`ai_suggestions:session:${entity.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_suggestions:user:${entity.user_id}`);
        // 设置最新建议缓存
        await redisCache_1.RedisCache.set(`ai_suggestions:session:${entity.session_id}:latest`, suggestion, 3600);
        return suggestion;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedSuggestion = await redisCache_1.RedisCache.get(`${PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedSuggestion) {
            return cachedSuggestion;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const suggestion = result.rows[0];
        // 缓存AI建议记录
        await redisCache_1.RedisCache.set(`${PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX}${suggestion.id}`, suggestion, 3600);
        return suggestion;
    }
    async update(id, entity) {
        // 构建更新语句
        const updateFields = Object.entries(entity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(entity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLAISuggestionDAO.TABLE_NAME} SET ${updateFields}
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const suggestion = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX}${suggestion.id}`, suggestion, 3600);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_suggestions:session:${suggestion.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_suggestions:user:${suggestion.user_id}`);
        // 检查是否需要更新最新建议缓存
        const latestSuggestion = await this.getLatestBySession(suggestion.session_id);
        if (latestSuggestion && latestSuggestion.id === suggestion.id) {
            await redisCache_1.RedisCache.set(`ai_suggestions:session:${suggestion.session_id}:latest`, suggestion, 3600);
        }
        return suggestion;
    }
    async delete(id) {
        const suggestion = await this.getById(id);
        if (!suggestion) {
            return false;
        }
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX}${id}`);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_suggestions:session:${suggestion.session_id}`);
        await redisCache_1.RedisCache.delete(`ai_suggestions:user:${suggestion.user_id}`);
        // 检查是否需要更新最新建议缓存
        const latestSuggestion = await this.getLatestBySession(suggestion.session_id);
        if (latestSuggestion) {
            await redisCache_1.RedisCache.set(`ai_suggestions:session:${suggestion.session_id}:latest`, latestSuggestion, 3600);
        }
        else {
            await redisCache_1.RedisCache.delete(`ai_suggestions:session:${suggestion.session_id}:latest`);
        }
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME}`);
        return result.rows;
    }
    async getByUser(userId) {
        // 先从缓存获取
        const cachedSuggestions = await redisCache_1.RedisCache.get(`ai_suggestions:user:${userId}`);
        if (cachedSuggestions) {
            return cachedSuggestions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        // 缓存用户建议列表
        await redisCache_1.RedisCache.set(`ai_suggestions:user:${userId}`, result.rows, 3600);
        return result.rows;
    }
    async getBySession(sessionId) {
        // 先从缓存获取
        const cachedSuggestions = await redisCache_1.RedisCache.get(`ai_suggestions:session:${sessionId}`);
        if (cachedSuggestions) {
            return cachedSuggestions;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC`, [sessionId]);
        // 缓存会话建议列表
        await redisCache_1.RedisCache.set(`ai_suggestions:session:${sessionId}`, result.rows, 3600);
        return result.rows;
    }
    async getLatestBySession(sessionId) {
        // 先从缓存获取
        const cachedSuggestion = await redisCache_1.RedisCache.get(`ai_suggestions:session:${sessionId}:latest`);
        if (cachedSuggestion) {
            return cachedSuggestion;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAISuggestionDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`, [sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const suggestion = result.rows[0];
        // 缓存最新建议记录
        await redisCache_1.RedisCache.set(`ai_suggestions:session:${sessionId}:latest`, suggestion, 3600);
        return suggestion;
    }
}
exports.PostgreSQLAISuggestionDAO = PostgreSQLAISuggestionDAO;
PostgreSQLAISuggestionDAO.TABLE_NAME = 'ai_suggestions';
PostgreSQLAISuggestionDAO.CACHE_KEY_PREFIX = 'ai_suggestion:';
// 实现AITrainingDataDAO接口
class PostgreSQLAITrainingDataDAO {
    async create(entity) {
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLAITrainingDataDAO.TABLE_NAME} (user_id, session_id, hole_cards, community_cards, hand_strength, recommended_action, actual_action, action_result, context_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            entity.userId,
            entity.sessionId,
            JSON.stringify(entity.holeCards),
            JSON.stringify(entity.communityCards),
            entity.handStrength,
            entity.recommendedAction,
            entity.actualAction,
            entity.actionResult,
            JSON.stringify(entity.contextData || {})
        ]);
        const trainingData = result.rows[0];
        // 缓存训练数据
        await redisCache_1.RedisCache.set(`${PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX}${trainingData.id}`, trainingData, 3600);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_training_data:user:${trainingData.userId}`);
        await redisCache_1.RedisCache.delete(`ai_training_data:session:${trainingData.sessionId}`);
        return trainingData;
    }
    async getById(id) {
        // 先从缓存获取
        const cachedData = await redisCache_1.RedisCache.get(`${PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX}${id}`);
        if (cachedData) {
            return cachedData;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const trainingData = result.rows[0];
        // 缓存训练数据
        await redisCache_1.RedisCache.set(`${PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX}${trainingData.id}`, trainingData, 3600);
        return trainingData;
    }
    async update(id, entity) {
        // 处理JSON字段
        const processedEntity = { ...entity };
        if (processedEntity.holeCards) {
            processedEntity.hole_cards = JSON.stringify(processedEntity.holeCards);
        }
        if (processedEntity.communityCards) {
            processedEntity.community_cards = JSON.stringify(processedEntity.communityCards);
        }
        if (processedEntity.contextData) {
            processedEntity.context_data = JSON.stringify(processedEntity.contextData);
        }
        // 构建更新语句
        const updateFields = Object.entries(processedEntity)
            .map(([key, value], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = [...Object.values(processedEntity), id];
        const result = await database_1.default.query(`UPDATE ${PostgreSQLAITrainingDataDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW() 
       WHERE id = $${values.length} RETURNING *`, values);
        if (result.rows.length === 0) {
            return null;
        }
        const trainingData = result.rows[0];
        // 更新缓存
        await redisCache_1.RedisCache.set(`${PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX}${trainingData.id}`, trainingData, 3600);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_training_data:user:${trainingData.userId}`);
        await redisCache_1.RedisCache.delete(`ai_training_data:session:${trainingData.sessionId}`);
        return trainingData;
    }
    async delete(id) {
        const trainingData = await this.getById(id);
        if (!trainingData) {
            return false;
        }
        const result = await database_1.default.query(`DELETE FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return false;
        }
        // 删除缓存
        await redisCache_1.RedisCache.delete(`${PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX}${id}`);
        // 清除相关列表缓存
        await redisCache_1.RedisCache.delete(`ai_training_data:user:${trainingData.userId}`);
        await redisCache_1.RedisCache.delete(`ai_training_data:session:${trainingData.sessionId}`);
        return true;
    }
    async getAll() {
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} ORDER BY created_at DESC`);
        return result.rows;
    }
    async getByUser(userId, limit) {
        // 先从缓存获取
        const cacheKey = `ai_training_data:user:${userId}${limit ? `:${limit}` : ''}`;
        const cachedData = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const query = limit
            ? `SELECT * FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
            : `SELECT * FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC`;
        const values = limit ? [userId, limit] : [userId];
        const result = await database_1.default.query(query, values);
        // 缓存用户训练数据
        await redisCache_1.RedisCache.set(cacheKey, result.rows, 3600);
        return result.rows;
    }
    async getBySession(sessionId) {
        // 先从缓存获取
        const cachedData = await redisCache_1.RedisCache.get(`ai_training_data:session:${sessionId}`);
        if (cachedData) {
            return cachedData;
        }
        const result = await database_1.default.query(`SELECT * FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC`, [sessionId]);
        // 缓存会话训练数据
        await redisCache_1.RedisCache.set(`ai_training_data:session:${sessionId}`, result.rows, 3600);
        return result.rows;
    }
    async batchInsert(data) {
        if (data.length === 0) {
            return [];
        }
        // 构建批量插入SQL
        const placeholders = data.map((_, i) => `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`).join(', ');
        const values = data.flatMap(item => [
            item.userId,
            item.sessionId,
            JSON.stringify(item.holeCards),
            JSON.stringify(item.communityCards),
            item.handStrength,
            item.recommendedAction,
            item.actualAction,
            item.actionResult,
            JSON.stringify(item.contextData || {})
        ]);
        const result = await database_1.default.query(`INSERT INTO ${PostgreSQLAITrainingDataDAO.TABLE_NAME} (user_id, session_id, hole_cards, community_cards, hand_strength, recommended_action, actual_action, action_result, context_data) 
       VALUES ${placeholders} RETURNING id`, values);
        // 清除相关缓存
        const userIds = new Set(data.map(item => item.userId));
        const sessionIds = new Set(data.map(item => item.sessionId));
        for (const userId of userIds) {
            await redisCache_1.RedisCache.delete(`ai_training_data:user:${userId}`);
            // 清除带limit的缓存
            await redisCache_1.RedisCache.deletePattern(`ai_training_data:user:${userId}:*`);
        }
        for (const sessionId of sessionIds) {
            await redisCache_1.RedisCache.delete(`ai_training_data:session:${sessionId}`);
        }
        return result.rows.map(row => row.id);
    }
    async getTrainingStats(userId) {
        // 先从缓存获取
        const cacheKey = `ai_training_stats${userId ? `:${userId}` : ''}`;
        const cachedStats = await redisCache_1.RedisCache.get(cacheKey);
        if (cachedStats) {
            return cachedStats;
        }
        const whereClause = userId ? 'WHERE user_id = $1' : '';
        const values = userId ? [userId] : [];
        // 获取总数
        const totalResult = await database_1.default.query(`SELECT COUNT(*) as total FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} ${whereClause}`, values);
        const total = parseInt(totalResult.rows[0].total, 10);
        // 按结果统计
        const resultResult = await database_1.default.query(`SELECT action_result, COUNT(*) as count FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} ${whereClause} GROUP BY action_result`, values);
        const byResult = {};
        resultResult.rows.forEach(row => {
            byResult[row.action_result] = parseInt(row.count, 10);
        });
        // 按行动统计
        const actionResult = await database_1.default.query(`SELECT actual_action, COUNT(*) as count FROM ${PostgreSQLAITrainingDataDAO.TABLE_NAME} ${whereClause} GROUP BY actual_action`, values);
        const byAction = {};
        actionResult.rows.forEach(row => {
            byAction[row.actual_action] = parseInt(row.count, 10);
        });
        const stats = { total, byResult, byAction };
        // 缓存统计信息
        await redisCache_1.RedisCache.set(cacheKey, stats, 3600);
        return stats;
    }
}
exports.PostgreSQLAITrainingDataDAO = PostgreSQLAITrainingDataDAO;
PostgreSQLAITrainingDataDAO.TABLE_NAME = 'ai_training_data';
PostgreSQLAITrainingDataDAO.CACHE_KEY_PREFIX = 'ai_training_data:';
// 创建单例实例
exports.postgreSQLAIAnalysisDAO = new PostgreSQLAIAnalysisDAO();
exports.postgreSQLAISuggestionDAO = new PostgreSQLAISuggestionDAO();
exports.postgreSQLAITrainingDataDAO = new PostgreSQLAITrainingDataDAO();
//# sourceMappingURL=postgreSQLAIDAO.js.map