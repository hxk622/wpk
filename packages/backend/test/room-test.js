// 测试创建房间功能
const axios = require('axios');

// 测试配置
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TEST_USER: {
    username: 'testuser',
    password: 'testpassword'
  }
};

// 创建axios实例
const api = axios.create({
  baseURL: TEST_CONFIG.BASE_URL
});

// 测试流程
async function testCreateRoom() {
  console.log('=== 测试创建房间功能 ===\n');
  
  try {
    // 1. 尝试登录，如果失败则注册新用户
    console.log('1. 测试登录获取token...');
    let token;
    
    try {
      // 尝试登录
      const loginResponse = await api.post('/users/login', {
        username: TEST_CONFIG.TEST_USER.username,
        password: TEST_CONFIG.TEST_USER.password
      });
      
      if (loginResponse.status === 200) {
        token = loginResponse.data.data.token;
        console.log('✅ 登录成功，获取到token');
        console.log('   Token:', token);
      }
    } catch (loginError) {
      // 登录失败，注册新用户
      console.log('   登录失败，尝试注册新用户...');
      
      const registerResponse = await api.post('/users/register', {
        username: TEST_CONFIG.TEST_USER.username,
        email: `test_${Date.now()}@example.com`,
        password: TEST_CONFIG.TEST_USER.password
      });
      
      if (registerResponse.status !== 201) {
        throw new Error('注册失败');
      }
      
      console.log('✅ 注册成功');
      
      // 注册成功后再次登录
      const loginResponse = await api.post('/users/login', {
        username: TEST_CONFIG.TEST_USER.username,
        password: TEST_CONFIG.TEST_USER.password
      });
      
      if (loginResponse.status !== 200) {
        throw new Error('注册后登录失败');
      }
      
      token = loginResponse.data.data.token;
      console.log('✅ 注册后登录成功，获取到token');
      console.log('   Token:', token);
    }
    
    // 设置axios默认headers，包含token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 2. 测试创建房间
    console.log('\n2. 测试创建房间...');
    const roomData = {
      name: '测试房间',
      room_type: 'public',
      small_blind: 10,
      big_blind: 20,
      max_players: 6,
      table_type: 'cash'
    };
    
    const createRoomResponse = await api.post('/rooms', roomData);
    
    if (createRoomResponse.status !== 201) {
      throw new Error('创建房间失败');
    }
    
    const { room } = createRoomResponse.data.data;
    console.log('✅ 创建房间成功');
    console.log('   房间ID:', room.id);
    console.log('   房间名称:', room.name);
    console.log('   房间类型:', room.room_type);
    console.log('   小盲注:', room.small_blind);
    console.log('   大盲注:', room.big_blind);
    console.log('   最大玩家数:', room.max_players);
    console.log('   房间状态:', room.game_status);
    
    // 3. 测试获取房间列表
    console.log('\n3. 测试获取房间列表...');
    const roomsResponse = await api.get('/rooms');
    
    if (roomsResponse.status !== 200) {
      throw new Error('获取房间列表失败');
    }
    
    const { rooms } = roomsResponse.data.data;
    console.log('✅ 获取房间列表成功，共', rooms.length, '个房间');
    
    // 4. 测试获取房间详情
    console.log('\n4. 测试获取房间详情...');
    const roomDetailResponse = await api.get(`/rooms/${room.id}`);
    
    if (roomDetailResponse.status !== 200) {
      throw new Error('获取房间详情失败');
    }
    
    const { room: roomDetail } = roomDetailResponse.data.data;
    console.log('✅ 获取房间详情成功');
    console.log('   房间ID:', roomDetail.id);
    console.log('   房间名称:', roomDetail.name);
    console.log('   房主ID:', roomDetail.owner_id);
    
    // 5. 测试加入房间
    console.log('\n5. 测试加入房间...');
    const joinRoomResponse = await api.post(`/rooms/${room.id}/join`);
    
    if (joinRoomResponse.status !== 200) {
      throw new Error('加入房间失败');
    }
    
    console.log('✅ 加入房间成功');
    
    // 6. 测试离开房间
    console.log('\n6. 测试离开房间...');
    const leaveRoomResponse = await api.post(`/rooms/${room.id}/leave`);
    
    if (leaveRoomResponse.status !== 200) {
      throw new Error('离开房间失败');
    }
    
    console.log('✅ 离开房间成功');
    
    // 7. 测试删除房间
    console.log('\n7. 测试删除房间...');
    const deleteRoomResponse = await api.delete(`/rooms/${room.id}`);
    
    if (deleteRoomResponse.status !== 200) {
      throw new Error('删除房间失败');
    }
    
    console.log('✅ 删除房间成功');
    
    // 测试完成
    console.log('\n=== 所有测试通过！===');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    } else if (error.request) {
      console.error('   请求已发送，但没有收到响应');
    }
    return false;
  }
}

// 运行测试
testCreateRoom().then(success => {
  process.exit(success ? 0 : 1);
});