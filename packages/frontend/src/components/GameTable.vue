<template>
  <div class="game-table-container">
    <!-- 游戏桌背景 -->
    <div class="game-table-background">
      <!-- 玩家座位 - 动态生成 -->
      <div class="player-seats" :style="{ '--seat-count': maxPlayers }">
        <div 
          v-for="index in maxPlayers" 
          :key="index" 
          class="seat" 
          :style="getSeatPosition(index - 1)"
        >
          <div v-if="getPlayerByPosition(index - 1)" class="player-info">
            <div class="player-avatar">
              <img :src="getPlayerByPosition(index - 1).avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'" alt="avatar" />
            </div>
            <div class="player-name">{{ getPlayerByPosition(index - 1).username }}</div>
            <div class="player-stack">{{ getPlayerByPosition(index - 1).stack }}</div>
          </div>
          <div v-else class="empty-seat">+</div>
        </div>
      </div>
      
      <!-- 中央区域 -->
      <div class="center-area">
        <!-- 品牌标识 -->
        <div class="brand-logo">
          <div class="logo-text">WePoker</div>
          <div class="logo-url">www.wpk.com</div>
        </div>
        
        <!-- 总底池信息 -->
        <div class="pot-info">
          <div class="pot-banner">总底池</div>
          <div class="pot-amount">{{ formatMoney(totalPot) }}</div>
        </div>
        
        <!-- 邀请好友按钮 -->
        <div class="invite-button">邀请好友</div>
        
        <!-- 房间信息 -->
        <div class="room-info">
          <div class="room-stats">
            <span>20/40</span>
            <span>♠ 950344</span>
            <span>⏱ 01:00:00</span>
          </div>
          <div class="room-details">
            <div class="detail-item">
              <span class="label">带入记分牌上限：</span>
              <span class="value">40000</span>
            </div>
            <div class="detail-item">
              <span class="label">随机入座 | </span>
              <span class="value">All-in发两次</span>
            </div>
            <div class="detail-item">
              <span class="label">web.wpk13.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Card from './Card.vue';

// 本地实现formatMoney函数，避免从shared包导入
const formatMoney = (amount) => {
  return `${amount}`;
};

const props = defineProps({
  players: {
    type: Array,
    default: () => []
  },
  communityCards: {
    type: Array,
    default: () => []
  },
  currentPlayer: {
    type: Object,
    default: null
  },
  gamePhase: {
    type: String,
    default: 'waiting'
  },
  currentBet: {
    type: Number,
    default: 0
  },
  totalPot: {
    type: Number,
    default: 0
  },
  maxPlayers: {
    type: Number,
    default: 6,
    validator: (value) => value >= 2 && value <= 12
  }
});

// 根据位置获取玩家
const getPlayerByPosition = (position) => {
  return props.players.find(player => player.position === position);
};

// 动态计算座位位置
const getSeatPosition = (index) => {
  const seatCount = props.maxPlayers;
  const angle = (index / seatCount) * Math.PI * 2 - Math.PI / 2; // 从顶部开始
  const radius = 45; // 百分比半径
  const x = Math.cos(angle) * radius + 50;
  const y = Math.sin(angle) * radius + 50;
  return {
    top: `${y}%`,
    left: `${x}%`,
    transform: 'translate(-50%, -50%)'
  };
};
</script>

<style scoped>
/* 游戏桌容器 */
.game-table-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 游戏桌背景 */
.game-table-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e553c 0%, #143a25 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 玩家座位容器 */
.player-seats {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 900px;
  max-height: 900px;
}

/* 座位样式 */
.seat {
  position: absolute;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* 座位位置通过JavaScript动态计算 */
.seat {
  position: absolute;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* 空位样式 */
.empty-seat {
  width: 60px;
  height: 60px;
  border: 3px dashed rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.empty-seat:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: rgba(255, 255, 255, 0.6);
}

/* 玩家信息样式 */
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 玩家头像 */
.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 8px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 玩家名称 */
.player-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

/* 玩家筹码 */
.player-stack {
  font-size: 14px;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

/* 中央区域 */
.center-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

/* 品牌标识 */
.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo-text {
  font-size: 36px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 5px;
}

.logo-url {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
}

/* 总底池信息 */
.pot-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.pot-banner {
  background: linear-gradient(90deg, #1e7e34, #2ecc71);
  color: white;
  padding: 5px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.pot-amount {
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

/* 邀请好友按钮 */
.invite-button {
  background: linear-gradient(90deg, #1e7e34, #2ecc71);
  color: white;
  padding: 12px 40px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.invite-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 房间信息 */
.room-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.room-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.room-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-item {
  display: flex;
  gap: 5px;
  text-align: center;
}

.detail-item .label {
  font-weight: bold;
}

.detail-item .value {
  color: rgba(255, 255, 255, 0.9);
}
</style>