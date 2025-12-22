<template>
  <div class="game-container">
    <!-- 顶部状态栏 -->
    <div class="top-status">
      <div class="game-header">
        <button class="exit-button" @click="handleExitGame">
          <van-icon name="arrow-left" size="20" color="#fff" />
          <span>退出</span>
        </button>
        <div class="game-status">
          <div class="status-item">
            <span class="label">游戏状态：</span>
            <span class="value">{{ gameState.statusText }}</span>
          </div>
          <div class="status-item">
            <span class="label">连接状态：</span>
            <span class="value" :class="{ 'connected': socketService.isConnected, 'disconnected': !socketService.isConnected, 'reconnecting': reconnecting }">
              {{ socketService.isConnected ? '已连接' : reconnecting ? '重连中...' : '已断开' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">当前回合：</span>
            <span class="value">{{ gameState.currentRoundText }}</span>
          </div>
          <div class="status-item">
            <span class="label">当前玩家：</span>
            <span class="value">{{ gameState.currentPlayer }}</span>
          </div>
        </div>
      </div>
      <div class="game-controls-top">
        <div class="pot-info">
          <span class="label">底池：</span>
          <span class="value">{{ gameState.pot }}</span>
        </div>
        <!-- 游戏控制按钮 -->
        <div class="game-action-buttons" v-if="gameState.status !== GAME_STATUS.IN_PROGRESS">
          <van-button size="small" type="primary" @click="startGame" v-if="gameState.status === GAME_STATUS.WAITING || gameState.status === GAME_STATUS.FINISHED">
            开始游戏
          </van-button>
          <van-button size="small" type="success" @click="restartGame" v-if="gameState.status === GAME_STATUS.FINISHED">
            重新开始
          </van-button>
        </div>
      </div>
    </div>

    <!-- 游戏桌区域 -->
    <GameTable
      :players="roomPlayers"
      :community-cards="gameState.communityCards"
      :current-player="roomPlayers.find(p => p.id === gameState.currentPlayerId)"
      :game-phase="gameState.currentRound"
      :current-bet="gameState.currentBet"
      :total-pot="gameState.pot"
    />

    <!-- 当前玩家手牌 -->
    <PlayerHand
      :hole-cards="playerCards"
      :hand-strength="{
        strength: aiAnalysis.handStrength,
        percentage: aiAnalysis.winProbability,
        description: aiAnalysis.handCombination
      }"
      :ai-suggestions="{
        recommendedAction: aiAnalysis.recommendedAction,
        explanation: aiAnalysis.explanation
      }"
      :show-ai="aiAnalysis.show"
    />

    <!-- 游戏控制区域 -->
    <GameControls
      :balance="maxBet"
      :current-bet="currentPlayerBet"
      :amount-to-call="callAmount"
      :big-blind="gameState.bigBlind"
      :is-player-turn="gameState.currentPlayerId === currentUserId && gameState.status === GAME_STATUS.IN_PROGRESS"
      :is-loading="false"
      @fold="fold"
      @check="check"
      @call="call"
      @raise="raise"
      @all-in="allIn"
    />

    <!-- 底部功能栏 -->
    <div class="bottom-bar">
      <van-tabs v-model:active="activeTab">
        <van-tab title="游戏">
          <!-- 游戏相关信息 -->
        </van-tab>
        <van-tab title="聊天">
          <div class="chat-section">
            <!-- 聊天类型切换 -->
            <div class="chat-type-tabs">
              <van-button 
                size="small" 
                :type="chatStore.chatType === 'room' ? 'primary' : 'default'" 
                @click="chatStore.setChatType('room')"
              >
                房间聊天
              </van-button>
              <van-button 
                size="small" 
                :type="chatStore.chatType === 'private' ? 'primary' : 'default'" 
                :disabled="!chatStore.privateChatUserId"
                @click="chatStore.setChatType('private')"
              >
                私聊
              </van-button>
            </div>
            
            <!-- 聊天消息列表 -->
            <div class="chat-messages">
              <div
                v-for="(message, index) in chatStore.getLatestMessages(50)"
                :key="message.id"
                class="chat-message"
                :class="{
                  'own-message': message.senderId === currentUserId,
                  'private-message': message.type === 'private'
                }"
              >
                <div class="message-content">
                  <div class="message-header">
                    <div class="message-sender">{{ message.senderName }}</div>
                    <div class="message-time">{{ new Date(message.timestamp).toLocaleTimeString() }}</div>
                  </div>
                  <div class="message-text">{{ message.content }}</div>
                  <div v-if="message.type === 'private'" class="message-type-indicator">私聊</div>
                </div>
              </div>
            </div>
            
            <!-- 聊天输入框 -->
            <div class="chat-input">
              <van-field
                v-model="chatStore.inputMessage"
                :placeholder="chatStore.chatType === 'private' ? '输入私聊消息...' : '输入房间消息...'"
                right-icon="send"
                @click-right-icon="sendChatMessage"
                @keyup.enter="sendChatMessage"
              />
            </div>
          </div>
        </van-tab>
        <van-tab title="AI辅助">
          <div class="ai-assist-section">
            <div class="ai-controls">
              <van-cell-group inset>
                <van-cell title="AI辅助开关">
                  <template #right-icon>
                    <van-switch v-model="aiAnalysis.enabled" size="24px" @change="toggleAiAssist" />
                  </template>
                </van-cell>
                <van-cell title="实时分析">
                  <template #right-icon>
                    <van-switch v-model="aiAnalysis.realTime" size="24px" />
                  </template>
                </van-cell>
                <van-cell title="建议强度">
                  <template #right-icon>
                    <van-slider v-model="aiAnalysis.adviceStrength" min="1" max="5" step="1" />
                  </template>
                </van-cell>
              </van-cell-group>
              <van-button
                type="primary"
                block
                @click="requestAiAnalysis"
                :loading="aiAnalysis.loading"
                style="margin-top: 10px;"
              >
                请求AI分析
              </van-button>
            </div>
            <div v-if="aiAnalysis.show" class="ai-analysis">
              <div class="analysis-card">
                <div class="card-title">当前手牌分析</div>
                <div class="card-content">
                  <div class="analysis-item">
                    <span class="item-label">手牌组合：</span>
                    <span class="item-value">{{ aiAnalysis.handCombination }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">手牌强度：</span>
                    <span class="item-value">{{ aiAnalysis.handStrength }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">获胜概率：</span>
                    <span class="item-value">{{ aiAnalysis.winProbability }}%</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">底池赔率：</span>
                    <span class="item-value">{{ aiAnalysis.potOdds }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">牌力 equity：</span>
                    <span class="item-value">{{ aiAnalysis.equity }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">推荐操作：</span>
                    <span class="item-value">{{ aiAnalysis.recommendedAction }}</span>
                  </div>
                  <div v-if="aiAnalysis.explanation" class="analysis-explanation">
                    <span class="explanation-label">分析说明：</span>
                    <span class="explanation-text">{{ aiAnalysis.explanation }}</span>
                  </div>
                  
                  <!-- 对手分析 -->
                  <div v-if="aiAnalysis.opponentAnalysis" class="opponent-analysis">
                    <div class="opponent-title">对手分析</div>
                    <div class="analysis-item">
                      <span class="item-label">对手：</span>
                      <span class="item-value">{{ aiAnalysis.opponentAnalysis.opponentName }}</span>
                    </div>
                    <div class="analysis-item">
                      <span class="item-label">打法风格：</span>
                      <span class="item-value">{{ aiAnalysis.opponentAnalysis.playingStyle }}</span>
                    </div>
                    <div class="analysis-item">
                      <span class="item-label">攻击倾向：</span>
                      <span class="item-value">{{ aiAnalysis.opponentAnalysis.aggressionLevel }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import gameApi from '../api/game';
import aiApi from '../api/ai';
import { showToast, showConfirmDialog } from 'vant';
import { useUserStore } from '../stores/user';
import { useChatStore } from '../stores/chat';
import socketService from '../api/socket';

// 导入游戏组件
import Card from '../components/Card.vue';
import GameTable from '../components/GameTable.vue';
import PlayerHand from '../components/PlayerHand.vue';
import GameControls from '../components/GameControls.vue';

// 路由和参数
const router = useRouter();
const route = useRoute();
const gameId = route.params.id;
const roomId = route.params.id; // 假设gameId和roomId相同

// 当前用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.userInfo);
const currentUserId = computed(() => userStore.getUserId);

// 连接状态 - 直接使用socketService的响应式状态
const reconnecting = ref(false);
const connectionError = ref(null);

// 清理函数引用，用于组件卸载时清理资源
let cleanupFunction = null;

// 游戏状态枚举
const GAME_STATUS = {
  WAITING: 'waiting',
  STARTING: 'starting',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished'
};

const GAME_ROUNDS = {
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
};

// 游戏状态
const gameState = reactive({
  id: gameId,
  status: GAME_STATUS.WAITING,
  statusText: '等待开始',
  currentRound: GAME_ROUNDS.PREFLOP,
  currentRoundText: '翻牌前',
  currentPlayer: '',
  currentPlayerId: null,
  pot: 0,
  totalBet: 0,
  smallBlind: 10,
  bigBlind: 20,
  dealerPosition: 0,
  communityCards: [
    { suit: 'S', value: 'A', revealed: false },
    { suit: 'H', value: 'K', revealed: false },
    { suit: 'D', value: 'Q', revealed: false },
    { suit: 'C', value: 'J', revealed: false },
    { suit: 'S', value: '10', revealed: false }
  ],
  // 回合开始时的底池，用于计算当前回合的下注
  roundPot: 0,
  // 当前回合最高下注
  currentBet: 0,
  // 是否已经有人加注
  hasRaised: false,
  // 游戏开始时间
  startTime: null,
  // 游戏结束时间
  endTime: null,
  // 获胜者信息
  winner: null
});

// 玩家座位（模拟数据，实际应该从服务器获取）
// 玩家状态枚举
const PLAYER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  READY: 'ready',
  NOT_READY: 'not_ready',
  IN_GAME: 'in_game',
  FOLDED: 'folded',
  ALL_IN: 'all_in',
  OUT: 'out'
};

const playerSeats = reactive([
  // 座位0-8，按照德州扑克顺时针座位排列
  { index: 0, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'top' },
  { index: 1, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'top-right' },
  { index: 2, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'right' },
  { index: 3, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'bottom-right' },
  { index: 4, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'bottom' },
  { index: 5, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'bottom-left' },
  { index: 6, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'left' },
  { index: 7, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'top-left' },
  { index: 8, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false, isEmpty: true, position: 'center' } // 中心位置（通常不使用）
]);

// 当前房间的所有玩家
const roomPlayers = ref([]);

// 玩家进入房间
const handlePlayerJoin = (player) => {
  // 添加到房间玩家列表
  if (!roomPlayers.value.find(p => p.id === player.id)) {
    roomPlayers.value.push(player);
  }
  
  // 分配座位
  assignSeatToPlayer(player);
  
  showToast(`${player.username} 进入了房间`);
};

// 玩家离开房间
const handlePlayerLeave = (playerId) => {
  // 从房间玩家列表移除
  roomPlayers.value = roomPlayers.value.filter(player => player.id !== playerId);
  
  // 清空对应座位
  const seat = playerSeats.find(seat => seat.player && seat.player.id === playerId);
  if (seat) {
    const playerName = seat.player.username;
    seat.player = null;
    seat.isActive = false;
    seat.isCurrentPlayer = false;
    seat.isDealer = false;
    seat.isSmallBlind = false;
    seat.isBigBlind = false;
    seat.isEmpty = true;
    
    showToast(`${playerName} 离开了房间`);
  }
};

// 给玩家分配座位
const assignSeatToPlayer = (player) => {
  // 检查玩家是否已有座位
  const existingSeat = playerSeats.find(seat => seat.player && seat.player.id === player.id);
  if (existingSeat) {
    // 更新现有座位信息
    existingSeat.player = player;
    existingSeat.isActive = player.status === PLAYER_STATUS.IN_GAME || player.status === PLAYER_STATUS.READY;
    existingSeat.isEmpty = false;
    return;
  }
  
  // 寻找空座位（跳过中心位置）
  const emptySeat = playerSeats.find(seat => seat.isEmpty && seat.position !== 'center');
  if (emptySeat) {
    emptySeat.player = player;
    emptySeat.isActive = player.status === PLAYER_STATUS.IN_GAME || player.status === PLAYER_STATUS.READY;
    emptySeat.isEmpty = false;
  }
};

// 更新玩家状态
const updatePlayerStatus = (playerId, status) => {
  // 更新房间玩家列表中的状态
  const player = roomPlayers.value.find(p => p.id === playerId);
  if (player) {
    player.status = status;
  }
  
  // 更新座位上的玩家状态
  const seat = playerSeats.find(seat => seat.player && seat.player.id === playerId);
  if (seat) {
    seat.isActive = status === PLAYER_STATUS.IN_GAME || status === PLAYER_STATUS.READY;
    seat.player.status = status;
  }
};

// 切换玩家准备状态
const togglePlayerReady = async () => {
  try {
    await gameApi.toggleReady(gameId, userId);
    // 本地状态会通过WebSocket更新
  } catch (error) {
    console.error('切换准备状态失败:', error);
    showToast('切换准备状态失败');
  }
};

// 当前玩家手牌
const playerCards = reactive([
  { suit: 'S', value: 'A' },
  { suit: 'H', value: 'A' }
]);

// AI分析结果
const aiAnalysis = reactive({
  enabled: true,
  realTime: true,
  show: false,
  loading: false,
  handCombination: '一对A',
  handStrength: '极强',
  winProbability: 95,
  potOdds: '1:2',
  equity: '85%',
  impliedOdds: null,
  recommendedAction: '加注',
  explanation: '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。',
  adviceStrength: 3,
  opponentAnalysis: null
});

// 聊天功能
const chatStore = useChatStore();
const activeTab = ref(0);

// 下注相关
const betAmount = ref(0);

// 当前玩家在当前回合的已下注金额
const currentPlayerBet = ref(0);

// 计算属性
const minBet = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return 0;
  
  // 翻牌前的最小下注是大盲注
  if (gameState.currentRound === GAME_ROUNDS.PREFLOP) {
    return gameState.bigBlind;
  }
  
  // 其他回合的最小下注取决于当前最高下注
  const currentBet = gameState.currentBet;
  const playerBet = currentPlayerBet.value;
  
  // 如果玩家已经下注了当前最高金额，最小下注是最小加注额
  if (playerBet >= currentBet) {
    return Math.max(gameState.bigBlind, currentBet); // 最小加注额是当前最高下注
  }
  
  // 否则，最小下注是跟注金额（需要补的差额）
  return currentBet - playerBet;
});

const maxBet = computed(() => currentUser?.stack || 1000);

// 最小加注金额
const minRaiseAmount = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return 0;
  
  // 最小加注额是当前最高下注或大盲注，取较大值
  return Math.max(gameState.bigBlind, gameState.currentBet);
});

