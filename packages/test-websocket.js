const WebSocket = require('ws');

// JWT令牌（从登录响应中获取）
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMThlZjc4Zi1hZTEwLTRmMDEtOWM3YS1mOGEwNTE0MjY4MTMiLCJpYXQiOjE3NjU3NzQzMTYsImV4cCI6MTc2NTg2MDcxNn0.rl9382PY3armFyJLwzfiLR1JbEM57llBMeYCphi-B8U';

// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:3000', [token]);

// 连接成功事件
ws.on('open', () => {
  console.log('WebSocket连接已建立');
  
  // 测试发送加入房间消息
  const joinRoomMessage = {
    type: 'join_room',
    data: {
      roomId: 'test-room-1'
    }
  };
  
  ws.send(JSON.stringify(joinRoomMessage));
  console.log('已发送加入房间消息:', joinRoomMessage);
});

// 接收消息事件
ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('收到消息:', message);
});

// 连接关闭事件
ws.on('close', () => {
  console.log('WebSocket连接已关闭');
});

// 连接错误事件
ws.on('error', (error) => {
  console.error('WebSocket连接错误:', error);
});

// 3秒后发送玩家准备消息
setTimeout(() => {
  const readyMessage = {
    type: 'player_ready',
    data: {
      roomId: 'test-room-1',
      ready: true
    }
  };
  
  ws.send(JSON.stringify(readyMessage));
  console.log('已发送玩家准备消息:', readyMessage);
}, 3000);

// 5秒后关闭连接
setTimeout(() => {
  ws.close();
}, 5000);
