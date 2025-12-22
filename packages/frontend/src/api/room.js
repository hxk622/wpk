import api from './axios';

// 房间API服务
const roomApi = {
  // 获取房间列表
  getRooms: async (params) => {
    const response = await api.get('/rooms', { params });
    // 转换数据格式：下划线命名法转为驼峰命名法
    const result = { rooms: [] };
    if (response && Array.isArray(response.rooms)) {
      result.rooms = response.rooms.map(room => {
        return {
          id: room.id,
          name: room.name,
          status: room.game_status,
          maxPlayers: room.max_players,
          currentPlayers: room.current_players,
          smallBlind: room.small_blind,
          bigBlind: room.big_blind,
          // 简化处理：创建一个空数组作为players
          players: []
        };
      });
    }
    return result;
  },

  // 创建房间
  createRoom: (roomData) => {
    return api.post('/rooms', roomData);
  },

  // 获取房间详情
  getRoomDetail: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    console.log('Raw room detail response:', response);
    // 转换数据格式：下划线命名法转为驼峰命名法
    if (response && response.room) {
      const room = response.room;
      return {
        room: {
          id: room.id,
          name: room.name,
          smallBlind: room.small_blind,
          bigBlind: room.big_blind,
          gameMode: room.table_type,
          maxPlayers: room.max_players,
          currentPlayers: room.current_players,
          status: room.game_status,
          gameStarted: room.game_status === 'playing',
          players: room.players || [],
          ownerId: room.owner_id
        }
      };
    }
    return response;
  },

  // 加入房间
  joinRoom: async (roomId, joinData = {}) => {
    const response = await api.post(`/rooms/${roomId}/join`, joinData);
    console.log('Raw join room response:', response);
    return response;
  },

  // 离开房间
  leaveRoom: (roomId) => {
    return api.post(`/rooms/${roomId}/leave`);
  },
  
  // 验证房间密码
  validatePassword: (roomId, password) => {
    return api.get(`/rooms/validate-password/${roomId}`, { params: { password } });
  },
  
  // 获取用户创建的房间
  getUserCreatedRooms: async () => {
    const response = await api.get('/rooms/user/created');
    // 转换数据格式：下划线命名法转为驼峰命名法
    const result = { rooms: [] };
    if (response && Array.isArray(response.rooms)) {
      result.rooms = response.rooms.map(room => ({
        id: room.id,
        name: room.name,
        status: room.game_status,
        maxPlayers: room.max_players,
        currentPlayers: room.current_players,
        smallBlind: room.small_blind,
        bigBlind: room.big_blind,
        players: room.players || []
      }));
    }
    return result;
  },

  // 以下API为前端模拟实现，后端尚未提供
  // 准备游戏 - 后端未实现
  readyGame: async (roomId) => {
    console.warn('readyGame API 后端尚未实现');
    // 返回模拟响应（符合三元组结构）
    return { code: 0, data: { ready: true }, message: '已准备' };
  },

  // 取消准备 - 后端未实现
  cancelReady: async (roomId) => {
    console.warn('cancelReady API 后端尚未实现');
    // 返回模拟响应（符合三元组结构）
    return { code: 0, data: { ready: false }, message: '已取消准备' };
  },
  
  // 切换准备状态（前端封装）
  toggleReady: async (roomId, isReady) => {
    try {
      if (isReady) {
        return await roomApi.cancelReady(roomId);
      } else {
        return await roomApi.readyGame(roomId);
      }
    } catch (error) {
      console.error('切换准备状态失败:', error);
      // 返回模拟响应（符合三元组结构）
      return { code: 0, data: { ready: !isReady }, message: isReady ? '已取消准备' : '已准备' };
    }
  },
  
  // 开始游戏 - 后端未实现
  startGame: async (roomId) => {
    console.warn('startGame API 后端尚未实现');
    // 返回模拟响应（符合三元组结构）
    return { code: 0, data: { gameStarted: true }, message: '游戏已开始' };
  },
  
  // 发送消息 - 后端未实现
  sendMessage: async (roomId, message) => {
    console.warn('sendMessage API 后端尚未实现');
    // 返回模拟响应（符合三元组结构）
    return { code: 0, data: { messageSent: true }, message: '消息已发送' };
  },
  
  // 踢出玩家 - 后端未实现
  kickPlayer: async (roomId, playerId) => {
    console.warn('kickPlayer API 后端尚未实现');
    // 返回模拟响应（符合三元组结构）
    return { code: 0, data: { playerKicked: true }, message: '玩家已踢出' };
  },
  
  // 获取用户当前所在房间
  getUserCurrentRoom: async () => {
    try {
      const response = await api.get('/rooms/current');
      return response;
    } catch (error) {
      console.error('获取用户当前房间失败:', error);
      return { code: 404, data: { roomId: null }, message: '用户当前不在任何房间中' };
    }
  }
};

export default roomApi;