// 是否可以过牌
const canCheck = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return false;
  // 只有当没有未跟注的下注时才能过牌
  return gameState.currentBet === 0 || currentPlayerBet.value >= gameState.currentBet;
});

// 是否可以过牌或跟注
const canCheckOrCall = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return false;
  // 如果可以过牌，或者有足够的筹码跟注
  return canCheck.value || (maxBet.value >= minBet.value);
});

// 是否可以加注
const canRaise = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return false;
  
  // 检查是否有足够的筹码进行最小加注
  const requiredRaise = gameState.currentBet + minRaiseAmount.value;
  const playerAvailableStack = maxBet.value;
  
  // 如果玩家已经下注了当前最高金额，可以加注
  if (currentPlayerBet.value >= gameState.currentBet) {
    return playerAvailableStack >= minRaiseAmount.value;
  }
  
  // 否则，需要计算跟注后再加注的金额
  const callAmount = gameState.currentBet - currentPlayerBet.value;
  const raiseAmount = minRaiseAmount.value;
  
  return (callAmount + raiseAmount) <= playerAvailableStack;
});

// 计算当前需要跟注的金额
const callAmount = computed(() => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) return 0;
  return Math.max(0, gameState.currentBet - currentPlayerBet.value);
});

// 获取扑克牌花色符号
const getSuitSymbol = (suit) => {
  const symbols = {
    'S': '♠',
    'H': '♥',
    'D': '♦',
    'C': '♣'
  };
  return symbols[suit] || suit;
};

