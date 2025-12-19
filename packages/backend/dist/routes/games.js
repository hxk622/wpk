"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const gameService_1 = require("../services/gameService");
const response_1 = require("../utils/response");
// JWT验证中间件
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json((0, response_1.errorResponse)('未提供认证令牌', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        res.status(401).json((0, response_1.errorResponse)('无效的认证令牌', 401));
    }
};
const router = express_1.default.Router();
/**
 * @swagger
 * /games/{gameId}/action:
 *   post:
 *     summary: 执行游戏动作（下注、跟注、弃牌等）
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: 游戏ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [fold, check, call, raise, allin]
 *                 description: 游戏动作类型
 *               amount:
 *                 type: number
 *                 description: 下注金额（仅在raise动作时需要）
 *     responses:
 *       200:
 *         description: 游戏动作执行成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 执行游戏动作
const executeGameAction = async (req, res) => {
    try {
        const { gameId } = req.params;
        const action = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        const gameStatus = await (0, gameService_1.executeGameAction)(gameId, userId, action);
        res.status(200).json((0, response_1.successResponse)({ gameStatus }, '游戏动作执行成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
};
/**
 * @swagger
 * /games/{gameId}/history:
 *   get:
 *     summary: 获取牌局历史
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 获取牌局历史成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取牌局历史
const getGameHistory = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        // TODO: 实现获取牌局历史逻辑
        // 1. 检查用户是否有权限访问该牌局
        // 2. 查询牌局历史记录
        // 3. 返回历史记录
        res.status(200).json((0, response_1.successResponse)({
            gameId,
            actions: []
        }, '获取牌局历史成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
};
/**
 * @swagger
 * /games/stats:
 *   get:
 *     summary: 获取用户游戏统计
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取游戏统计成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gamesPlayed:
 *                       type: number
 *                     gamesWon:
 *                       type: number
 *                     winRate:
 *                       type: number
 *                     totalChips:
 *                       type: number
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取游戏统计
const getGameStats = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        // TODO: 实现获取游戏统计逻辑
        // 1. 查询用户的游戏统计数据
        // 2. 返回统计结果
        res.status(200).json((0, response_1.successResponse)({
            gamesPlayed: 0,
            gamesWon: 0,
            winRate: 0,
            totalChips: 0
        }, '获取游戏统计成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
};
/**
 * @swagger
 * /games/{gameId}:
 *   get:
 *     summary: 获取当前牌局状态
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 获取牌局状态成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                     communityCards:
 *                       type: array
 *                       items:
 *                         type: object
 *                     currentPlayer:
 *                       type: string
 *                     round:
 *                       type: string
 *                     pot:
 *                       type: number
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取当前牌局状态
const getGameStatus = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        const gameStatus = await (0, gameService_1.getGameStatus)(gameId);
        res.status(200).json((0, response_1.successResponse)({ gameStatus }, '获取牌局状态成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
};
/**
 * @swagger
 * /games/{gameId}/start:
 *   post:
 *     summary: 开始新牌局
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 新牌局开始成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                     communityCards:
 *                       type: array
 *                       items:
 *                         type: object
 *                     currentPlayer:
 *                       type: string
 *                     round:
 *                       type: string
 *                     pot:
 *                       type: number
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 开始新牌局
const startNewGameRoute = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        const gameSession = await (0, gameService_1.startNewGame)(gameId);
        res.status(200).json((0, response_1.successResponse)({ gameSession }, '新牌局开始成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
};
// 注册路由
router.post('/:gameId/action', verifyToken, executeGameAction);
router.get('/:gameId/history', verifyToken, getGameHistory);
router.get('/:gameId/stats', verifyToken, getGameStats);
router.get('/:gameId', verifyToken, getGameStatus);
router.post('/:gameId/start', verifyToken, startNewGameRoute);
router.get('/stats', verifyToken, getGameStats);
/**
 * @swagger
 * /games/{gameId}/ai/analysis:
 *   post:
 *     summary: 请求AI分析
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: 游戏ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerCards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 手牌
 *                 minItems: 2
 *                 maxItems: 2
 *               communityCards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 公共牌
 *     responses:
 *       200:
 *         description: AI分析成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     playerCards:
 *                       type: array
 *                       items:
 *                         type: string
 *                     communityCards:
 *                       type: array
 *                       items:
 *                         type: string
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         handStrength:
 *                           type: number
 *                         winningOdds:
 *                           type: number
 *                         recommendedAction:
 *                           type: string
 *                         potOdds:
 *                           type: number
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/:gameId/ai/analysis', verifyToken, async (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerCards, communityCards } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未认证', 401));
        }
        if (!playerCards || !Array.isArray(playerCards) || playerCards.length !== 2) {
            return res.status(400).json((0, response_1.errorResponse)('请提供有效的手牌', 400));
        }
        // 调用AI服务进行分析
        const analysis = {
            gameId,
            playerCards,
            communityCards,
            analysis: {
                handStrength: 0.75,
                winningOdds: 0.6,
                recommendedAction: 'call',
                potOdds: 0.5
            }
        };
        res.status(200).json((0, response_1.successResponse)({ analysis }, 'AI分析成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)('服务器错误', 500, error.message));
    }
});
exports.default = router;
//# sourceMappingURL=games.js.map