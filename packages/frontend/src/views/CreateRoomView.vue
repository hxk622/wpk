<template>
  <div class="create-room">
    <!-- 页面标题 -->
    <van-nav-bar
      title="创建房间"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      background="#1a1a2e"
      title-style="color: #ffd700"
      left-text-style="color: #ffd700"
    />

    <div class="create-room-container">
      <!-- 房间参数设置表单 -->
      <van-form @submit="handleCreateRoom">
        <div class="card-form">
          <!-- 房间名 -->
      <div class="form-item">
        <label class="form-label">
          <van-icon name="chat-o" color="#ffd700" />
          <span>房间名</span>
        </label>
        <van-field
          v-model="roomForm.roomName"
          name="roomName"
          placeholder="请输入房间名"
          type="text"
          class="form-field"
          :rules="[{ required: true, message: '请输入房间名' }]"
        />
      </div>
      
      <!-- 小盲注 -->
      <div class="form-item">
        <label class="form-label">
          <van-icon name="coin" color="#ffd700" />
          <span>小盲注</span>
        </label>
        <van-field
          v-model="roomForm.smallBlind"
          name="smallBlind"
          placeholder="请输入小盲注金额"
          type="number"
          class="form-field"
          :rules="[{ required: true, message: '请输入小盲注金额' }, { min: 1, message: '小盲注金额不能小于1' }]"
        />
      </div>
          
          <!-- 大盲注 -->
          <div class="form-item">
            <label class="form-label">
              <van-icon name="coin" color="#ffd700" />
              <span>大盲注</span>
            </label>
            <van-field
              v-model="roomForm.bigBlind"
              name="bigBlind"
              placeholder="请输入大盲注金额"
              type="number"
              class="form-field"
              :rules="[{ required: true, message: '请输入大盲注金额' }, { min: 2, message: '大盲注金额不能小于2' }]"
            />
          </div>
          
          <!-- 最大玩家数量 -->
          <div class="form-item">
            <label class="form-label">
              <van-icon name="people-o" color="#ffd700" />
              <span>最大玩家数量</span>
            </label>
            <div class="picker-wrapper" @click="showMaxPlayersPicker = true">
              <span class="picker-value">{{ getMaxPlayersText() }}</span>
              <van-icon name="arrow-down" color="#ffd700" />
              <div class="picker-hint">点击选择人数 (2-10人)</div>
            </div>
            <van-popup v-model:show="showMaxPlayersPicker" round position="bottom" :style="{ height: '400px' }">
              <van-picker
                :columns="maxPlayersOptions"
                @confirm="(value) => { roomForm.maxPlayers = value.value; showMaxPlayersPicker = false; }"
                show-toolbar
                toolbar-position="bottom"
                title="选择最大玩家数量"
                :height="300"
                :visible-item-count="5"
              />
            </van-popup>
          </div>
          
          <!-- 游戏模式 -->
          <div class="form-item">
            <label class="form-label">
              <van-icon name="gamepad-o" color="#ffd700" />
              <span>游戏模式</span>
            </label>
            <div class="picker-wrapper" @click="showGameModePicker = true">
              <span class="picker-value">{{ getGameModeText() }}</span>
              <van-icon name="arrow" color="#888" />
            </div>
            <van-popup v-model:show="showGameModePicker" round position="bottom" :style="{ height: '400px' }">
              <van-picker
                :columns="gameModeOptions"
                @confirm="(value) => { roomForm.gameMode = value.value; showGameModePicker = false; }"
                show-toolbar
                toolbar-position="bottom"
                title="选择游戏模式"
                :height="300"
                :visible-item-count="3"
              />
            </van-popup>
          </div>
          
          <!-- 是否允许观看 -->
          <div class="form-item switch-item">
            <label class="form-label">
              <van-icon name="eye-o" color="#ffd700" />
              <span>允许观看</span>
            </label>
            <van-switch v-model="roomForm.allowSpectators" size="28px" active-color="#ffd700" inactive-color="#444" />
          </div>
        </div>

        <!-- 创建房间按钮 -->
        <div class="create-button-container">
          <div class="create-button-hint">点击下方按钮创建房间</div>
          <van-button
            type="primary"
            class="create-room-btn"
            @click="handleCreateRoom"
            :loading="loading"
            size="large"
          >
            <van-icon name="plus-circle" size="22" />
            创建房间
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import roomApi from '../api/room';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { Icon as VanIcon } from 'vant';

// 路由实例
const router = useRouter();

// 用户存储
const userStore = useUserStore();

// 最大玩家数量选项
const maxPlayersOptions = [
  { text: '2人', value: 2 },
  { text: '4人', value: 4 },
  { text: '6人', value: 6 },
  { text: '8人', value: 8 },
  { text: '9人', value: 9 },
  { text: '10人', value: 10 }
];

