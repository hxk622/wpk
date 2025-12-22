<template>
  <div class="room-list-container">
    <div class="room-list-header">
      <h1>游戏房间列表</h1>
      <button class="create-room-btn" @click="handleCreateRoom">
        <van-icon name="plus" size="20" color="#fff" />
        <span>创建房间</span>
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <van-search
        v-model="searchQuery"
        placeholder="搜索房间名称"
        shape="round"
        @search="handleSearch"
      />
      <div class="filter-options">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterType" :options="typeOptions" />
          <van-dropdown-item v-model="filterStatus" :options="statusOptions" />
        </van-dropdown-menu>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="room-list">
      <van-empty
        v-if="filteredRooms.length === 0 && !loading"
        description="暂无房间数据"
      />
      <van-loading v-else-if="loading" type="spinner" color="#1989fa" />
      <div v-else class="room-items">
        <van-cell-group inset v-for="room in filteredRooms" :key="room.id" class="room-item">
          <div class="room-info">
            <div class="room-header">
              <h3 class="room-name">{{ room.name }}</h3>
              <van-tag :type="room.room_type === 'private' ? 'danger' : 'success'" size="small">
                {{ room.room_type === 'private' ? '私人房间' : '公共房间' }}
              </van-tag>
            </div>
            <div class="room-details">
              <div class="detail-item">
                <span class="label">玩家:</span>
                <span class="value">{{ room.current_players }}/{{ room.max_players }}</span>
              </div>
              <div class="detail-item">
                <span class="label">盲注:</span>
                <span class="value">{{ room.small_blind }}/{{ room.big_blind }}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态:</span>
                <span class="value">{{ room.game_status === 'waiting' ? '等待中' : room.game_status === 'playing' ? '游戏中' : '已结束' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">类型:</span>
                <span class="value">{{ room.table_type === 'cash' ? '现金桌' : '锦标赛' }}</span>
              </div>
            </div>
          </div>
          <div class="room-actions">
            <button class="join-btn" @click="handleJoinRoom(room)" :disabled="room.current_players >= room.max_players">
              {{ room.current_players >= room.max_players ? '已满' : '加入' }}
            </button>
          </div>
        </van-cell-group>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="!loading && filteredRooms.length > 0">
      <van-pagination
        v-model:current-page="currentPage"
        :page-count="totalPages"
        :show-page-size="true"
        :page-size="pageSize"
        layout="prev, pager, next, jumper, total"
        :total-items="filteredRooms.length"
        @change="handlePageChange"
      />
    </div>

    <!-- 私人房间密码输入弹窗 -->
    <van-popup v-model:show="showPasswordPopup" position="center" :style="{ width: '300px' }">
      <div class="password-popup">
        <h3>输入房间密码</h3>
        <van-field
          v-model="roomPassword"
          type="password"
          placeholder="请输入房间密码"
          @keyup.enter="handlePasswordSubmit"
        />
        <div class="popup-actions">
          <van-button type="default" @click="showPasswordPopup = false">取消</van-button>
          <van-button type="primary" @click="handlePasswordSubmit">确认</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import roomApi from '../api/room';
import socketService from '../api/socket';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

// 房间列表数据
const rooms = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选条件
const filterType = ref('all');
const filterStatus = ref('all');

// 私人房间密码
const showPasswordPopup = ref(false);
const roomPassword = ref('');
let selectedRoom = null;

// 筛选选项
const typeOptions = [
  { text: '全部类型', value: 'all' },
  { text: '公共房间', value: 'public' },
  { text: '私人房间', value: 'private' }
];

const statusOptions = [
  { text: '全部状态', value: 'all' },
  { text: '等待中', value: 'waiting' },
  { text: '游戏中', value: 'playing' },
  { text: '已结束', value: 'finished' }
];

// 获取房间列表
const fetchRooms = async () => {
  loading.value = true;
  try {
    const response = await roomApi.getRoomList();
    rooms.value = response.data;
    showToast('获取房间列表成功');
  } catch (error) {
    console.error('获取房间列表失败:', error);
    showToast('获取房间列表失败');
  } finally {
    loading.value = false;
  }
};

// 过滤房间列表
const filteredRooms = computed(() => {
  let result = [...rooms.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(room => room.name.toLowerCase().includes(query));
  }

  // 类型过滤
  if (filterType.value !== 'all') {
    result = result.filter(room => room.room_type === filterType.value);
  }

  // 状态过滤
  if (filterStatus.value !== 'all') {
    result = result.filter(room => room.game_status === filterStatus.value);
  }

  return result;
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredRooms.value.length / pageSize.value);
});

// 当前页显示的房间
const currentRooms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRooms.value.slice(start, end);
});

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 加入房间
const handleJoinRoom = async (room) => {
  if (room.current_players >= room.max_players) {
    showToast('房间已满');
    return;
  }

  if (room.room_type === 'private') {
    // 私人房间需要输入密码
    selectedRoom = room;
    showPasswordPopup.value = true;
  } else {
    // 公共房间直接加入
    await joinRoom(room.id);
  }
};

// 处理密码提交
const handlePasswordSubmit = async () => {
  if (!roomPassword.value.trim()) {
    showToast('请输入房间密码');
    return;
  }

  try {
    const success = await roomApi.validateRoomPassword(selectedRoom.id, roomPassword.value);
    if (success) {
      await joinRoom(selectedRoom.id);
      showPasswordPopup.value = false;
      roomPassword.value = '';
    } else {
      showToast('密码错误');
    }
  } catch (error) {
    console.error('验证房间密码失败:', error);
    showToast('验证房间密码失败');
  }
};

// 实际加入房间
const joinRoom = async (roomId) => {
  try {
    const success = await roomApi.joinRoom(roomId);
    if (success) {
      showToast('加入房间成功');
      // 连接WebSocket
      socketService.connect();
      socketService.joinRoom(roomId);
      // 跳转到游戏页面
      router.push(`/game/${roomId}`);
    } else {
      showToast('加入房间失败');
    }
  } catch (error) {
    console.error('加入房间失败:', error);
    showToast(error.message || '加入房间失败');
  }
};

// 创建房间
const handleCreateRoom = () => {
  router.push('/room/create');
};

// 组件挂载时获取房间列表
onMounted(() => {
  fetchRooms();
});
</script>

<style scoped>
.room-list-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.room-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.room-list-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #323233;
}

.create-room-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #1989fa;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-room-btn:hover {
  background-color: #409eff;
}

.search-filter {
  margin-bottom: 20px;
}

.filter-options {
  margin-top: 10px;
}

.room-list {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.room-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.room-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.room-info {
  padding: 15px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-name {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.room-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  font-size: 14px;
  color: #646566;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-item .label {
  color: #969799;
}

.detail-item .value {
  color: #323233;
  font-weight: 500;
}

.room-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 15px;
}

.join-btn {
  background-color: #1989fa;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.join-btn:hover {
  background-color: #409eff;
}

.join-btn:disabled {
  background-color: #c6e2ff;
  cursor: not-allowed;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.password-popup {
  padding: 20px;
}

.password-popup h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.popup-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.popup-actions .van-button {
  flex: 1;
}
</style>