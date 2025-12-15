<template>
  <div class="room-detail">
    <!-- 页面标题 -->
    <van-nav-bar
      title="房间详情"
      left-text="退出"
      left-arrow
      @click-left="handleExitRoom"
    />

    <div class="room-detail-container">
      <!-- 房间信息卡片 -->
      <van-card
        class="room-info-card"
        title="房间信息"
        :bordered="false"
      >
        <div class="room-info">
          <div class="info-item">
            <span class="label">房间号：</span>
            <span class="value">{{ roomInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">盲注：</span>
            <span class="value">{{ roomInfo.smallBlind }} / {{ roomInfo.bigBlind }}</span>
          </div>
          <div class="info-item">
            <span class="label">游戏模式：</span>
            <span class="value">{{ getGameModeText(roomInfo.gameMode) }}</span>
          </div>
          <div class="info-item">
            <span class="label">玩家数量：</span>
            <span class="value">{{ roomInfo.currentPlayers }} / {{ roomInfo.maxPlayers }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <span class="value status-{{ roomInfo.status }}">{{ getRoomStatusText(roomInfo.status) }}</span>
          </div>
        </div>
      </van-card>

      <!-- 玩家列表 -->
      <van-card
        class="players-card"
        title="玩家列表"
        :bordered="false"
      >
        <div class="players-list">
          <div
            v-for="(player, index) in roomInfo.players"
            :key="player.id"
            class="player-item"
            :class="{ 'current-player': player.id === currentUserId, 'ready': player.ready }"
          >
            <div class="player-avatar">
              <van-image
                :src="player.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
                round
                width="48"
                height="48"
              />
              <div v-if="player.ready" class="ready-indicator">
                <van-icon name="checked" size="16" color="#07c160" />
              </div>
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.username }}</div>
              <div class="player-stack">筹码：{{ player.stack || 0 }}</div>
            </div>
            <div v-if="isRoomOwner && player.id !== currentUserId" class="player-actions">
              <van-button size="small" type="danger" @click="kickPlayer(player.id)">
                踢出
              </van-button>
            </div>
          </div>
          <!-- 空位显示 -->
          <div
            v-for="i in (roomInfo.maxPlayers - roomInfo.currentPlayers)"
            :key="'empty-' + i"
            class="player-item empty"
          >
            <div class="player-avatar empty">
              <van-icon name="plus" size="24" color="#969799" />
            </div>
            <div class="player-info">
              <div class="player-name">空位</div>
            </div>
          </div>
        </div>
      </van-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="!isInRoom"
          type="primary"
          block
          @click="joinRoom"
          :loading="joining"
        >
          加入房间
        </van-button>
        
        <div v-else class="in-room-actions">
          <van-button
            v-if="!roomInfo.gameStarted"
            type="info"
            block
            @click="toggleReady"
            :class="{ 'ready-btn': isReady }"
          >
            {{ isReady ? '取消准备' : '准备' }}
          </van-button>
          
          <van-button
            type="danger"
            block
            @click="leaveRoom"
            style="margin-top: 10px;"
          >
            离开房间
          </van-button>
          
          <van-button
            v-if="isRoomOwner && !roomInfo.gameStarted && canStartGame"
            type="success"
            block
            @click="startGame"
            style="margin-top: 10px;"
            :loading="startingGame"
          >
            开始游戏
          </van-button>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div v-if="isInRoom" class="chat-container">
        <van-tabs v-model:active="activeTab">
          <van-tab title="聊天">
            <div class="chat-messages">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                class="chat-message"
                :class="{ 'own-message': message.senderId === currentUserId }"
              >
                <div class="message-avatar">
                  <van-image
                    :src="message.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
                    round
                    width="28"
                    height="28"
                  />
                </div>
                <div class="message-content">
                  <div class="message-name">{{ message.username }}</div>
                  <div class="message-text">{{ message.content }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <van-field
                v-model="chatInput"
                placeholder="输入消息..."
                left-icon="chat-o"
                right-icon="send"
                @click-right-icon="sendMessage"
              />
            </div>
          </van-tab>
          
          <van-tab title="设置">
            <div class="settings-content">
              <van-cell-group inset>
                <van-cell title="音效" value="">
                  <template #right-icon>
                    <van-switch v-model="settings.sound" size="24px" />
                  </template>
                </van-cell>
                <van-cell title="背景音乐" value="">
                  <template #right-icon>
                    <van-switch v-model="settings.bgMusic" size="24px" />
                  </template>
                </van-cell>
                <van-cell title="AI辅助" value="">
                  <template #right-icon>
                    <van-switch v-model="settings.aiAssist" size="24px" />
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import roomApi from '../api/room';
import socketService from '../api/socket';
import { showToast, showConfirmDialog } from 'vant';
import { useUserStore } from '../stores/user';

// 路由和参数
const router = useRouter();
const route = useRoute();
const roomId = route.params.id;

// 当前用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.userInfo);
const currentUserId = currentUser?.id;

// 房间信息
const roomInfo = reactive({
  id: roomId,
  smallBlind: 10,
  bigBlind: 20,
  gameMode: 'no_limit',
  maxPlayers: 6,
  currentPlayers: 0,
  status: 'waiting',
  gameStarted: false,
  players: [],
  ownerId: null
});

// 状态
const joining = ref(false);
const startingGame = ref(false);
const isInRoom = ref(false);
const isReady = ref(false);
const chatMessages = ref([]);
const chatInput = ref('');
const activeTab = ref(0);

// 设置
const settings = reactive({
  sound: true,
  bgMusic: true,
  aiAssist: true
});

// 计算属性
const isRoomOwner = computed(() => roomInfo.ownerId === currentUserId);
const canStartGame = computed(() => {
  // 至少需要2个玩家才能开始游戏
  const readyPlayers = roomInfo.players.filter(p => p.ready).length;
  return readyPlayers >= 2;
});

// 获取游戏模式文本
const getGameModeText = (mode) => {
  const modes = {
    'no_limit': '无限注',
    'limit': '有限注',
    'pot_limit': '固定注'
  };
  return modes[mode] || mode;
};

// 获取房间状态文本
const getRoomStatusText = (status) => {
  const statuses = {
    'waiting': '等待中',
    'playing': '游戏中',
    'finished': '已结束'
  };
  return statuses[status] || status;
};

// 加载房间信息
const loadRoomInfo = async () => {
  try {
    const response = await roomApi.getRoomDetail(roomId);
    const roomData = response.room || response;
    if (roomData) {
      Object.assign(roomInfo, roomData);
      // 检查当前用户是否在房间内
      const currentPlayer = roomInfo.players.find(p => p.id === currentUserId);
      isInRoom.value = !!currentPlayer;
      if (currentPlayer) {
        isReady.value = currentPlayer.ready;
      }
    }
  } catch (error) {
    console.error('加载房间信息失败:', error);
    showToast(error.message || '加载房间信息失败');
  }
};

// 加入房间
const joinRoom = async () => {
  try {
    joining.value = true;
    await roomApi.joinRoom(roomId);
    showToast('加入房间成功');
    await loadRoomInfo();
    // 使用WebSocket加入房间
    if (currentUserId) {
      socketService.joinRoom(Number(roomId));
    }
  } catch (error) {
    console.error('加入房间失败:', error);
    showToast(error.message || '加入房间失败');
  } finally {
    joining.value = false;
  }
};

// 离开房间
const leaveRoom = () => {
  showConfirmDialog({
    title: '确认离开',
    message: '确定要离开房间吗？'
  }).then(async () => {
    try {
      // 使用WebSocket离开房间
      socketService.leaveRoom(Number(roomId));
      
      await roomApi.leaveRoom(roomId);
      showToast('离开房间成功');
      router.push('/rooms');
    } catch (error) {
      console.error('离开房间失败:', error);
      showToast(error.message || '离开房间失败');
    }
  }).catch(() => {
    // 用户取消
  });
};

// 退出房间（返回按钮）
const handleExitRoom = () => {
  if (isInRoom.value) {
    leaveRoom();
  } else {
    router.push('/rooms');
  }
};

// 切换准备状态
const toggleReady = async () => {
  try {
    // 使用WebSocket发送准备状态
    socketService.sendPlayerReadyStatus(Number(roomId), !isReady.value);
    
    // 乐观更新本地状态
    isReady.value = !isReady.value;
    const playerIndex = roomInfo.players.findIndex(p => p.id === currentUserId);
    if (playerIndex !== -1) {
      roomInfo.players[playerIndex].ready = isReady.value;
    }
    showToast(isReady.value ? '已准备' : '已取消准备');
    
    // 也可以调用API作为备选方案
    const response = await roomApi.toggleReady(roomId, !isReady.value);
    if (response && response.error) {
      // API调用失败，回滚本地状态
      isReady.value = !isReady.value;
      if (playerIndex !== -1) {
        roomInfo.players[playerIndex].ready = isReady.value;
      }
      showToast(response.error || '操作失败');
    }
  } catch (error) {
    console.error('切换准备状态失败:', error);
    // 网络错误，回滚本地状态
    isReady.value = !isReady.value;
    const playerIndex = roomInfo.players.findIndex(p => p.id === currentUserId);
    if (playerIndex !== -1) {
      roomInfo.players[playerIndex].ready = isReady.value;
    }
    showToast('操作失败，请检查网络连接');
  }
};

// 踢出玩家
const kickPlayer = (playerId) => {
  showConfirmDialog({
    title: '确认踢出',
    message: '确定要将该玩家踢出房间吗？'
  }).then(async () => {
    try {
      const response = await roomApi.kickPlayer(roomId, playerId);
      if (response && !response.error) {
        showToast('踢出成功');
        await loadRoomInfo();
      } else {
        showToast(response?.error || '踢出失败');
      }
    } catch (error) {
      console.error('踢出玩家失败:', error);
      showToast(error.message || '踢出失败');
    }
  }).catch(() => {
    // 用户取消
  });
};

// 开始游戏
const startGame = async () => {
  try {
    startingGame.value = true;
    const response = await roomApi.startGame(roomId);
      if (response && !response.error) {
        showToast('游戏开始');
        // 跳转到游戏界面
        router.push(`/game/${roomId}`);
      } else {
        showToast(response?.error || '开始游戏失败');
      }
  } catch (error) {
    console.error('开始游戏失败:', error);
    showToast(error.message || '开始游戏失败');
  } finally {
    startingGame.value = false;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!chatInput.value.trim()) return;
  
  const message = {
    senderId: currentUserId,
    username: currentUser?.username || '我',
    avatar: currentUser?.avatar,
    content: chatInput.value.trim(),
    timestamp: new Date().toISOString()
  };
  
  // 先添加到本地
  chatMessages.value.push(message);
  chatInput.value = '';
  
  try {
    // 使用WebSocket发送消息
    socketService.sendChatMessage(Number(roomId), message.content);
    
    // 也可以调用API作为备选方案
    await roomApi.sendMessage(roomId, message.content);
  } catch (error) {
    console.error('发送消息失败:', error);
    // 可以选择从本地移除失败的消息
    chatMessages.value.pop();
    showToast(error.message || '发送消息失败');
  }
};

// 初始加载
onMounted(() => {
  loadRoomInfo();
  
  // 连接WebSocket并加入房间
  if (currentUserId) {
    socketService.connect();
    socketService.joinRoom(Number(roomId));
      
    // 监听房间状态更新
    socketService.on('room_state_update', (data) => {
      if (data.room || data) {
        // 根据后端返回的数据结构进行适配
        const roomData = data.room || data;
        Object.assign(roomInfo, roomData);
        // 更新当前用户是否在房间内和准备状态
        const currentPlayer = roomInfo.players.find(p => p.id === currentUserId);
        isInRoom.value = !!currentPlayer;
        if (currentPlayer) {
          isReady.value = currentPlayer.ready;
        }
      }
    });
    
    // 监听玩家加入事件
    socketService.on('player_joined', (data) => {
      showToast(`${data.username || '玩家'} 加入了房间`);
    });
    
    // 监听玩家离开事件
    socketService.on('player_left', (data) => {
      showToast(`${data.username || '玩家'} 离开了房间`);
    });
    
    // 监听玩家准备状态变化事件
    socketService.on('player_ready_status', (data) => {
      // 更新对应玩家的准备状态
      const player = roomInfo.players.find(p => p.id === data.playerId);
      if (player) {
        player.ready = data.ready;
        // 如果是当前用户，更新本地准备状态
        if (data.playerId === currentUserId) {
          isReady.value = data.ready;
        }
      }
    });
    
    // 监听错误事件
    socketService.on('error', (data) => {
      console.error('WebSocket错误:', data);
      showToast(data.message || '服务器连接错误');
    });
  }
});

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  socketService.leaveRoom(Number(roomId));
  socketService.offAll();
  // 注意：这里不要断开整个socket连接，因为可能还有其他组件需要使用
  // socketService.disconnect();
});
</script>

