import axios from 'axios';
import jwt from 'jsonwebtoken';

// API基础URL
const API_BASE_URL = 'http://localhost:3000';

// 生成测试用的JWT令牌
const generateToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// 测试加入房间API
async function testJoinRoomAPI() {
  console.log('=== 测试加入房间API开始 ===\n');

  try {
    // 1. 测试健康检查
    console.log('1. 检查服务器健康状态:');
    const healthResponse = await axios.get(`${API_BASE_URL}/ping`);
    console.log('✅ 健康检查通过:', healthResponse.data.message);

    // 2. 生成测试JWT令牌
    console.log('\n2. 生成测试JWT令牌:');
    const testUserId = 'test-user-123';
    const token = generateToken(testUserId);
    console.log('✅ JWT令牌生成成功:', token.substring(0, 20) + '...');

    // 3. 获取房间列表
    console.log('3. 获取房间列表:');
    const roomsResponse = await axios.get(`${API_BASE_URL}/api/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ 房间列表获取成功，共找到', roomsResponse.data.rooms.length, '个房间');

    if (roomsResponse.data.rooms.length === 0) {
      console.log('❌ 没有找到可测试的房间，请先创建一个房间');
      return;
    }

    // 4. 选择第一个房间进行测试
    const testRoom = roomsResponse.data.rooms[0];
    const testRoomId = testRoom.id;
    console.log('\n4. 选择测试房间:');
    console.log('房间ID:', testRoomId);
    console.log('房间名称:', testRoom.name);
    console.log('房间类型:', testRoom.isPrivate ? '私人' : '公开');

    // 5. 调用加入房间API
    console.log('\n5. 测试加入房间API:');
    try {
      const joinResponse = await axios.post(`${API_BASE_URL}/api/rooms/${testRoomId}/join`,
        testRoom.isPrivate ? { password: 'testpassword' } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ 加入房间成功:', joinResponse.data.message);
    } catch (joinError: any) {
      if (joinError.response) {
        console.error('❌ 加入房间失败:', joinError.response.data.error || joinError.response.data.message);
        console.error('状态码:', joinError.response.status);
      } else {
        console.error('❌ 加入房间请求失败:', joinError.message);
      }
    }

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
  }

  console.log('\n=== 测试加入房间API结束 ===');
}

testJoinRoomAPI();
