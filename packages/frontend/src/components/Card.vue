<template>
  <div class="card" :class="{ 'flipped': isFlipped, 'selected': isSelected }">
    <div class="card-inner">
      <!-- 卡牌正面 -->
      <div class="card-front">
        <div class="card-corner top-left">
          <div class="card-rank">{{ rank }}</div>
          <div class="card-suit">{{ suitSymbol }}</div>
        </div>
        <div class="card-suit center">{{ suitSymbol }}</div>
        <div class="card-corner bottom-right">
          <div class="card-rank">{{ rank }}</div>
          <div class="card-suit">{{ suitSymbol }}</div>
        </div>
      </div>
      <!-- 卡牌背面 -->
      <div class="card-back"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// 计算卡牌的显示内容
const rank = computed(() => {
  switch (props.card.rank) {
    case 'A': return 'A';
    case 'J': return 'J';
    case 'Q': return 'Q';
    case 'K': return 'K';
    default: return props.card.rank;
  }
});

// 计算卡牌的花色符号
const suitSymbol = computed(() => {
  switch (props.card.suit) {
    case 'HEARTS': return '♥';
    case 'DIAMONDS': return '♦';
    case 'CLUBS': return '♣';
    case 'SPADES': return '♠';
    default: return '';
  }
});

// 计算卡牌的颜色
const suitColor = computed(() => {
  return ['HEARTS', 'DIAMONDS'].includes(props.card.suit) ? 'red' : 'black';
});
</script>

<style scoped>
.card {
  width: 80px;
  height: 112px;
  perspective: 1000px;
  cursor: pointer;
  margin: 4px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  border-radius: 8px;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-front {
  background-color: white;
  color: #333;
  padding: 4px;
  box-sizing: border-box;
}

.card-back {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #1a237e 100%);
  background-size: 20px 20px;
  transform: rotateY(180deg);
}

.card-corner {
  position: absolute;
  text-align: center;
  font-weight: bold;
}

.top-left {
  top: 4px;
  left: 4px;
}

.bottom-right {
  bottom: 4px;
  right: 4px;
  transform: rotate(180deg);
}

.card-rank {
  font-size: 16px;
  line-height: 1;
  color: v-bind(suitColor);
}

.card-suit {
  font-size: 20px;
  line-height: 1;
  color: v-bind(suitColor);
}

.card-suit.center {
  font-size: 40px;
}

.card.selected {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}
</style>