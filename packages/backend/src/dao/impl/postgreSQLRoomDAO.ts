import pool from '../../services/database';
import { GameRoom, CreateRoomInput } from '../../types';
import { RoomDAO } from '../roomDAO';
import { RedisCache } from '../../services/redisCache';
import loggerService from '../../services/loggerService';

export class PostgreSQLRoomDAO implements RoomDAO {
  private static readonly TABLE_NAME = 'game_rooms';
  private static readonly CACHE_KEY_PREFIX = 'room:';

  // 这个方法与接口定义不匹配，应该由createRoom方法代替
  async create(entity: Omit<GameRoom, 'id' | 'created_at' | 'updated_at'>): Promise<GameRoom> {
    // 内部使用createRoom方法实现，保持接口兼容性
    return this.createRoom(
      {
        name: entity.name,
        room_type: entity.room_type,
        small_blind: entity.small_blind,
        big_blind: entity.big_blind,
        max_players: entity.max_players,
        password: entity.password,
        min_buy_in: entity.min_buy_in,
        max_buy_in: entity.max_buy_in,
        table_type: entity.table_type
      },
      entity.owner_id
    );
  }



  async getById(id: string): Promise<GameRoom | null> {
    try {
      // 先从缓存获取
      const cachedRoom = await RedisCache.get<GameRoom>(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${id}`);
      if (cachedRoom) {
        loggerService.debug('从缓存获取房间信息成功', { roomId: id });
        return cachedRoom;
      }

      const roomResult = await pool.query(
        `SELECT * FROM ${PostgreSQLRoomDAO.TABLE_NAME} WHERE id = $1`,
        [id]
      );

      if (roomResult.rows.length === 0) {
        loggerService.info('房间不存在', { roomId: id });
        return null;
      }

      const room = roomResult.rows[0];
      
      // 获取房间内的玩家列表
      const playersResult = await pool.query(
        `SELECT u.id, u.username, u.avatar, sp.seat_number, sp.chips, sp.is_active, sp.is_ready
         FROM session_players sp
         JOIN users u ON sp.user_id = u.id
         JOIN game_sessions gs ON sp.session_id = gs.id
         WHERE gs.room_id = $1 AND gs.status IN ('waiting', 'playing')
         ORDER BY sp.seat_number ASC`,
        [id]
      );
      
      // 添加玩家列表到房间信息中
      room.players = playersResult.rows.map(player => ({
        id: player.id,
        username: player.username,
        avatar: player.avatar,
        seatNumber: player.seat_number,
        stack: player.chips,
        isActive: player.is_active,
        ready: player.is_ready
      }));
      
      // 更新current_players字段
      room.current_players = room.players.length;
      
      // 缓存房间详情
      await RedisCache.set(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${room.id}`, room, 3600);
      loggerService.debug('从数据库获取房间信息成功', { roomId: id });
      return room;
    } catch (error) {
      loggerService.error('获取房间信息失败', { error, roomId: id });
      throw error;
    }
  }

