<template>
  <div class="home">
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      title="德州扑克" 
      :right-text="userStore.userInfo?.username || '未登录'"
      @click-right="handleUserClick"
    />

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-title">欢迎回来，{{ userStore.userInfo?.username || '牌手' }}！</div>
        <div class="welcome-subtitle">开始你的德州扑克之旅</div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <div class="action-card" @click="handleCreateRoom">
        <div class="action-icon create-icon">+</div>
        <div class="action-title">创建房间</div>
        <div class="action-desc">自定义游戏规则</div>
      </div>
      <div class="action-card" @click="handleJoinRoom">
        <div class="action-icon join-icon">👥</div>
        <div class="action-title">加入房间</div>
        <div class="action-desc">快速加入游戏</div>
      </div>
      <div class="action-card" @click="handleQuickStart">
        <div class="action-icon quick-icon">⚡</div>
        <div class="action-title">快速开始</div>
        <div class="action-desc">自动匹配对手</div>
      </div>
      <div class="action-card" @click="handleViewStats">
        <div class="action-icon stats-icon">📊</div>
        <div class="action-title">游戏统计</div>
        <div class="action-desc">查看历史战绩</div>
      </div>
    </div>

    <!-- 游戏信息区域 -->
    <div class="game-info">
      <div class="info-section">
        <div class="info-title">游戏规则</div>
        <div class="info-content">
          <div class="rule-item">
            <div class="rule-icon">🎯</div>
            <div class="rule-text">德州扑克基础规则</div>
          </div>
          <div class="rule-item">
            <div class="rule-icon">💰</div>
            <div class="rule-text">盲注和底池管理</div>
          </div>
          <div class="rule-item">
            <div class="rule-icon">🃏</div>
            <div class="rule-text">牌型大小比较</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">在线玩家</div>
        <div class="online-players">
          <div class="player-item" v-for="i in 10" :key="i">
            <van-image
              round
              :src="'https://img.yzcdn.cn/vant/cat.jpeg'"
              width="40px"
              height="40px"
            />
          </div>
          <div class="more-players">+{{ onlineCount }}</div>
        </div>
        <div class="online-count">{{ onlineCount }} 位玩家正在游戏</div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item" @click="handleHome">
        <div class="nav-icon">🏠</div>
        <div class="nav-text">首页</div>
      </div>
      <div class="nav-item" @click="handleRooms">
        <div class="nav-icon">🏢</div>
        <div class="nav-text">房间</div>
      </div>
      <div class="nav-item" @click="handleChat">
        <div class="nav-icon">💬</div>
        <div class="nav-text">聊天</div>
      </div>
      <div class="nav-item" @click="handleProfile">
        <div class="nav-icon">👤</div>
        <div class="nav-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { showToast } from 'vant';
import { logger } from '../utils/logger';

// 路由实例
const router = useRouter();
// 用户状态管理
const userStore = useUserStore();

// 在线玩家数量
const onlineCount = ref(0);

// 页面挂载时获取数据
onMounted(() => {
  logger.info('HomeView组件已挂载');
  // 模拟获取在线玩家数量
  setTimeout(() => {
    onlineCount.value = Math.floor(Math.random() * 100) + 50;
  }, 500);
});

// 处理用户点击
const handleUserClick = () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    router.push('/profile');
  } else {
    router.push('/login');
  }
};

// 创建房间
const handleCreateRoom = () => {
  router.push('/create-room');
};

// 加入房间
const handleJoinRoom = () => {
  router.push('/rooms');
};

// 快速开始
const handleQuickStart = () => {
  showToast('快速开始功能开发中');
  // 后续可以实现自动匹配房间的功能
};

// 查看统计
const handleViewStats = () => {
  router.push('/game-history');
};

// 首页
const handleHome = () => {
  router.push('/');
};

// 房间列表
const handleRooms = () => {
  router.push('/rooms');
};

// 聊天
const handleChat = () => {
  showToast('聊天功能开发中');
  // 后续可以实现全局聊天功能
};

// 个人中心
const handleProfile = () => {
  router.push('/profile');
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  border-radius: 0 0 20px 20px;
}

.welcome-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 快速操作区域 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
}

.action-card {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
}

.action-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.create-icon {
  background-color: #4e54c8;
  color: white;
}

.join-icon {
  background-color: #07c160;
  color: white;
  font-size: 28px;
}

.quick-icon {
  background-color: #fa8c16;
  color: white;
}

.stats-icon {
  background-color: #1989fa;
  color: white;
}

.action-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.action-desc {
  font-size: 13px;
  color: #666;
}

/* 游戏信息区域 */
.game-info {
  padding: 0 20px 20px;
}

.info-section {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.info-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 规则列表 */
.info-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.rule-icon {
  font-size: 20px;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.rule-text {
  font-size: 14px;
  color: #666;
}

/* 在线玩家 */
.online-players {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.player-item {
  position: relative;
}

.player-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #07c160;
  border-radius: 50%;
  border: 2px solid white;
}

.more-players {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  font-weight: bold;
}

.online-count {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.nav-text {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .welcome-section {
    padding: 30px 15px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
  
  .quick-actions {
    padding: 15px;
    gap: 10px;
  }
  
  .action-card {
    padding: 15px;
  }
  
  .action-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .join-icon {
    font-size: 24px;
  }
  
  .action-title {
    font-size: 15px;
  }
  
  .action-desc {
    font-size: 12px;
  }
  
  .game-info {
    padding: 0 15px 15px;
  }
  
  .info-section {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .info-title {
    font-size: 16px;
  }
  
  .rule-item {
    padding: 8px;
  }
  
  .rule-text {
    font-size: 13px;
  }
}
</style>