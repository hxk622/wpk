import { defineStore } from 'pinia';

// 聊天状态管理
export const useChatStore = defineStore('chat', {
  // 状态
  state: () => ({
    // 当前房间的聊天消息列表
    messages: [],
    // 聊天输入框内容
    inputMessage: '',
    // 是否显示聊天窗口
    showChat: true,
    // 当前选中的聊天类型：'room' 或 'private'
    chatType: 'room',
    // 当前私聊对象ID
    privateChatUserId: null
  }),

  // getters
  getters: {
    // 获取当前房间的所有消息
    getRoomMessages: (state) => state.messages.filter(msg => msg.type === 'room'),
    // 获取与指定用户的私聊消息
    getPrivateMessages: (state) => (userId) => {
      return state.messages.filter(msg => 
        msg.type === 'private' && 
        ((msg.senderId === userId && msg.receiverId === state.privateChatUserId) ||
         (msg.senderId === state.privateChatUserId && msg.receiverId === userId))
      );
    },
    // 获取最新的消息
    getLatestMessages: (state) => (limit = 20) => {
      return [...state.messages].reverse().slice(0, limit).reverse();
    }
  },

  // actions
  actions: {
    // 添加消息
    addMessage(message) {
      this.messages.push({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ...message
      });
    },

    // 发送房间消息
    sendRoomMessage(content, senderId, senderName) {
      const message = {
        type: 'room',
        content,
        senderId,
        senderName
      };
      this.addMessage(message);
      return message;
    },

    // 发送私聊消息
    sendPrivateMessage(content, senderId, senderName, receiverId) {
      const message = {
        type: 'private',
        content,
        senderId,
        senderName,
        receiverId
      };
      this.addMessage(message);
      return message;
    },

    // 设置输入消息
    setInputMessage(content) {
      this.inputMessage = content;
    },

    // 清空输入消息
    clearInputMessage() {
      this.inputMessage = '';
    },

    // 切换聊天窗口显示状态
    toggleChat() {
      this.showChat = !this.showChat;
    },

    // 设置聊天类型
    setChatType(type, userId = null) {
      this.chatType = type;
      if (type === 'private' && userId) {
        this.privateChatUserId = userId;
      }
    },

    // 清空所有消息
    clearMessages() {
      this.messages = [];
    }
  }
});