// 下注金额变化处理
const onBetChange = (value) => {
  // 确保下注金额在有效范围内
  betAmount.value = Math.min(Math.max(value, minBet.value), maxBet.value);
};

// 设置下注金额
const setBetAmount = (amount) => {
  // 如果是过牌操作，不需要设置下注金额
  if (canCheck.value && amount === 0) {
    betAmount.value = 0;
    return;
  }
  
  // 确保下注金额在有效范围内
  betAmount.value = Math.min(Math.max(amount, minBet.value), maxBet.value);
};

// 获取当前玩家的座位信息
const getCurrentPlayerSeat = () => {
  return playerSeats.find(seat => seat.player && seat.player.id === currentUserId.value);
};

// 处理游戏回合转换
const handleRoundTransition = (newRound) => {
  switch (newRound) {
    case GAME_ROUNDS.PREFLOP:
      gameState.currentRoundText = '翻牌前';
      // 翻牌前没有公共牌
      gameState.communityCards.forEach(card => card.revealed = false);
      break;
    case GAME_ROUNDS.FLOP:
      gameState.currentRoundText = '翻牌';
      // 翻牌阶段翻开前3张公共牌
      gameState.communityCards.slice(0, 3).forEach(card => card.revealed = true);
      break;
    case GAME_ROUNDS.TURN:
      gameState.currentRoundText = '转牌';
      // 转牌阶段翻开第4张公共牌
      gameState.communityCards[3].revealed = true;
      break;
    case GAME_ROUNDS.RIVER:
      gameState.currentRoundText = '河牌';
      // 河牌阶段翻开第5张公共牌
      gameState.communityCards[4].revealed = true;
      break;
    case GAME_ROUNDS.SHOWDOWN:
      gameState.currentRoundText = '摊牌';
      // 摊牌阶段显示所有公共牌
      gameState.communityCards.forEach(card => card.revealed = true);
      break;
    default:
      gameState.currentRoundText = '未知';
  }
  
  // 重置当前回合的下注状态
  gameState.currentBet = 0;
  gameState.hasRaised = false;
  
  // 重置下注金额
  betAmount.value = 0;
};

