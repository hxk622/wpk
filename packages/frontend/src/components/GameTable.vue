<template>
  <div class="game-table-container">
    <!-- 游戏桌 -->
    <div class="game-table">
      <!-- 公共牌区域 -->
      <div class="community-cards">
        <div v-for="(card, index) in communityCards" :key="index" class="card-wrapper">
          <Card :card="card" :is-flipped="true" />
        </div>
        <div v-if="communityCards.length < 5" v-for="index in (5 - communityCards.length)" :key="'empty-' + index" class="card-wrapper empty"></div>
      </div>
      
      <!-- 底池信息 -->
      <div class="pot-info">
        <div class="pot-label">底池</div>
        <div class="pot-amount">{{ formatMoney(totalPot) }}</div>
      </div>
      
      <!-- 当前回合信息 -->
      <div class="round-info" v-if="currentPlayer">
        <div class="phase-label">{{ phaseLabel }}</div>
        <div class="current-player">当前行动: {{ currentPlayer.username }}</div>
        <div class="current-bet" v-if="currentBet > 0">当前下注: {{ formatMoney(currentBet) }}</div>
      </div>
    </div>
    
    <!-- 玩家座位 -->
    <div class="player-seats">
      <div v-for="player in players" :key="player.id" 
           class="player-seat" 
           :class="{
             'current-player': player.isCurrentPlayer,
             'dealer': player.isDealer,
             'small-blind': player.isSmallBlind,
             'big-blind': player.isBigBlind,
             'folded': player.hasFolded,
             'winner': player.isWinner
           }"
           :style="getSeatPosition(player.position)">
        <!-- 玩家信息 -->
        <div class="player-info">
          <div class="player-avatar" :style="{ backgroundColor: getRandomColor(player.id) }">
            {{ player.username.charAt(0).toUpperCase() }}
          </div>
          <div class="player-name">{{ player.username }}</div>
          <div class="player-stack">{{ formatMoney(player.stack) }}</div>
          <div v-if="player.bet > 0" class="player-bet">{{ formatMoney(player.bet) }}</div>
          
          <!-- 玩家状态指示器 -->
          <div v-if="player.isDealer" class="status-indicator dealer">D</div>
          <div v-else-if="player.isSmallBlind" class="status-indicator small-blind">SB</div>
          <div v-else-if="player.isBigBlind" class="status-indicator big-blind">BB</div>
          
          <!-- 行动状态 -->
          <div v-if="player.hasFolded" class="action-indicator folded">弃牌</div>
          <div v-else-if="player.isAllIn" class="action-indicator all-in">全下</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Card from './Card.vue';
import { formatMoney } from '@poker/shared';

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
  }
});

// 计算阶段标签
const phaseLabel = computed(() => {
  switch (props.gamePhase) {
    case 'preflop': return '翻牌前';
    case 'flop': return '翻牌';
    case 'turn': return '转牌';
    case 'river': return '河牌';
    case 'showdown': return '摊牌';
    default: return '等待开始';
  }
});

// 计算玩家座位位置
const getSeatPosition = (position) => {
  const positions = [
    { top: '10%', left: '45%' },      // 位置1
    { top: '20%', left: '70%' },      // 位置2
    { top: '50%', left: '85%' },      // 位置3
    { top: '80%', left: '70%' },      // 位置4
    { top: '90%', left: '45%' },      // 位置5
    { top: '80%', left: '20%' },      // 位置6
    { top: '50%', left: '5%' },       // 位置7
    { top: '20%', left: '20%' }       // 位置8
  ];
  return positions[position % positions.length] || { top: '50%', left: '50%' };
};

// 生成随机颜色
const getRandomColor = (id) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E2', '#F8C471', '#82E0AA'
  ];
  return colors[Math.abs(id.hashCode()) % colors.length];
};

// 字符串哈希函数
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};
</script>

<style scoped>
.game-table-container {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e3a20;
  padding: 20px;
  box-sizing: border-box;
}

.game-table {
  position: relative;
  width: 80%;
  height: 80%;
  max-width: 800px;
  max-height: 500px;
  background: radial-gradient(circle at center, #2d5a27 0%, #1e3a20 70%);
  border-radius: 50%;
  border: 10px solid #8B4513;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.community-cards {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.card-wrapper {
  margin: 0 5px;
}

.card-wrapper.empty {
  width: 80px;
  height: 112px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  margin: 0 5px;
}

.pot-info {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}

.pot-label {
  font-size: 14px;
  opacity: 0.8;
}

.pot-amount {
  font-size: 32px;
  font-weight: bold;
  color: #FFD700;
}

.round-info {
  text-align: center;
  color: white;
  font-size: 16px;
}

.phase-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.current-player {
  margin-bottom: 5px;
}

.current-bet {
  color: #FFD700;
  font-weight: bold;
}

.player-seats {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.player-seat {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px;
  min-width: 120px;
  text-align: center;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.player-seat.current-player {
  border-color: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  transform: scale(1.1);
}

.player-seat.dealer {
  border-color: #FF6B6B;
}

.player-seat.small-blind {
  border-color: #4ECDC4;
}

.player-seat.big-blind {
  border-color: #45B7D1;
}

.player-seat.folded {
  opacity: 0.5;
}

.player-seat.winner {
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 1);
}

.player-info {
  color: white;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  margin: 0 auto 8px;
}

.player-name {
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: bold;
}

.player-stack {
  font-size: 12px;
  margin-bottom: 2px;
}

.player-bet {
  font-size: 14px;
  color: #FFD700;
  font-weight: bold;
  margin-top: 2px;
}

.status-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.status-indicator.dealer {
  background-color: #FF6B6B;
}

.status-indicator.small-blind {
  background-color: #4ECDC4;
}

.status-indicator.big-blind {
  background-color: #45B7D1;
}

.action-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

.action-indicator.folded {
  background-color: #777;
}

.action-indicator.all-in {
  background-color: #FF6B6B;
}
</style>