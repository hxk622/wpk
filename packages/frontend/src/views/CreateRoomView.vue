<template>
  <div class="create-room">
    <!-- 页面标题 -->
    <van-nav-bar
      title="创建房间"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="create-room-container">
      <!-- 房间参数设置表单 -->
      <van-form @submit="handleCreateRoom" class="room-form">
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
                ref="maxPlayersPickerRef"
                :columns="maxPlayersOptions"
                :default-index="maxPlayersOptions.findIndex(opt => opt.value === roomForm.maxPlayers)"
                @confirm="handleMaxPlayersConfirm"
                show-toolbar
                toolbar-position="bottom"
                title="选择最大玩家数量"
                :height="300"
                :visible-item-count="5"
                allow-html
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
                ref="gameModePickerRef"
                :columns="gameModeOptions"
                :default-index="gameModeOptions.findIndex(opt => opt.value === roomForm.gameMode)"
                @confirm="handleGameModeConfirm"
                show-toolbar
                toolbar-position="bottom"
                title="选择游戏模式"
                :height="300"
                :visible-item-count="3"
                allow-html
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
import { ref, reactive, watch, nextTick } from 'vue';
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

// 选择器ref
const maxPlayersPickerRef = ref(null);
const gameModePickerRef = ref(null);

// 最大玩家数量选择器确认事件
const handleMaxPlayersConfirm = ({ selectedOptions }) => {
  if (selectedOptions && selectedOptions.length > 0) {
    roomForm.maxPlayers = selectedOptions[0].value;
  }
  showMaxPlayersPicker.value = false;
};

// 游戏模式选择器确认事件
const handleGameModeConfirm = ({ selectedOptions }) => {
  if (selectedOptions && selectedOptions.length > 0) {
    roomForm.gameMode = selectedOptions[0].value;
  }
  showGameModePicker.value = false;
};

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
  background-color: #f5f5f5;
  font-family: 'Arial', sans-serif;
}

.create-room-container {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.card-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

.card-form:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.form-label span {
  color: #333;
}

.form-field {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  color: #333;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-field:focus {
  background: white;
  border-color: #1989fa;
  box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.2);
}

.form-field::placeholder {
  color: #999;
}

.picker-wrapper {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  font-size: 16px;
  gap: 4px;
}

.picker-value {
  font-size: 18px;
  font-weight: 600;
  color: #1989fa;
}

.picker-hint {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-wrapper:hover {
  background: #f9f9f9;
  border-color: #1989fa;
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
  color: #666;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.create-room-btn {
  width: 100%;
  height: 56px;
  font-size: 20px;
  font-weight: 700;
  border-radius: 8px;
  background-color: #1989fa;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.create-room-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25, 137, 250, 0.4);
}

.create-room-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .create-room-container {
    padding: 16px 16px 100px; /* 增加底部内边距，防止按钮被挡住 */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box; /* 确保内边距不增加总高度 */
  }
  
  .card-form {
    padding: 20px;
    flex: 1;
    box-sizing: border-box;
  }
  
  .create-button-container {
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  .create-room-btn {
    margin-top: 0;
    height: 56px; /* 增加按钮高度，提高可点击区域 */
    font-size: 18px;
  }
}



/* 确保表单内容不被底部按钮挡住 */
.room-form {
  margin-bottom: 20px;
}

/* 选择器容器样式优化 */
.picker-wrapper {
  touch-action: pan-y;
}

/* 修复选择器滑动问题 */
.van-picker__column {
  touch-action: pan-y;
}

/* 确保内容区域可以滚动 */
.create-room-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>