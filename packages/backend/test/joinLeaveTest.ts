import pool from '../src/services/database';
import { postgreSQLRoomDAO } from '../src/dao/impl/postgreSQLRoomDAO';

// 简单的测试脚本，直接测试joinRoom和leaveRoom方法
async function testJoinLeaveMethods() {
  console.log('=== 测试joinRoom和leaveRoom方法开始 ===\n');

  try {
    // 检查数据库连接
    await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功');
    
    // 检查是否有现有的房间
    const roomsResult = await pool.query('SELECT * FROM game_rooms LIMIT 5');
    console.log(`找到 ${roomsResult.rows.length} 个房间`);
    
    if (roomsResult.rows.length === 0) {
      console.log('❌ 没有找到可测试的房间，请先创建一个房间');
      return;
    }
    
    const testRoomId = roomsResult.rows[0].id;
    const testUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    console.log('');
    console.log('测试房间ID:', testRoomId);
    console.log('测试用户ID:', testUserId);
    
    // 首先，创建一个测试用户（如果不存在）
    try {
      const uniqueUsername = `testuser_${Date.now()}`;
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET username = $2, email = $3`,
        [testUserId, uniqueUsername, 'test@example.com', 'hashedpassword123']
      );
      console.log('✅ 测试用户已创建或已更新');
    } catch (error) {
      console.error('❌ 创建测试用户失败:', error);
      // 即使创建用户失败，我们也继续测试，因为可能用户已经存在
      console.log('⚠️  继续测试，假设用户已存在');
    }
    
    // 测试加入房间
    console.log('\n1. 测试加入房间:');
    try {
      const success = await postgreSQLRoomDAO.joinRoom(testRoomId, testUserId);
      if (success) {
        console.log('✅ 加入房间成功');
        
        // 检查session_players表是否有记录
        const sessionPlayersResult = await pool.query(
          `SELECT * FROM session_players WHERE session_id IN (
            SELECT id FROM game_sessions WHERE room_id = $1
          ) AND user_id = $2`,
          [testRoomId, testUserId]
        );
        
        if (sessionPlayersResult.rows.length > 0) {
          console.log('✅ session_players表中成功记录了玩家加入信息');
          console.log('记录信息:', sessionPlayersResult.rows[0]);
        } else {
          console.error('❌ session_players表中没有找到玩家加入记录');
        }
      } else {
        console.error('❌ 加入房间失败');
      }
    } catch (error) {
      console.error('❌ 加入房间抛出异常:', error);
    }
    
    // 测试离开房间
    console.log('\n2. 测试离开房间:');
    try {
      const success = await postgreSQLRoomDAO.leaveRoom(testRoomId, testUserId);
      if (success) {
        console.log('✅ 离开房间成功');
        
        // 再次检查session_players表是否已删除记录
        const sessionPlayersResult = await pool.query(
          `SELECT * FROM session_players WHERE session_id IN (
            SELECT id FROM game_sessions WHERE room_id = $1
          ) AND user_id = $2`,
          [testRoomId, testUserId]
        );
        
        if (sessionPlayersResult.rows.length === 0) {
          console.log('✅ session_players表中已成功删除玩家记录');
        } else {
          console.error('❌ session_players表中仍然存在玩家记录');
        }
      } else {
        console.error('❌ 离开房间失败');
      }
    } catch (error) {
      console.error('❌ 离开房间抛出异常:', error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await pool.end();
  }
  
  console.log('\n=== 测试joinRoom和leaveRoom方法结束 ===');
}

testJoinLeaveMethods();