<style scoped>
.room-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.room-detail-container {
  padding: 20px;
}

.room-info-card,
.players-card {
  margin-bottom: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #646566;
  font-size: 14px;
}

.info-item .value {
  color: #323233;
  font-weight: 500;
}

.status-waiting {
  color: #1989fa;
}

.status-playing {
  color: #07c160;
}

.status-finished {
  color: #969799;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f7f8fa;
  border-radius: 8px;
  position: relative;
}

.player-item.current-player {
  border: 2px solid #1989fa;
}

.player-item.ready {
  background-color: #f0f9eb;
}

.player-item.empty {
  opacity: 0.6;
}

.player-avatar {
  position: relative;
  margin-right: 10px;
}

.player-avatar.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e6eb;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.ready-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.player-stack {
  font-size: 12px;
  color: #646566;
}

.player-actions {
  margin-left: 10px;
}

.action-buttons {
  margin-bottom: 15px;
}

.in-room-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ready-btn {
  background-color: #07c160;
  border-color: #07c160;
}

.chat-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.chat-messages {
  height: 200px;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chat-message.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin-top: 2px;
}

.message-content {
  max-width: 70%;
}

.own-message .message-content {
  text-align: right;
}

.message-name {
  font-size: 12px;
  color: #969799;
  margin-bottom: 2px;
}

.message-text {
  background-color: #f2f3f5;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  word-wrap: break-word;
}

.own-message .message-text {
  background-color: #1989fa;
  color: white;
}


.chat-input {
  border-top: 1px solid #ebedf0;
  padding: 10px;
}

.settings-content {
  padding: 10px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .room-detail-container {
    padding: 10px;
  }
  
  .player-item {
    padding: 8px;
  }
  
  .player-avatar img {
    width: 36px !important;
    height: 36px !important;
  }
  
  .player-avatar.empty {
    width: 36px;
    height: 36px;
  }
  
  .player-name {
    font-size: 14px;
  }
  
  .player-stack {
    font-size: 12px;
  }
  
  .chat-messages {
    height: 180px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message-text {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .action-buttons button {
    padding: 10px 0;
  }
}
</style>