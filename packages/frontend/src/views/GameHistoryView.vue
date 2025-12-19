<template>
  <div class="game-history">
    <!-- 页面标题 -->
    <van-nav-bar
      title="游戏历史"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="history-container">
      <!-- 历史记录列表 -->
      <div class="history-list">
        <div class="history-item" v-for="game in gameHistory" :key="game.id">
          <div class="game-info">
            <div class="game-title">
              <span class="game-id">房间: {{ game.roomId }}</span>
              <span class="game-date">{{ formatDate(game.endTime) }}</span>
            </div>
            <div class="game-details">
              <div class="detail-item">
                <span class="detail-label">玩家数:</span>
                <span class="detail-value">{{ game.players.length }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">底池:</span>
                <span class="detail-value">{{ game.totalPot }} 筹码</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">我的盈利:</span>
                <span class="detail-value" :class="{ 'win': game.profit > 0, 'lose': game.profit < 0 }">
                  {{ game.profit > 0 ? '+' : '' }}{{ game.profit }} 筹码
                </span>
              </div>
            </div>
          </div>
          <div class="game-result" :class="{ 'win': game.isWinner, 'lose': !game.isWinner }">
            {{ game.isWinner ? '胜利' : '失败' }}
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <van-loading v-if="loading" class="loading" size="40px" />

      <!-- 空状态 -->
      <div v-else-if="gameHistory.length === 0" class="empty-state">
        <van-empty description="暂无游戏历史记录" />
      </div>

      <!-- 错误信息 -->
      <div v-else-if="error" class="error-state">
        <van-empty description="获取游戏历史失败" />
        <van-button type="primary" size="small" @click="loadGameHistory">重试</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import gameApi from '../api/game';
import { showToast } from 'vant';
import { logger } from '../utils/logger';

// 路由实例
const router = useRouter();
// 用户状态管理
const userStore = useUserStore();

// 游戏历史记录
const gameHistory = ref([]);
// 加载状态
const loading = ref(true);
// 错误信息
const error = ref(null);

// 返回按钮点击事件
const onClickLeft = () => {
  router.back();
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 加载游戏历史记录
const loadGameHistory = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    logger.info('正在加载游戏历史记录');
    const response = await gameApi.getGameHistory();
    
    if (response && response.history) {
      gameHistory.value = response.history;
    }
  } catch (err) {
    logger.error('加载游戏历史记录失败:', err);
    error.value = err;
    showToast('加载游戏历史记录失败');
  } finally {
    loading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadGameHistory();
});
</script>

<style scoped>
.game-history {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.history-container {
  padding: 15px;
}

.history-list {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.game-info {
  flex: 1;
}

.game-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.game-id {
  font-weight: bold;
  font-size: 16px;
}

.game-date {
  font-size: 12px;
  color: #999;
}

.game-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #666;
  margin-right: 5px;
}

.detail-value {
  font-weight: bold;
}

.detail-value.win {
  color: #52c41a;
}

.detail-value.lose {
  color: #ff4d4f;
}

.game-result {
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.game-result.win {
  background-color: #e6f7ff;
  color: #1890ff;
}

.game-result.lose {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-state,
.error-state {
  padding: 40px 0;
  text-align: center;
}

.error-state .van-button {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .history-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .game-result {
    margin-top: 10px;
  }
  
  .game-details {
    flex-direction: column;
    gap: 5px;
  }
}
</style>