  async update(id: string, entity: Partial<GameRoom>): Promise<GameRoom | null> {
    try {
      // 构建更新语句
      const updateFields = Object.entries(entity)
        .map(([key, value], index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [...Object.values(entity), id];

      const result = await pool.query(
        `UPDATE ${PostgreSQLRoomDAO.TABLE_NAME} SET ${updateFields}, updated_at = NOW()
         WHERE id = $${values.length} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        loggerService.info('更新房间失败：房间不存在', { roomId: id, updateEntity: entity });
        return null;
      }

      const room = result.rows[0];
      // 更新缓存
      await RedisCache.set(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${room.id}`, room, 3600);
      // 更新房间列表缓存
      await this.invalidateRoomListCache();
      loggerService.info('更新房间成功', { roomId: id, updateEntity: entity });
      return room;
    } catch (error) {
      loggerService.error('更新房间失败', { error, roomId: id, updateEntity: entity });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM ${PostgreSQLRoomDAO.TABLE_NAME} WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        loggerService.info('删除房间失败：房间不存在', { roomId: id });
        return false;
      }

      // 删除缓存
      await RedisCache.delete(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${id}`);
      // 更新房间列表缓存
      await this.invalidateRoomListCache();
      loggerService.info('删除房间成功', { roomId: id });
      return true;
    } catch (error) {
      loggerService.error('删除房间失败', { error, roomId: id });
      throw error;
    }
  }

  async getAll(): Promise<GameRoom[]> {
    try {
      // 先从缓存获取
      const cachedRooms = await RedisCache.get<GameRoom[]>('rooms:all');
      if (cachedRooms) {
        loggerService.debug('从缓存获取所有房间列表成功', { count: cachedRooms.length });
        return cachedRooms;
      }

      const result = await pool.query(
        `SELECT * FROM ${PostgreSQLRoomDAO.TABLE_NAME}`
      );

      // 缓存房间列表
      await RedisCache.set('rooms:all', result.rows, 300);
      loggerService.info('从数据库获取所有房间列表成功', { count: result.rows.length });
      return result.rows;
    } catch (error) {
      loggerService.error('获取所有房间列表失败', { error });
      throw error;
    }
  }

  async getPublicRooms(): Promise<GameRoom[]> {
    try {
      // 先从缓存获取
      const cachedRooms = await RedisCache.get<GameRoom[]>('rooms:public');
      if (cachedRooms) {
        loggerService.debug('从缓存获取公共房间列表成功', { count: cachedRooms.length });
        return cachedRooms;
      }

      const result = await pool.query(
        `SELECT * FROM ${PostgreSQLRoomDAO.TABLE_NAME} WHERE room_type = $1`,
        ['public']
      );

      // 缓存公共房间列表
      await RedisCache.set('rooms:public', result.rows, 300);
      loggerService.info('从数据库获取公共房间列表成功', { count: result.rows.length });
      return result.rows;
    } catch (error) {
      loggerService.error('获取公共房间列表失败', { error });
      throw error;
    }
  }

  async getRoomsByOwner(ownerId: string): Promise<GameRoom[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM ${PostgreSQLRoomDAO.TABLE_NAME} WHERE owner_id = $1`,
        [ownerId]
      );

      loggerService.info('获取用户创建的房间列表成功', { ownerId, count: result.rows.length });
      return result.rows;
    } catch (error) {
      loggerService.error('获取用户创建的房间列表失败', { error, ownerId });
      throw error;
    }
  }

  async getRoomsByStatus(status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom[]> {
    try {
      // 先从缓存获取
      const cachedRooms = await RedisCache.get<GameRoom[]>(`rooms:status:${status}`);
      if (cachedRooms) {
        loggerService.debug('从缓存获取指定状态的房间列表成功', { status, count: cachedRooms.length });
        return cachedRooms;
      }

      const result = await pool.query(
        `SELECT * FROM ${PostgreSQLRoomDAO.TABLE_NAME} WHERE game_status = $1`,
        [status]
      );

      // 缓存指定状态的房间列表
      await RedisCache.set(`rooms:status:${status}`, result.rows, 300);
      loggerService.info('从数据库获取指定状态的房间列表成功', { status, count: result.rows.length });
      return result.rows;
    } catch (error) {
      loggerService.error('获取指定状态的房间列表失败', { error, status });
      throw error;
    }
  }

  // 实现RoomDAO接口定义的createRoom方法
  async createRoom(input: CreateRoomInput, ownerId: string): Promise<GameRoom> {
    try {
      const { 
        name, 
        room_type, 
        small_blind, 
        big_blind, 
        max_players,
        password,
        min_buy_in,
        max_buy_in,
        table_type = 'cash'
      } = input;

      // 设置默认值
      const currentPlayers = 0;
      const gameStatus = 'waiting';

      const result = await pool.query(
        `INSERT INTO ${PostgreSQLRoomDAO.TABLE_NAME} (name, room_type, small_blind, big_blind, max_players, current_players, game_status, owner_id, password, min_buy_in, max_buy_in, table_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [name, room_type, small_blind, big_blind, max_players, currentPlayers, gameStatus, ownerId, password, min_buy_in, max_buy_in, table_type]
      );

      const room = result.rows[0];
      loggerService.info('创建房间成功', { roomId: room.id, ownerId, roomName: name });
      
      // 缓存房间详情
      await RedisCache.set(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${room.id}`, room, 3600);
      // 更新房间列表缓存
      await this.invalidateRoomListCache();
      return room;
    } catch (error) {
      loggerService.error('创建房间失败', { error, ownerId, input });
      throw error;
    }
  }

  async updatePlayerCount(roomId: string, delta: number): Promise<GameRoom | null> {
    try {
      const result = await pool.query(
        `UPDATE ${PostgreSQLRoomDAO.TABLE_NAME} SET current_players = GREATEST(current_players + $1, 0), updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [delta, roomId]
      );

      if (result.rows.length === 0) {
        loggerService.info('更新房间玩家数量失败：房间不存在', { roomId, delta });
        return null;
      }

      loggerService.info('更新房间玩家数量成功', { roomId, delta });
      
      // 获取完整的房间信息，包括玩家列表
      const completeRoom = await this.getById(roomId);
      
      // 更新缓存（包含完整的房间信息和玩家列表）
      if (completeRoom) {
        await RedisCache.set(`${PostgreSQLRoomDAO.CACHE_KEY_PREFIX}${roomId}`, completeRoom, 3600);
      }
      // 更新房间列表缓存
      await this.invalidateRoomListCache();
      return completeRoom;
    } catch (error) {
      loggerService.error('更新房间玩家数量失败', { error, roomId, delta });
      throw error;
    }
  }

  async updateStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom | null> {
    return this.update(roomId, { game_status: status });
  }

  // 加入房间
  async joinRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      // 检查房间是否存在且未满
      const room = await this.getById(roomId);
      if (!room) {
        loggerService.info('加入房间失败：房间不存在', { userId, roomId });
        return false;
      }

      if (room.current_players >= room.max_players) {
        loggerService.info('加入房间失败：房间已满', { userId, roomId, currentPlayers: room.current_players, maxPlayers: room.max_players });
        return false;
      }

      // 获取当前游戏会话
      const sessionResult = await pool.query(
        `SELECT * FROM game_sessions WHERE room_id = $1 AND status = $2`,
        [roomId, 'waiting']
      );

      let sessionId: string;
      
      if (sessionResult.rows.length === 0) {
        // 如果没有等待中的会话，创建一个新会话
        const createSessionResult = await pool.query(
          `INSERT INTO game_sessions (room_id, status) VALUES ($1, $2) RETURNING id`,
          [roomId, 'waiting']
        );

        if (createSessionResult.rows.length === 0) {
          loggerService.error('加入房间失败：创建游戏会话失败', { userId, roomId });
          throw new Error('创建游戏会话失败');
        }
        
        sessionId = createSessionResult.rows[0].id;
        loggerService.info('创建新游戏会话成功', { sessionId, roomId });
      } else {
        // 使用现有的会话
        sessionId = sessionResult.rows[0].id;
        loggerService.debug('使用现有游戏会话', { sessionId, roomId });
      }

      // 检查用户是否已经在任何房间中
      const anyRoomResult = await pool.query(
        `SELECT sp.session_id, gs.room_id FROM session_players sp
         JOIN game_sessions gs ON sp.session_id = gs.id
         WHERE sp.user_id = $1 AND gs.status IN ($2, $3)`,
        [userId, 'waiting', 'playing']
      );

      if (anyRoomResult.rows.length > 0) {
        const existingRoomId = anyRoomResult.rows[0].room_id;
        loggerService.info('加入房间失败：用户已经在其他房间中', { userId, requestedRoomId: roomId, existingRoomId });
        return false;
      }

      // 检查用户是否已经在当前会话中
      const playerResult = await pool.query(
        `SELECT * FROM session_players WHERE session_id = $1 AND user_id = $2`,
        [sessionId, userId]
      );

      if (playerResult.rows.length > 0) {
        loggerService.info('加入房间失败：用户已经在房间中', { userId, roomId, sessionId });
        return false;
      }

      // 获取已用座位
      const seatResult = await pool.query(
        `SELECT seat_number FROM session_players WHERE session_id = $1 ORDER BY seat_number ASC`,
        [sessionId]
      );

      const takenSeats = seatResult.rows.map(row => row.seat_number);
      
      // 分配新座位
      let seatNumber = 1;
      while (takenSeats.includes(seatNumber)) {
        seatNumber++;
      }

      // 将用户添加到会话中
      await pool.query(
        `INSERT INTO session_players (session_id, user_id, seat_number, chips, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, userId, seatNumber, 10000, true]
      );

      await this.updatePlayerCount(roomId, 1);
      loggerService.info('加入房间成功', { userId, roomId, sessionId, seatNumber });
      return true;
    } catch (error) {
      loggerService.error('加入房间失败', { error, userId, roomId });
      return false;
    }
  }

  // 离开房间
  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      // 获取当前游戏会话
      const sessionResult = await pool.query(
        `SELECT * FROM game_sessions WHERE room_id = $1 AND status IN ($2, $3)`,
        [roomId, 'waiting', 'playing']
      );

      if (sessionResult.rows.length === 0) {
        loggerService.info('离开房间失败：房间没有活跃会话', { userId, roomId });
        return false;
      }

      const sessionId = sessionResult.rows[0].id;

      // 检查用户是否在会话中
      const playerResult = await pool.query(
        `SELECT * FROM session_players WHERE session_id = $1 AND user_id = $2`,
        [sessionId, userId]
      );

      if (playerResult.rows.length === 0) {
        loggerService.info('离开房间失败：用户不在房间中', { userId, roomId, sessionId });
        return false;
      }

      // 从会话中移除用户
      await pool.query(
        `DELETE FROM session_players WHERE session_id = $1 AND user_id = $2`,
        [sessionId, userId]
      );

      await this.updatePlayerCount(roomId, -1);
      loggerService.info('离开房间成功', { userId, roomId, sessionId });
      return true;
    } catch (error) {
      loggerService.error('离开房间失败', { error, userId, roomId });
      return false;
    }
  }

  // 检查用户当前所在房间
  async getUserCurrentRoom(userId: string): Promise<string | null> {
    try {
      const result = await pool.query(
        `SELECT gs.room_id 
         FROM session_players sp 
         JOIN game_sessions gs ON sp.session_id = gs.id 
         WHERE sp.user_id = $1 AND gs.status IN ($2, $3)`,
        [userId, 'waiting', 'playing']
      );

      if (result.rows.length > 0) {
        loggerService.info('用户当前在房间中', { userId, roomId: result.rows[0].room_id });
        return result.rows[0].room_id;
      }

      loggerService.info('用户当前不在任何房间中', { userId });
      return null;
    } catch (error) {
      loggerService.error('获取用户当前房间失败', { error, userId });
      throw error;
    }
  }

  // 清除房间列表相关缓存
  private async invalidateRoomListCache(): Promise<void> {
    await RedisCache.deleteBatch(['rooms:all', 'rooms:public', 'rooms:status:waiting', 'rooms:status:playing', 'rooms:status:finished']);
  }
}

// 创建单例实例
export const postgreSQLRoomDAO = new PostgreSQLRoomDAO();
