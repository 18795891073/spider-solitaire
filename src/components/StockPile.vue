<template>
  <div
    class="stock-pile"
    :class="{ 'stock-pile-disabled': isDealing }"
    @click="handleClick"
  >
    <div v-if="cards.length > 0" class="stock-card">
      <div class="card-back">
        <div class="spider-pattern"></div>
        <div class="card-count">{{ cards.length }}</div>
      </div>
    </div>
    <div v-else class="stock-empty">发牌堆</div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "../types";

interface Props {
  cards: Card[];
  isDealing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDealing: false,
});

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  if (!props.isDealing) {
    emit("click");
  }
}
</script>

<style scoped>
.stock-pile {
  width: 70px;
  height: 98px;
  cursor: pointer;
  position: relative;
}

.stock-card {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-back {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.2s;
}

.stock-pile:hover .card-back {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.spider-pattern {
  width: 50px;
  height: 50px;
  background-image: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px
    ),
    radial-gradient(
      circle at 70% 70%,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px
    );
  background-size: 20px 20px, 20px 20px;
  background-position: 0 0, 10px 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.stock-empty {
  width: 100%;
  height: 100%;
  border: 2px dashed #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  text-align: center;
}

.stock-pile-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
