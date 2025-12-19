"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomStatus = exports.leaveRoom = exports.joinRoom = exports.getRoomById = exports.getRoomList = exports.getUserRooms = exports.deleteRoom = exports.updateRoom = exports.validateRoomPassword = exports.createRoom = void 0;
const postgreSQLRoomDAO_1 = require("../dao/impl/postgreSQLRoomDAO");
const loggerService_1 = __importDefault(require("../services/loggerService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// 创建游戏房间
const createRoom = async (userId, input) => {
    try {
        const { name, room_type, small_blind, big_blind, max_players, password, min_buy_in, max_buy_in, table_type = 'cash' } = input;
        // 如果是私人房间且有密码，则哈希密码
        let hashedPassword = undefined;
        if (room_type === 'private' && password) {
            hashedPassword = await bcrypt_1.default.hash(password, 10);
        }
        const room = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.createRoom({
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
        loggerService_1.default.info('创建游戏房间服务调用成功', { userId, roomId: room.id, roomName: name });
        return room;
    }
    catch (error) {
        loggerService_1.default.error('创建游戏房间服务调用失败', { error, userId, input });
        throw error;
    }
};
exports.createRoom = createRoom;
// 验证私人房间密码
const validateRoomPassword = async (roomId, password) => {
    try {
        const room = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getById(roomId);
        if (!room || room.room_type !== 'private') {
            loggerService_1.default.info('验证私人房间密码失败：房间不存在或不是私人房间', { roomId });
            return false;
        }
        if (!room.password) {
            // 私人房间但没有密码
            loggerService_1.default.debug('验证私人房间密码成功：私人房间没有设置密码', { roomId });
            return true;
        }
        const isValid = await bcrypt_1.default.compare(password, room.password);
        loggerService_1.default.info('验证私人房间密码', { roomId, isValid });
        return isValid;
    }
    catch (error) {
        loggerService_1.default.error('验证房间密码失败', { error, roomId });
        return false;
    }
};
exports.validateRoomPassword = validateRoomPassword;
// 更新房间信息
const updateRoom = async (roomId, updates, userId) => {
    try {
        // 验证用户是否为房间所有者
        const room = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getById(roomId);
        if (!room || room.owner_id !== userId) {
            loggerService_1.default.warn('更新房间信息失败：无权限更新该房间', { userId, roomId });
            throw new Error('无权限更新该房间');
        }
        // 如果更新密码，需要哈希
        if (updates.password) {
            updates.password = await bcrypt_1.default.hash(updates.password, 10);
        }
        const updatedRoom = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.update(roomId, updates);
        loggerService_1.default.info('更新房间信息成功', { userId, roomId, updates });
        return updatedRoom;
    }
    catch (error) {
        loggerService_1.default.error('更新房间信息失败', { error, userId, roomId, updates });
        throw error;
    }
};
exports.updateRoom = updateRoom;
// 删除房间
const deleteRoom = async (roomId, userId) => {
    try {
        // 验证用户是否为房间所有者
        const room = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getById(roomId);
        if (!room || room.owner_id !== userId) {
            loggerService_1.default.warn('删除房间失败：无权限删除该房间', { userId, roomId });
            throw new Error('无权限删除该房间');
        }
        const success = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.delete(roomId);
        loggerService_1.default.info('删除房间成功', { userId, roomId, success });
        return success;
    }
    catch (error) {
        loggerService_1.default.error('删除房间失败', { error, userId, roomId });
        throw error;
    }
};
exports.deleteRoom = deleteRoom;
// 获取用户创建的房间列表
const getUserRooms = async (userId) => {
    try {
        const rooms = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getRoomsByOwner(userId);
        loggerService_1.default.info('获取用户创建的房间列表成功', { userId, count: rooms.length });
        return rooms;
    }
    catch (error) {
        loggerService_1.default.error('获取用户房间列表失败', { error, userId });
        throw new Error('获取用户房间列表失败');
    }
};
exports.getUserRooms = getUserRooms;
// 获取房间列表
const getRoomList = async (status) => {
    try {
        let rooms;
        if (status) {
            rooms = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getRoomsByStatus(status);
            loggerService_1.default.info('获取指定状态的房间列表成功', { status, count: rooms.length });
        }
        else {
            rooms = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getAll();
            loggerService_1.default.info('获取所有房间列表成功', { count: rooms.length });
        }
        return rooms;
    }
    catch (error) {
        loggerService_1.default.error('获取房间列表失败', { error, status });
        throw new Error('获取房间列表失败');
    }
};
exports.getRoomList = getRoomList;
// 获取房间详情
const getRoomById = async (roomId) => {
    try {
        const room = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getById(roomId);
        loggerService_1.default.info('获取房间详情', { roomId, exists: !!room });
        return room;
    }
    catch (error) {
        loggerService_1.default.error('获取房间详情失败', { error, roomId });
        throw new Error('获取房间详情失败');
    }
};
exports.getRoomById = getRoomById;
// 加入房间
const joinRoom = async (roomId, userId) => {
    try {
        // 检查用户是否已经在其他房间中
        const currentRoomId = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.getUserCurrentRoom(userId);
        if (currentRoomId) {
            loggerService_1.default.warn('加入房间失败：用户已经在其他房间中', { userId, currentRoomId, requestedRoomId: roomId });
            throw new Error('您已经在另一个房间中，请先离开当前房间');
        }
        const success = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.joinRoom(roomId, userId);
        loggerService_1.default.info('加入房间服务调用结果', { userId, roomId, success });
        return success;
    }
    catch (error) {
        loggerService_1.default.error('加入房间服务调用失败', { error, userId, roomId });
        if (error instanceof Error && error.message.includes('已经在另一个房间中')) {
            throw error;
        }
        throw new Error('加入房间失败');
    }
};
exports.joinRoom = joinRoom;
// 离开房间
const leaveRoom = async (roomId, userId) => {
    try {
        const success = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.leaveRoom(roomId, userId);
        loggerService_1.default.info('离开房间服务调用结果', { userId, roomId, success });
        return success;
    }
    catch (error) {
        loggerService_1.default.error('离开房间服务调用失败', { error, userId, roomId });
        throw new Error('离开房间失败');
    }
};
exports.leaveRoom = leaveRoom;
// 更新房间状态
const updateRoomStatus = async (roomId, status) => {
    try {
        const result = await postgreSQLRoomDAO_1.postgreSQLRoomDAO.updateStatus(roomId, status);
        const success = result !== null;
        loggerService_1.default.info('更新房间状态', { roomId, status, success });
        return success;
    }
    catch (error) {
        loggerService_1.default.error('更新房间状态失败', { error, roomId, status });
        return false;
    }
};
exports.updateRoomStatus = updateRoomStatus;
//# sourceMappingURL=roomService.js.map