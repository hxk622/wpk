"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loggerService_1 = __importDefault(require("./loggerService"));
const aiService_1 = require("./aiService");
// WebSocket服务类
class WebSocketService {
    constructor(server) {
        this.clients = new Map();
        // 聊天历史记录，按房间ID存储
        this.chatHistory = new Map();
        // 最大历史记录数量
        this.maxHistoryLength = 100;
        // AI分析相关的游戏数据缓存
        this.gameDataCache = new Map();
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.wss.on('connection', (socket, req) => {
            this.handleConnection(socket, req);
        });
    }
    handleConnection(socket, req) {
        loggerService_1.default.debug('WebSocket connection attempt received', { remoteAddress: req.socket.remoteAddress });
        // 从请求头获取token
        const token = req.headers['sec-websocket-protocol']?.split(',')[0]?.trim();
        if (!token) {
            loggerService_1.default.warn('WebSocket connection rejected: Missing authentication token', { remoteAddress: req.socket.remoteAddress });
            socket.close(1008, '缺少认证令牌');
            return;
        }
        try {
            // 验证JWT令牌
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // 兼容两种格式：decoded.id和decoded.userId
            const userId = decoded.id || decoded.userId;
            const clientId = `${userId}-${Date.now()}`;
            loggerService_1.default.info('WebSocket connection authenticated', { userId, clientId, remoteAddress: req.socket.remoteAddress });
            // 创建客户端对象
            const client = {
                id: clientId,
                userId,
                socket
            };
            // 添加到客户端映射
            this.clients.set(clientId, client);
            // 设置客户端事件处理
            socket.on('message', (data) => this.handleMessage(clientId, data));
            socket.on('close', () => this.handleClose(clientId));
            socket.on('error', (error) => this.handleError(clientId, error));
            // 发送连接成功消息
            this.sendToClient(clientId, {
                type: 'connection_success',
                data: { clientId, userId }
            });
        }
        catch (error) {
            // TypeScript中catch的error默认是unknown类型，需要进行类型断言
            const err = error;
            loggerService_1.default.error('WebSocket authentication failed', { remoteAddress: req.socket.remoteAddress, error: err.message, stack: err.stack });
            socket.close(1008, '无效的认证令牌');
        }
    }
    async handleMessage(clientId, data) {
        try {
            // 将RawData转换为字符串
            const messageString = typeof data === 'string' ? data : data.toString();
            const message = JSON.parse(messageString);
            const client = this.clients.get(clientId);
            if (!client) {
                loggerService_1.default.warn('Received message from unknown client', { clientId });
                return;
            }
            loggerService_1.default.info('Processing WebSocket message', {
                clientId,
                userId: client.userId,
                messageType: message.type
            });
            // 根据消息类型处理
            switch (message.type) {
                case 'join_room':
                    loggerService_1.default.debug('Handling join_room event', { clientId, roomId: message.data?.roomId });
                    await this.handleJoinRoom(client, message.data);
                    break;
                case 'leave_room':
                    loggerService_1.default.debug('Handling leave_room event', { clientId, roomId: message.data?.roomId });
                    await this.handleLeaveRoom(client, message.data);
                    break;
                case 'game_action':
                    loggerService_1.default.debug('Handling game_action event', { clientId, actionType: message.data?.action?.action_type, sessionId: message.data?.sessionId });
                    this.handleGameAction(client, message.data);
                    break;
                case 'chat_message':
                    loggerService_1.default.debug('Handling chat_message event', { clientId, message: message.data?.message?.substring(0, 50) + '...', roomId: message.data?.roomId });
                    this.handleChatMessage(client, message.data);
                    break;
                case 'real_time_analysis_toggle':
                    loggerService_1.default.debug('Handling real_time_analysis_toggle event', { clientId, enabled: message.data?.enabled });
                    this.handleRealTimeAnalysisToggle(client, message.data);
                    break;
                case 'update_game_data':
                    loggerService_1.default.debug('Handling update_game_data event', { clientId, sessionId: message.data?.sessionId });
                    this.handleGameDataUpdate(client, message.data);
                    break;
                case 'player_ready':
                    loggerService_1.default.debug('Handling player_ready event', { clientId, ready: message.data?.ready });
                    this.handlePlayerReady(client, message.data);
                    break;
                default:
                    loggerService_1.default.warn('Unknown message type', { clientId, messageType: message.type });
                    this.sendToClient(clientId, {
                        type: 'error',
                        data: { message: '未知的消息类型' }
                    });
            }
        }
        catch (error) {
            // TypeScript中catch的error默认是unknown类型，需要进行类型断言
            const err = error;
            loggerService_1.default.error('Error processing WebSocket message', { clientId, error: err.message, stack: err.stack });
            this.sendToClient(clientId, {
                type: 'error',
                data: { message: '消息格式错误' }
            });
        }
    }
    async handleJoinRoom(client, data) {
        const { roomId } = data;
        if (!roomId) {
            loggerService_1.default.warn('Missing roomId in join_room request', { clientId: client.id, userId: client.userId });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: '缺少房间ID' }
            });
            return;
        }
        try {
            // 检查用户是否已经在房间中（基于客户端状态的快速检查）
            if (client.roomId) {
                loggerService_1.default.warn('Player already in a room (client state)', { clientId: client.id, userId: client.userId, currentRoomId: client.roomId, requestedRoomId: roomId });
                this.sendToClient(client.id, {
                    type: 'error',
                    data: { message: '您已经在一个房间中，无法加入新房间' }
                });
                return;
            }
            // 调用roomService进行房间加入操作，确保与数据库同步
            const roomService = await Promise.resolve().then(() => __importStar(require('./roomService')));
            await roomService.joinRoom(roomId, client.userId);
            loggerService_1.default.info('Player joining room', { clientId: client.id, userId: client.userId, roomId });
            // 更新客户端房间信息
            client.roomId = roomId;
            this.clients.set(client.id, client);
            // 通知房间内其他用户
            loggerService_1.default.debug('Broadcasting player joined notification', { clientId: client.id, userId: client.userId, roomId });
            this.broadcastToRoom(roomId, {
                type: 'player_joined',
                data: { userId: client.userId }
            }, client.id);
            // 发送聊天历史给新加入的玩家
            loggerService_1.default.debug('Sending chat history to new player', { clientId: client.id, roomId, historyLength: this.getChatHistory(roomId).length });
            this.sendChatHistory(client.id, roomId);
            // 发送加入房间成功消息
            this.sendToClient(client.id, {
                type: 'join_room_success',
                data: { roomId }
            });
        }
        catch (error) {
            const err = error;
            loggerService_1.default.error('Failed to join room', { clientId: client.id, userId: client.userId, roomId, error: err.message });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: err.message || '加入房间失败' }
            });
        }
    }
    async handleLeaveRoom(client, data) {
        const { roomId } = data;
        if (!roomId || client.roomId !== roomId) {
            loggerService_1.default.warn('Invalid roomId in leave_room request', { clientId: client.id, userId: client.userId, requestedRoomId: roomId, currentRoomId: client.roomId });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: '无效的房间ID' }
            });
            return;
        }
        try {
            // 调用roomService进行房间离开操作，确保与数据库同步
            const roomService = await Promise.resolve().then(() => __importStar(require('./roomService')));
            await roomService.leaveRoom(roomId, client.userId);
            loggerService_1.default.info('Player leaving room', { clientId: client.id, userId: client.userId, roomId });
            // 通知房间内其他用户
            loggerService_1.default.debug('Broadcasting player left notification', { clientId: client.id, userId: client.userId, roomId });
            this.broadcastToRoom(roomId, {
                type: 'player_left',
                data: { userId: client.userId }
            }, client.id);
            // 更新客户端房间信息
            client.roomId = undefined;
            this.clients.set(client.id, client);
            // 发送离开房间成功消息
            this.sendToClient(client.id, {
                type: 'leave_room_success',
                data: { roomId }
            });
        }
        catch (error) {
            const err = error;
            loggerService_1.default.error('Failed to leave room', { clientId: client.id, userId: client.userId, roomId, error: err.message });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: err.message || '离开房间失败' }
            });
        }
    }
    handlePlayerReady(client, data) {
        const { roomId, ready } = data;
        if (!roomId || client.roomId !== roomId) {
            loggerService_1.default.warn('Invalid roomId in player_ready request', { clientId: client.id, userId: client.userId, requestedRoomId: roomId, currentRoomId: client.roomId });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: '无效的房间ID' }
            });
            return;
        }
        loggerService_1.default.info('Player ready status updated', { clientId: client.id, userId: client.userId, roomId, ready });
        // 广播玩家准备状态到房间内所有用户
        loggerService_1.default.debug('Broadcasting player ready status to room', { clientId: client.id, userId: client.userId, roomId, ready });
        this.broadcastToRoom(roomId, {
            type: 'player_ready_status',
            data: {
                playerId: client.userId,
                ready
            }
        });
        // 发送准备状态更新成功消息
        this.sendToClient(client.id, {
            type: 'player_ready_success',
            data: { roomId, ready }
        });
    }
    async handleGameAction(client, data) {
        const { sessionId, action } = data;
        if (!sessionId || !action) {
            loggerService_1.default.warn('Missing required parameters in game_action', { clientId: client.id, userId: client.userId, hasSessionId: !!sessionId, hasAction: !!action });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: '缺少必要参数' }
            });
            return;
        }
        loggerService_1.default.info('Processing game action', { clientId: client.id, userId: client.userId, sessionId, actionType: action.action_type, roomId: client.roomId });
        // 更新客户端会话信息
        client.sessionId = sessionId;
        this.clients.set(client.id, client);
        try {
            // 调用gameService处理游戏动作
            const gameService = await Promise.resolve().then(() => __importStar(require('./gameService')));
            await gameService.executeGameAction(sessionId, client.userId, action);
        }
        catch (error) {
            const err = error;
            loggerService_1.default.error('Failed to execute game action', { clientId: client.id, userId: client.userId, sessionId, actionType: action.action_type, error: err.message });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: err.message || '执行游戏动作失败' }
            });
            return;
        }
    }
    handleChatMessage(client, data) {
        const { message, roomId, isPrivate, recipientId } = data;
        if (!message || !roomId) {
            loggerService_1.default.warn('Missing required parameters in chat_message', { clientId: client.id, userId: client.userId, hasMessage: !!message, hasRoomId: !!roomId });
            this.sendToClient(client.id, {
                type: 'error',
                data: { message: '缺少必要参数' }
            });
            return;
        }
        // 创建聊天消息对象
        const chatMessage = {
            id: Date.now().toString(),
            userId: client.userId,
            message,
            roomId,
            timestamp: new Date().toISOString(),
            isPrivate: isPrivate || false,
            recipientId
        };
        loggerService_1.default.info('Processing chat message', {
            clientId: client.id,
            userId: client.userId,
            roomId,
            isPrivate: chatMessage.isPrivate,
            recipientId: chatMessage.recipientId,
            messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });
        // 保存到聊天历史
        if (!this.chatHistory.has(roomId)) {
            this.chatHistory.set(roomId, []);
        }
        const history = this.chatHistory.get(roomId);
        history.push(chatMessage);
        // 限制历史记录长度
        if (history.length > this.maxHistoryLength) {
            const removedMessage = history.shift();
            loggerService_1.default.debug('Removed old chat message to limit history length', { roomId, removedMessageId: removedMessage?.id });
        }
        loggerService_1.default.debug('Current chat history length', { roomId, historyLength: history.length });
        if (isPrivate && recipientId) {
            // 私信功能：只发送给指定的接收者和发送者
            loggerService_1.default.debug('Sending private message', { clientId: client.id, userId: client.userId, recipientId, roomId });
            this.sendChatMessageToUser(chatMessage, recipientId);
            this.sendChatMessageToUser(chatMessage, client.userId);
        }
        else {
            // 广播聊天消息到房间内所有用户
            loggerService_1.default.debug('Broadcasting chat message to room', { clientId: client.id, userId: client.userId, roomId });
            this.broadcastToRoom(roomId, {
                type: 'chat_message',
                data: chatMessage
            });
        }
    }
    handleClose(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            loggerService_1.default.info('Client connection closed', {
                clientId,
                userId: client.userId,
                roomId: client.roomId,
                sessionId: client.sessionId
            });
            // 清理分析定时器
            if (client.analysisIntervalId) {
                clearInterval(client.analysisIntervalId);
                client.analysisIntervalId = undefined;
            }
            // 通知房间内其他用户
            if (client.roomId) {
                loggerService_1.default.debug('Broadcasting player disconnected notification', { clientId, userId: client.userId, roomId: client.roomId });
                this.broadcastToRoom(client.roomId, {
                    type: 'player_disconnected',
                    data: { userId: client.userId }
                }, client.id);
            }
            // 移除客户端
            this.clients.delete(clientId);
            loggerService_1.default.debug('Client removed from clients list', { clientId, remainingClients: this.clients.size });
        }
        else {
            loggerService_1.default.warn('Attempted to handle close for unknown client', { clientId });
        }
    }
    handleError(clientId, error) {
        loggerService_1.default.error('WebSocket client error', { clientId, error: error.message, stack: error.stack });
        const client = this.clients.get(clientId);
        if (client) {
            loggerService_1.default.debug('Removing client due to error', { clientId, userId: client.userId });
            this.clients.delete(clientId);
        }
    }
    // 发送消息给单个客户端
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.socket.readyState === ws_1.WebSocket.OPEN) {
            client.socket.send(JSON.stringify(message));
        }
    }
    // 广播消息到房间内所有客户端
    broadcastToRoom(roomId, message, excludeClientId) {
        this.clients.forEach((client) => {
            if (client.roomId === roomId &&
                client.id !== excludeClientId &&
                client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(JSON.stringify(message));
            }
        });
    }
    // 向特定用户发送消息
    broadcastToUser(userId, message) {
        // 遍历所有客户端，查找指定用户的客户端，并发送消息
        this.clients.forEach((client) => {
            if (client.userId === userId && client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(JSON.stringify(message));
            }
        });
    }
    // 广播消息到所有客户端
    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(JSON.stringify(message));
            }
        });
    }
    // 获取房间内的客户端列表
    getClientsInRoom(roomId) {
        return Array.from(this.clients.values())
            .filter(client => client.roomId === roomId);
    }
    // 发送聊天消息给特定用户
    sendChatMessageToUser(message, userId) {
        this.clients.forEach((client) => {
            if (client.userId === userId && client.socket.readyState === ws_1.WebSocket.OPEN) {
                client.socket.send(JSON.stringify({
                    type: 'chat_message',
                    data: message
                }));
            }
        });
    }
    // 获取房间的聊天历史
    getChatHistory(roomId) {
        return this.chatHistory.get(roomId) || [];
    }
    // 发送聊天历史给客户端
    sendChatHistory(clientId, roomId) {
        const history = this.getChatHistory(roomId);
        this.sendToClient(clientId, {
            type: 'chat_history',
            data: history
        });
    }
    // 处理实时AI分析开关
    handleRealTimeAnalysisToggle(client, data) {
        const { enabled, style } = data;
        // 清理现有定时器
        if (client.analysisIntervalId) {
            clearInterval(client.analysisIntervalId);
            client.analysisIntervalId = undefined;
        }
        // 配置实时分析
        client.realTimeAnalysisConfig = {
            enabled,
            analysisInterval: 5000, // 默认5秒
            style: style || 'gto',
            autoAnalyzeOnAction: true
        };
        loggerService_1.default.info('Real-time AI analysis toggle', {
            clientId: client.id,
            userId: client.userId,
            enabled,
            style: client.realTimeAnalysisConfig.style
        });
        // 如果启用，启动定时器
        if (enabled) {
            this.startRealTimeAnalysis(client);
        }
        // 发送确认消息
        this.sendToClient(client.id, {
            type: 'real_time_analysis_toggle_success',
            data: { enabled, style: client.realTimeAnalysisConfig.style }
        });
    }
    // 处理游戏数据更新
    handleGameDataUpdate(client, data) {
        const { sessionId, holeCards, communityCards, betHistory, potSize, currentBet, stackSize } = data;
        if (!sessionId)
            return;
        // 更新游戏数据缓存
        this.gameDataCache.set(sessionId, {
            holeCards,
            communityCards,
            betHistory,
            potSize,
            currentBet,
            stackSize
        });
        // 如果启用了自动分析，立即进行一次分析
        if (client.realTimeAnalysisConfig?.enabled && client.realTimeAnalysisConfig?.autoAnalyzeOnAction) {
            this.performRealTimeAnalysis(client, sessionId);
        }
    }
    // 启动实时AI分析定时器
    startRealTimeAnalysis(client) {
        if (!client.sessionId || !client.realTimeAnalysisConfig?.enabled)
            return;
        const interval = client.realTimeAnalysisConfig.analysisInterval || 5000;
        client.analysisIntervalId = setInterval(() => {
            if (client.sessionId) {
                this.performRealTimeAnalysis(client, client.sessionId);
            }
        }, interval);
        loggerService_1.default.debug('Real-time AI analysis started', {
            clientId: client.id,
            userId: client.userId,
            interval
        });
    }
    // 执行实时AI分析
    performRealTimeAnalysis(client, sessionId) {
        const gameData = this.gameDataCache.get(sessionId);
        if (!gameData || !client.realTimeAnalysisConfig)
            return;
        try {
            const { holeCards, communityCards, betHistory, potSize, currentBet, stackSize } = gameData;
            // 执行AI分析
            const analysis = aiService_1.aiService.analyzeHand(client.userId, sessionId, holeCards, communityCards, betHistory, potSize, currentBet, stackSize);
            // 获取AI建议
            const suggestion = aiService_1.aiService.getSuggestion(client.userId, sessionId, client.realTimeAnalysisConfig.style, holeCards, communityCards, betHistory, potSize, currentBet, stackSize);
            // 发送分析结果
            const event = {
                type: 'ai_analysis',
                data: {
                    session_id: sessionId,
                    analysis,
                    suggestion
                }
            };
            this.sendToClient(client.id, event);
            loggerService_1.default.debug('Real-time AI analysis performed', {
                clientId: client.id,
                userId: client.userId,
                sessionId
            });
        }
        catch (error) {
            loggerService_1.default.error('Error in real-time AI analysis', {
                clientId: client.id,
                userId: client.userId,
                sessionId,
                error: error.message
            });
        }
    }
    // 获取客户端数量
    getClientCount() {
        return this.clients.size;
    }
    // 关闭WebSocket服务器
    close() {
        // 清理所有定时器
        this.clients.forEach((client) => {
            if (client.analysisIntervalId) {
                clearInterval(client.analysisIntervalId);
            }
        });
        this.wss.close();
    }
}
exports.WebSocketService = WebSocketService;
exports.default = WebSocketService;
//# sourceMappingURL=websocketService.js.map