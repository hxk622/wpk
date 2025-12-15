import { FriendRequest, Friend, PrivateMessage } from '../types';

// 好友请求DAO接口
export interface FriendRequestDAO {
  // 创建好友请求
  createFriendRequest(request: Omit<FriendRequest, 'id' | 'created_at' | 'updated_at'>): Promise<FriendRequest>;
  
  // 根据ID获取好友请求
  getFriendRequestById(id: string): Promise<FriendRequest | null>;
  
  // 根据发送者和接收者获取好友请求
  getFriendRequestByUsers(fromUserId: string, toUserId: string): Promise<FriendRequest | null>;
  
  // 获取用户收到的好友请求列表
  getFriendRequestsByToUserId(toUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
  
  // 获取用户发送的好友请求列表
  getFriendRequestsByFromUserId(fromUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
  
  // 更新好友请求状态
  updateFriendRequestStatus(id: string, status: FriendRequest['status']): Promise<FriendRequest | null>;
  
  // 删除好友请求
  deleteFriendRequest(id: string): Promise<boolean>;
}

// 好友关系DAO接口
export interface FriendDAO {
  // 创建好友关系（双向）
  createFriendship(friendship: Omit<Friend, 'id' | 'created_at' | 'updated_at'>): Promise<[Friend, Friend]>;
  
  // 根据ID获取好友关系
  getFriendshipById(id: string): Promise<Friend | null>;
  
  // 检查两个用户是否是好友
  isFriends(userId: string, friendId: string): Promise<boolean>;
  
  // 获取用户的好友列表
  getFriendsByUserId(userId: string): Promise<Friend[]>;
  
  // 删除好友关系（双向）
  deleteFriendship(userId: string, friendId: string): Promise<boolean>;
}

// 私信DAO接口
export interface PrivateMessageDAO {
  // 创建私信
  createMessage(message: Omit<PrivateMessage, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<PrivateMessage>;
  
  // 根据ID获取私信
  getPrivateMessageById(id: string): Promise<PrivateMessage | null>;
  
  // 获取两个用户之间的私信历史
  getPrivateMessagesBetweenUsers(senderId: string, receiverId: string, limit?: number, offset?: number): Promise<PrivateMessage[]>;
  
  // 获取用户收到的未读私信数量
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // 标记私信为已读
  markMessagesAsRead(messageIds: string[]): Promise<boolean>;
  
  // 标记用户间的所有私信为已读
  markAllMessagesAsRead(userId: string, otherUserId: string): Promise<boolean>;
  
  // 删除私信
  deletePrivateMessage(id: string): Promise<boolean>;
}
