// 直接测试roomService.createRoom功能
const { createRoom } = require('../src/services/roomService');
const { postgreSQLRoomDAO } = require('../src/dao/impl/postgreSQLRoomDAO');

// 测试流程
async function testCreateRoomService() {
  console.log('=== 测试创建房间服务 ===\n');
  
  try {
    // 模拟用户ID和房间创建参数
    const testUserId = 'test-user-id-123';
    const testRoomInput = {
      name: '测试房间',
      room_type: 'public',
      small_blind: 10,
      big_blind: 20,
      max_players: 6,
      table_type: 'cash'
    };
    
    // 调用createRoom服务函数
    console.log('1. 调用createRoom服务函数...');
    console.log('   测试用户ID:', testUserId);
    console.log('   房间参数:', JSON.stringify(testRoomInput, null, 2));
    
    const createdRoom = await createRoom(testUserId, testRoomInput);
    
    // 检查返回结果
    console.log('\n✅ 创建房间成功！');
    console.log('   房间ID:', createdRoom.id);
    console.log('   房间名称:', createdRoom.name);
    console.log('   房间类型:', createdRoom.room_type);
    console.log('   小盲注:', createdRoom.small_blind);
    console.log('   大盲注:', createdRoom.big_blind);
    console.log('   最大玩家数:', createdRoom.max_players);
    console.log('   房间状态:', createdRoom.game_status);
    console.log('   房主ID:', createdRoom.owner_id);
    console.log('   创建时间:', createdRoom.created_at);
    
    // 2. 测试通过DAO直接调用createRoom方法
    console.log('\n2. 直接调用DAO的createRoom方法...');
    const directCreatedRoom = await postgreSQLRoomDAO.createRoom(testRoomInput, testUserId);
    
    console.log('✅ 直接调用DAO成功！');
    console.log('   房间ID:', directCreatedRoom.id);
    console.log('   房间名称:', directCreatedRoom.name);
    
    console.log('\n=== 所有测试通过！===');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('   错误栈:', error.stack);
    return false;
  }
}

// 运行测试
testCreateRoomService().then(success => {
  process.exit(success ? 0 : 1);
});