// 开始游戏
const startGame = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.startGame(gameId);
    showToast('游戏开始');
  } catch (error) {
    console.error('开始游戏失败:', error);
    showToast('开始游戏失败');
  }
};

// 重新开始游戏
const restartGame = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.restartGame(gameId);
    // 重置本地状态
    gameState.status = GAME_STATUS.IN_PROGRESS;
    gameState.currentRound = GAME_ROUNDS.PREFLOP;
    gameState.currentRoundText = '翻牌前';
    gameState.pot = 0;
    gameState.totalBet = 0;
    
    // 重置公共牌
    gameState.communityCards = [
      { suit: 'S', value: 'A', revealed: false },
      { suit: 'H', value: 'K', revealed: false },
      { suit: 'D', value: 'Q', revealed: false },
      { suit: 'C', value: 'J', revealed: false },
      { suit: 'S', value: '10', revealed: false }
    ];
    
    // 重置手牌
    playerCards[0] = { suit: 'S', value: 'A' };
    playerCards[1] = { suit: 'H', value: 'A' };
    
    // 重置下注
    betAmount.value = 0;
    currentPlayerBet.value = 0;
    
    showToast('游戏已重置');
  } catch (error) {
    console.error('重新开始游戏失败:', error);
    showToast('重新开始游戏失败');
  }
};

// 游戏结束处理
const handleGameEnd = (gameResult) => {
  // 更新游戏状态
  gameState.status = GAME_STATUS.FINISHED;
  gameState.statusText = '游戏结束';
  
  // 显示获胜者信息
  if (gameResult && gameResult.winners) {
    const winnerNames = gameResult.winners.map(winner => winner.name).join(', ');
    const winnerMessage = `游戏结束！获胜者：${winnerNames}`;
    showToast(winnerMessage, { duration: 5000 });
  }
  
  // 显示最终的公共牌和获胜牌型
  if (gameResult && gameResult.showdown) {
    console.log('摊牌结果:', gameResult.showdown);
    // 这里可以根据需要添加更多的摊牌结果展示逻辑
  }
};

// 弃牌
const fold = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, 'fold');
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error('弃牌失败:', error);
    showToast('弃牌失败');
  }
};

// 过牌或跟注
const checkOrCall = async () => {
  const action = canCheck.value ? 'check' : 'call';
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, action);
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error(action + '失败:', error);
    showToast(action + '失败');
  }
};

// 过牌
const check = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, 'check');
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error('过牌失败:', error);
    showToast('过牌失败');
  }
};

// 跟注
const call = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, 'call');
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error('跟注失败:', error);
    showToast('跟注失败');
  }
};

// 全下
const allIn = async () => {
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, 'all_in');
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error('全下失败:', error);
    showToast('全下失败');
  }
};

// 加注
const raise = async (amount) => {
  const raiseAmount = amount || betAmount.value;
  if (raiseAmount <= minBet.value) {
    showToast('加注金额必须大于跟注金额');
    return;
  }
  
  try {
    if (!socketService.isConnected) {
      showToast('网络连接断开，无法操作');
      return;
    }
    await gameApi.playerAction(gameId, 'raise', raiseAmount);
    // 这里会通过WebSocket接收游戏状态更新
  } catch (error) {
    console.error('加注失败:', error);
    showToast('加注失败');
  }
};

// 发送聊天消息
const sendChatMessage = async () => {
  if (!chatStore.inputMessage.trim()) return;
  
  try {
    let message;
    // 根据当前聊天类型发送不同的消息
    if (chatStore.chatType === 'room') {
      // 发送房间消息
      message = chatStore.sendRoomMessage(
        chatStore.inputMessage.trim(),
        currentUserId.value,
        currentUser.value.username
      );
      
      // 通过WebSocket发送到服务器
      socketService.send('chat_message', {
        message: message.content,
        roomId: gameId,
        userId: currentUserId.value,
        username: currentUser.value.username
      });
    } else {
      // 发送私聊消息
      message = chatStore.sendPrivateMessage(
        chatStore.inputMessage.trim(),
        currentUserId.value,
        currentUser.value.username,
        chatStore.privateChatUserId
      );
      
      // 通过WebSocket发送到服务器
      socketService.send('chat_message', {
        message: message.content,
        roomId: gameId,
        isPrivate: true,
        recipientId: chatStore.privateChatUserId,
        userId: currentUserId.value,
        username: currentUser.value.username
      });
    }
    
    // 清空输入框
    chatStore.clearInputMessage();
  } catch (error) {
    console.error('发送消息失败:', error);
    showToast('发送消息失败');
  }
}

// 开始私聊
const startPrivateChat = (userId, username) => {
  chatStore.setChatType('private', userId);
  // 可以显示一个提示或切换到聊天标签
  showToast(`开始与${username}私聊`);
  activeTab.value = 1; // 切换到聊天标签
};

// 切换AI辅助
const toggleAiAssist = () => {
  if (aiAnalysis.enabled && aiAnalysis.realTime) {
    requestAiAnalysis();
  } else {
    aiAnalysis.show = false;
  }
};

