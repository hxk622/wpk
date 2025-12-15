"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const roomService_1 = require("../services/roomService");
const loggerService_1 = __importDefault(require("../services/loggerService"));
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// 中间件：验证JWT令牌
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json((0, response_1.errorResponse)('未提供令牌', 401));
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json((0, response_1.errorResponse)('令牌无效', 403));
        }
        // 将用户ID存储在请求对象中
        req.user = user;
        next();
    });
};
/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: 房间管理相关API
 */
/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: 创建房间
 *     tags: [Rooms]
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
 *               maxPlayers:
 *                 type: number
 *               buyIn:
 *                 type: number
 *               smallBlind:
 *                 type: number
 *               bigBlind:
 *                 type: number
 *     responses:
 *       201:
 *         description: 房间创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 room:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     hostId:
 *                       type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                     maxPlayers:
 *                       type: number
 *                     buyIn:
 *                       type: number
 *                     smallBlind:
 *                       type: number
 *                     bigBlind:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: 创建房间失败
 *       401:
 *         description: 未授权
 */
// 创建房间
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const input = req.body;
    try {
        loggerService_1.default.info('收到创建房间请求', { userId, roomName: input.name });
        const room = await (0, roomService_1.createRoom)(userId, input);
        loggerService_1.default.info('创建房间成功', { userId, roomId: room.id, roomName: room.name });
        res.status(201).json((0, response_1.successResponse)({ room }, '房间创建成功', 201));
    }
    catch (error) {
        loggerService_1.default.error('创建房间失败', { error, userId, roomName: input.name });
        res.status(400).json((0, response_1.errorResponse)('创建房间失败', 400, { details: error.message }));
    }
});
/**
 * @swagger
 * /rooms/validate-password/{roomId}:
 *   post:
 *     summary: 验证私人房间密码
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 房间密码
 *     responses:
 *       200:
 *         description: 密码验证成功
 *       401:
 *         description: 密码错误或未授权
 *       404:
 *         description: 房间不存在
 */
// 验证私人房间密码
router.post('/validate-password/:roomId', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const { password } = req.body;
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到验证私人房间密码请求', { userId, roomId });
        const isValid = await (0, roomService_1.validateRoomPassword)(roomId, password);
        if (isValid) {
            loggerService_1.default.info('私人房间密码验证成功', { userId, roomId });
            res.status(200).json((0, response_1.successResponse)(null, '密码验证成功'));
        }
        else {
            loggerService_1.default.info('私人房间密码验证失败', { userId, roomId });
            res.status(401).json((0, response_1.errorResponse)('密码错误', 401));
        }
    }
    catch (error) {
        loggerService_1.default.error('验证私人房间密码失败', { error, userId, roomId });
        res.status(404).json((0, response_1.errorResponse)('房间不存在', 404));
    }
});
/**
 * @swagger
 * /rooms/{roomId}:
 *   put:
 *     summary: 更新房间信息
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               small_blind:
 *                 type: number
 *               big_blind:
 *                 type: number
 *               max_players:
 *                 type: number
 *               password:
 *                 type: string
 *               min_buy_in:
 *                 type: number
 *               max_buy_in:
 *                 type: number
 *     responses:
 *       200:
 *         description: 房间更新成功
 *       401:
 *         description: 未授权或不是房间所有者
 *       404:
 *         description: 房间不存在
 */
// 更新房间信息
router.put('/:roomId', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;
    const updates = req.body;
    try {
        loggerService_1.default.info('收到更新房间信息请求', { userId, roomId, updates });
        const updatedRoom = await (0, roomService_1.updateRoom)(roomId, updates, userId);
        if (updatedRoom) {
            loggerService_1.default.info('房间信息更新成功', { userId, roomId, roomName: updatedRoom.name });
            res.status(200).json((0, response_1.successResponse)({ room: updatedRoom }, '房间更新成功'));
        }
        else {
            loggerService_1.default.info('更新房间信息失败：房间不存在', { userId, roomId });
            res.status(404).json((0, response_1.errorResponse)('房间不存在', 404));
        }
    }
    catch (error) {
        loggerService_1.default.error('更新房间信息失败', { error, userId, roomId });
        res.status(401).json((0, response_1.errorResponse)(error.message, 401));
    }
});
/**
 * @swagger
 * /rooms/{roomId}:
 *   delete:
 *     summary: 删除房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     responses:
 *       200:
 *         description: 房间删除成功
 *       401:
 *         description: 未授权或不是房间所有者
 *       404:
 *         description: 房间不存在
 */
// 删除房间
router.delete('/:roomId', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到删除房间请求', { userId, roomId });
        const success = await (0, roomService_1.deleteRoom)(roomId, userId);
        if (success) {
            loggerService_1.default.info('房间删除成功', { userId, roomId });
            res.status(200).json((0, response_1.successResponse)(null, '房间删除成功'));
        }
        else {
            loggerService_1.default.info('删除房间失败：房间不存在', { userId, roomId });
            res.status(404).json((0, response_1.errorResponse)('房间不存在', 404));
        }
    }
    catch (error) {
        loggerService_1.default.error('删除房间失败', { error, userId, roomId });
        res.status(401).json((0, response_1.errorResponse)(error.message, 401));
    }
});
/**
 * @swagger
 * /rooms/user/created:
 *   get:
 *     summary: 获取用户创建的房间列表
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户创建的房间列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameRoom'
 *       500:
 *         description: 获取房间列表失败
 */
