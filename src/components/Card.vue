<template>
  <div
    class="card"
    :class="{
      'card-face-up': card.isFaceUp,
      'card-face-down': !card.isFaceUp,
      'card-red': card.isFaceUp && card.color === 'red',
      'card-black': card.isFaceUp && card.color === 'black',
      'card-dragging': isDragging,
      'card-hint': isHint,
    }"
    :style="cardStyle"
    @mousedown="handleMouseDown"
    @dblclick="handleDoubleClick"
  >
    <!-- 正面 -->
    <div v-if="card.isFaceUp" class="card-face card-front">
      <div class="card-corner card-corner-top">
        <div class="card-rank">{{ rankText }}</div>
        <div class="card-suit">{{ suitSymbol }}</div>
      </div>
      <div class="card-center">
        <div class="card-suit-large">{{ suitSymbol }}</div>
      </div>
      <div class="card-corner card-corner-bottom">
        <div class="card-rank">{{ rankText }}</div>
        <div class="card-suit">{{ suitSymbol }}</div>
      </div>
    </div>

    <!-- 背面 -->
    <div v-else class="card-face card-back">
      <div class="spider-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Card } from "../types";
import { getCardRankText, getSuitSymbol } from "../utils/cardUtils";

interface Props {
  card: Card;
  zIndex?: number;
  isDragging?: boolean;
  isHint?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  zIndex: 1,
  isDragging: false,
  isHint: false,
});

const emit = defineEmits<{
  mousedown: [event: MouseEvent];
  dblclick: [event: MouseEvent];
}>();

const rankText = computed(() => getCardRankText(props.card.rank));
const suitSymbol = computed(() => getSuitSymbol(props.card.suit));

const cardStyle = computed(() => ({
  zIndex: props.zIndex,
}));

function handleMouseDown(event: MouseEvent) {
  emit("mousedown", event);
}

function handleDoubleClick(event: MouseEvent) {
  emit("dblclick", event);
}
</script>

<style scoped>
.card {
  width: 70px;
  height: 98px;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.card:active {
  cursor: grabbing;
}

.card:hover {
  transform: translateY(-2px);
}

.card-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  transition: opacity 0.2s, transform 0.2s;
}

.card-hint {
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  animation: hint-pulse 1s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 1);
  }
}

.card-face {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.card-front {
  background: white;
  border: 1px solid #ddd;
  padding: 4px;
}

.card-back {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-red {
  color: #d32f2f;
}

.card-black {
  color: #212121;
}

.card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.card-corner-top {
  align-self: flex-start;
}

.card-corner-bottom {
  align-self: flex-end;
  transform: rotate(180deg);
  margin-top: auto;
}

.card-rank {
  font-size: 14px;
  font-weight: bold;
}

.card-suit {
  font-size: 10px;
  margin-top: 2px;
}

.card-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-suit-large {
  font-size: 36px;
}

.spider-pattern {
  width: 60px;
  height: 60px;
  background-image: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px
    ),
    radial-gradient(
      circle at 70% 70%,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.05) 3px,
      transparent 3px
    );
  background-size: 20px 20px, 20px 20px, 30px 30px;
  background-position: 0 0, 10px 10px, 15px 15px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}
</style>