// 请求AI分析
const requestAiAnalysis = async () => {
  if (!aiAnalysis.enabled) return;
  
  aiAnalysis.loading = true;
  try {
    // 调用API获取AI分析结果
    const response = await gameApi.requestAiAnalysis(gameId, playerCards, gameState.communityCards);
    
    // 更新分析结果
    if (response && response.analysis) {
      Object.assign(aiAnalysis, {
        show: true,
        handCombination: response.analysis.handCombination,
        handStrength: response.analysis.handStrength,
        winProbability: response.analysis.winProbability,
        recommendedAction: response.analysis.recommendedAction,
        explanation: response.analysis.explanation,
        potOdds: response.analysis.potOdds || null,
        equity: response.analysis.equity || null
      });
      
      // 如果游戏中有其他玩家，分析对手行为
      if (gameState.players && gameState.players.length > 1) {
        analyzeOpponents();
      }
      
      // 计算赔率
      calculateOdds();
    } else {
      // 默认分析结果（当API不可用时）
      aiAnalysis.show = true;
      aiAnalysis.handCombination = '一对A';
      aiAnalysis.handStrength = '极强';
      aiAnalysis.winProbability = 95;
      aiAnalysis.potOdds = '1:2';
      aiAnalysis.equity = '85%';
      aiAnalysis.impliedOdds = '1:3';
      aiAnalysis.recommendedAction = '加注';
      aiAnalysis.explanation = '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。';
      aiAnalysis.opponentAnalysis = {
        opponentName: '对手玩家',
        playingStyle: '保守',
        aggressionLevel: '低',
        recentActions: ['跟注', '弃牌', '跟注']
      };
    }
  } catch (error) {
    console.error('AI分析请求失败:', error);
    showToast('AI分析请求失败');
    
    // 失败时显示默认分析结果
    aiAnalysis.show = true;
    aiAnalysis.handCombination = '一对A';
    aiAnalysis.handStrength = '极强';
    aiAnalysis.winProbability = 95;
    aiAnalysis.potOdds = '1:2';
    aiAnalysis.equity = '85%';
    aiAnalysis.impliedOdds = '1:3';
    aiAnalysis.recommendedAction = '加注';
    aiAnalysis.explanation = '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。';
    aiAnalysis.opponentAnalysis = {
      opponentName: '对手玩家',
      playingStyle: '保守',
      aggressionLevel: '低',
      recentActions: ['跟注', '弃牌', '跟注']
    };
  } finally {
    aiAnalysis.loading = false;
  }
};

// 对手行为分析
const analyzeOpponents = async () => {
  try {
    // 这里可以根据游戏需要分析所有对手或特定对手
    const currentOpponents = gameState.players.filter(p => p.id !== currentUserId.value);
    if (currentOpponents.length > 0) {
      // 分析第一个对手（示例）
      const opponent = currentOpponents[0];
      const response = await aiApi.analyzeOpponent(gameId, opponent.id);
      
      if (response && response.analysis) {
        aiAnalysis.opponentAnalysis = {
          opponentName: opponent.username,
          playingStyle: response.analysis.playingStyle,
          aggressionLevel: response.analysis.aggressionLevel,
          recentActions: response.analysis.recentActions
        };
      }
    }
  } catch (error) {
    console.error('对手分析请求失败:', error);
    // 对手分析失败不影响主分析结果
  }
};

// 计算赔率
const calculateOdds = async () => {
  if (!aiAnalysis.enabled) return;
  
  try {
    const response = await aiApi.calculateOdds(gameId, playerCards, gameState.communityCards);
    
    if (response && response.odds) {
      aiAnalysis.potOdds = response.odds.potOdds;
      aiAnalysis.equity = response.odds.equity;
      aiAnalysis.impliedOdds = response.odds.impliedOdds;
    }
  } catch (error) {
    console.error('赔率计算请求失败:', error);
  }
};

// 更新玩家座位
const updatePlayerSeats = (players) => {
  // 先标记所有座位为空
  playerSeats.forEach(seat => {
    seat.isEmpty = true;
  });
  
  // 根据后端返回的玩家数据更新座位
  players.forEach((player) => {
    // 查找玩家当前的座位
    let seat = playerSeats.find(s => s.player && s.player.id === player.id);
    
    // 如果玩家没有座位，分配一个空座位
    if (!seat) {
      seat = playerSeats.find(s => s.isEmpty && s.position !== 'center');
    }
    
    if (seat) {
      seat.player = player;
      seat.isActive = player.status === PLAYER_STATUS.IN_GAME || player.status === PLAYER_STATUS.READY;
      seat.isCurrentPlayer = player.isCurrentPlayer;
      seat.isDealer = player.isDealer;
      seat.isSmallBlind = player.isSmallBlind;
      seat.isBigBlind = player.isBigBlind;
      seat.isEmpty = false;
      
      // 如果是当前玩家，更新其下注金额
      if (player.id === currentUserId.value) {
        currentPlayerBet.value = player.bet || 0;
      }
      
      // 更新房间玩家列表
      const existingPlayer = roomPlayers.value.find(p => p.id === player.id);
      if (existingPlayer) {
        Object.assign(existingPlayer, player);
      } else {
        roomPlayers.value.push({...player});
      }
    }
  });
  
  // 清理没有玩家的座位
  playerSeats.forEach(seat => {
    if (seat.player && !players.find(p => p.id === seat.player.id)) {
      seat.player = null;
      seat.isActive = false;
      seat.isCurrentPlayer = false;
      seat.isDealer = false;
      seat.isSmallBlind = false;
      seat.isBigBlind = false;
      seat.isEmpty = true;
    }
  });
  
  // 清理房间玩家列表
  roomPlayers.value = roomPlayers.value.filter(p => 
    players.find(player => player.id === p.id)
  );
};

// 初始化游戏
const initGame = async () => {
  try {
    const response = await gameApi.getGameState(gameId);
    if (response && response.data) {
      // 更新游戏状态
      Object.assign(gameState, response.data);
      
      // 更新玩家座位
      if (response.data.players) {
        updatePlayerSeats(response.data.players);
      }
      
      // 如果有当前玩家手牌信息，更新手牌
      if (response.data.playerCards) {
        Object.assign(playerCards, response.data.playerCards);
      }
      
      // 设置当前玩家的下注金额
      const currentPlayerSeat = getCurrentPlayerSeat();
      if (currentPlayerSeat && currentPlayerSeat.player) {
        currentPlayerBet.value = currentPlayerSeat.player.bet || 0;
      }
      
      // 如果AI辅助启用且实时分析开启，请求AI分析
      if (aiAnalysis.enabled && aiAnalysis.realTime) {
        requestAiAnalysis();
      }
    }
  } catch (error) {
    console.error('初始化游戏失败:', error);
    // 游戏可能还未开始，不跳回房间详情页，继续留在游戏页面
    showToast('游戏还未开始，等待中...');
    gameState.status = GAME_STATUS.WAITING;
  }
};

