import { FriendRequest, Friend, PrivateMessage } from '../types';
declare class SocialService {
    private static instance;
    private constructor();
    static getInstance(): SocialService;
    /**
     * 发送好友请求
     * @param fromUserId 发送者用户ID
     * @param toUserId 接收者用户ID
     * @returns 好友请求对象
     */
    sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>;
    /**
     * 响应好友请求
     * @param requestId 请求ID
     * @param status 响应状态 (accepted/rejected)
     * @returns 更新后的好友请求对象
     */
    respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<FriendRequest>;
    /**
     * 获取用户收到的好友请求列表
     * @param userId 用户ID
     * @param status 请求状态 (可选)
     * @returns 好友请求列表
     */
    getReceivedFriendRequests(userId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    /**
     * 获取用户发送的好友请求列表
     * @param userId 用户ID
     * @param status 请求状态 (可选)
     * @returns 好友请求列表
     */
    getSentFriendRequests(userId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    /**
     * 删除好友请求
     * @param requestId 请求ID
     * @returns 是否删除成功
     */
    deleteFriendRequest(requestId: string): Promise<boolean>;
    /**
     * 获取用户的好友列表
     * @param userId 用户ID
     * @returns 好友列表
     */
    getFriends(userId: string): Promise<Friend[]>;
    /**
     * 检查两个用户是否是好友
     * @param userId 用户ID
     * @param friendId 好友ID
     * @returns 是否是好友
     */
    isFriends(userId: string, friendId: string): Promise<boolean>;
    /**
     * 删除好友
     * @param userId 用户ID
     * @param friendId 好友ID
     * @returns 是否删除成功
     */
    removeFriend(userId: string, friendId: string): Promise<boolean>;
    /**
     * 发送私信
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @param content 消息内容
     * @returns 私信对象
     */
    sendPrivateMessage(senderId: string, receiverId: string, content: string): Promise<PrivateMessage>;
    /**
     * 获取两个用户之间的私信历史
     * @param userId 用户ID
     * @param otherUserId 对方用户ID
     * @param limit 限制数量
     * @param offset 偏移量
     * @returns 私信列表
     */
    getPrivateMessageHistory(userId: string, otherUserId: string, limit?: number, offset?: number): Promise<PrivateMessage[]>;
    /**
     * 获取用户的未读私信数量
     * @param userId 用户ID
     * @returns 未读消息数量
     */
    getUnreadMessageCount(userId: string): Promise<number>;
    /**
     * 标记私信为已读
     * @param messageIds 消息ID列表
     * @returns 是否标记成功
     */
    markMessagesAsRead(messageIds: string[]): Promise<boolean>;
    /**
     * 标记与某个用户的所有私信为已读
     * @param userId 用户ID
     * @param otherUserId 对方用户ID
     * @returns 是否标记成功
     */
    markAllMessagesAsRead(userId: string, otherUserId: string): Promise<boolean>;
}
export declare const socialService: SocialService;
export default SocialService;
