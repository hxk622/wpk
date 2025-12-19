import axios from 'axios';
import jwt from 'jsonwebtoken';
import { postgreSQLRoomDAO } from '../src/dao/impl/postgreSQLRoomDAO';

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 生成测试用的JWT令牌
const generateToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// 测试房间服务功能
async function testRoomService() {
  console.log('=== 房间服务测试开始 ===\n');

  // 生成测试令牌
  const token = generateToken('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  
  // 创建axios实例
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`
    },
    httpAgent: new (require('http').Agent)({ keepAlive: false })
  });

  // 测试1: 创建测试房间
  console.log('1. 测试创建房间:');
  let testRoomId: string;
  try {
    const response = await api.post('/rooms', {
      name: '测试房间',
      room_type: 'public',
      small_blind: 10,
      big_blind: 20,
      max_players: 6,
      min_buy_in: 1000,
      max_buy_in: 10000,
      table_type: 'cash'
    });
    testRoomId = response.data.room.id;
    console.log('✅ 创建房间成功:', testRoomId);
  } catch (error) {
    console.error('❌ 创建房间失败:', error);
    return;
  }
  console.log('');

  // 测试2: 加入房间功能
  console.log('2. 测试加入房间:');
  try {
    const response = await api.post(`/rooms/${testRoomId}/join`);
    console.log('✅ 加入房间成功:', response.data.message);
  } catch (error) {
    console.error('❌ 加入房间失败:', error);
  }
  console.log('');

  // 测试3: 离开房间功能
  console.log('3. 测试离开房间:');
  try {
    const response = await api.post(`/rooms/${testRoomId}/leave`);
    console.log('✅ 离开房间成功:', response.data.message);
  } catch (error) {
    console.error('❌ 离开房间失败:', error);
  }

  console.log('\n=== 房间服务测试结束 ===');
}

// 直接测试DAO层的joinRoom和leaveRoom方法
async function testRoomDAO() {
  console.log('\n=== 房间DAO层测试开始 ===\n');

  // 生成UUID格式的测试数据
  const testUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  
  // 先创建一个测试房间
  console.log('1. 测试创建房间:');
  let testRoomId: string;
  try {
    const room = await postgreSQLRoomDAO.createRoom({
      name: 'DAO测试房间',
      room_type: 'public',
      small_blind: 10,
      big_blind: 20,
      max_players: 6,
      min_buy_in: 1000,
      max_buy_in: 10000,
      table_type: 'cash'
    }, testUserId);
    testRoomId = room.id;
    console.log('✅ 创建房间成功:', testRoomId);
  } catch (error) {
    console.error('❌ 创建房间失败:', error);
    return;
  }
  console.log('');

  // 测试2: DAO层加入房间
  console.log('2. 测试DAO层加入房间:');
  try {
    const success = await postgreSQLRoomDAO.joinRoom(testRoomId, testUserId);
    if (success) {
      console.log('✅ DAO层加入房间成功');
    } else {
      console.error('❌ DAO层加入房间失败');
    }
  } catch (error) {
    console.error('❌ DAO层加入房间抛出异常:', error);
  }
  console.log('');

  // 测试3: DAO层离开房间
  console.log('3. 测试DAO层离开房间:');
  try {
    const success = await postgreSQLRoomDAO.leaveRoom(testRoomId, testUserId);
    if (success) {
      console.log('✅ DAO层离开房间成功');
    } else {
      console.error('❌ DAO层离开房间失败');
    }
  } catch (error) {
    console.error('❌ DAO层离开房间抛出异常:', error);
  }

  console.log('\n=== 房间DAO层测试结束 ===');
}

// 运行测试
async function runAllTests() {
  await testRoomService();
  await testRoomDAO();
}

runAllTests().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});