// 监听游戏状态变化
const listenGameUpdates = () => {
  // 连接WebSocket
  socketService.connect(currentUserId.value);
  
  // 加入游戏房间
  socketService.joinRoom(gameId);
  
  // 监听游戏状态更新
  socketService.on('game_state_update', (data) => {
    console.log('收到游戏状态更新:', data);
    
    // 保存旧的回合和状态信息
    const oldRound = gameState.currentRound;
    const oldStatus = gameState.status;
    
    // 根据后端发送的游戏状态直接更新
    Object.assign(gameState, data);
    
    // 检查是否发生了回合转换
    if (oldRound !== gameState.currentRound) {
      handleRoundTransition(gameState.currentRound);
    }
    
    // 根据游戏状态设置不同的状态文本
    switch (gameState.status) {
      case GAME_STATUS.WAITING:
        gameState.statusText = '等待开始';
        break;
      case GAME_STATUS.STARTING:
        gameState.statusText = '游戏开始';
        break;
      case GAME_STATUS.IN_PROGRESS:
        gameState.statusText = '游戏进行中';
        break;
      case GAME_STATUS.FINISHED:
        gameState.statusText = '游戏结束';
        break;
      default:
        gameState.statusText = '未知状态';
    }
    
    // 如果有玩家座位信息，更新玩家座位
    if (data.players) {
      updatePlayerSeats(data.players);
    }
    
    // 如果有当前玩家手牌信息，更新手牌
    if (data.playerCards) {
      Object.assign(playerCards, data.playerCards);
    }
    
    // 如果游戏结束，处理游戏结束逻辑
    if (gameState.status === GAME_STATUS.FINISHED && oldStatus === GAME_STATUS.IN_PROGRESS) {
      // 构建gameResult对象以适配handleGameEnd函数
      const gameResult = {
        winners: gameState.winner ? [gameState.winner] : [],
        showdown: data.showdown
      };
      handleGameEnd(gameResult);
    }
  });
  
  // 监听API错误
  socketService.on('api_error', (error) => {
    console.error('API错误:', error);
    showToast(`操作失败: ${error.message || '未知错误'}`, 'fail');
  });
  
  // 监听其他玩家加入
  socketService.on('player_joined', (data) => {
    console.log('玩家加入:', data);
    showToast(`${data.username || '玩家'} 加入了游戏`);
  });
  
  // 监听其他玩家离开
  socketService.on('player_left', (data) => {
    console.log('玩家离开:', data);
    showToast(`${data.username || '玩家'} 离开了游戏`);
  });
  
  // 监听聊天消息
  socketService.on('chat_message', (data) => {
    console.log('收到聊天消息:', data);
    chatStore.addMessage({
      type: data.isPrivate ? 'private' : 'room',
      content: data.message,
      senderId: data.userId,
      senderName: data.username || '玩家',
      receiverId: data.recipientId,
      timestamp: data.timestamp
    });
  });
  
  // 监听聊天历史
  socketService.on('chat_history', (data) => {
    console.log('收到聊天历史:', data);
    // 清空现有消息
    chatStore.clearMessages();
    // 添加历史消息
    data.forEach(message => {
      chatStore.addMessage({
        type: message.isPrivate ? 'private' : 'room',
        content: message.message,
        senderId: message.userId,
        senderName: message.username || '玩家',
        receiverId: message.recipientId,
        timestamp: message.timestamp
      });
    });
  });
  
  // 监听游戏动作
  socketService.on('game_action', (data) => {
    console.log('收到游戏动作:', data);
    // 可以在这里添加游戏动作的视觉反馈
  });
  
  // 监听连接错误
  socketService.on('error', (data) => {
    console.error('WebSocket错误:', data);
    showToast(`WebSocket错误: ${data.message || '未知错误'}`);
  });
  
  // 监听连接状态变化
  const checkConnectionStatus = () => {
    if (!socketService.isConnected && !reconnecting.value) {
      reconnecting.value = true;
      connectionError.value = '连接已断开，正在尝试重连...';
    } else if (socketService.isConnected && reconnecting.value) {
      reconnecting.value = false;
      connectionError.value = null;
      showToast('已重新连接到游戏服务器');
      // 重新加入房间
      socketService.joinRoom(gameId);
    }
  };
  
  // 使用watch监听连接状态变化
  const unwatchConnection = watch(
    () => socketService.isConnected,
    () => {
      checkConnectionStatus();
    }
  );
  
  // 返回清理函数
  return () => {
    // 停止监听连接状态
    unwatchConnection();
    // 移除所有注册的事件监听器
    socketService.off('game_state_update');
    socketService.off('api_error');
    socketService.off('player_joined');
    socketService.off('player_left');
    socketService.off('chat_message');
    socketService.off('chat_history');
    socketService.off('game_action');
    socketService.off('error');
  };
};

// 监听实时分析开关变化
watch(
  () => aiAnalysis.realTime,
  (newValue) => {
    if (newValue && aiAnalysis.enabled) {
      requestAiAnalysis();
    }
  }
);

// 监听公共牌变化
watch(
  () => gameState.communityCards,
  (newValue, oldValue) => {
    // 检查是否有牌被翻开
    const hasNewCardRevealed = newValue.some((card, index) => 
      card.revealed && (!oldValue[index] || !oldValue[index].revealed)
    );
    
    if (hasNewCardRevealed && aiAnalysis.enabled && aiAnalysis.realTime) {
      requestAiAnalysis();
    }
  },
  { deep: true }
);

// 组件挂载
onMounted(() => {
  initGame();
  // 保存清理函数以便在组件卸载时调用
  cleanupFunction = listenGameUpdates();
});

// 组件卸载前断开WebSocket连接
onBeforeUnmount(() => {
  // 调用清理函数，清除定时器
  if (cleanupFunction) {
    cleanupFunction();
  }
  // 离开游戏房间
  socketService.leaveRoom(gameId);
  // 断开WebSocket连接
  socketService.disconnect();
});
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f3413 0%, #1a5319 50%, #0f3413 100%);
  color: white;
  display: flex;
  flex-direction: column;
  background-size: 100% 100%;
  background-attachment: fixed;
}

/* 顶部状态栏 */
.top-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.3);
}

.game-status {
  display: flex;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.status-item .label {
  margin-right: 5px;
  opacity: 0.8;
}

.status-item .value {
  font-weight: 500;
}

.pot-info {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.pot-info .label {
  margin-right: 5px;
  opacity: 0.8;
}

.pot-info .value {
  font-weight: bold;
  color: #ffd700;
}

/* 游戏桌区域 */
.game-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 20px 0;
  padding: 20px;
}

/* 玩家座位 */
.player-seats {
  position: relative;
  width: 350px;
  height: 350px;
  margin-bottom: 30px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%);
  border-radius: 50%;
  border: 4px solid #33691e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 
              inset 0 2px 10px rgba(255, 255, 255, 0.1),
              inset 0 0 50px rgba(56, 142, 60, 0.5);
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: 0 0, 15px 15px;
}

