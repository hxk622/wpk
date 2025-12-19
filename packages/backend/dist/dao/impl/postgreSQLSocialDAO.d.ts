import { FriendRequest, Friend, PrivateMessage } from '../../types';
import { FriendRequestDAO, FriendDAO, PrivateMessageDAO } from '../socialDAO';
declare class PostgreSQLFriendRequestDAO implements FriendRequestDAO {
    createFriendRequest(request: Omit<FriendRequest, 'id' | 'created_at' | 'updated_at'>): Promise<FriendRequest>;
    getFriendRequestById(id: string): Promise<FriendRequest | null>;
    getFriendRequestByUsers(fromUserId: string, toUserId: string): Promise<FriendRequest | null>;
    getFriendRequestsByToUserId(toUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    getFriendRequestsByFromUserId(fromUserId: string, status?: FriendRequest['status']): Promise<FriendRequest[]>;
    updateFriendRequestStatus(id: string, status: FriendRequest['status']): Promise<FriendRequest | null>;
    deleteFriendRequest(id: string): Promise<boolean>;
}
declare class PostgreSQLFriendDAO implements FriendDAO {
    createFriendship(friendship: Omit<Friend, 'id' | 'created_at' | 'updated_at'>): Promise<[Friend, Friend]>;
    getFriendshipById(id: string): Promise<Friend | null>;
    isFriends(userId: string, friendId: string): Promise<boolean>;
    getFriendsByUserId(userId: string): Promise<Friend[]>;
    deleteFriendship(userId: string, friendId: string): Promise<boolean>;
}
declare class PostgreSQLPrivateMessageDAO implements PrivateMessageDAO {
    createMessage(message: Omit<PrivateMessage, 'id' | 'created_at' | 'updated_at'>): Promise<PrivateMessage>;
    getPrivateMessageById(id: string): Promise<PrivateMessage | null>;
    getPrivateMessagesBetweenUsers(senderId: string, receiverId: string, limit?: number, offset?: number): Promise<PrivateMessage[]>;
    getUnreadMessageCount(userId: string): Promise<number>;
    markMessagesAsRead(messageIds: string[]): Promise<boolean>;
    markAllMessagesAsRead(userId: string, otherUserId: string): Promise<boolean>;
    deletePrivateMessage(id: string): Promise<boolean>;
}
export declare const friendRequestDAO: PostgreSQLFriendRequestDAO;
export declare const friendDAO: PostgreSQLFriendDAO;
export declare const privateMessageDAO: PostgreSQLPrivateMessageDAO;
export {};
