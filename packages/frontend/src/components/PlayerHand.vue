<template>
  <div class="player-hand">
    <div class="hand-title">你的手牌</div>
    <div class="cards-container">
      <div v-for="(card, index) in holeCards" :key="index" class="card-wrapper">
        <Card :card="card" :is-flipped="true" />
      </div>
      <div v-if="holeCards.length < 2" v-for="index in (2 - holeCards.length)" :key="'empty-' + index" class="card-wrapper empty"></div>
    </div>
    
    <!-- 手牌强度分析 -->
    <div v-if="handStrength" class="hand-strength">
      <div class="strength-label">手牌强度</div>
      <div class="strength-value" :class="getStrengthClass(handStrength.strength)">
        {{ handStrength.description }}
      </div>
      <div class="strength-percentage">
        <div class="percentage-bar">
          <div class="percentage-fill" :style="{ width: `${handStrength.percentage}%` }"></div>
        </div>
        <span>{{ handStrength.percentage }}%</span>
      </div>
    </div>
    
    <!-- AI建议 -->
    <div v-if="showAi && aiSuggestions" class="ai-suggestions">
      <div class="suggestions-title">AI建议</div>
      <div class="suggestions-list">
        <div class="suggestion-item">
          <div class="suggestion-action" :class="aiSuggestions.recommendedAction.toLowerCase()">
            {{ aiSuggestions.recommendedAction }}
          </div>
          <div class="suggestion-reason">{{ aiSuggestions.explanation }}</div>
          <div class="suggestion-confidence" style="width: 100%">
            AI推荐
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Card from './Card.vue';

const props = defineProps({
  holeCards: {
    type: Array,
    default: () => []
  },
  handStrength: {
    type: Object,
    default: null
  },
  aiSuggestions: {
    type: Object,
    default: null
  },
  showAi: {
    type: Boolean,
    default: false
  }
});

// 根据手牌强度获取对应的CSS类
const getStrengthClass = (strength) => {
  if (strength >= 90) return 'excellent';
  if (strength >= 70) return 'good';
  if (strength >= 50) return 'average';
  if (strength >= 30) return 'weak';
  return 'very-weak';
};
</script>

<style scoped>
.player-hand {
  background-color: #2d3748;
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hand-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  color: #e2e8f0;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.card-wrapper {
  position: relative;
}

.card-wrapper.empty {
  width: 100px;
  height: 140px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hand-strength {
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.strength-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.strength-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.strength-value.excellent {
  color: #48bb78;
}

.strength-value.good {
  color: #4299e1;
}

.strength-value.average {
  color: #ed8936;
}

.strength-value.weak {
  color: #f56565;
}

.strength-value.very-weak {
  color: #fc8181;
}

.strength-percentage {
  display: flex;
  align-items: center;
  gap: 10px;
}

.percentage-bar {
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background-color: #48bb78;
  transition: width 0.3s ease;
}

.percentage-bar + span {
  font-size: 12px;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.ai-suggestions {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.suggestions-title {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.suggestion-action {
  min-width: 80px;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  font-size: 12px;
}

.suggestion-action.fold {
  background-color: #f56565;
  color: white;
}

.suggestion-action.check {
  background-color: #48bb78;
  color: white;
}

.suggestion-action.call {
  background-color: #4299e1;
  color: white;
}

.suggestion-action.raise {
  background-color: #ed8936;
  color: white;
}

.suggestion-action.allin {
  background-color: #d69e2e;
  color: white;
}

.suggestion-reason {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
}

.suggestion-confidence {
  min-width: 60px;
  height: 10px;
  background-color: #48bb78;
  border-radius: 5px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 5px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  transition: width 0.3s ease;
}
</style>