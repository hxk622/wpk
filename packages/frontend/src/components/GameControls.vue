<template>
  <div class="game-controls">
    <!-- 当前玩家状态 -->
    <div class="player-status">
      <div class="status-item">
        <span class="label">余额</span>
        <span class="value">{{ formatMoney(balance) }}</span>
      </div>
      <div class="status-item">
        <span class="label">已下注</span>
        <span class="value">{{ formatMoney(currentBet) }}</span>
      </div>
      <div class="status-item">
        <span class="label">需要跟注</span>
        <span class="value">{{ formatMoney(amountToCall) }}</span>
      </div>
    </div>
    
    <!-- 游戏操作按钮 -->
    <div class="control-buttons">
      <button 
        class="control-btn fold" 
        @click="handleFold" 
        :disabled="!isPlayerTurn || isLoading"
      >
        弃牌
      </button>
      
      <button 
        class="control-btn check" 
        @click="handleCheck" 
        :disabled="amountToCall > 0 || !isPlayerTurn || isLoading"
      >
        过牌
      </button>
      
      <button 
        class="control-btn call" 
        @click="handleCall" 
        :disabled="amountToCall <= 0 || balance < amountToCall || !isPlayerTurn || isLoading"
      >
        跟注
        <span class="btn-amount">{{ formatMoney(amountToCall) }}</span>
      </button>
      
      <button 
        class="control-btn raise" 
        @click="toggleRaisePanel" 
        :disabled="balance < amountToCall + minRaise || !isPlayerTurn || isLoading"
      >
        加注
        <span class="btn-amount" v-if="selectedRaiseAmount">{{ formatMoney(selectedRaiseAmount) }}</span>
      </button>
      
      <button 
        class="control-btn all-in" 
        @click="handleAllIn" 
        :disabled="!isPlayerTurn || isLoading"
      >
        全下
        <span class="btn-amount">{{ formatMoney(balance) }}</span>
      </button>
    </div>
    
    <!-- 加注面板 -->
    <div v-if="showRaisePanel" class="raise-panel">
      <div class="raise-header">
        <h3>选择加注金额</h3>
        <button class="close-btn" @click="toggleRaisePanel">×</button>
      </div>
      
      <div class="raise-options">
        <!-- 快速选择按钮 -->
        <div class="quick-raises">
          <button 
            v-for="(multiplier, index) in [0.5, 1, 2, 3]" 
            :key="index"
            class="quick-raise-btn"
            :class="{ 'selected': selectedRaiseAmount === Math.min(balance, amountToCall + (bigBlind * multiplier)) }"
            @click="setRaiseAmount(Math.min(balance, amountToCall + (bigBlind * multiplier)))"
          >
            {{ multiplier }}x BB
          </button>
        </div>
        
        <!-- 滑动条 -->
        <div class="raise-slider">
          <div class="slider-labels">
            <span>{{ formatMoney(minRaise) }}</span>
            <span>{{ formatMoney(balance) }}</span>
          </div>
          <input 
            type="range" 
            v-model.number="selectedRaiseAmount"
            :min="minRaise"
            :max="balance"
            :step="10"
            class="raise-range"
          >
        </div>
        
        <!-- 自定义金额 -->
        <div class="custom-raise">
          <label for="custom-amount">自定义金额</label>
          <input 
            id="custom-amount"
            type="number" 
            v-model.number="selectedRaiseAmount"
            :min="minRaise"
            :max="balance"
            :step="10"
            class="custom-amount-input"
          >
        </div>
      </div>
      
      <!-- 加注操作按钮 -->
      <div class="raise-actions">
        <button class="action-btn cancel" @click="toggleRaisePanel">取消</button>
        <button 
          class="action-btn confirm" 
          @click="handleRaise" 
          :disabled="selectedRaiseAmount < minRaise || selectedRaiseAmount > balance"
        >
          确认加注
        </button>
      </div>
    </div>
    
    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在处理...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 本地实现formatMoney函数，避免从shared包导入
const formatMoney = (amount) => {
  return `$${amount.toFixed(2)}`;
};

const props = defineProps({
  balance: {
    type: Number,
    default: 0
  },
  currentBet: {
    type: Number,
    default: 0
  },
  amountToCall: {
    type: Number,
    default: 0
  },
  bigBlind: {
    type: Number,
    default: 10
  },
  isPlayerTurn: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['fold', 'check', 'call', 'raise', 'all-in']);

// 加注面板状态
const showRaisePanel = ref(false);
const selectedRaiseAmount = ref(0);

// 计算最小加注金额
const minRaise = computed(() => {
  return Math.max(props.amountToCall, props.bigBlind * 2);
});

// 切换加注面板
const toggleRaisePanel = () => {
  showRaisePanel.value = !showRaisePanel.value;
  if (showRaisePanel.value) {
    // 默认选择最小加注金额
    selectedRaiseAmount.value = minRaise.value;
  }
};

// 设置加注金额
const setRaiseAmount = (amount) => {
  selectedRaiseAmount.value = amount;
};

// 游戏操作处理
const handleFold = () => {
  emit('fold');
};

const handleCheck = () => {
  emit('check');
};

const handleCall = () => {
  emit('call');
};

const handleRaise = () => {
  if (selectedRaiseAmount.value >= minRaise.value && selectedRaiseAmount.value <= props.balance) {
    emit('raise', selectedRaiseAmount.value);
    showRaisePanel.value = false;
  }
};

const handleAllIn = () => {
  emit('all-in');
};
</script>

<style scoped>
.game-controls {
  background-color: #2d3748;
  padding: 20px;
  border-radius: 12px;
  color: white;
  position: relative;
}

.player-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-item .label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 5px;
}

.status-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #e2e8f0;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  flex: 1;
  min-width: 100px;
  padding: 15px 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.fold {
  background-color: #f56565;
}

.control-btn.check {
  background-color: #48bb78;
}

.control-btn.call {
  background-color: #4299e1;
}

.control-btn.raise {
  background-color: #ed8936;
}

.control-btn.all-in {
  background-color: #d69e2e;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-amount {
  font-size: 12px;
  opacity: 0.9;
}

/* 加注面板 */
.raise-panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  background-color: #1a202c;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  z-index: 10;
  margin-bottom: 20px;
}

.raise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.raise-header h3 {
  margin: 0;
  font-size: 16px;
  color: #e2e8f0;
}

.close-btn {
  background: none;
  border: none;
  color: #e2e8f0;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.raise-options {
  padding: 20px;
}

.quick-raises {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.quick-raise-btn {
  flex: 1;
  min-width: 80px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 6px;
  color: #e2e8f0;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-raise-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.quick-raise-btn.selected {
  background-color: #4299e1;
  border-color: #4299e1;
}

.raise-slider {
  margin-bottom: 20px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  opacity: 0.7;
}

.raise-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.raise-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4299e1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.raise-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4299e1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.custom-raise {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-raise label {
  font-size: 14px;
  opacity: 0.8;
}

.custom-amount-input {
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  text-align: center;
}

.custom-amount-input:focus {
  outline: none;
  border-color: #4299e1;
}

.raise-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.cancel {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.action-btn.cancel:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.action-btn.confirm {
  background-color: #4299e1;
  color: white;
}

.action-btn.confirm:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: white;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>