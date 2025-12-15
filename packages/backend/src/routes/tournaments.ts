import express from 'express';
import { tournamentService } from '../services/tournamentService';
import { Tournament } from '../types';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { successResponse, errorResponse } from '../utils/response';

const router = express.Router();

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
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tournamentData = req.body;
    const tournament = await tournamentService.createTournament(tournamentData);
    res.status(201).json(successResponse({ tournament }, '锦标赛创建成功', 201));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
      tournaments = await tournamentService.getTournamentsByStatus(status as Tournament['status']);
    } else if (limit) {
      tournaments = await tournamentService.getUpcomingTournaments(Number(limit));
    } else {
      tournaments = await tournamentService.getAllTournaments();
    }
    
    res.status(200).json(successResponse({ tournaments }, '获取锦标赛列表成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
    const tournament = await tournamentService.getTournament(id);
    
    if (!tournament) {
      return res.status(404).json(errorResponse('锦标赛不存在', 404));
    }
    
    res.status(200).json(successResponse({ tournament }, '获取锦标赛详情成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const registration = await tournamentService.registerForTournament(id, userId);
    res.status(201).json(successResponse({ registration }, '注册参加锦标赛成功', 201));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
router.delete('/tournaments/:id/register', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    await tournamentService.cancelTournamentRegistration(id, userId);
    res.status(200).json(successResponse(null, '取消注册成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
router.post('/tournaments/:id/start', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.startTournament(id);
    res.status(200).json(successResponse({ tournament }, '锦标赛开始成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
router.get('/tournaments/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const tournaments = await tournamentService.getUserTournaments(userId);
    res.status(200).json(successResponse({ tournaments }, '获取用户注册的锦标赛成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
    const rankings = await tournamentService.getTournamentRankings(id);
    res.status(200).json(successResponse({ rankings }, '获取锦标赛排名成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
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
router.post('/tournaments/default-blind-structure', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blindStructure = await tournamentService.createDefaultBlindStructure();
    res.status(201).json(successResponse({ blindStructure }, '默认盲注结构创建成功', 201));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

export default router;
