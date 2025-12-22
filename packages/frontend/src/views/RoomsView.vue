<template>
  <div class="rooms">
    <!-- 页面标题 -->
    <van-nav-bar
      title="游戏房间"
      left-arrow
      @click-left="handleBack"
      right-text="创建"
      @click-right="handleCreateRoom"
    />

    <!-- 房间列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多房间了"
        @load="onLoad"
      >
        <div class="room-item" v-for="room in rooms" :key="room.id" @click="handleJoinRoom(room.id)">
          <div class="room-header">
            <div class="room-name">房间 {{ room.id }}</div>
            <van-tag :type="room.status === 'waiting' ? 'primary' : 'success'">
              {{ room.status === 'waiting' ? '等待中' : '游戏中' }}
            </van-tag>
          </div>
          <div class="room-info">
            <div class="room-player-count">
              <van-icon name="friends-o" /> {{ room.players.length }}/{{ room.maxPlayers }}人
            </div>
            <div class="room-blinds">
              <span>小盲: {{ room.smallBlind }}</span>
              <span>大盲: {{ room.bigBlind }}</span>
            </div>
          </div>
          <div class="room-players">
            <div v-for="(player, index) in room.players" :key="player.id" class="player-avatar">
              <van-image
                round
                :src="player.avatar || defaultAvatar"
                width="30px"
                height="30px"
              />
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import roomApi from '../api/room';
import { showToast, showLoadingToast, closeToast } from 'vant';

// 路由实例
const router = useRouter();

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg';

// 房间列表数据
const rooms = ref([]);
// 加载状态
const loading = ref(false);
// 刷新状态
const refreshing = ref(false);
// 是否加载完毕
const finished = ref(false);
// 当前页码
const page = ref(1);
// 每页数量
const pageSize = ref(10);

// 获取房间列表
const getRooms = async (isRefresh = false) => {
  try {
    // 如果是刷新，重置页码和数据
    if (isRefresh) {
      page.value = 1;
      rooms.value = [];
      finished.value = false;
    }

    // 调用API获取房间列表
    const response = await roomApi.getRooms({
      page: page.value,
      pageSize: pageSize.value
    });

    // 如果是刷新，直接替换数据
    if (isRefresh) {
      rooms.value = response.rooms;
    } else {
      // 否则追加数据
      rooms.value = [...rooms.value, ...response.rooms];
    }

    // 更新页码
    page.value++;

    // 如果没有更多数据，设置finished为true
    if (response.rooms.length < pageSize.value) {
      finished.value = true;
    }
  } catch (error) {
    console.error('获取房间列表失败:', error);
    showToast(error.message || '获取房间列表失败');
  } finally {
    // 关闭加载和刷新状态
    loading.value = false;
    refreshing.value = false;
  }
};

// 上拉加载
const onLoad = () => {
  getRooms(false);
};

// 下拉刷新
const onRefresh = () => {
  getRooms(true);
};

// 页面挂载时获取房间列表
onMounted(() => {
  getRooms(true);
});

// 返回大厅
const handleBack = () => {
  router.push('/');
};

// 创建房间
const handleCreateRoom = () => {
  router.push('/create-room');
};

// 加入房间
const handleJoinRoom = async (roomId) => {
  try {
    // 显示加载提示
    showLoadingToast({
      message: '正在加入房间...',
      forbidClick: true,
    });

    // 调用加入房间API
    await roomApi.joinRoom(roomId);

    // 加入成功，直接跳转到游戏页面
    router.push(`/game/${roomId}`);
  } catch (error) {
    console.error('加入房间失败:', error);
    showToast(error.message || '加入房间失败，请稍后重试');
  } finally {
    // 关闭加载提示
    closeToast();
  }
};
</script>

<style scoped>
.rooms {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.room-item {
  background-color: #fff;
  margin: 10px;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.room-item:active {
  transform: scale(0.98);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.room-player-count {
  display: flex;
  align-items: center;
}

.room-player-count .van-icon {
  margin-right: 5px;
}

.room-blinds {
  display: flex;
  gap: 15px;
}

.room-players {
  display: flex;
  gap: 8px;
}

.player-avatar {
  position: relative;
}

.player-avatar::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #07c160;
  border-radius: 50%;
  border: 2px solid #fff;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .room-item {
    margin: 8px;
    padding: 12px;
  }
  
  .room-name {
    font-size: 15px;
  }
  
  .room-info {
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .room-blinds {
    gap: 10px;
  }
  
  .player-avatar {
    width: 24px;
    height: 24px;
  }
  
  .player-avatar img {
    width: 24px;
    height: 24px;
  }
  
  .player-avatar::after {
    width: 6px;
    height: 6px;
  }
}
</style>