// 游戏模式选项
const gameModeOptions = [
  { text: '无限注', value: 'no_limit' },
  { text: '有限注', value: 'limit' },
  { text: '固定注', value: 'pot_limit' }
];

// 房间表单数据
const roomForm = reactive({
  roomName: '', // 房间名
  smallBlind: 10,
  bigBlind: 20,
  maxPlayers: 6,
  gameMode: 'no_limit',
  allowSpectators: true
});

// 初始化房间名
console.log('Username:', userStore.getUsername);
roomForm.roomName = userStore.getUsername ? `${userStore.getUsername}创建的房间` : '新建房间';
console.log('Room name:', roomForm.roomName);

// 加载状态
const loading = ref(false);

// 选择器显示状态
const showMaxPlayersPicker = ref(false);
const showGameModePicker = ref(false);

// 获取当前选中的文本 - 彻底避免使用索引访问
const getMaxPlayersText = () => {
  const option = maxPlayersOptions.find(opt => opt.value === roomForm.maxPlayers);
  return option ? option.text : '6人';
};

const getGameModeText = () => {
  const option = gameModeOptions.find(opt => opt.value === roomForm.gameMode);
  return option ? option.text : '无限注';
};

// 返回按钮点击事件
const onClickLeft = () => {
  router.back();
};



// 创建房间
const handleCreateRoom = async () => {
  try {
    console.log('Create room button clicked');
    console.log('Current room form:', roomForm);
    
    // 先验证基本信息
    if (!roomForm.roomName) {
      showToast('请输入房间名');
      return;
    }
    
    if (!roomForm.smallBlind || roomForm.smallBlind < 1) {
      showToast('请输入有效的小盲注金额');
      return;
    }
    
    if (!roomForm.bigBlind || roomForm.bigBlind < 2) {
      showToast('请输入有效的大盲注金额');
      return;
    }
    
    // 验证大盲注必须是小盲注的两倍
    const smallBlindNum = Number(roomForm.smallBlind);
    const bigBlindNum = Number(roomForm.bigBlind);
    if (bigBlindNum !== smallBlindNum * 2) {
      showToast('大盲注必须是小盲注的两倍');
      return;
    }

    // 显示加载提示
    loading.value = true;
    showLoadingToast({
      message: '创建房间中...',
      forbidClick: true,
    });

    // 调用创建房间API
    console.log('Calling createRoom API with data:', {
      name: roomForm.roomName,
      room_type: roomForm.allowSpectators ? 'public' : 'private',
      small_blind: parseInt(roomForm.smallBlind),
      big_blind: parseInt(roomForm.bigBlind),
      max_players: roomForm.maxPlayers,
      table_type: 'cash' // 默认使用现金桌类型
    });
    
    const response = await roomApi.createRoom({
      name: roomForm.roomName,
      room_type: roomForm.allowSpectators ? 'public' : 'private',
      small_blind: parseInt(roomForm.smallBlind),
      big_blind: parseInt(roomForm.bigBlind),
      max_players: roomForm.maxPlayers,
      table_type: 'cash' // 默认使用现金桌类型
    });

    console.log('API response:', response);
    
    closeToast();
    
    if (response && response.room) {
      // 创建成功，跳转到房间详情页
      showToast('房间创建成功');
      router.push(`/room/${response.room.id}`);
    } else {
      showToast(response?.message || '房间创建失败');
    }
  } catch (error) {
    closeToast();
    console.error('创建房间失败:', error);
    console.error('Error details:', error.response?.data || error.message);
    showToast('房间创建失败，请稍后重试');
  } finally {
    // 关闭加载提示
    loading.value = false;
  }
};
</script>

<style scoped>
.create-room {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Arial', sans-serif;
}

.create-room-container {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.card-form {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.card-form:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.form-item {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffd700;
  font-size: 16px;
  font-weight: 600;
}

.form-label span {
  color: #fff;
}

.form-field {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-field:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
}

.form-field::placeholder {
  color: #888;
}

.picker-wrapper {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
  font-size: 16px;
  gap: 4px;
}

.picker-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffd700;
}

.picker-hint {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-wrapper:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffd700;
}

.switch-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.create-button-container {
  width: 100%;
  margin-top: 32px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.create-button-hint {
  color: #ffd700;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.create-room-btn {
  width: 100%;
  height: 56px;
  font-size: 20px;
  font-weight: 700;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  border: none;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.create-room-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}

.create-room-btn:active {
  transform: translateY(0);
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 6px 24px rgba(255, 215, 0, 0.6);
  }
  100% {
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .create-room-container {
    padding: 16px 16px 60px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .card-form {
    padding: 20px;
    flex: 1;
  }
  
  .create-button-container {
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  .create-room-btn {
    margin-top: 0;
    height: 50px;
    font-size: 18px;
  }
}
</style>