.player-seat {
  position: absolute;
  width: 110px;
  height: 85px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.player-seat:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.player-seat.player-folded {
  opacity: 0.5;
  background-color: rgba(238, 10, 36, 0.15);
  filter: grayscale(70%);
}

.player-seat.player-all-in {
  border-color: #ff5722;
  box-shadow: 0 0 15px rgba(255, 87, 34, 0.4);
  animation: pulseAllIn 2s infinite;
}

@keyframes pulseAllIn {
  0%, 100% { box-shadow: 0 0 15px rgba(255, 87, 34, 0.4); }
  50% { box-shadow: 0 0 25px rgba(255, 87, 34, 0.7); }
}

/* 空座位 */
.empty-seat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.empty-seat:hover {
  color: rgba(255, 255, 255, 0.9);
}

.empty-seat-icon {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  transition: transform 0.3s ease;
  width: 40px;
  height: 40px;
  border: 3px dashed rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-seat:hover .empty-seat-icon {
  transform: scale(1.2);
  border-color: rgba(255, 255, 255, 0.8);
}

.empty-seat-text {
  font-size: 12px;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  /* 玩家座位区域 */
  .player-seats {
    width: 250px;
    height: 250px;
  }
  
  /* 玩家座位 */
  .player-seat {
    width: 80px;
    height: 60px;
  }
  
  /* 座位位置调整 */
  .player-seat:nth-child(1) { top: -15px; left: 85px; }
  .player-seat:nth-child(2) { top: 15px; right: -15px; }
  .player-seat:nth-child(3) { bottom: 15px; right: -15px; }
  .player-seat:nth-child(4) { bottom: -15px; left: 85px; }
  .player-seat:nth-child(5) { bottom: 15px; left: -15px; }
  .player-seat:nth-child(6) { top: 15px; left: -15px; }
  
  /* 玩家信息 */
  .player-avatar img {
    width: 30px !important;
    height: 30px !important;
  }
  
  .player-name {
    font-size: 10px;
  }
  
  .player-stack, .player-bet {
    font-size: 9px;
  }
  
  /* 扑克牌 */
  .card {
    width: 40px;
    height: 56px;
  }
  
  .card-content {
    font-size: 14px;
  }
  
  .card-suit {
    font-size: 20px;
  }
  
  /* AI分析结果 */
  .ai-analysis-result {
    width: 160px;
    padding: 8px;
  }
  
  .analysis-content {
    font-size: 10px;
  }
  
  /* 游戏控制区域 */
  .game-controls {
    padding: 10px;
  }
  
  /* 操作按钮 */
  .action-buttons button {
    padding: 10px 0;
  }
  
  /* 聊天区域 */
  .chat-section {
    height: 180px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  /* 聊天类型切换 */
  .chat-type-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding: 0 5px;
  }
  
  /* 私聊按钮 */
  .private-chat-button {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    background-color: rgba(25, 137, 250, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.3s ease;
  }
  
  .private-chat-button:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  /* 消息头部 */
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
  }
  
  /* 消息时间 */
  .message-time {
    font-size: 10px;
    opacity: 0.7;
  }
  
  /* 私聊消息样式 */
  .private-message {
    background-color: rgba(25, 137, 250, 0.1);
    border-left: 3px solid #1989fa;
  }
  
  /* 消息类型指示器 */
  .message-type-indicator {
    font-size: 9px;
    color: #1989fa;
    margin-top: 2px;
  }
  
  /* 移动端适配 */
  @media (max-width: 480px) {
    .private-chat-button {
      width: 15px;
      height: 15px;
      font-size: 10px;
    }
  }
}

.player-seat.active {
  background-color: rgba(25, 137, 250, 0.45);
  border-color: rgba(25, 137, 250, 0.6);
  box-shadow: 0 0 15px rgba(25, 137, 250, 0.3);
}

.player-seat.current-player {
  background-color: rgba(7, 193, 96, 0.45);
  border: 2px solid #07c160;
  box-shadow: 0 0 20px rgba(7, 193, 96, 0.4);
  transform: scale(1.08) translateY(-8px);
  z-index: 10;
}

/* 座位位置（德州扑克圆形桌布局） */
.player-seat:nth-child(1) { top: -20px; left: 100px; }
.player-seat:nth-child(2) { top: 20px; right: -20px; }
.player-seat:nth-child(3) { bottom: 20px; right: -20px; }
.player-seat:nth-child(4) { bottom: -20px; left: 100px; }
.player-seat:nth-child(5) { bottom: 20px; left: -20px; }
.player-seat:nth-child(6) { top: 20px; left: -20px; }

.player-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.player-avatar {
  position: relative;
  margin-bottom: 6px;
  z-index: 2;
}

.player-status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.player-status-indicator.online {
  background-color: #4caf50;
  animation: pulseOnline 2s infinite;
}

.player-status-indicator.offline {
  background-color: #9e9e9e;
}

.player-status-indicator.ready {
  background-color: #2196f3;
}

.player-status-indicator.folded {
  background-color: #f44336;
}

.player-status-indicator.all-in {
  background-color: #ff5722;
  animation: pulseAllIn 2s infinite;
}

@keyframes pulseOnline {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
}

.player-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.player-stack {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2px;
}

.stack-value {
  font-weight: bold;
  color: #ffd700;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.stack-label {
  opacity: 0.8;
  font-size: 10px;
  color: #fff;
}

.player-bet {
  font-size: 12px;
  margin-top: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 193, 7, 0.4));
  border-radius: 18px;
  border: 1px solid rgba(255, 215, 0, 0.7);
  animation: pulseBet 1.5s infinite;
}

@keyframes pulseBet {
  0%, 100% { transform: scale(1); box-shadow: 0 2px 5px rgba(255, 215, 0, 0.2); }
  50% { transform: scale(1.08); box-shadow: 0 4px 10px rgba(255, 215, 0, 0.4); }
}

