<template>
  <div
    class="foundation-pile"
    :class="{ 'foundation-pile-empty': pile.length === 0, 'foundation-pile-complete': pile.length === 13 }"
  >
    <div v-if="pile.length > 0" class="foundation-cards">
      <Card
        v-for="(card, index) in visibleCards"
        :key="card.id"
        :card="card"
        :z-index="index + 1"
        :style="{ position: 'absolute', top: `${index * 3}px`, left: `${index * 3}px` }"
      />
    </div>
    <div v-else class="foundation-placeholder">
      <div class="foundation-indicator">完成区</div>
    </div>
    <div v-if="pile.length === 13" class="foundation-complete-badge">✓</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from './Card.vue'
import type { Card as CardType } from '../types'

interface Props {
  pile: CardType[]
}

const props = defineProps<Props>()

// 只显示最上面的几张牌
const visibleCards = computed(() => {
  if (props.pile.length === 0) return []
  // 只显示最后3张
  return props.pile.slice(-3)
})
</script>

<style scoped>
.foundation-pile {
  width: 70px;
  height: 98px;
  position: relative;
  margin: 0 5px;
}

.foundation-cards {
  width: 100%;
  height: 100%;
  position: relative;
}

.foundation-pile-empty {
  border: 2px dashed #ddd;
  border-radius: 6px;
}

.foundation-pile-complete {
  border: 2px solid #4caf50;
}

.foundation-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.foundation-indicator {
  font-size: 11px;
  color: #999;
  text-align: center;
}

.foundation-complete-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
</style>

