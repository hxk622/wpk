// 创建原生WebSocket服务实例
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    // 根据后端配置修改WebSocket连接地址
    this.url = 'ws://localhost:3000';
  }

  // 连接到服务器
  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    // 获取token
    const token = localStorage.getItem('token');

    try {
      // 创建连接，将token作为sec-websocket-protocol头传递
      this.socket = new WebSocket(this.url, [token]);

      // 连接成功事件
      this.socket.onopen = () => {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      // 接收消息事件
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const eventName = message.type;
          const data = message.data;
          
          // 触发对应事件的处理函数
          if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(callback => {
              callback(data);
            });
          }
        } catch (error) {
          console.error('解析WebSocket消息错误:', error);
        }
      };

      // 连接错误事件
      this.socket.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        this.isConnected = false;
      };

      // 断开连接事件
      this.socket.onclose = (event) => {
        console.log('WebSocket断开连接:', event.code, event.reason);
        this.isConnected = false;
        
        // 尝试重连
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      this.isConnected = false;
    }
  }

  // 尝试重连
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket尝试重连，次数: ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('WebSocket重连失败');
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers = {};
      this.reconnectAttempts = 0;
    }
  }

  // 发送事件
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      const message = {
        type: eventName,
        data
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接，无法发送事件:', eventName);
    }
  }

  // 监听事件
  on(eventName, callback) {
    // 保存事件处理函数
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(callback);
  }

  // 移除事件监听
  off(eventName, callback) {
    if (this.eventHandlers[eventName]) {
      if (callback) {
        // 移除特定回调
        this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(handler => handler !== callback);
      } else {
        // 移除所有回调
        this.eventHandlers[eventName] = [];
      }
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected;
  }

  // 获取Socket实例
  getSocket() {
    return this.socket;
  }

  // 加入房间
  joinRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  // 离开房间
  leaveRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  // 发送玩家准备状态
  sendPlayerReadyStatus(roomId, ready) {
    this.emit('player_ready', { roomId, ready });
  }

  // 发送聊天消息
  sendChatMessage(roomId, message) {
    this.emit('chat_message', { roomId, message });
  }

  // 移除所有事件监听
  offAll() {
    this.eventHandlers = {};
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;