.bet-value {
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.bet-label {
  opacity: 0.8;
  font-size: 10px;
  color: #fff;
}

.dealer-badge, .blind-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 3;
  font-weight: bold;
}

.dealer-badge {
  top: -10px;
  left: -10px;
  width: 28px;
  height: 28px;
  background-color: #ffd700;
  color: black;
  animation: rotateBadge 3s linear infinite;
}

@keyframes rotateBadge {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.blind-badge {
  top: -10px;
  right: -10px;
  width: 26px;
  height: 26px;
  font-size: 12px;
  color: white;
}

.blind-badge.small {
  background-color: #2196f3;
}

.blind-badge.big {
  background-color: #f44336;
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 12px;
}

/* 公共牌区域 */
.community-cards {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.card {
  width: 50px;
  height: 70px;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
}

.card.hidden {
  background-color: #8b4513;
  background-image: linear-gradient(45deg, #a0522d 25%, transparent 25%, transparent 75%, #a0522d 75%, #a0522d),
                    linear-gradient(-45deg, #a0522d 25%, transparent 25%, transparent 75%, #a0522d 75%, #a0522d);
  background-size: 20px 20px;
}

.card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.card-suit {
  font-size: 24px;
  margin-bottom: 5px;
}

.card-suit.spades {
  color: black;
}

.card-suit.hearts {
  color: #ee0a24;
}

.card-suit.diamonds {
  color: #ee0a24;
}

.card-suit.clubs {
  color: black;
}

/* 底池显示 */
.pot-display {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.pot-display::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pot-label {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 1;
}

.pot-amount {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5),
               0 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* 游戏结果展示区域 */
.game-result {
  margin: 20px auto;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  border: 2px solid #ffd700;
  width: 80%;
  max-width: 600px;
}

.game-result .result-header {
  text-align: center;
  margin-bottom: 15px;
}

.game-result .result-header h3 {
  color: #ffd700;
  font-size: 24px;
  margin: 0;
}

.game-result .result-content {
  text-align: center;
}

.game-result .winner-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.game-result .winner-label {
  font-size: 16px;
  color: #ccc;
}

.game-result .winner-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 5px 0;
}

.game-result .winner-prize {
  font-size: 18px;
  color: #4caf50;
}

.game-result .showdown-info {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.game-result .showdown-title {
  font-size: 16px;
  color: #ccc;
  margin-bottom: 10px;
}

.game-result .player-showdown {
  margin: 10px 0;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.game-result .player-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.game-result .player-hand {
  font-size: 14px;
  color: #ddd;
}

.game-result .player-rank {
  font-size: 14px;
  color: #4caf50;
}

/* 当前玩家手牌 */
.player-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.cards-title {
  font-size: 14px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.cards-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.player-card {
  width: 60px;
  height: 84px;
}

/* AI分析结果 */
.ai-analysis-result {
  background-color: rgba(25, 137, 250, 0.2);
  padding: 10px;
  border-radius: 8px;
  width: 200px;
  text-align: center;
}

.analysis-title {
  font-size: 12px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.analysis-content {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.analysis-content .label {
  opacity: 0.8;
  margin-right: 5px;
}

.analysis-content .value {
  font-weight: 500;
}

/* 游戏控制区域 */
.game-controls {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* 响应式游戏控制区域 */
@media (max-width: 480px) {
  .game-controls {
    padding: 10px;
  }
}

/* 下注控制 */
.bet-controls {
  margin-bottom: 15px;
}

.bet-slider {
  margin-bottom: 10px;
}

.bet-amount-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}

.bet-amount-display .label {
  margin-right: 5px;
  opacity: 0.8;
}

.bet-amount-display .value {
  font-weight: bold;
  color: #ffd700;
}

.bet-quick-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.bet-quick-buttons button {
  border-radius: 20px !important;
  font-weight: 500 !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9)) !important;
  color: #000 !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.bet-quick-buttons button:active {
  transform: scale(0.95);
}

/* 响应式下注控制 */
@media (max-width: 480px) {
  .bet-controls {
    margin-bottom: 10px;
  }
  
  .bet-amount-display {
    font-size: 14px;
  }
  
  .bet-quick-buttons {
    gap: 5px;
    flex-wrap: wrap;
  }
  
  .bet-info {
    font-size: 12px;
  }
  
  .info-item {
    margin-bottom: 5px;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.action-buttons button {
  border-radius: 20px !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.action-buttons button:active {
  transform: scale(0.98);
}

/* 底部功能栏 */
.bottom-bar {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

/* 聊天区域 */
.chat-section {
  height: 200px;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin: 10px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-message {
  margin-bottom: 10px;
}

.chat-message.own-message .message-content {
  text-align: right;
}

.message-content {
  max-width: 70%;
}

.own-message .message-content {
  margin-left: auto;
}

.message-sender {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2px;
  font-weight: 500;
}

.message-text {
  background-color: rgba(255, 255, 255, 0.9);
  color: #000;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.own-message .message-text {
  background-color: #4caf50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-input {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.4);
}

/* AI辅助区域 */
.ai-assist-section {
  padding: 10px;
}

.ai-controls {
  margin-bottom: 15px;
}

.analysis-card {
  background-color: rgba(255, 255, 255, 0.95);
  color: #000;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 14px;
  color: #000;
  font-weight: 600;
  font-weight: 500;
  margin-bottom: 10px;
  color: #323233;
}

.card-content {
  font-size: 12px;
  color: #646566;
}

.analysis-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.item-label {
  width: 80px;
  opacity: 0.8;
}

.item-value {
  flex: 1;
  font-weight: 500;
  color: #323233;
}

.analysis-explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebedf0;
}

.explanation-label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #323233;
}

.explanation-text {
  font-size: 11px;
  line-height: 1.4;
  color: #646566;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .game-status {
    gap: 10px;
  }
  
  .status-item {
    font-size: 12px;
  }
  
  .player-seats {
    width: 250px;
    height: 250px;
  }
  
  .player-seat {
    width: 80px;
    height: 60px;
  }
  
  .player-name {
    font-size: 10px;
  }
  
  .player-stack {
    font-size: 10px;
  }
  
  .card {
    width: 45px;
    height: 63px;
  }
  
  .player-card {
    width: 55px;
    height: 77px;
  }
}
</style>