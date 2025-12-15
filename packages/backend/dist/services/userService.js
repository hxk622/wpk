"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.updateUserChips = exports.getUserStats = exports.updateUserProfile = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("./database"));
const postgreSQLUserDAO_1 = require("../dao/impl/postgreSQLUserDAO");
const loggerService_1 = __importDefault(require("./loggerService"));
const errors_1 = require("../utils/errors");
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
// 哈希密码
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt_1.default.hash(password, saltRounds);
};
// 验证密码
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt_1.default.compare(password, hashedPassword);
};
// 生成JWT令牌
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
// 用户注册
const registerUser = async (input) => {
    const { username, password, email, phone } = input;
    // 哈希密码
    const hashedPassword = await hashPassword(password);
    // 创建用户
    return await postgreSQLUserDAO_1.postgreSQLUserDAO.register({
        username,
        password: hashedPassword,
        email,
        phone
    });
};
exports.registerUser = registerUser;
// 用户登录
const loginUser = async (input) => {
    const { email, phone, username, password } = input;
    // 根据邮箱、手机号或用户名查找用户
    let user = null;
    if (email) {
        user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getByEmail(email);
    }
    else if (phone) {
        user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getByPhone(phone);
    }
    else if (username) {
        user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getByUsername(username);
    }
    else {
        throw new errors_1.BadRequestError('必须提供邮箱、手机号或用户名');
    }
    if (!user) {
        throw new errors_1.NotFoundError('用户不存在');
    }
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash || '');
    if (!isPasswordValid) {
        throw new errors_1.UnauthorizedError('密码错误');
    }
    // 生成令牌
    const token = generateToken(user.id);
    return { user, token };
};
exports.loginUser = loginUser;
// 根据ID获取用户
const getUserById = async (userId) => {
    return await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
};
exports.getUserById = getUserById;
// 更新用户资料
const updateUserProfile = async (userId, data) => {
    // 移除密码相关字段，密码更新应单独处理
    const { password_hash, ...updateData } = data;
    // 更新用户
    return await postgreSQLUserDAO_1.postgreSQLUserDAO.update(userId, updateData);
};
exports.updateUserProfile = updateUserProfile;
// 获取用户统计数据
const getUserStats = async (userId) => {
    try {
        // 从user_stats表获取用户统计数据
        const result = await database_1.default.query(`SELECT * FROM user_stats WHERE user_id = $1`, [userId]);
        // 如果存在统计数据，直接返回
        if (result.rows.length > 0) {
            const stats = result.rows[0];
            return {
                total_games: stats.total_games,
                total_wins: stats.total_wins,
                total_losses: stats.total_losses,
                win_rate: stats.total_games > 0 ? (stats.total_wins / stats.total_games * 100).toFixed(2) + '%' : '0%',
                total_chips_won: stats.total_chips_won,
                total_chips_lost: stats.total_chips_lost,
                average_chips_per_game: stats.total_games > 0 ? Math.round(stats.total_chips_won / stats.total_games) : 0
            };
        }
        // 如果不存在统计数据，从原始表计算
        const gameStatsResult = await database_1.default.query(`SELECT
        COUNT(DISTINCT gs.id) as total_games,
        COUNT(CASE WHEN sp.is_winner = true THEN 1 END) as total_wins
      FROM session_players sp
      JOIN game_sessions gs ON sp.session_id = gs.id
      WHERE sp.user_id = $1 AND gs.status = 'finished'`, [userId]);
        const chipStatsResult = await database_1.default.query(`SELECT
        SUM(CASE WHEN sp.is_winner = true THEN sp.chips ELSE 0 END) as total_chips_won,
        SUM(CASE WHEN sp.is_winner = false THEN sp.bet_amount ELSE 0 END) as total_chips_lost
      FROM session_players sp
      JOIN game_sessions gs ON sp.session_id = gs.id
      WHERE sp.user_id = $1 AND gs.status = 'finished'`, [userId]);
        const gameStats = gameStatsResult.rows[0];
        const chipStats = chipStatsResult.rows[0];
        const totalGames = parseInt(gameStats.total_games) || 0;
        const totalWins = parseInt(gameStats.total_wins) || 0;
        const totalLosses = totalGames - totalWins;
        const winRate = totalGames > 0 ? (totalWins / totalGames * 100).toFixed(2) + '%' : '0%';
        const totalChipsWon = parseInt(chipStats.total_chips_won) || 0;
        const totalChipsLost = parseInt(chipStats.total_chips_lost) || 0;
        const averageChipsPerGame = totalGames > 0 ? Math.round(totalChipsWon / totalGames) : 0;
        // 将计算结果保存到user_stats表，以便后续快速查询
        await database_1.default.query(`INSERT INTO user_stats (user_id, total_games, total_wins, total_losses, total_chips_won, total_chips_lost)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE
       SET total_games = $2, total_wins = $3, total_losses = $4, total_chips_won = $5, total_chips_lost = $6, updated_at = NOW()`, [userId, totalGames, totalWins, totalLosses, totalChipsWon, totalChipsLost]);
        return {
            total_games: totalGames,
            total_wins: totalWins,
            total_losses: totalLosses,
            win_rate: winRate,
            total_chips_won: totalChipsWon,
            total_chips_lost: totalChipsLost,
            average_chips_per_game: averageChipsPerGame
        };
    }
    catch (error) {
        loggerService_1.default.error('获取用户统计数据失败:', { error });
        // 如果查询失败，返回默认值
        return {
            total_games: 0,
            total_wins: 0,
            total_losses: 0,
            win_rate: '0%',
            total_chips_won: 0,
            total_chips_lost: 0,
            average_chips_per_game: 0
        };
    }
};
exports.getUserStats = getUserStats;
// 更新用户筹码
const updateUserChips = async (userId, chips) => {
    return await postgreSQLUserDAO_1.postgreSQLUserDAO.updateChips(userId, chips);
};
exports.updateUserChips = updateUserChips;
// 重置密码
const resetPassword = async (userId, oldPassword, newPassword) => {
    // 获取用户信息
    const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
    if (!user) {
        throw new errors_1.NotFoundError('用户不存在');
    }
    // 验证旧密码
    if (!await verifyPassword(oldPassword, user.password_hash || '')) {
        throw new errors_1.UnauthorizedError('旧密码错误');
    }
    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword);
    // 更新密码
    return await postgreSQLUserDAO_1.postgreSQLUserDAO.update(userId, { password_hash: hashedPassword });
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=userService.js.map