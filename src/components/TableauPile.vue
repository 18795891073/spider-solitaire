<template>
  <div
    class="tableau-pile"
    :class="{
      'tableau-pile-empty': pile.length === 0,
      'tableau-pile-drag-over': isDragOver,
    }"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-for="(card, index) in pile"
      :key="card.id"
      class="card-wrapper"
      :style="{
        top: `${Number(index) * 25}px`,
        zIndex: String(Number(index) + 1),
      }"
    >
      <Card
        :card="card"
        :z-index="Number(index) + 1"
        :is-dragging="draggingCard?.id === card.id"
        :is-hint="isCardHint(card.id)"
        @mousedown="(e: MouseEvent) => handleCardMouseDown(e, index)"
        @dblclick="(e: MouseEvent) => handleCardDoubleClick(e, index)"
      />
    </div>

    <!-- 空列标记 -->
    <div v-if="pile.length === 0" class="empty-placeholder">
      <div class="empty-indicator">K</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Card from "./Card.vue";
import type { Card as CardType } from "../types";

interface Props {
  pile: CardType[];
  pileIndex: number;
  draggingCard?: CardType | null;
  hintCards?: Set<string>;
  isDragging?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  draggingCard: null,
  hintCards: () => new Set<string>(),
  isDragging: false,
});

const emit = defineEmits<{
  cardMouseDown: [index: number, event: MouseEvent];
  cardDoubleClick: [index: number, event: MouseEvent];
  drop: [targetIndex: number];
}>();

const isDragOver = ref(false);

function isCardHint(cardId: string): boolean {
  return props.hintCards.has(cardId);
}

function handleCardMouseDown(event: MouseEvent, cardIndex: number) {
  emit("cardMouseDown", cardIndex, event);
}

function handleCardDoubleClick(event: MouseEvent, cardIndex: number) {
  emit("cardDoubleClick", cardIndex, event);
}

function handleMouseUp() {
  if (props.isDragging) {
    emit("drop", props.pileIndex);
    isDragOver.value = false;
  }
}

function handleMouseEnter() {
  if (props.isDragging) {
    isDragOver.value = true;
  }
}

function handleMouseLeave() {
  isDragOver.value = false;
}
</script>

<style scoped>
.tableau-pile {
  min-height: 150px;
  position: relative;
  width: 70px;
  margin: 0 5px;
  padding-bottom: 120px;
}

.card-wrapper {
  position: absolute;
  left: 0;
  transition: top 0.3s ease;
}

.tableau-pile-empty {
  border: 2px dashed #ccc;
  border-radius: 6px;
  min-height: 98px;
}

.tableau-pile-drag-over {
  border: 2px solid #4caf50;
  border-radius: 6px;
  background: rgba(76, 175, 80, 0.1);
}

.empty-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 98px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-indicator {
  font-size: 48px;
  font-weight: bold;
  color: #ddd;
  opacity: 0.5;
}
</style>
