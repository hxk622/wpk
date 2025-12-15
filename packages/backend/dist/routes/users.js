"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService_1 = require("../services/userService");
const response_1 = require("../utils/response");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理相关API
 */
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInput'
 *     responses:
 *       201:
 *         description: 用户注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 注册失败
 */
router.post('/register', async (req, res) => {
    const input = req.body;
    const user = await (0, userService_1.registerUser)(input);
    res.status(201).json((0, response_1.successResponse)({ user }, '用户注册成功', 201));
});
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserInput'
 *           example:
 *             username: exampleuser
 *             password: password123
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: 登录失败
 */
router.post('/login', async (req, res) => {
    const input = req.body;
    const { user, token } = await (0, userService_1.loginUser)(input);
    res.status(200).json((0, response_1.successResponse)({ user, token }, '登录成功'));
});
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 获取用户资料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户资料成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权或获取用户资料失败
 *       404:
 *         description: 用户不存在
 */
router.get('/profile', authMiddleware_1.authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const user = await (0, userService_1.getUserById)(userId);
    if (!user) {
        return res.status(404).json((0, response_1.errorResponse)('用户不存在', 404));
    }
    res.status(200).json((0, response_1.successResponse)({ user }, '获取用户资料成功'));
});
/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: 更新用户资料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新用户资料成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 更新用户资料失败
 *       401:
 *         description: 未授权
 */
router.put('/profile', authMiddleware_1.authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const data = req.body;
    const updatedUser = await (0, userService_1.updateUserProfile)(userId, data);
    res.status(200).json((0, response_1.successResponse)({ user: updatedUser }, '更新用户资料成功'));
});
/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: 获取用户统计数据
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stats:
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
 *       400:
 *         description: 获取用户统计数据失败
 *       401:
 *         description: 未授权
 */
router.get('/stats', authMiddleware_1.authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const stats = await (0, userService_1.getUserStats)(userId);
    res.status(200).json((0, response_1.successResponse)({ stats }, '获取用户统计数据成功'));
});
exports.default = router;
//# sourceMappingURL=users.js.map