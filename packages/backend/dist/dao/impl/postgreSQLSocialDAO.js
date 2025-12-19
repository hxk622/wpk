"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateMessageDAO = exports.friendDAO = exports.friendRequestDAO = void 0;
const database_1 = __importDefault(require("../../services/database"));
const uuid_1 = require("uuid");
// 好友请求DAO实现
class PostgreSQLFriendRequestDAO {
    async createFriendRequest(request) {
        const client = await database_1.default.connect();
        try {
            const id = (0, uuid_1.v4)();
            const now = new Date();
            const result = await client.query('INSERT INTO friend_requests (id, from_user_id, to_user_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, request.from_user_id, request.to_user_id, request.status, now, now]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async getFriendRequestById(id) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM friend_requests WHERE id = $1', [id]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async getFriendRequestByUsers(fromUserId, toUserId) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM friend_requests WHERE from_user_id = $1 AND to_user_id = $2', [fromUserId, toUserId]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async getFriendRequestsByToUserId(toUserId, status) {
        const client = await database_1.default.connect();
        try {
            let query = 'SELECT * FROM friend_requests WHERE to_user_id = $1';
            const params = [toUserId];
            if (status) {
                query += ' AND status = $2';
                params.push(status);
            }
            query += ' ORDER BY created_at DESC';
            const result = await client.query(query, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async getFriendRequestsByFromUserId(fromUserId, status) {
        const client = await database_1.default.connect();
        try {
            let query = 'SELECT * FROM friend_requests WHERE from_user_id = $1';
            const params = [fromUserId];
            if (status) {
                query += ' AND status = $2';
                params.push(status);
            }
            query += ' ORDER BY created_at DESC';
            const result = await client.query(query, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async updateFriendRequestStatus(id, status) {
        const client = await database_1.default.connect();
        try {
            const now = new Date();
            const result = await client.query('UPDATE friend_requests SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *', [status, now, id]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async deleteFriendRequest(id) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('DELETE FROM friend_requests WHERE id = $1', [id]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
}
// 好友DAO实现
class PostgreSQLFriendDAO {
    async createFriendship(friendship) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const id1 = (0, uuid_1.v4)();
            const id2 = (0, uuid_1.v4)();
            const now = new Date();
            // 创建正向好友关系
            const result1 = await client.query('INSERT INTO friends (id, user_id, friend_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id1, friendship.user_id, friendship.friend_id, now, now]);
            // 创建反向好友关系
            const result2 = await client.query('INSERT INTO friends (id, user_id, friend_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id2, friendship.friend_id, friendship.user_id, now, now]);
            await client.query('COMMIT');
            return [result1.rows[0], result2.rows[0]];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getFriendshipById(id) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM friends WHERE id = $1', [id]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async isFriends(userId, friendId) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2 LIMIT 1', [userId, friendId]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
    async getFriendsByUserId(userId) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query(`SELECT f.*, u.username, u.avatar, u.chips 
         FROM friends f 
         JOIN users u ON f.friend_id = u.id 
         WHERE f.user_id = $1 
         ORDER BY f.created_at DESC`, [userId]);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async deleteFriendship(userId, friendId) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // 删除正向好友关系
            await client.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [userId, friendId]);
            // 删除反向好友关系
            await client.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [friendId, userId]);
            await client.query('COMMIT');
            return true;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
// 私信DAO实现
class PostgreSQLPrivateMessageDAO {
    async createMessage(message) {
        const client = await database_1.default.connect();
        try {
            const id = (0, uuid_1.v4)();
            const now = new Date();
            const result = await client.query('INSERT INTO private_messages (id, sender_id, receiver_id, content, read, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [id, message.sender_id, message.receiver_id, message.content, false, now, now]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async getPrivateMessageById(id) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM private_messages WHERE id = $1', [id]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    async getPrivateMessagesBetweenUsers(senderId, receiverId, limit = 50, offset = 0) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query(`SELECT pm.*, us.username as sender_name, us.avatar as sender_avatar, ur.username as receiver_name, ur.avatar as receiver_avatar 
         FROM private_messages pm 
         JOIN users us ON pm.sender_id = us.id 
         JOIN users ur ON pm.receiver_id = ur.id 
         WHERE (pm.sender_id = $1 AND pm.receiver_id = $2) OR (pm.sender_id = $2 AND pm.receiver_id = $1) 
         ORDER BY pm.created_at DESC 
         LIMIT $3 OFFSET $4`, [senderId, receiverId, limit, offset]);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async getUnreadMessageCount(userId) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT COUNT(*) as count FROM private_messages WHERE receiver_id = $1 AND read = false', [userId]);
            return parseInt(result.rows[0].count, 10);
        }
        finally {
            client.release();
        }
    }
    async markMessagesAsRead(messageIds) {
        const client = await database_1.default.connect();
        try {
            const now = new Date();
            const result = await client.query('UPDATE private_messages SET read = true, updated_at = $1 WHERE id = ANY($2) RETURNING *', [now, messageIds]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
    async markAllMessagesAsRead(userId, otherUserId) {
        const client = await database_1.default.connect();
        try {
            const now = new Date();
            const result = await client.query('UPDATE private_messages SET read = true, updated_at = $1 WHERE receiver_id = $2 AND sender_id = $3 RETURNING *', [now, userId, otherUserId]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
    async deletePrivateMessage(id) {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('DELETE FROM private_messages WHERE id = $1', [id]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
}
// 导出DAO实例
exports.friendRequestDAO = new PostgreSQLFriendRequestDAO();
exports.friendDAO = new PostgreSQLFriendDAO();
exports.privateMessageDAO = new PostgreSQLPrivateMessageDAO();
//# sourceMappingURL=postgreSQLSocialDAO.js.map