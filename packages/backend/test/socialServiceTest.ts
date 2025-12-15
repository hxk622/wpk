import { socialService } from '../src/services/socialService';
import { FriendRequest, Friend, PrivateMessage } from '../src/types';

// 测试社交服务的各种功能
async function testSocialService() {
  console.log('=== 社交服务单元测试开始 ===\n');

  // 测试1: 发送好友请求
  console.log('1. 测试发送好友请求:');
  try {
    const senderId = 'user-1';
    const receiverId = 'user-2';
    const request = await socialService.sendFriendRequest(senderId, receiverId);
    console.log(`✅ 发送好友请求成功:`);
    console.log(`   请求ID: ${request.id}`);
    console.log(`   发送者: ${request.from_user_id}`);
    console.log(`   接收者: ${request.to_user_id}`);
    console.log(`   状态: ${request.status}`);
    console.log(`   创建时间: ${request.created_at}`);
  } catch (error) {
    console.error('❌ 发送好友请求失败:', error);
  }
  console.log('');

  // 测试2: 获取用户的好友请求
  console.log('2. 测试获取用户的好友请求:');
  try {
    const userId = 'user-2';
    const requests = await socialService.getReceivedFriendRequests(userId);
    console.log(`✅ 获取好友请求成功:`);
    console.log(`   共获取到 ${requests.length} 个好友请求`);
    requests.forEach((request: FriendRequest) => {
      console.log(`   - 请求ID: ${request.id}, 发送者: ${request.from_user_id}, 状态: ${request.status}`);
    });
  } catch (error) {
    console.error('❌ 获取好友请求失败:', error);
  }
  console.log('');

  // 测试3: 响应好友请求
  console.log('3. 测试响应好友请求:');
  try {
    // 先获取一个待处理的请求
    const userId = 'user-2';
    const requests = await socialService.getReceivedFriendRequests(userId);
    if (requests.length > 0) {
      const requestId = requests[0].id;
      const status = "accepted";
      const result = await socialService.respondToFriendRequest(requestId, status);
      console.log(`✅ 响应好友请求成功:`);
      console.log(`   请求ID: ${requestId}`);
      console.log(`   响应结果: ${status}`);
      console.log(`   操作是否成功: ${result}`);
    } else {
      console.log(`⚠️  没有待处理的好友请求，跳过测试`);
    }
  } catch (error) {
    console.error('❌ 响应好友请求失败:', error);
  }
  console.log('');

  // 测试4: 获取用户的好友列表
  console.log('4. 测试获取用户的好友列表:');
  try {
    const userId = 'user-1';
    const friends = await socialService.getFriends(userId);
    console.log(`✅ 获取好友列表成功:`);
    console.log(`   共获取到 ${friends.length} 个好友`);
    friends.forEach((friend: Friend) => {
      console.log(`   - 用户ID: ${friend.id}, 好友ID: ${friend.friend_id}, 创建时间: ${friend.created_at}`);
    });
  } catch (error) {
    console.error('❌ 获取好友列表失败:', error);
  }
  console.log('');

  // 测试5: 发送私信
  console.log('5. 测试发送私信:');
  try {
    const senderId = 'user-1';
    const receiverId = 'user-2';
    const content = '测试私信内容';
    const message = await socialService.sendPrivateMessage(senderId, receiverId, content);
    console.log(`✅ 发送私信成功:`);
    console.log(`   消息ID: ${message.id}`);
    console.log(`   发送者: ${message.sender_id}`);
    console.log(`   接收者: ${message.receiver_id}`);
    console.log(`   内容: ${message.content}`);
    console.log(`   已读: ${message.read}`);
    console.log(`   发送时间: ${message.created_at}`);
  } catch (error) {
    console.error('❌ 发送私信失败:', error);
  }
  console.log('');

  // 测试6: 获取私信历史
  console.log('6. 测试获取私信历史:');
  try {
    const userId = 'user-1';
    const friendId = 'user-2';
    const messages = await socialService.getPrivateMessageHistory(userId, friendId, 10, 0);
    console.log(`✅ 获取私信历史成功:`);
    console.log(`   共获取到 ${messages.length} 条消息`);
    messages.forEach((message: PrivateMessage) => {
      const direction = message.sender_id === userId ? '发送' : '接收';
      console.log(`   [${direction}] ${message.content} (${new Date(message.created_at).toLocaleString()})`);
    });
  } catch (error) {
    console.error('❌ 获取私信历史失败:', error);
  }
  console.log('');

  // 测试7: 获取未读消息计数
  console.log('7. 测试获取未读消息计数:');
  try {
    const userId = 'user-2';
    const count = await socialService.getUnreadMessageCount(userId);
    console.log(`✅ 获取未读消息计数成功:`);
    console.log(`   用户 ${userId} 共有 ${count} 条未读消息`);
  } catch (error) {
    console.error('❌ 获取未读消息计数失败:', error);
  }
  console.log('');

  // 测试8: 标记消息为已读
  console.log('8. 测试标记消息为已读:');
  try {
    const userId = 'user-2';
    const friendId = 'user-1';
    const result = await socialService.markAllMessagesAsRead(userId, friendId);
    console.log(`✅ 标记消息为已读成功:`);
    console.log(`   操作是否成功: ${result}`);
  } catch (error) {
    console.error('❌ 标记消息为已读失败:', error);
  }
  console.log('');

  // 测试9: 删除好友关系
  console.log('9. 测试删除好友关系:');
  try {
    const userId = 'user-1';
    const friendId = 'user-2';
    const result = await socialService.removeFriend(userId, friendId);
    console.log(`✅ 删除好友关系成功:`);
    console.log(`   操作是否成功: ${result}`);
  } catch (error) {
    console.error('❌ 删除好友关系失败:', error);
  }
  console.log('');

  console.log('=== 社交服务单元测试结束 ===');
}

// 运行测试
testSocialService().catch(console.error);
