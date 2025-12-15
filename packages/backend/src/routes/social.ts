import express from 'express';
import { socialService } from '../services/socialService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { successResponse, errorResponse } from '../utils/response';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Social
 *   description: 社交功能相关API
 */

// 好友请求相关路由

/**
 * @swagger
 * /api/social/friend-requests:
 *   post:
 *     summary: 发送好友请求
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toUserId: 
 *                 type: string
 *                 description: 接收者用户ID
 *     responses:
 *       201: 
 *         description: 好友请求发送成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.post('/friend-requests', authMiddleware, async (req, res) => {
  try {
    const fromUserId = req.user?.userId;
    const { toUserId } = req.body;
    
    if (!fromUserId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const friendRequest = await socialService.sendFriendRequest(fromUserId, toUserId);
    res.status(201).json(successResponse({ friendRequest }, '好友请求发送成功', 201));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /api/social/friend-requests/{id}/respond:
 *   post:
 *     summary: 响应好友请求
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 好友请求ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: 
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: 响应状态
 *     responses:
 *       200: 
 *         description: 响应成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.post('/friend-requests/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedRequest = await socialService.respondToFriendRequest(id, status);
    res.status(200).json(successResponse({ updatedRequest }, '响应好友请求成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /api/social/friend-requests/received:
 *   get:
 *     summary: 获取收到的好友请求
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: 请求状态
 *     responses:
 *       200: 
 *         description: 好友请求列表
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/friend-requests/received', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const requests = await socialService.getReceivedFriendRequests(userId, status as any);
    res.status(200).json(successResponse({ requests }, '获取收到的好友请求成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /api/social/friend-requests/sent:
 *   get:
 *     summary: 获取发送的好友请求
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: 请求状态
 *     responses:
 *       200: 
 *         description: 好友请求列表
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/friend-requests/sent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const requests = await socialService.getSentFriendRequests(userId, status as any);
    res.status(200).json(successResponse({ requests }, '获取发送的好友请求成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /api/social/friend-requests/{id}:
 *   delete:
 *     summary: 删除好友请求
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 好友请求ID
 *     responses:
 *       200: 
 *         description: 删除成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.delete('/friend-requests/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await socialService.deleteFriendRequest(id);
    res.status(200).json(successResponse({ success }, '删除好友请求成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

// 好友关系相关路由

/**
 * @swagger
 * /social/friends:
 *   get:
 *     summary: 获取好友列表
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: 
 *         description: 好友列表
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/social/friends', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const friends = await socialService.getFriends(userId);
    res.status(200).json(successResponse({ friends }, '获取好友列表成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/friends/{friendId}:
 *   delete:
 *     summary: 删除好友
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: 好友ID
 *     responses:
 *       200: 
 *         description: 删除成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.delete('/social/friends/:friendId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { friendId } = req.params;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const success = await socialService.removeFriend(userId, friendId);
    res.status(200).json(successResponse({ success }, '删除好友成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/friends/check/{friendId}:
 *   get:
 *     summary: 检查是否是好友
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: 好友ID
 *     responses:
 *       200: 
 *         description: 检查结果
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/social/friends/check/:friendId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { friendId } = req.params;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const isFriends = await socialService.isFriends(userId, friendId);
    res.status(200).json(successResponse({ isFriends }, '检查好友关系成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

// 私信相关路由

/**
 * @swagger
 * /social/messages:
 *   post:
 *     summary: 发送私信
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId: 
 *                 type: string
 *                 description: 接收者ID
 *               content: 
 *                 type: string
 *                 description: 消息内容
 *     responses:
 *       201: 
 *         description: 消息发送成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.post('/social/messages', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, content } = req.body;
    
    if (!senderId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const message = await socialService.sendPrivateMessage(senderId, receiverId, content);
    res.status(201).json(successResponse({ message }, '发送私信成功', 201));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/messages/{otherUserId}:
 *   get:
 *     summary: 获取与某个用户的私信历史
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: 对方用户ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: 限制数量
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: 偏移量
 *     responses:
 *       200: 
 *         description: 私信历史列表
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/social/messages/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { otherUserId } = req.params;
    const { limit, offset } = req.query;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const messages = await socialService.getPrivateMessageHistory(
      userId, 
      otherUserId, 
      limit ? Number(limit) : 50, 
      offset ? Number(offset) : 0
    );
    res.status(200).json(successResponse({ messages }, '获取私信历史成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/messages/unread-count:
 *   get:
 *     summary: 获取未读私信数量
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: 
 *         description: 未读消息数量
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.get('/social/messages/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const count = await socialService.getUnreadMessageCount(userId);
    res.status(200).json(successResponse({ count }, '获取未读私信数量成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/messages/read:
 *   post:
 *     summary: 标记私信为已读
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageIds: 
 *                 type: array
 *                 items: 
 *                   type: string
 *                 description: 消息ID列表
 *     responses:
 *       200: 
 *         description: 标记成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.post('/social/messages/read', authMiddleware, async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    const success = await socialService.markMessagesAsRead(messageIds);
    res.status(200).json(successResponse({ success }, '标记私信为已读成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

/**
 * @swagger
 * /social/messages/{otherUserId}/read-all:
 *   post:
 *     summary: 标记与某个用户的所有私信为已读
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: 对方用户ID
 *     responses:
 *       200: 
 *         description: 标记成功
 *       401: 
 *         description: 未授权
 *       500: 
 *         description: 服务器错误
 */
router.post('/social/messages/:otherUserId/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { otherUserId } = req.params;
    
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }
    
    const success = await socialService.markAllMessagesAsRead(userId, otherUserId);
    res.status(200).json(successResponse({ success }, '标记与某个用户的所有私信为已读成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message, 500));
  }
});

export default router;
