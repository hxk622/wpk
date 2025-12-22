import { GameRoom, CreateRoomInput } from '../types/index';
import { postgreSQLRoomDAO } from '../dao/impl/postgreSQLRoomDAO';
import loggerService from '../services/loggerService';
import bcrypt from 'bcrypt';

// 创建游戏房间
export const createRoom = async (userId: string, input: CreateRoomInput): Promise<GameRoom> => {
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

    // 如果是私人房间且有密码，则哈希密码
    let hashedPassword = undefined;
    if (room_type === 'private' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const room = await postgreSQLRoomDAO.createRoom({
      name,
      room_type,
      small_blind,
      big_blind,
      max_players,
      password: hashedPassword,
      min_buy_in,
      max_buy_in,
      table_type
    }, userId);

    loggerService.info('创建游戏房间服务调用成功', { userId, roomId: room.id, roomName: name });
    return room;
  } catch (error) {
    loggerService.error('创建游戏房间服务调用失败', { error, userId, input });
    throw error;
  }
};

// 验证私人房间密码
export const validateRoomPassword = async (roomId: string, password: string): Promise<boolean> => {
  try {
    const room = await postgreSQLRoomDAO.getById(roomId);
    if (!room || room.room_type !== 'private') {
      loggerService.info('验证私人房间密码失败：房间不存在或不是私人房间', { roomId });
      return false;
    }

    if (!room.password) {
      // 私人房间但没有密码
      loggerService.debug('验证私人房间密码成功：私人房间没有设置密码', { roomId });
      return true;
    }

    const isValid = await bcrypt.compare(password, room.password);
    loggerService.info('验证私人房间密码', { roomId, isValid });
    return isValid;
  } catch (error) {
    loggerService.error('验证房间密码失败', { error, roomId });
    return false;
  }
};

// 更新房间信息
export const updateRoom = async (roomId: string, updates: Partial<GameRoom>, userId: string): Promise<GameRoom | null> => {
  try {
    // 验证用户是否为房间所有者
    const room = await postgreSQLRoomDAO.getById(roomId);
    if (!room || room.owner_id !== userId) {
      loggerService.warn('更新房间信息失败：无权限更新该房间', { userId, roomId });
      throw new Error('无权限更新该房间');
    }

    // 如果更新密码，需要哈希
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedRoom = await postgreSQLRoomDAO.update(roomId, updates);
    loggerService.info('更新房间信息成功', { userId, roomId, updates });
    return updatedRoom;
  } catch (error) {
    loggerService.error('更新房间信息失败', { error, userId, roomId, updates });
    throw error;
  }
};

// 删除房间
export const deleteRoom = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    // 验证用户是否为房间所有者
    const room = await postgreSQLRoomDAO.getById(roomId);
    if (!room || room.owner_id !== userId) {
      loggerService.warn('删除房间失败：无权限删除该房间', { userId, roomId });
      throw new Error('无权限删除该房间');
    }

    const success = await postgreSQLRoomDAO.delete(roomId);
    loggerService.info('删除房间成功', { userId, roomId, success });
    return success;
  } catch (error) {
    loggerService.error('删除房间失败', { error, userId, roomId });
    throw error;
  }
};

// 获取用户创建的房间列表
export const getUserRooms = async (userId: string): Promise<GameRoom[]> => {
  try {
    const rooms = await postgreSQLRoomDAO.getRoomsByOwner(userId);
    loggerService.info('获取用户创建的房间列表成功', { userId, count: rooms.length });
    return rooms;
  } catch (error) {
    loggerService.error('获取用户房间列表失败', { error, userId });
    throw new Error('获取用户房间列表失败');
  }
};

// 获取房间列表
export const getRoomList = async (status?: 'waiting' | 'playing' | 'finished'): Promise<GameRoom[]> => {
  try {
    let rooms: GameRoom[];
    if (status) {
      rooms = await postgreSQLRoomDAO.getRoomsByStatus(status);
      loggerService.info('获取指定状态的房间列表成功', { status, count: rooms.length });
    } else {
      rooms = await postgreSQLRoomDAO.getAll();
      loggerService.info('获取所有房间列表成功', { count: rooms.length });
    }
    return rooms;
  } catch (error) {
    loggerService.error('获取房间列表失败', { error, status });
    throw new Error('获取房间列表失败');
  }
};

// 获取房间详情
export const getRoomById = async (roomId: string): Promise<GameRoom | null> => {
  try {
    const room = await postgreSQLRoomDAO.getById(roomId);
    loggerService.info('获取房间详情', { roomId, exists: !!room });
    return room;
  } catch (error) {
    loggerService.error('获取房间详情失败', { error, roomId });
    throw new Error('获取房间详情失败');
  }
};

// 加入房间
export const joinRoom = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    // 检查用户是否已经在其他房间中
    const currentRoomId = await postgreSQLRoomDAO.getUserCurrentRoom(userId);
    loggerService.debug('getUserCurrentRoom返回结果', { userId, currentRoomId });
    if (currentRoomId) {
      loggerService.warn('加入房间失败：用户已经在其他房间中', { userId, currentRoomId, requestedRoomId: roomId });
      // 强制离开当前房间
      loggerService.info('强制离开当前房间', { userId, currentRoomId });
      await postgreSQLRoomDAO.leaveRoom(currentRoomId, userId);
    }
    
    const success = await postgreSQLRoomDAO.joinRoom(roomId, userId);
    loggerService.info('加入房间服务调用结果', { userId, roomId, success });
    return success;
  } catch (error) {
    loggerService.error('加入房间服务调用失败', { error, userId, roomId });
    if (error instanceof Error && error.message.includes('已经在另一个房间中')) {
      throw error;
    }
    throw new Error('加入房间失败');
  }
};

// 离开房间
export const leaveRoom = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const success = await postgreSQLRoomDAO.leaveRoom(roomId, userId);
    loggerService.info('离开房间服务调用结果', { userId, roomId, success });
    return success;
  } catch (error) {
    loggerService.error('离开房间服务调用失败', { error, userId, roomId });
    throw new Error('离开房间失败');
  }
};

// 更新房间状态
export const updateRoomStatus = async (roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<boolean> => {
  try {
    const result = await postgreSQLRoomDAO.updateStatus(roomId, status);
    const success = result !== null;
    loggerService.info('更新房间状态', { roomId, status, success });
    return success;
  } catch (error) {
    loggerService.error('更新房间状态失败', { error, roomId, status });
    return false;
  }
};
