import { FriendRequest, Friend, PrivateMessage } from '../types';
export interface FriendRequestDAO {
    createFriendRequest(request: Omit<FriendRequest, 'id' | 'created_at' | 'updated_at'>): Promise<FriendRequest>;
    getFriendRequestById(id: string): Promise<FriendRequest | null>;
    getFriendRequestByUsers(fromUserId: string, toUserId: string): Promise<FriendRequest | null>;
    getFriendRequestsByToUserId(toUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    getFriendRequestsByFromUserId(fromUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    updateFriendRequestStatus(id: string, status: FriendRequest['status']): Promise<FriendRequest | null>;
    deleteFriendRequest(id: string): Promise<boolean>;
}
export interface FriendDAO {
    createFriendship(friendship: Omit<Friend, 'id' | 'created_at' | 'updated_at'>): Promise<[Friend, Friend]>;
    getFriendshipById(id: string): Promise<Friend | null>;
    isFriends(userId: string, friendId: string): Promise<boolean>;
    getFriendsByUserId(userId: string): Promise<Friend[]>;
    deleteFriendship(userId: string, friendId: string): Promise<boolean>;
}
export interface PrivateMessageDAO {
    createMessage(message: Omit<PrivateMessage, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<PrivateMessage>;
    getPrivateMessageById(id: string): Promise<PrivateMessage | null>;
    getPrivateMessagesBetweenUsers(senderId: string, receiverId: string, limit?: number, offset?: number): Promise<PrivateMessage[]>;
    getUnreadMessageCount(userId: string): Promise<number>;
    markMessagesAsRead(messageIds: string[]): Promise<boolean>;
    markAllMessagesAsRead(userId: string, otherUserId: string): Promise<boolean>;
    deletePrivateMessage(id: string): Promise<boolean>;
}
