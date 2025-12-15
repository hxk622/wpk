import { ref } from 'vue';

// WebSocket消息类型定义
export interface WebSocketMessage {
  type: string;
  data: any;
}

// 事件处理器类型
type EventHandler = (data: any) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private url: string = 'ws://localhost:3000';
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  public isConnected = ref(false);

  constructor() {
    // 初始化事件处理器映射
    this.eventHandlers = new Map();
  }

  // 连接WebSocket服务器
  connect(userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      if (this.isConnecting) {
        // 如果已经在连接中，等待连接完成
        const checkConnection = () => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            resolve(true);
          } else if (this.socket?.readyState === WebSocket.CLOSED) {
            reject(new Error('WebSocket连接失败'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      try {
        // 创建WebSocket连接，带上用户ID作为查询参数
        this.socket = new WebSocket(`${this.url}?userId=${userId}`);

        // 连接打开事件
        this.socket.onopen = () => {
          console.log('WebSocket连接已建立');
          this.isConnected.value = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve(true);
        };

        // 接收消息事件
        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        // 连接关闭事件
        this.socket.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.isConnected.value = false;
          this.isConnecting = false;
          
          // 自动重连
          this.attemptReconnect(userId);
        };

        // 连接错误事件
        this.socket.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // 断开WebSocket连接
  disconnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
    this.isConnected.value = false;
    this.eventHandlers.clear();
  }

  // 发送消息到服务器
  send(type: string, data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送消息');
      return;
    }

    const message: WebSocketMessage = { type, data };
    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
    }
  }

  // 订阅事件
  on(type: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type)?.push(handler);
  }

  // 取消订阅事件
  off(type: string, handler: EventHandler): void {
    if (this.eventHandlers.has(type)) {
      const handlers = this.eventHandlers.get(type)?.filter(h => h !== handler) || [];
      if (handlers.length > 0) {
        this.eventHandlers.set(type, handlers);
      } else {
        this.eventHandlers.delete(type);
      }
    }
  }

  // 取消所有事件订阅
  offAll(): void {
    this.eventHandlers.clear();
  }

  // 处理接收到的消息
  private handleMessage(message: WebSocketMessage): void {
    console.log('收到WebSocket消息:', message);
    const { type, data } = message;

    // 调用所有注册的事件处理器
    if (this.eventHandlers.has(type)) {
      this.eventHandlers.get(type)?.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`处理WebSocket事件 ${type} 失败:`, error);
        }
      });
    }
  }

  // 尝试重新连接
  private attemptReconnect(userId: number): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(userId).catch(error => {
          console.error('重连失败:', error);
        });
      }, this.reconnectDelay);
    } else {
      console.error('达到最大重连尝试次数，停止重连');
    }
  }

  // 加入房间
  joinRoom(roomId: number): void {
    this.send('join_room', { roomId });
  }

  // 离开房间
  leaveRoom(roomId: number): void {
    this.send('leave_room', { roomId });
  }

  // 发送玩家准备状态
  sendPlayerReadyStatus(roomId: number, isReady: boolean): void {
    this.send('player_ready', { roomId, ready: isReady });
  }

  // 发送游戏动作
  sendGameAction(sessionId: number, action: string, data?: any): void {
    this.send('game_action', { sessionId, action, data });
  }

  // 发送聊天消息
  sendChatMessage(roomId: number, content: string): void {
    this.send('chat_message', { roomId, content });
  }
}

// 导出单例实例
export const socketService = new SocketService();
