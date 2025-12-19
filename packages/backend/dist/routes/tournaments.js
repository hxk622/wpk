"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tournamentService_1 = require("../services/tournamentService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: 锦标赛管理相关API
 */
/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: 创建新的锦标赛
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 锦标赛名称
 *               description:
 *                 type: string
 *                 description: 锦标赛描述
 *               buy_in:
 *                 type: number
 *                 description: 买入费用
 *               max_players:
 *                 type: number
 *                 description: 最大玩家数量
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               blind_structure_id:
 *                 type: string
 *                 description: 盲注结构ID
 *     responses:
 *       201:
 *         description: 锦标赛创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, async (req, res) => {
    try {
        const tournamentData = req.body;
        const tournament = await tournamentService_1.tournamentService.createTournament(tournamentData);
        res.status(201).json((0, response_1.successResponse)({ tournament }, '锦标赛创建成功', 201));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: 获取锦标赛列表
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registration, in_progress, completed, cancelled]
 *         description: 锦标赛状态
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: 限制返回数量
 *     responses:
 *       200:
 *         description: 锦标赛列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 *       500:
 *         description: 服务器错误
 */
router.get('/', async (req, res) => {
    try {
        const { status, limit } = req.query;
        let tournaments;
        if (status) {
            tournaments = await tournamentService_1.tournamentService.getTournamentsByStatus(status);
        }
        else if (limit) {
            tournaments = await tournamentService_1.tournamentService.getUpcomingTournaments(Number(limit));
        }
        else {
            tournaments = await tournamentService_1.tournamentService.getAllTournaments();
        }
        res.status(200).json((0, response_1.successResponse)({ tournaments }, '获取锦标赛列表成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: 获取锦标赛详情
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 锦标赛ID
 *     responses:
 *       200:
 *         description: 锦标赛详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: 锦标赛不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await tournamentService_1.tournamentService.getTournament(id);
        if (!tournament) {
            return res.status(404).json((0, response_1.errorResponse)('锦标赛不存在', 404));
        }
        res.status(200).json((0, response_1.successResponse)({ tournament }, '获取锦标赛详情成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /api/tournaments/{id}/register:
 *   post:
 *     summary: 注册参加锦标赛
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 锦标赛ID
 *     responses:
 *       201:
 *         description: 注册成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 锦标赛不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/register', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('未授权', 401));
        }
        const registration = await tournamentService_1.tournamentService.registerForTournament(id, userId);
        res.status(201).json((0, response_1.successResponse)({ registration }, '注册参加锦标赛成功', 201));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /tournaments/{id}/register:
 *   delete:
 *     summary: 取消锦标赛注册
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 锦标赛ID
 *     responses:
 *       200:
 *         description: 取消注册成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 注册信息不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/tournaments/:id/register', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('未授权', 401));
        }
        await tournamentService_1.tournamentService.cancelTournamentRegistration(id, userId);
        res.status(200).json((0, response_1.successResponse)(null, '取消注册成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /tournaments/{id}/start:
 *   post:
 *     summary: 开始锦标赛
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 锦标赛ID
 *     responses:
 *       200:
 *         description: 锦标赛开始成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 锦标赛不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/tournaments/:id/start', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await tournamentService_1.tournamentService.startTournament(id);
        res.status(200).json((0, response_1.successResponse)({ tournament }, '锦标赛开始成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /tournaments/user:
 *   get:
 *     summary: 获取用户注册的锦标赛
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户注册的锦标赛列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/tournaments/user', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('未授权', 401));
        }
        const tournaments = await tournamentService_1.tournamentService.getUserTournaments(userId);
        res.status(200).json((0, response_1.successResponse)({ tournaments }, '获取用户注册的锦标赛成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /tournaments/{id}/rankings:
 *   get:
 *     summary: 获取锦标赛排名
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 锦标赛ID
 *     responses:
 *       200:
 *         description: 锦标赛排名列表
 *       404:
 *         description: 锦标赛不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/tournaments/:id/rankings', async (req, res) => {
    try {
        const { id } = req.params;
        const rankings = await tournamentService_1.tournamentService.getTournamentRankings(id);
        res.status(200).json((0, response_1.successResponse)({ rankings }, '获取锦标赛排名成功'));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /tournaments/default-blind-structure:
 *   post:
 *     summary: 创建默认盲注结构
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 默认盲注结构创建成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/tournaments/default-blind-structure', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, async (req, res) => {
    try {
        const blindStructure = await tournamentService_1.tournamentService.createDefaultBlindStructure();
        res.status(201).json((0, response_1.successResponse)({ blindStructure }, '默认盲注结构创建成功', 201));
    }
    catch (error) {
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
exports.default = router;
//# sourceMappingURL=tournaments.js.map