// 获取用户创建的房间列表
router.get('/user/created', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到获取用户创建的房间列表请求', { userId });
        const rooms = await (0, roomService_1.getUserRooms)(userId);
        loggerService_1.default.info('获取用户创建的房间列表成功', { userId, count: rooms.length });
        res.status(200).json((0, response_1.successResponse)({ rooms }, '获取用户创建的房间列表成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取用户创建的房间列表失败', { error, userId });
        res.status(500).json((0, response_1.errorResponse)(error.message, 500));
    }
});
/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: 获取房间列表
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 房间状态筛选
 *     responses:
 *       200:
 *         description: 获取房间列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       hostId:
 *                         type: string
 *                       playerCount:
 *                         type: number
 *                       maxPlayers:
 *                         type: number
 *                       buyIn:
 *                         type: number
 *                       smallBlind:
 *                         type: number
 *                       bigBlind:
 *                         type: number
 *                       status:
 *                         type: string
 *       500:
 *         description: 获取房间列表失败
 */
// 获取房间列表
router.get('/', authenticateToken, async (req, res) => {
    const status = req.query.status;
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到获取房间列表请求', { userId, status });
        const rooms = await (0, roomService_1.getRoomList)(status);
        loggerService_1.default.info('获取房间列表成功', { userId, status, count: rooms.length });
        res.status(200).json((0, response_1.successResponse)({ rooms }, '获取房间列表成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取房间列表失败', { error, userId, status });
        res.status(500).json((0, response_1.errorResponse)('获取房间列表失败', 500, { details: error.message }));
    }
});
/**
 * @swagger
 * /rooms/{roomId}:
 *   get:
 *     summary: 获取房间详情
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     responses:
 *       200:
 *         description: 获取房间详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 room:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     hostId:
 *                       type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                     maxPlayers:
 *                       type: number
 *                     buyIn:
 *                       type: number
 *                     smallBlind:
 *                       type: number
 *                     bigBlind:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: 获取房间详情失败
 *       401:
 *         description: 未授权
 *       404:
 *         description: 房间不存在
 */
// 获取房间详情
router.get('/:roomId', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到获取房间详情请求', { userId, roomId });
        const room = await (0, roomService_1.getRoomById)(roomId);
        if (!room) {
            loggerService_1.default.info('获取房间详情失败：房间不存在', { userId, roomId });
            return res.status(404).json((0, response_1.errorResponse)('房间不存在', 404));
        }
        loggerService_1.default.info('获取房间详情成功', { userId, roomId, roomName: room.name });
        res.status(200).json((0, response_1.successResponse)({ room }, '获取房间详情成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取房间详情失败', { error, userId, roomId });
        res.status(500).json((0, response_1.errorResponse)('获取房间详情失败', 500, { details: error.message }));
    }
});
/**
 * @swagger
 * /rooms/{roomId}/join:
 *   post:
 *     summary: 加入房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 私人房间密码
 *     responses:
 *       200:
 *         description: 加入房间成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 加入房间失败
 *       401:
 *         description: 未授权或密码错误
 */
// 加入房间
router.post('/:roomId/join', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;
    const { password } = req.body;
    try {
        loggerService_1.default.info('收到加入房间请求', { userId, roomId });
        // 如果是私人房间，验证密码
        const room = await (0, roomService_1.getRoomById)(roomId);
        if (room?.room_type === 'private') {
            const isPasswordValid = await (0, roomService_1.validateRoomPassword)(roomId, password || '');
            if (!isPasswordValid) {
                loggerService_1.default.info('加入私人房间失败：密码错误', { userId, roomId });
                return res.status(401).json((0, response_1.errorResponse)('密码错误', 401));
            }
        }
        const success = await (0, roomService_1.joinRoom)(roomId, userId);
        if (success) {
            loggerService_1.default.info('加入房间成功', { userId, roomId });
            res.status(200).json((0, response_1.successResponse)(null, '加入房间成功'));
        }
        else {
            loggerService_1.default.info('加入房间失败', { userId, roomId });
            res.status(400).json((0, response_1.errorResponse)('加入房间失败', 400));
        }
    }
    catch (error) {
        loggerService_1.default.error('加入房间失败', { error, userId, roomId });
        res.status(400).json((0, response_1.errorResponse)('加入房间失败', 400, { details: error.message }));
    }
});
/**
 * @swagger
 * /rooms/{roomId}/leave:
 *   post:
 *     summary: 离开房间
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: 房间ID
 *     responses:
 *       200:
 *         description: 离开房间成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 离开房间失败
 *       401:
 *         description: 未授权
 */
// 离开房间
router.post('/:roomId/leave', authenticateToken, async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;
    try {
        loggerService_1.default.info('收到离开房间请求', { userId, roomId });
        const success = await (0, roomService_1.leaveRoom)(roomId, userId);
        if (success) {
            loggerService_1.default.info('离开房间成功', { userId, roomId });
            res.status(200).json((0, response_1.successResponse)(null, '离开房间成功'));
        }
        else {
            loggerService_1.default.info('离开房间失败', { userId, roomId });
            res.status(400).json((0, response_1.errorResponse)('离开房间失败', 400));
        }
    }
    catch (error) {
        loggerService_1.default.error('离开房间失败', { error, userId, roomId });
        res.status(500).json((0, response_1.errorResponse)('离开房间失败', 500, { details: error.message }));
    }
});
exports.default = router;
//# sourceMappingURL=rooms.js.map