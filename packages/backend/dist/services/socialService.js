"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialService = void 0;
const postgreSQLSocialDAO_1 = require("../dao/impl/postgreSQLSocialDAO");
const websocketInstance_1 = require("./websocketInstance");
const loggerService_1 = __importDefault(require("./loggerService"));
// 社交服务类
class SocialService {
    constructor() { }
    static getInstance() {
        if (!SocialService.instance) {
            SocialService.instance = new SocialService();
        }
        return SocialService.instance;
    }
    // 好友请求相关功能
    /**
     * 发送好友请求
     * @param fromUserId 发送者用户ID
     * @param toUserId 接收者用户ID
     * @returns 好友请求对象
     */
    async sendFriendRequest(fromUserId, toUserId) {
        // 检查是否已经是好友
        const isFriends = await postgreSQLSocialDAO_1.friendDAO.isFriends(fromUserId, toUserId);
        if (isFriends) {
            throw new Error('你们已经是好友了');
        }
        // 检查是否已经有未处理的好友请求
        const existingRequest = await postgreSQLSocialDAO_1.friendRequestDAO.getFriendRequestByUsers(fromUserId, toUserId);
        if (existingRequest && existingRequest.status === 'pending') {
            throw new Error('好友请求已发送，等待对方响应');
        }
        // 创建好友请求
        const friendRequest = await postgreSQLSocialDAO_1.friendRequestDAO.createFriendRequest({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            status: 'pending'
        });
        // 发送WebSocket通知给接收者
        const websocketService = (0, websocketInstance_1.getWebSocketService)();
        const event = {
            type: 'friend_request',
            data: friendRequest
        };
        websocketService.broadcastToUser(toUserId, event);
        // 记录日志
        loggerService_1.default.info(`User ${fromUserId} sent friend request to user ${toUserId}`);
        return friendRequest;
    }
    /**
     * 响应好友请求
     * @param requestId 请求ID
     * @param status 响应状态 (accepted/rejected)
     * @returns 更新后的好友请求对象
     */
    async respondToFriendRequest(requestId, status) {
        // 获取好友请求
        const friendRequest = await postgreSQLSocialDAO_1.friendRequestDAO.getFriendRequestById(requestId);
        if (!friendRequest) {
            throw new Error('好友请求不存在');
        }
        if (friendRequest.status !== 'pending') {
            throw new Error('好友请求已处理');
        }
        // 更新好友请求状态
        const updatedRequest = await postgreSQLSocialDAO_1.friendRequestDAO.updateFriendRequestStatus(requestId, status);
        if (!updatedRequest) {
            throw new Error('更新好友请求失败');
        }
        // 如果接受请求，创建好友关系
        if (status === 'accepted') {
            await postgreSQLSocialDAO_1.friendDAO.createFriendship({
                user_id: friendRequest.from_user_id,
                friend_id: friendRequest.to_user_id
            });
        }
        // 发送WebSocket通知给双方
        const websocketService = (0, websocketInstance_1.getWebSocketService)();
        const responseEvent = {
            type: 'friend_request_response',
            data: {
                request_id: requestId,
                status,
                from_user_id: friendRequest.from_user_id,
                to_user_id: friendRequest.to_user_id
            }
        };
        websocketService.broadcastToUser(friendRequest.from_user_id, responseEvent);
        websocketService.broadcastToUser(friendRequest.to_user_id, responseEvent);
        // 记录日志
        loggerService_1.default.info(`Friend request ${requestId} from ${friendRequest.from_user_id} to ${friendRequest.to_user_id} ${status}`);
        return updatedRequest;
    }
    /**
     * 获取用户收到的好友请求列表
     * @param userId 用户ID
     * @param status 请求状态 (可选)
     * @returns 好友请求列表
     */
    async getReceivedFriendRequests(userId, status) {
        return await postgreSQLSocialDAO_1.friendRequestDAO.getFriendRequestsByToUserId(userId, status);
    }
    /**
     * 获取用户发送的好友请求列表
     * @param userId 用户ID
     * @param status 请求状态 (可选)
     * @returns 好友请求列表
     */
    async getSentFriendRequests(userId, status) {
        return await postgreSQLSocialDAO_1.friendRequestDAO.getFriendRequestsByFromUserId(userId, status);
    }
    /**
     * 删除好友请求
     * @param requestId 请求ID
     * @returns 是否删除成功
     */
    async deleteFriendRequest(requestId) {
        const success = await postgreSQLSocialDAO_1.friendRequestDAO.deleteFriendRequest(requestId);
        if (success) {
            loggerService_1.default.info(`Friend request ${requestId} deleted`);
        }
        return success;
    }
    // 好友关系相关功能
    /**
     * 获取用户的好友列表
     * @param userId 用户ID
     * @returns 好友列表
     */
    async getFriends(userId) {
        return await postgreSQLSocialDAO_1.friendDAO.getFriendsByUserId(userId);
    }
    /**
     * 检查两个用户是否是好友
     * @param userId 用户ID
     * @param friendId 好友ID
     * @returns 是否是好友
     */
    async isFriends(userId, friendId) {
        return await postgreSQLSocialDAO_1.friendDAO.isFriends(userId, friendId);
    }
    /**
     * 删除好友
     * @param userId 用户ID
     * @param friendId 好友ID
     * @returns 是否删除成功
     */
    async removeFriend(userId, friendId) {
        const success = await postgreSQLSocialDAO_1.friendDAO.deleteFriendship(userId, friendId);
        if (success) {
            loggerService_1.default.info(`User ${userId} removed friend ${friendId}`);
        }
        return success;
    }
    // 私信相关功能
    /**
     * 发送私信
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @param content 消息内容
     * @returns 私信对象
     */
    async sendPrivateMessage(senderId, receiverId, content) {
        // 检查是否是好友
        const isFriends = await postgreSQLSocialDAO_1.friendDAO.isFriends(senderId, receiverId);
        if (!isFriends) {
            throw new Error('只能给好友发送私信');
        }
        // 创建私信
        const message = await postgreSQLSocialDAO_1.privateMessageDAO.createMessage({
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            read: false
        });
        // 发送WebSocket通知给接收者
        const websocketService = (0, websocketInstance_1.getWebSocketService)();
        const event = {
            type: 'private_message',
            data: message
        };
        websocketService.broadcastToUser(receiverId, event);
        // 记录日志
        loggerService_1.default.info(`User ${senderId} sent private message to user ${receiverId}`);
        return message;
    }
    /**
     * 获取两个用户之间的私信历史
     * @param userId 用户ID
     * @param otherUserId 对方用户ID
     * @param limit 限制数量
     * @param offset 偏移量
     * @returns 私信列表
     */
    async getPrivateMessageHistory(userId, otherUserId, limit = 50, offset = 0) {
        // 检查是否是好友
        const isFriends = await postgreSQLSocialDAO_1.friendDAO.isFriends(userId, otherUserId);
        if (!isFriends) {
            throw new Error('只能查看好友的私信历史');
        }
        // 标记对方发送的消息为已读
        await postgreSQLSocialDAO_1.privateMessageDAO.markAllMessagesAsRead(userId, otherUserId);
        return await postgreSQLSocialDAO_1.privateMessageDAO.getPrivateMessagesBetweenUsers(userId, otherUserId, limit, offset);
    }
    /**
     * 获取用户的未读私信数量
     * @param userId 用户ID
     * @returns 未读消息数量
     */
    async getUnreadMessageCount(userId) {
        return await postgreSQLSocialDAO_1.privateMessageDAO.getUnreadMessageCount(userId);
    }
    /**
     * 标记私信为已读
     * @param messageIds 消息ID列表
     * @returns 是否标记成功
     */
    async markMessagesAsRead(messageIds) {
        return await postgreSQLSocialDAO_1.privateMessageDAO.markMessagesAsRead(messageIds);
    }
    /**
     * 标记与某个用户的所有私信为已读
     * @param userId 用户ID
     * @param otherUserId 对方用户ID
     * @returns 是否标记成功
     */
    async markAllMessagesAsRead(userId, otherUserId) {
        return await postgreSQLSocialDAO_1.privateMessageDAO.markAllMessagesAsRead(userId, otherUserId);
    }
}
// 导出社交服务实例
exports.socialService = SocialService.getInstance();
exports.default = SocialService;
//# sourceMappingURL=socialService.js.map